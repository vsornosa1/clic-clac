# Tasks: ha-figure v2

Spec: [docs/spec-ha-page.md](../docs/spec-ha-page.md) · Plan: [plan.md](./plan.md)

- [x] Build the hardware scene
  - Acceptance: two 2U rack units, a 1U switch, a beacon, three cables, a reset button, board screws and contact shadows; audit passes
  - Verify: `node build.mjs --audit` → `audit passed`, 6 items / 11 solids
  - Files: src/hardware.mjs, build.mjs

- [x] Free-play state machine with reset
  - Acceptance: click a server to stop/repair, the switch toggles auto/manual, RESET returns the exact initial state, no auto-tour; standby faults do not dark the load
  - Verify: browser sequence (auto, manual, standby, reset)
  - Files: src/live.js

- [x] Hover tags and lifts
  - Acceptance: every device lifts 2 px with a shadow, its role tag appears, nothing dims; leaving restores
  - Verify: computed transform/opacity in the browser
  - Files: src/live.js, src/shell.mjs, src/hardware.mjs

- [x] Three beat-timed annotations
  - Acceptance: `A stopped` at 0 s, `noticed in 1.5 s` at detection, `dark for 4.1 s` on restore; one at a time, 2.2 s hold; B faults annotate correctly
  - Verify: 300 ms timeline poll
  - Files: src/live.js, src/hardware.mjs, src/shell.mjs

- [x] One light plate, no dark mode
  - Acceptance: no theme toggle, no theme script, no dark CSS on any page
  - Verify: grep for `data-theme`, `cc-theme`, `theme-toggle`
  - Files: build.mjs, src/shell.mjs

- [x] Verify the spec
  - Acceptance: ≤40 visible words (31), one screen at 1440×900, reset/auto/manual/standby behaviour, keyboard incl `0`, zero console errors
  - Verify: browser pass; audit passes
  - Files: —

- [x] Retire superseded modules
  - Acceptance: `src/pond.mjs` and `src/tiles.mjs` gone; nothing imports them
  - Verify: `node build.mjs --audit`
  - Files: src/
