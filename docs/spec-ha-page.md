# Spec: The HA figure, v2 — real hardware, free play, timed explanation

Module id: `ha-figure` · supersedes the v1 spec (37 words, hover-only, no
explanation). One capability.

## Objective

Fix all four failures of v1 at once:

1. **It doesn't explain.** The reader cannot say what the switch does or why the
   light matters.
2. **It doesn't look finished.** Four pastel slabs read as a board-game
   prototype.
3. **The interaction is hidden.** Hover fades everything; nothing says these
   are devices you can touch.
4. **No hierarchy.** The beacon — the whole point — is a 6 px green dot.

Reference for craft: **brunosimon.com** — tactile objects, springy motion,
detail you want to poke. We cannot match WebGL; we can match the care.

The concept, the numbers and the audit stay. The scene is rebuilt as two rack
units, a transfer switch, a beacon and cables.

## Visual contract

Everything below is isometric, on the existing board, and recorded where a solid
exists. The board gains a machined edge, four corner screws and soft contact
shadows under every unit.

**SERVER A / SERVER B — 2U rack units** (`w 92 × d 54 × h 26`)
- chassis with a 2 px top bevel; front face on `+y`
- two rack ears with a screw each, 6 front vent slots, two drive bays
- two LEDs on the front: power and heartbeat (green pulse at 0.5 s)
- engraved nameplate on the top: `SERVER A` / `SERVER B`
- one cable port on the inner side, machined rim
- A tinted cool, B tinted warm, both metal — no pastel flat fill

**TRANSFER SWITCH — 1U unit** (`w 64 × d 54 × h 24`)
- two input ports (left and right) and one output port (front)
- a chunky lever on top with a spring ease, resting toward A or B
- a key switch on the front (auto / manual)
- a small inset display showing `A` or `B`
- nameplate `TRANSFER SWITCH`

**USERS — status beacon**
- flanged base with screws, short post, three-ring lens
- green glow and a soft halo when served; dark, no halo, when not
- nameplate `USERS`

**Cables** — three thick cables drawn as SVG paths with a highlight and a small
port collar at each end. They are not audited solids. A live cable carries a
slow travelling pulse; a dead cable is grey and flat.

**RESET** — a physical push button on the board's front-left: ring, cap,
engraved `RESET`. Clicking it returns the initial state from anywhere.

**No auto-tour.** The figure only changes when the user acts. Heartbeat LEDs
keep it alive.

## Interaction contract (free play, reproducible)

- **Hover any device** → it lifts 2 px, gains a soft shadow, the cursor becomes
  a pointer, and a 2–4 word tag appears beside it. Nothing else dims.
  Tags: `PRIMARY` · `STANDBY` · `HEALTH CHECK + TRANSFER` · `THE LOAD`.
- **Click a server** → stop it; click again → repair it.
- **Click the switch** → auto / manual (the key switch is the affordance).
- **Click RESET** → exact initial state: A serving, both up, auto, annotations
  cleared.
- **State is deterministic.** Same click, same sequence, every time. No
  randomness, no idle script.
- **Keyboard aliases stay** for accessibility, unadvertised: A, B, R, M, `[`,
  `]`, plus `0` for reset.

### Three timed annotations

Each appears at its beat, holds 2.2 s, fades 0.25 s; only one at a time.

| t | Tag | Anchored to |
|---|---|---|
| 0.0 s | `A stopped` | SERVER A |
| 1.5 s | `noticed in 1.5 s` | switch |
| ~4.0 s | `dark for 4.0 s` | beacon |

## Copy budget

At rest, details closed: **≤ 40 visible words.** Transient tags and annotations
do not count when absent.

| Element | Copy |
|---|---|
| Kicker | `HIGH AVAILABILITY` |
| Lead | `Two servers, one light. Stop A and watch.` |
| Nameplates | `SERVER A` · `TRANSFER SWITCH` · `SERVER B` · `USERS` · `RESET` |
| Readout | `A serving · light on` |
| Toggle | `Numbers` |
| Hover tags | transient: `PRIMARY` · `STANDBY` · `HEALTH CHECK + TRANSFER` · `THE LOAD` |
| Annotations | transient, as above |

The `Numbers` details stays as built: heartbeat, detection, standby, switch
time, dark time, failures, availability.

## Commands

```
Build:  node build.mjs
Audit:  node build.mjs --audit        # must end "audit passed"
Serve:  npm run serve                 # http://localhost:4173
```

## Project Structure

```
build.mjs        page assembly, copy, plate card, data for live.js
src/hardware.mjs the new scene: units, ports, cables, beacon, reset, shadows
src/live.js      deterministic state machine, hover tags, annotations, reset
src/shell.mjs    shell, CSS, Numbers block
docs/            this spec
tasks/           plan and todo
```

`src/tiles.mjs` is replaced by `src/hardware.mjs`. `src/pond.mjs` is deleted
after this ships.

## Code Style

Annotations are state on the stage, not timers inside the renderer:

```js
// live.js — one queue, one visible tag
const ANNOTATIONS = [
  { at: 0.0, key: "a", text: "A stopped" },
  { at: 1.5, key: "noticed", text: "noticed in 1.5 s" },
  { at: null, key: "dark", text: "dark for 4.0 s" }, // fired on restore
];
function annotate(key) {
  stage.dataset.anno = key;
  clearTimeout(annoTimer);
  annoTimer = setTimeout(() => delete stage.dataset.anno, 2200);
}
```

```css
.iso-stage .cc-anno { opacity: 0; transition: opacity .25s ease }
.iso-stage[data-anno="a"] [data-anno="a"],
.iso-stage[data-anno="noticed"] [data-anno="noticed"],
.iso-stage[data-anno="dark"] [data-anno="dark"] { opacity: 1 }
```

## Testing Strategy

No unit framework is added. Two levels:

1. `node build.mjs --audit` ends `audit passed`.
2. Scripted browser pass, all must pass:
   - visible words at rest ≤ 40; `Numbers` closed;
   - at 1440×900 the full figure and the readout are above the fold;
   - hover each of the four devices: lift (transform), shadow, pointer, tag
     visible, nothing dimmed; leave restores;
   - click A → annotation `A stopped`, then `noticed in 1.5 s`, then the lever
     swings and `dark for 4.0 s`; readout `B serving · light on`;
   - click RESET → initial state, no annotation, no residue;
   - click switch → manual; stop B → light stays dark; repair B → light returns;
   - keyboard aliases work; `0` resets;
   - zero console errors; light plate legible at 100% and at 860 px.

A visual review follows the pass: full-size screenshot in both themes, checking
hardware detail, hierarchy (beacon brightest), and that no label collides.

## Boundaries

- **Always:** run build + audit; keep keyboard access and reduced motion; keep
  the beacon, the cables and the lever (they carry the story); ship one light
  plate only.
- **Ask first:** deleting `src/pond.mjs`; adding a dependency; changing model
  numbers; changing the palette family.
- **Never:** edit `vendor/`; remove the audit; add a modal, tour or onboarding
  overlay; auto-trigger state changes without a click; add a dark theme.

## Success Criteria

1. At rest, ≤ 40 visible words; explanation arrives only as hover tags and
   three annotations.
2. Every device is recognisable hardware in a 100% screenshot: ears, screws,
   vents or drives, ports, LEDs; the beacon is the brightest object.
3. Hover lifts and labels every device; nothing dims; leaving restores in
   ≤ 150 ms.
4. Click A produces the exact three-annotation sequence and the 4.0 s dark
   time; a second identical click sequence produces the same result.
5. RESET restores the initial state in one click from any state.
6. No state change without a click (except heartbeat pulses).
7. One screen at 1440×900; audit passes; zero console errors; one light plate,
   legible at 100%; reduced motion correct.

## Resolved decisions

1. **Hover tags — kept.** They answer the hidden-interaction failure; the three
   annotations still carry the sequence.
2. **Kicker — kept.** `HIGH AVAILABILITY` names the concept in two words.
3. **`src/pond.mjs` — deleted**, along with the superseded `src/tiles.mjs`.
4. **Palette — one light plate, no dark mode.** The theme toggle and its CSS
   were removed from every page.
