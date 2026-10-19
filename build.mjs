import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./vendor/anatomy/kit/iso-kit.mjs";
import { kitScript } from "./vendor/anatomy/scripts/inline-kit.mjs";
import { buildHall, armSvg } from "./src/hardware.mjs";
import { report, failoversPerYear, PLANT, INTERVALS } from "./src/model.mjs";
import { SHELL_CSS, header, footer, indexBody, numbersBody } from "./src/shell.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "site");
const audit = process.argv.includes("--audit");
mkdirSync(OUT, { recursive: true });

const stripExports = (file) =>
  readFileSync(join(HERE, "vendor", "anatomy", "kit", file), "utf8")
    .replace(/^import .*$/m, "")
    .replace(/^export /gm, "");
const inlineFn = (fn) => fn.toString().replace(/\bk\./g, "");

const { svg, P, data } = buildHall({ audit });
const rep = report({ heartbeatS: INTERVALS[0], rideS: 0 });
const faults = failoversPerYear(PLANT);

const latheScript = `const G = (() => {${stripExports("lathe.mjs")}\nreturn { viewOf, scaleOf, frameAlong, frameOf, pointOf, disc, sphereOf, prismOf, arcOf, circleOf, spokesOf, ribsOf, dotsOf, saddleOf, solidOf, dot3, add3, sub3, mul3, unit3, cross3, len3, lerp3, radialOf, fillet, pathLength, tangentAlong };})();\n`;
const liveSource = readFileSync(join(HERE, "src", "live.js"), "utf8");

const liveData = `{P: ${JSON.stringify(P)}, intervals: ${JSON.stringify(INTERVALS)}, interval: ${rep.heartbeatS}, startS: ${rep.startS}, breakS: ${rep.breakS}, detectS: ${rep.detectS}, armF: ${JSON.stringify(data.armF)}, arm: ${inlineFn(armSvg)}}`;

const shellScript = `<script>(function(){var a=document.querySelector("[data-about]");if(a)a.addEventListener("click",function(e){e.preventDefault();a.textContent="built with the anatomy kit";a.style.color="var(--anatomy-strong)"})})();</script>`;

function page({ title, here, body, script = "", showFooter = true }) {
  const shell = `<style>${SHELL_CSS}</style>
<div class="cc-shell">
${header({ here })}
${body}
${showFooter ? footer() : ""}
</div>${shellScript}`;
  return k
    .pageHtml({ title, theme: "light", width: 1240, body: shell, script })
    .replace('<main class="iso-page">', '<main class="iso-page cc-page">');
}

writeFileSync(join(OUT, "index.html"), page({ title: "Clic Clac — system design, operated", here: "index", body: indexBody() }));

const lead = `<div class="cc-kicker">High availability</div><p class="cc-lead"><b>Two servers, one light.</b> Stop A and watch.</p>`;

const card = k.plateHtml({
  fig: "Fig 1",
  readout: "A serving · light on",
  body: `<div class="iso-stage" tabindex="0" role="group" aria-label="Two rack servers, a transfer switch and a beacon. Click a server to stop or repair it, click the switch to change auto or manual, click reset to start over. Keys A, B, R, M, brackets and zero also work.">${svg}<span class="cc-sr" role="status" aria-live="polite" data-status></span></div>`,
});

const figure = `<div class="cc-main">
  ${lead}${card}
  ${numbersBody(rep, { faultsPerYear: faults })}
</div>`;

writeFileSync(
  join(OUT, "ha.html"),
  page({
    title: "High availability and failover — Clic Clac",
    here: "ha",
    body: figure,
    showFooter: false,
    script: kitScript() + latheScript + liveSource.replace("__DATA__", liveData),
  }),
);

console.log(`wrote site/index.html and site/ha.html · detect ${rep.detectS.toFixed(1)} s · dark ${rep.outageS.toFixed(1)} s`);
