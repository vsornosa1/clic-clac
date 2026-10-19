# Draw the Model, Not the Analogy

## Problem Statement
How might we make each figure show the mental model a solution architect already
holds — labelled in the system's own vocabulary and operable — so a first-time
reader decodes it in three seconds instead of needing the answer first?

## Recommended Direction
One rule for every figure: draw the concept's native mental model, never an
analogy to it, and make the model operable. Rate limiting's native model is a
token bucket, so it is drawn literally: a glass bucket, a tap, tokens, requests
taking one. Failover's native model is a topology, so a pump-and-basin stand-in
is the wrong object; HA ships as four labelled tiles — SERVER A, SWITCH,
SERVER B, USERS — three links and one light. No machinery at all.

The differentiator is not "physical" and not "literal" — it is *operable plus
audited*: real numbers, true depth order, a state machine you can trip. Literal
drawing removes the decoding tax; operability supplies the intuition; the audit
keeps the craft honest. Boxes-and-arrows tools own "literal" — they do not own
"operable".

Sequence matters. First run the HA vocabulary control: relabel the existing
figure in IT terms and measure whether naming alone rescues it. That is both a
cheap experiment and the data that justifies (or cancels) rebuilding HA. Then
build rate limiting literally as the flagship for the new standard.

### Evidence for the diagnosis
The shipped HA figure's legend reads "Blue pump A, amber pump B… the see-saw…
the water tower". The words *server*, *standby*, *health check* and *failover*
appear only in a paragraph below the figure. The machine was functioning as a
mnemonic for readers who already knew the answer, not as an explanation.

## Key Assumptions to Validate
- [ ] Naming alone moves comprehension — HA control: 5 strangers, 30 s, 4 can
      state what breaks and what decides it.
- [ ] The native model is drawable as IT plant and still reads as IT — show one
      rate-limiting sketch to 3 architects, ask "what is this?" cold.
- [ ] Operability beats a static diagram — A/B the same figure, static vs
      operable; measure one-sentence recall after 60 s.
- [ ] Isometric beats flat for literal IT — same info, two sketches; time to
      answer the 3-second question.
- [ ] One session suffices for a legible first cut — timebox; if it doesn't,
      cut geometry, never clarity.

## MVP Scope
In: HA vocabulary control (title, lead, legend, stencil labels; no geometry);
the 5-reader test; rate limiting as a literal token bucket with one readout and
at most two controls, passing `node build.mjs --audit`, a phone capture, and the
3-second caption. Out: rebuilding HA; any third figure.

## Not Doing (and Why)
- Relabelling pumps and calling HA done — it is a control, not a destination.
- Side-by-side topology plus machine — you chose literal; two layers is two
  explanations competing for the same three seconds.
- A flat operable topology mode — it deletes the only moat (operable + audited).
- Any new concept before a stranger passes the legibility test — shipping more
  illegible figures multiplies the failure.
- Removing the audit bar — it is the credibility, not the decoration.
- The interactive routing game — real, but it belongs after the model is legible.

## Open Questions
- Does HA get rebuilt, or retired as "the one that taught us the rule"?
- Where does the readout live — on the machine, or the card corner? The
  3-second rule argues for the corner.
- What is "literal" for a non-physical concept (consistent hashing's ring)?
- Who is the primary test reader: the architect, the candidate, or the junior?
  Three audiences, one test — pick one as primary and let the others follow.
