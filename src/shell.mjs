import { fmtMinutes, fmtPercent } from "./model.mjs";

export const SHELL_CSS = `
.cc-page{width:min(1240px,100% - 56px);margin:28px auto}
.cc-shell{display:grid;gap:0}
.cc-head{display:flex;align-items:baseline;gap:18px;padding:22px 0 18px;border-bottom:1px solid var(--anatomy-mid)}
.cc-brand{font-family:var(--anatomy-mono);font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:var(--anatomy-strong);text-decoration:none}
.cc-brand b{color:var(--anatomy-lit)}
.cc-nav{display:flex;gap:16px;margin-right:auto}
.cc-nav a{font-size:12.5px;letter-spacing:.04em;color:var(--anatomy-muted);text-decoration:none}
.cc-nav a:hover,.cc-nav a[data-here]{color:var(--anatomy-strong)}
.cc-strip{display:flex;gap:26px;padding:16px 0 0;flex-wrap:wrap}
.cc-strip span{font-family:var(--anatomy-mono);font-size:11.5px;letter-spacing:.05em;color:var(--anatomy-muted)}
.cc-strip b{color:var(--anatomy-strong);font-weight:400}
.cc-foot{margin:56px 0 0;padding:20px 0 40px;border-top:1px solid var(--anatomy-mid);display:flex;gap:18px;flex-wrap:wrap;font-size:12.5px;color:var(--anatomy-muted)}
.cc-foot b{color:var(--anatomy-strong);font-weight:400}
.cc-hero{padding:64px 0 18px;max-width:820px}
.cc-hero h1{margin:0;font-size:44px;line-height:1.1;letter-spacing:-.02em;color:var(--anatomy-strong);font-weight:500}
.cc-hero p{margin:16px 0 0;font-size:16.5px;line-height:1.65;color:var(--anatomy-text)}
.cc-kicker{font-family:var(--anatomy-mono);font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--anatomy-muted);margin-bottom:10px}
.cc-wall{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;margin:30px 0 0}
.cc-plate{display:block;border:1px solid var(--anatomy-mid);background:var(--anatomy-card);padding:20px 20px 18px;text-decoration:none;color:inherit;position:relative}
.cc-plate:hover{border-color:var(--anatomy-hi)}
.cc-plate .n{font-family:var(--anatomy-mono);font-size:11px;color:var(--anatomy-muted)}
.cc-plate h3{margin:12px 0 6px;font-size:17px;font-weight:500;color:var(--anatomy-strong)}
.cc-plate p{margin:0;font-size:13.5px;line-height:1.55;color:var(--anatomy-text)}
.cc-plate .state{margin-top:16px;font-family:var(--anatomy-mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--anatomy-muted)}
.cc-plate[data-live] .state{color:var(--anatomy-lit)}
.cc-plate[data-live]:after{content:"";position:absolute;top:18px;right:18px;width:6px;height:6px;border-radius:50%;background:var(--anatomy-lit)}
.cc-plate[data-soon]{opacity:.62}
.cc-lead{margin:0 0 18px;font-size:16.5px;line-height:1.5;color:var(--anatomy-text);max-width:62ch}
.cc-lead b{color:var(--anatomy-strong);font-weight:500}
.cc-main{display:block;width:100%;max-width:860px;margin:0 auto;padding:16px 0 0}
.cc-more{max-width:900px;margin:20px auto 0;border-top:1px solid var(--anatomy-mid);padding:14px 0 0}
.cc-more summary{cursor:pointer;list-style:none;font-family:var(--anatomy-mono);font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--anatomy-muted)}
.cc-more summary::-webkit-details-marker{display:none}
.cc-more summary:hover{color:var(--anatomy-strong)}
.cc-more summary:after{content:"+";float:right;color:var(--anatomy-muted)}
.cc-more[open] summary:after{content:"–"}
.cc-more-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:16px}
@media (max-width:760px){.cc-more-grid{grid-template-columns:1fr}}
.cc-fails{margin:0 0 18px;padding:0;list-style:none;display:grid;gap:6px}
.cc-fails li{font-size:12.5px;line-height:1.5;color:var(--anatomy-text);display:grid;grid-template-columns:18px 1fr;gap:6px}
.cc-fails i{font-family:var(--anatomy-mono);font-style:normal;color:var(--anatomy-muted);font-size:10.5px}
.cc-table{width:100%;border-collapse:collapse;font-size:12.5px}
.cc-table td{padding:7px 0;border-bottom:1px solid var(--anatomy-mid);color:var(--anatomy-text)}
.cc-table td:last-child{text-align:right;font-family:var(--anatomy-mono);color:var(--anatomy-strong)}
.cc-table tr:last-child td{border-bottom:none}
.cc-stencil{pointer-events:none}
.cc-name{font-family:var(--anatomy-mono);letter-spacing:.12em;fill:#3f3f45}
.it{transition:transform .15s ease,filter .15s ease}
.iso-stage[data-hover="A"] [data-name="A.server"],
.iso-stage[data-hover="B"] [data-name="B.server"],
.iso-stage[data-hover="switch"] [data-name="switch.mode"],
.iso-stage[data-hover="users"] [data-name="users"],
.iso-stage[data-hover="reset"] [data-name="reset"]{transform:translateY(-2px);filter:drop-shadow(0 5px 4px rgba(0,0,0,.18))}
.cc-tag,.cc-anno{opacity:0;transition:opacity .15s ease;pointer-events:none}
.cc-tag rect{fill:#fff;stroke:#c5c5c0;stroke-width:1}
.cc-tag text{font-family:var(--anatomy-mono);font-size:14px;letter-spacing:.06em;fill:#2f2f35}
.cc-anno rect{fill:#232326;stroke:none}
.cc-anno text{font-family:var(--anatomy-mono);font-size:15px;letter-spacing:.06em;fill:#f4f4f0}
.iso-stage[data-hover="A"] [data-tag="A"],
.iso-stage[data-hover="B"] [data-tag="B"],
.iso-stage[data-hover="switch"] [data-tag="switch"],
.iso-stage[data-hover="users"] [data-tag="users"],
.iso-stage[data-hover="reset"] [data-tag="reset"]{opacity:1}
.iso-stage[data-anno="stopped-a"] [data-anno="stopped-a"],
.iso-stage[data-anno="stopped-b"] [data-anno="stopped-b"],
.iso-stage[data-anno="noticed"] [data-anno="noticed"],
.iso-stage[data-anno="dark"] [data-anno="dark"]{opacity:1}
.cc-trail{font-family:var(--anatomy-mono);font-size:11.5px;color:var(--anatomy-muted);padding:20px 0 0}
.cc-trail a{color:var(--anatomy-text);text-decoration:none}
.cc-trail a:hover{color:var(--anatomy-strong)}
.iso-stage{cursor:default}
.iso-stage[data-cursor="pointer"]{cursor:pointer}
.iso-lamp{fill:var(--anatomy-lo);stroke:none;transition:fill .18s ease}
[data-lamp][data-on] .iso-lamp{fill:var(--anatomy-lit)}
[data-lamp="A"][data-on] .iso-lamp,[data-lamp="unit.A"][data-on] .iso-lamp,[data-lamp="beat.A"][data-on] .iso-lamp{fill:var(--anatomy-green)}
[data-lamp="B"][data-on] .iso-lamp,[data-lamp="unit.B"][data-on] .iso-lamp,[data-lamp="beat.B"][data-on] .iso-lamp{fill:var(--anatomy-green)}
[data-lamp="bus"][data-on] .iso-lamp,[data-lamp="load"][data-on] .iso-lamp{fill:var(--anatomy-lit)}
[data-part="bus"] .bus-bar{fill:var(--anatomy-lit)}
[data-part="bus"][data-state="dead"] .bus-bar{fill:var(--anatomy-lo)}
.it[data-name$=".breaker"][data-state="off"],.it[data-name$=".breaker"] [data-state="off"]{opacity:.45}
.cc-shadow{fill:#000;fill-opacity:.07}
.cc-screw{fill:#9a9aa0;stroke:#5d5d64;stroke-width:.6}
.cc-vent{fill:#3c3c44;opacity:.55}
.cc-bay{fill:#2e2e35;opacity:.8}
.cc-port{fill:#15151a}
.cc-port-ring{fill:none;stroke:#6d6d76;stroke-width:1.2}
.cc-bezel{fill:#2b2b31}
.cc-unit-a .iso-top{fill:#dfe8f5}.cc-unit-a .iso-shade[data-shade="3"]{fill:#e9f0fa}.cc-unit-a .iso-shade[data-shade="2"]{fill:#d3dfef}
.cc-unit-b .iso-top{fill:#f7e8d4}.cc-unit-b .iso-shade[data-shade="3"]{fill:#fbf1e3}.cc-unit-b .iso-shade[data-shade="2"]{fill:#efdcc3}
.cc-unit-sw .iso-top{fill:#e9e7e0}
.cc-beacon-base .iso-top{fill:#e6e3da}
.cc-display .iso-fill{fill:#15151a}
.cc-display .iso-top{fill:#24242a}
.cc-display .iso-shade{fill:#101014}
.cc-display-text{font-family:var(--anatomy-mono);font-size:16px;fill:#8fe39c}
.cc-lens .iso-fill{fill:#a8adb2}
[data-lamp="load"][data-on] .cc-lens .iso-fill{fill:#6fc47f}
[data-lamp="load"][data-on] .cc-lens .iso-top{fill:#8fdc9c}
[data-lamp="load"][data-on] .cc-lens .iso-shade{fill:#7ccf8b}
.cc-lens-ring{fill:none;stroke:#4a7a52;stroke-width:.8;opacity:.55}
.cc-lens-base{fill:#4b4b52}
.cc-knob .iso-fill{fill:#b9432e}
.cc-knob .iso-top{fill:#d9634c}
.cc-knob .iso-shade{fill:#a93a26}
.cc-halo{fill:url(#cc-halo-g);opacity:0;transition:opacity .35s ease}
[data-lamp="load"][data-on] .cc-halo{opacity:1}
.cc-cable-case{fill:none;stroke:#2f2f36;stroke-width:7;stroke-linecap:round}
.cc-cable-core{fill:none;stroke:#8b8b90;stroke-width:2.6;stroke-linecap:round;transition:stroke .2s ease}
[data-part^="link."][data-state="live"] .cc-cable-core{stroke:var(--anatomy-green)}
.cc-dot{stroke:none}
.cc-req{fill:#2f8f5b}
.cc-resp{fill:#c98a2e}
[data-flow="none"] .cc-dot{opacity:0}
[data-flow="req"] .cc-resp{opacity:0}
[data-flow="resp"] .cc-req{opacity:0}
.cc-nodata{opacity:0;transition:opacity .12s ease;pointer-events:none}
.cc-nodata rect{fill:#232326}
.cc-nodata text{font-family:var(--anatomy-mono);font-size:10px;letter-spacing:.08em;fill:#e0a34a}
.iso-stage[data-stale~="A"] [data-stale="A"],
.iso-stage[data-stale~="B"] [data-stale="B"]{opacity:1}
.cc-reset .iso-top{fill:#dcdcd6}
.cc-reset-ring{fill:none;stroke:#55555c;stroke-width:1.2}
.cc-reset-cap{fill:#c9c9c2;stroke:#7a7a80;stroke-width:.8}
.cc-mat .iso-top{fill:#fbf7ee}
.cc-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.iso[data-theme="light"]{--anatomy-mid:#60606a;--anatomy-lo:#909096;--anatomy-faint:#c2c2c6;--anatomy-shade-0:#bcbcb7;--anatomy-shade-1:#ccccC7;--anatomy-shade-2:#dcdcd7;--anatomy-shade-3:#eaeae6;--anatomy-halo-opacity:.5;--anatomy-weight:.7px}
@media (prefers-reduced-motion: reduce){.it,.cc-tag,.cc-anno,.cc-halo,.cc-cable-core,.iso-lamp,.cc-nodata{transition:none}}
`;

export const CONCEPTS = [
  {
    n: "01",
    id: "ha",
    title: "Two servers, one light",
    q: "One server stops. Does the light stay on, and what decides that?",
    state: "live",
  },
  { n: "02", id: "lb", title: "Load balancing", q: "Where does the next request go, and what breaks when a node is slow?", state: "soon" },
  { n: "03", id: "cache", title: "Caching and eviction", q: "What stays, what is thrown out, and who decides?", state: "soon" },
  { n: "04", id: "rate", title: "Rate limiting", q: "A token bucket, a leaky bucket, and what a burst really costs.", state: "soon" },
  { n: "05", id: "hash", title: "Consistent hashing", q: "Adding one node should not move every key.", state: "soon" },
  { n: "06", id: "queue", title: "Queues and backpressure", q: "The difference between a slow service and a falling-over one.", state: "soon" },
];

export function header({ here = "" } = {}) {
  return `<header class="cc-head">
  <a class="cc-brand" href="index.html">clic&nbsp;clac<b>.</b> machines</a>
  <nav class="cc-nav">
    <a href="index.html"${here === "index" ? ' data-here=""' : ""}>Catalogue</a>
    <a href="ha.html"${here === "ha" ? ' data-here=""' : ""}>High availability</a>
    <a href="#" data-about>How it is made</a>
  </nav>
</header>`;
}

export function footer() {
  return `<footer class="cc-foot">
  <span>Every number in the figure comes from <b>src/model.mjs</b> — the same model that moves the parts.</span>
  <span>Built with the <b>anatomy</b> kit: isometric solids, a recorded shape for every part, an audit that proves the drawing.</span>
</footer>`;
}

export function indexBody() {
  const plates = CONCEPTS.map(
    (c) => `<a class="cc-plate" ${c.state === "live" ? `href="${c.id}.html" data-live` : `data-soon href="#" onclick="return false"`}>
    <span class="n">${c.n}</span>
    <h3>${c.title}</h3>
    <p>${c.q}</p>
    <span class="state">${c.state === "live" ? "Figure 1 · live" : "In engineering"}</span>
  </a>`,
  ).join("\n  ");
  return `<section class="cc-hero">
  <div class="cc-kicker">System design, as things you can poke</div>
  <h1>One idea, four things on a board, and a light that tells you the truth.</h1>
  <p>Each concept is four or five labelled things on a board, and a line that lights up where work actually flows. Press one, and the number in the corner tells you what it cost.</p>
</section>
<section class="cc-wall" aria-label="Concepts">
  ${plates}
</section>`;
}

export function numbersBody(rep, { faultsPerYear }) {
  return `<details class="cc-more">
  <summary>Numbers</summary>
  <div class="cc-more-grid">
    <table class="cc-table">
      <tr><td>Heartbeat, one per</td><td>${rep.heartbeatS.toFixed(1)} s</td></tr>
      <tr><td>Three missed beats noticed in</td><td>${rep.detectS.toFixed(1)} s</td></tr>
      <tr><td>The spare server is ready in</td><td>${rep.startS.toFixed(1)} s</td></tr>
      <tr><td>The switch moves in</td><td>${rep.breakS.toFixed(2)} s</td></tr>
      <tr><td>The users are dark for</td><td>${(rep.outageS + rep.breakS).toFixed(1)} s</td></tr>
      <tr><td>After a repair</td><td>traffic stays on B</td></tr>
    </table>
    <div>
      <ul class="cc-fails">
        <li><i>01</i><span>Manual switch, stopped server: nobody moves the traffic.</span></li>
        <li><i>02</i><span>A slower health check means a longer dark.</span></li>
        <li><i>03</i><span>One rack, one power feed: one failure, not two.</span></li>
      </ul>
      <table class="cc-table">
        <tr><td>One server, 2000 h MTBF, 8 h MTTR</td><td>${fmtPercent(rep.single, 2)}</td></tr>
        <tr><td>Two servers, independent</td><td>${fmtPercent(rep.pair, 4)}</td></tr>
        <tr><td>Two servers, 2% common cause</td><td>${fmtPercent(rep.pairWithCommonCause, 3)}</td></tr>
        <tr><td>Unplanned downtime a year</td><td>${fmtMinutes(rep.pairHoursPerYear)}</td></tr>
        <tr><td>${faultsPerYear.toFixed(1)} failovers a year cost</td><td>${(faultsPerYear * rep.outageS).toFixed(0)} s</td></tr>
      </table>
    </div>
  </div>
</details>`;
}
