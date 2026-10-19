# Spec: Real-time data flow on the HA figure

Module id: `data-flow` · single capability · depends on `ha-figure`
(see [spec-ha-page.md](./spec-ha-page.md)).

## Objective

The figure shows a live path and a dead one, but nothing actually *flows*.
This adds a real-time packet stream along the cables, two tones for the round
trip, and one explicit marker for a port that stops receiving data.

Success in one sentence: without reading anything, a stranger can see that data
is moving, which direction it moves, and the exact port where it stopped.

## The stream

- **Two tones, two directions.** Requests are cool green; responses are warm
  amber. They travel in opposite directions on the same cable, offset into two
  lanes ~2 px either side of the cable centre so they never overlap.
- **Serving path:** requests `SERVER → SWITCH → USERS`, responses
  `USERS → SWITCH → SERVER`.
- **Density:** 6 dots per long segment, 4 per short one, evenly spaced; a dot
  crosses its segment in about 1.2 s. Tuned visually, not by formula.
- **Geometry:** the dots follow the existing quadratic cable curves. They are
  SVG circles, not recorded solids; no audit impact.
- **Performance:** at most ~40 dots, updated in the existing `rAF` loop by
  writing `cx`/`cy`. The loop already pauses offscreen.

## What updates and what stops

The port of a server that is **stopped** gets a small dark plate with amber
mono text `NO DATA`, attached to its cable port. It appears the frame the
server stops and clears the frame it is repaired.

| State | Server ↔ switch | Switch ↔ users |
|---|---|---|
| A serving | round trip on A; B lane empty | round trip |
| A stopped, B healthy | A lane empty + `NO DATA`; B lane starts after the transfer | **responses only** while dark, then round trip on B |
| A stopped, no standby | A lane empty + `NO DATA` | responses drain, then stop |
| A repaired, B serving | A lane empty, no plate (healthy standby) | round trip on B |
| Manual, source stopped | source lane empty + `NO DATA` | responses drain, then stop |
| Reset | initial state | round trip |

**The switch never stops forwarding while any server is healthy.** That is why,
during the ~4 s dark window, the users cable keeps moving: the switch is still
draining responses already in flight. Requests resume only when a server serves
again. This is the one interpretation to confirm (see Open Questions).

- Dots never appear on a segment whose server is stopped or whose lane is
  inactive.
- A stopped server’s lane is clean — no frozen dots; the `NO DATA` plate is the
  only trace.
- The switch display, lever, LEDs and beacon keep their current behaviour.

## Reduced motion

With `prefers-reduced-motion: reduce`:

- no motion; dots are drawn at fixed positions on every active segment;
- inactive segments have no dots;
- the `NO DATA` plate and the beacon state carry the meaning;
- the state machine and the annotation timings are unchanged.

## Commands

```
Build:  node build.mjs
Audit:  node build.mjs --audit        # must end "audit passed"
Serve:  npm run serve                 # http://localhost:4173
```

## Project Structure

```
src/hardware.mjs   cables + dots markup (paths, lanes, NO DATA plate)
src/live.js        flow state per segment, dot phases, NO DATA toggle
src/shell.mjs      dot/plate CSS, tones, reduced-motion rules
build.mjs          passes cable path data to the client
docs/              this spec
```

## Code Style

One flow state per segment, one phase per dot; no per-dot timers.

```js
// live.js — phase advances with dt, position sampled from the cable curve
const SEGMENTS = {
  A: { curve: DATA.cableA, live: true, lane: -2.2 },
  B: { curve: DATA.cableB, live: false, lane: -2.2 },
  users: { curve: DATA.cableUsers, live: true, lane: 2.2 },
};
function stepFlow(dt) {
  for (const seg of Object.values(SEGMENTS)) {
    if (!seg.live) continue;
    seg.phase = (seg.phase + dt / 1.2) % 1;
    for (const dot of seg.dots) {
      const t = (seg.phase + dot.offset) % 1;
      const [x, y] = quadAt(seg.curve, t);
      dot.el.setAttribute("cx", x + seg.lane * seg.normalX);
      dot.el.setAttribute("cy", y + seg.lane * seg.normalY);
    }
  }
}
```

## Testing Strategy

No unit framework is added. Two levels:

1. `node build.mjs --audit` ends `audit passed`.
2. Scripted browser pass:
   - at rest, request and response dots exist on the serving lanes and their
     positions change between two samples 300 ms apart;
   - dots exist on the switch–users segment in both directions;
   - click A: A’s dots stop within one frame, `NO DATA` appears at A’s port,
     the users segment keeps moving, then a round trip starts on B;
   - repair A: the plate clears, A’s lane stays empty while it is standby;
   - manual + source fault: the users segment drains and then stops;
   - reset: initial streams restored, no plate;
   - reduced motion: dots are stationary but present only on active segments;
   - offscreen: the animation loop is cancelled;
   - zero console errors; audit unchanged.

Visual review: 100% screenshot of the figure at rest and after a fault; the two
tones must be distinguishable, and the `NO DATA` plate must not collide with a
cable, port or label.

## Boundaries

- **Always:** drive dots from the state machine; pause with the existing
  offscreen observer; respect reduced motion; keep the audit passing.
- **Ask first:** changing cable geometry or port positions; adding a dependency;
  changing the packet colours.
- **Never:** animate a segment whose server is stopped; use CSS filters/blur per
  dot; add DOM nodes per frame; change the existing annotations or timing.

## Success Criteria

1. At rest, both tones are visible and moving in opposite directions on the
   serving path.
2. Stopping the serving server removes its dots in the same frame and shows
   `NO DATA` at its port.
3. During failover the switch–users segment keeps moving (responses), and a
   round trip resumes on the new server.
4. A healthy standby has no dots and no plate.
5. Manual with no healthy source: the users segment drains and stops.
6. Reset restores the initial streams and clears the plate.
7. Reduced motion shows dots on active segments only, stationary.
8. No more than ~30 dots; loop pauses offscreen; zero console errors; audit
   passes.

## Resolved decisions

1. **Drain interpretation — responses only.** During the dark window the users
   cable carries amber responses only, because nothing new is being requested;
   requests resume on B after the transfer.
2. **Plate wording — `NO DATA`**, consistent with the English UI.
3. **Tones — cool green requests, warm amber responses**, on the existing
   palette.
4. **Lane separation — 5.2 px**, so the two directions read as two streams
   rather than one dotted cable.
