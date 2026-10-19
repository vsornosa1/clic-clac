# Clic Clac — Epic plan

**Goal:** a PC-first catalogue of system-design concepts, each explained by one machine you can operate. The machine is the explanation; the readout is the evidence.

## The simplicity contract (applies to every figure)

A reader who has never seen the figure must answer three questions in three seconds:

1. **What is this?** — named by its silhouette (two generators, a switchyard, a bucket).
2. **What moves?** — one part, lit, and only one.
3. **What number does it change?** — one big readout in the card corner, one sentence above the card.

Rules:

- **One subject per figure.** The figure carries the concept; everything else is removed. The ceiling is the fewest recorded items that still tell the story (Figure 1 is 5 items, 9 solids). If a part needs a legend to explain it, it is the wrong part.
- **Draw the model, not an analogy.** A pump standing in for a server makes the reader learn two things. Draw the server, the switch, the users. Literal objects, the system's own words on them.
- **At most two controls**, both on the machine and both obvious. Everything else is a readout.
- **No decorative plant.** A part earns its place only if it carries the concept (fuel, exhaust and air ducts earn nothing in a failover story; they go).
- **A and B are written on the machines**, engraved on real nameplates — not in a legend.
- **The load is one big thing.** A beacon that is lit or dark, never a row of six feeders.
- **One screen, under forty words.** The figure, one lead line and one readout fit above the fold at 1440×900. Numbers and failure modes hide behind a single toggle. Hover explains; click acts.
- **The legend names only what the reader must distinguish.** The caption adds the numbers.
- **Audit and lines still pass.** Simplicity is not permission to draw loose ends.

## The machines, in build order

### 1. High availability and failover — *done, v2 hardware*
Two 2U rack units, a 1U transfer switch, a status beacon, three cables, one reset button.
**Model:** heartbeat interval × misses = detection; spare ready + switch = failover; the beacon's dark time = the users' outage; MTBF/MTTR/common cause → availability and minutes a year.
**Watch:** stop A → the annotation says `A stopped` → at 1.5 s `noticed` → the lever swings, B serves, `dark for 4.1 s`; the packet stream moves from A to B and A's port shows `NO DATA`.

### 2. Rate limiting — *a token-bucket water clock*
A glass bucket with a tap dripping tokens at `r` per second; each request must take a token to pass; a short burst can borrow from the bucket's capacity `b`.
**Model:** tokens(t) = min(b, tokens + r·Δt); requests take 1; reject when empty; admission rate and burst length.
**Controls:** tap rate `r`, bucket size `b`.
**Watch:** turn the tap down and a burst that passed a moment ago is now refused.

### 3. Load balancing — *a railway switchyard*
One incoming track, three platforms; a turntable sends each wagon to the next platform in turn, and skips a platform whose signal is red.
**Model:** round robin vs weighted round robin vs least connections; health checks; the share each platform gets while one is slow.
**Controls:** algorithm, platform health.
**Watch:** redden a platform — round robin keeps sending it work, least-connections stops.

### 4. Caching — *a pantry with an eviction rule*
A cook asks for ingredients; a jar on the shelf is a hit, a trip to the market is a miss. The shelf holds five jars; a sixth must evict the least recently used.
**Model:** capacity, hit ratio, miss penalty, LRU eviction order.
**Controls:** shelf capacity, request pattern.
**Watch:** lower the capacity and the hit ratio collapse; the jar that leaves is the one not used longest.

### 5. Consistent hashing — *a key cabinet on a ring*
Keys hang on a ring of hooks; three drawers each own an arc. Add a fourth drawer and only its arc moves.
**Model:** modulo hashing moves nearly every key when N changes; consistent hashing moves ~1/N; virtual nodes smooth the split.
**Controls:** add/remove a drawer, ring size.
**Watch:** the counter of keys that moved — 100% versus a quarter.

### 6. Queues and backpressure — *a surge tank feeding a turbine*
Water arrives faster than the turbine can take it; the tank buffers, the spillway rejects, and closing the inlet is backpressure.
**Model:** λ, μ, buffer size, Little's law, dropped work, wait time.
**Controls:** inflow, buffer size.
**Watch:** push the inflow past μ and see whether the tank fills, spills or pushes back.

## Order and rationale

1. Simplification pass on Figure 1 (this session): four labelled tiles, three links, one light, one sentence.
2. Rate limiting: the smallest new machine and the strongest physical metaphor; proves the 3-second test on a fresh concept.
3. Load balancing: reuses the ATS idea (a switch that chooses) with a visible distribution.
4. Caching: introduces memory and eviction (the first stateful machine).
5. Consistent hashing: the ring geometry, the first model with a hashing visual.
6. Queues: the first fluid model, and the natural finale (what happens when demand outruns supply).

Each ship requires: `node build.mjs --audit` ending `audit passed`, the line check at 0, three beat-timed annotations, hover tags on every device, a deterministic reset, a phone capture, and one light plate (no dark mode).
