# Plan: data-flow

Spec: [docs/spec-data-flow.md](../docs/spec-data-flow.md) · depends on `ha-figure`

## Order

1. **Cable data and dots** (`src/hardware.mjs`) — each cable returns its
   quadratic curve, screen normal, dot count and two lanes of dot markup. Add
   the two `NO DATA` plates at the server ports. Export the curves in `data`.
2. **Pass to the client** (`build.mjs`) — serialize the cable curves into
   `liveData`.
3. **Flow engine** (`src/live.js`) — per-segment mode (`both` / `req` / `resp` /
   `none`) from the existing state, phase advance in `tick`, dot placement in
   `draw`, and the stale set for the plates.
4. **Styles** (`src/shell.mjs`) — two tones, lane visibility by mode, the plate,
   reduced-motion rules.
5. **Verify** — audit, motion samples, fault/manual/standby/reset, reduced
   motion, offscreen, console.

## Risks

- **Lane flip:** if the lane normal follows each dot's travel direction, request
  and response dots collide. Mitigation: compute the normal once per cable from
  `start → end` and apply a fixed side per tone.
- **Visual density:** 5 dots on an 18-unit cable can read as a solid line.
  Mitigation: radius 2.6 / 2.2 and tune after the first screenshot.
- **Contradiction in the dark window:** the spec resolves it as responses-only.
  If the tone is unreadable, the fallback is a full round trip — one flag.
- **Performance:** ≤ 36 dots, plain `cx`/`cy` writes in the existing loop; no
  filters, no DOM creation per frame.

## Verification checkpoints

- After step 2: `node build.mjs --audit` passes.
- After step 3: dot coordinates change between two samples 300 ms apart.
- After step 4: a fault shows the plate and moves the stream to B.
- After step 5: all spec success criteria pass.
