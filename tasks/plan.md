# Plan: ha-figure

Spec: [docs/spec-ha-page.md](../docs/spec-ha-page.md)

## Order

1. **Structure + copy** — remove the legend and side panel; collapse the numbers
   into one `<details>`; new lead; drop the card hint and title; drop the footer
   on this page only. Keeps every number, removes every paragraph.
2. **One-screen layout** — single centred column, card capped at ~900 px so the
   light and readout sit above the fold at 1440×900.
3. **Hover** — one `data-hover` attribute on the stage, CSS-only fade/highlight,
   labels fade with their tile. No per-frame DOM work.
4. **Hint** — `click A` pill rendered inside the SVG (scales with the figure),
   shown after 1.2 s, hidden forever on first click, `pointer-events: none`.
5. **Verify** — audit, word count, fold, hover, click, details, keyboard,
   console, light/dark.

## Risks

- The card must shrink without the figure becoming unreadable. Mitigation: cap
  at 900 px and check the screenshot, not the numbers.
- Removing the side panel removes the only explanation of the heartbeat. The
  hover + hint must carry it; if the check-reader test fails, the fix is a
  one-line lead, not a panel.
- `innerText` may include closed `<details>` content in some engines; measure
  with `textContent` on visible nodes if so.

## Verification checkpoints

- After step 2: `node build.mjs --audit` passes.
- After step 3: hover A fades B in the browser.
- After step 4: hint appears once, then never.
- After step 5: all spec success criteria pass.
