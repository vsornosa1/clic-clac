# Tasks: data-flow

Spec: [docs/spec-data-flow.md](../docs/spec-data-flow.md)

- [x] Task: Cable curves, lanes and NO DATA plates
  - Acceptance: each cable carries 5 (short) or 8 (long) request dots and the same number of response dots, offset into two lanes; the two plates exist at the server ports
  - Verify: audit passes; markup contains `data-dot` and `data-stale`
  - Files: src/hardware.mjs

- [x] Task: Serialize the curves for the client
  - Acceptance: `DATA.cables` holds `{a,c,b,n,count}` per segment
  - Verify: built page contains `cables:` in the live data
  - Files: build.mjs, src/hardware.mjs

- [x] Task: Flow state and placement
  - Acceptance: modes follow the spec table; positions advance at 1.2 s per segment; stopped servers show `NO DATA`; the users segment drains responses while dark
  - Verify: browser samples; fault, manual, standby, reset
  - Files: src/live.js

- [x] Task: Tone, lane and plate styles
  - Acceptance: cool requests, warm responses, lanes never overlap, plate legible and non-colliding; static under reduced motion
  - Verify: 100% screenshots at rest and after a fault
  - Files: src/shell.mjs

- [x] Task: Verify the spec
  - Acceptance: all eight success criteria pass; audit clean; zero console errors
  - Verify: scripted browser pass
  - Files: —
