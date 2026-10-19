# Clic Clac

**System design, as things you can poke.** A PC-first catalogue of engineering ideas, each drawn as a few real devices on a board and moved by the same arithmetic that decides the real thing.

Hero 1: **[Two servers, one light](site/ha.html)** — high availability in one screen. Two 2U rack units are cabled to a transfer switch; the switch feeds a status beacon for users. Green request packets and amber responses run in opposite lanes along the live cable, and a stopped server's port shows `NO DATA`. Hover a device for its role, click a server to stop it, click the switch to change auto/manual, and press the physical RESET button to start over.

A fault plays out in three annotations: `A stopped`, then `noticed in 1.5 s`, then `dark for 4.1 s` as the beacon comes back on B. The static page carries **31 visible words**; everything else is behind one `Numbers` toggle.

```sh
node build.mjs            # writes site/index.html and site/ha.html
node build.mjs --audit    # proves the drawing: clearance, support, depth order
```

Open `site/index.html` in a browser. No dependencies, no install — the anatomy kit is vendored in `vendor/anatomy`.

Verification (the anatomy skill's own headless tools; set `SKILL` to the skill folder):

```sh
node "$SKILL/scripts/capture.mjs" site/ha.html --out shots/ha.png --width 1440 --height 1500
node "$SKILL/scripts/lines.mjs" site/ha.html --out shots/lines.png      # line ends: 0
```


## What is on the plate

| | |
|---|---|
| Plant | two 2U rack units, a 1U transfer switch, a status beacon, three cables, one reset button |
| Flow | green requests and amber responses, two lanes, ~1.2 s per cable; `NO DATA` at a stopped server's port |
| Health check | 500 ms heartbeat, 3 missed beats → **1.5 s** to notice a stopped server |
| Spare server | ready in **2.5 s** |
| Switch | moves in **0.12 s** |
| Users in the dark | **4.1 s** from the stop to the other server |
| Reliability | 2000 h MTBF, 8 h MTTR, 2% common cause → 99.989% ≈ **59 min/yr** |

The figure is built from **6 recorded items** (11 solids). `node build.mjs --audit` ends `audit passed`: nothing intersects, every part is supported, and every overlap is drawn in true depth order. Cables are drawn paths, not audited solids.

## Controls

- **Hover** a device: it lifts 2 px, gains a shadow, and shows a 2–4 word role tag. Nothing dims.
- **Click** SERVER A or SERVER B to stop or repair it; click the SWITCH to toggle automatic failover.
- **RESET** on the board returns the exact starting state from anywhere.
- **Numbers** opens the tables; closed by default.
- **Keyboard**, for accessibility and not advertised: **A**/**B** stop, **R** repair, **M** mode, **[** **]** health check, **0** reset.
- No auto-tour: the figure only changes on a click. Heartbeat LEDs keep it alive.
- No dark mode: one light plate, one set of materials.

## Layout

```
build.mjs              the site builder (index + figure page)
src/model.mjs          the plant's numbers: detection, transfer, availability, downtime
src/hardware.mjs       the scene: rack units, switch, beacon, cables, reset
src/live.js            the client state machine: heartbeats, faults, failover, annotations
src/shell.mjs          catalogue shell, page CSS, Numbers block
vendor/anatomy/        the isometric kit (camera, solids, lathe, audit)
site/                  built pages
```

## What comes next

The full catalogue is an Epic: load balancing (a switchyard), caching (a shelf with an eviction rule), rate limiting (a token bucket), consistent hashing (a key cabinet on a ring), queues and backpressure (a surge tank). Each gets the same few-devices-on-a-board treatment, its own model module and the same audit bar.
