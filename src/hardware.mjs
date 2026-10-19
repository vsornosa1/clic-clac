import * as k from "../vendor/anatomy/kit/iso-kit.mjs";
import * as G from "../vendor/anatomy/kit/lathe.mjs";
import * as A from "../vendor/anatomy/kit/audit.mjs";

// Two rack units, a transfer switch, a beacon and three cables.
// Real hardware: ears, screws, vents, drive bays, ports, LEDs.

export const W = 1120;
export const H = 640;
const AZIMUTH = 45;
const ELEVATION = 30;

const MAT = { x: -150, y: -92, w: 300, d: 184, r: 14 };
const MAT_Z = -4;
const MAT_H = 6;
const UNIT_H = 26;
const SW_H = 24;

const A_PLAN = { x: -142, y: -37, w: 92, d: 54, r: 3 };
const S_PLAN = { x: -32, y: -37, w: 64, d: 54, r: 2 };
const B_PLAN = { x: 50, y: -37, w: 92, d: 54, r: 3 };
const BEACON = { x: 0, y: 62 };
const RESET = { x: -124, y: 70 };

const FRONT = (plan) => plan.y + plan.d;

export const P = k.fitProjection(
  [
    ...k.boxCorners(MAT, MAT_Z, MAT_H + 20),
    [A_PLAN.x + A_PLAN.w / 2, -10, MAT_H + UNIT_H + 2],
    [S_PLAN.x + S_PLAN.w / 2, -10, MAT_H + SW_H + 2],
    [B_PLAN.x + B_PLAN.w / 2, -10, MAT_H + UNIT_H + 2],
    [BEACON.x, BEACON.y, MAT_H + 40],
    [RESET.x, RESET.y, MAT_H + 26],
    [A_PLAN.x + A_PLAN.w / 2, -10, MAT_H + UNIT_H + 48],
    [B_PLAN.x + B_PLAN.w / 2, -10, MAT_H + UNIT_H + 48],
    [0, -10, MAT_H + SW_H + 52],
    [BEACON.x, BEACON.y, MAT_H + 78],
  ],
  W,
  H,
  { pad: 44, azimuth: AZIMUTH, elevation: ELEVATION },
);

const V = G.viewOf(P);
const KS = G.scaleOf(P);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const hx = (v) => Math.round(v * 100) / 100;

const R = A.recorder(P);
const record = R.solid;
const LIVE_FRAMES = {};

function put(name, ref, svg, shapes = [], { bias = 0, ...rest } = {}) {
  return R.put({ name, at: ref, bias, svg, shapes, piece: "hw", ...rest });
}

const frontFrame = (plan, z0) =>
  G.frameOf([plan.x + plan.w / 2, FRONT(plan) + 0.05, z0], [0, 1, 0], [1, 0, 0], [0, 0, 1]);

const dot = (lamp, p, r) => {
  const [cx, cy] = at(p);
  return `<g data-lamp="${lamp}" data-on=""><circle class="iso-lamp" cx="${hx(cx)}" cy="${hx(cy)}" r="${r}"/></g>`;
};

function shadow(plan, rx) {
  const [cx, cy] = at([plan.x + plan.w / 2, plan.y + plan.d / 2, MAT_H + 0.1]);
  return `<ellipse class="cc-shadow" cx="${hx(cx)}" cy="${hx(cy)}" rx="${rx}" ry="${rx * 0.34}"/>`;
}

// ---------------------------------------------------------------------------
// One 2U rack unit
// ---------------------------------------------------------------------------
function rackUnit(key, plan, tint) {
  const cx = plan.x + plan.w / 2;
  const z0 = MAT_H;
  const z1 = z0 + UNIT_H;
  const front = FRONT(plan);
  const F = frontFrame(plan, z0);
  const w = plan.w;
  const body = record(A.slab(plan, z0, UNIT_H, { name: `${key}.server` }, 4));

  const vents = [];
  for (let i = 0; i < 6; i++) {
    const u = -34 + i * 4.3;
    vents.push(S(G.prismOf(F, [[u, 5], [u + 1.7, 5], [u + 1.7, 21], [u, 21]], 0.2, 0.8, P), { tone: "faint", className: "cc-vent" }));
  }
  const bays = [5, 14].map((v) =>
    S(G.prismOf(F, [[3, v], [17, v], [17, v + 7], [3, v + 7]], 0.2, 0.9, P), { tone: "lo", className: "cc-bay" }) +
    Ln(G.circleOf(G.frameOf([cx + 10, front + 1.1, z0 + v + 3.5], [0, 1, 0], [1, 0, 0], [0, 0, 1]), 0.4, 1.6, P), { tone: "mid" }),
  );
  const ears = [-1, 1]
    .map((sign) => {
      const u = sign * (w / 2 - 4);
      const ear = S(G.prismOf(F, [[u, 0], [u + sign * 3.2, 0], [u + sign * 3.2, UNIT_H], [u, UNIT_H]], 0.7, 2.4, P), { tone: "hi" });
      const [sx, sy] = at([cx + u + sign * 1.6, front + 1.6, z1 - 6]);
      return ear + `<circle class="cc-screw" cx="${hx(sx)}" cy="${hx(sy)}" r="2.1"/>`;
    })
    .join("");
  const [ledX, ledY] = at([cx - 40, front + 1, z0 + 21]);
  const [beatX, beatY] = at([cx - 34, front + 1, z0 + 21]);
  const leds =
    `<circle class="cc-bezel" cx="${hx(ledX)}" cy="${hx(ledY)}" r="3.4"/>` +
    `<circle class="cc-bezel" cx="${hx(beatX)}" cy="${hx(beatY)}" r="2.6"/>` +
    dot(`unit.${key}`, [cx - 40, front + 1.1, z0 + 21], 2.2) +
    dot(`beat.${key}`, [cx - 34, front + 1.1, z0 + 21], 1.6);

  const [px, py] = at([key === "A" ? plan.x + plan.w : plan.x, plan.y + plan.d / 2, z0 + 14]);
  const port =
    `<circle class="cc-port" cx="${hx(px)}" cy="${hx(py)}" r="4.6"/>` +
    `<circle class="cc-port-ring" cx="${hx(px)}" cy="${hx(py)}" r="6.6"/>`;

  return put(
    `${key}.server`,
    [cx, plan.y + plan.d / 2, z0 + UNIT_H / 2],
    S(k.slabOf(plan, z0, UNIT_H, P, 4, 1.4), { tone: "hi", className: `cc-unit cc-unit-${tint}` }) +
      vents.join("") +
      bays.join("") +
      ears +
      leds +
      port,
    [body],
    { bias: key === "A" ? 0.2 : 0.4 },
  );
}

// ---------------------------------------------------------------------------
// The transfer switch: a lever on top, a key switch and an A/B display
// ---------------------------------------------------------------------------
const ARM_Z = MAT_H + SW_H + 4;
const ARM_F = G.frameOf([0, -22, ARM_Z], [0, 1, 0], [-1, 0, 0], [0, 0, 1]);
LIVE_FRAMES.armF = ARM_F;

export function armSvg(F, angle, P) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const rot = (u, v) => [u * c - v * s, u * s + v * c];
  const pts = [[-4, -3], [19, -3], [22, 0], [19, 3], [-4, 3]].map(([u, v]) => rot(u, v));
  const [tu, tv] = rot(22, 0);
  const tip = [F.o[0] + F.u[0] * tu + F.v[0] * tv, F.o[1] + F.u[1] * tu + F.v[1] * tv, F.o[2] + F.u[2] * tu + F.v[2] * tv];
  return (
    k.solidSvg(G.prismOf(F, pts, -1.8, 5.8, P), { tone: "hi" }) +
    k.solidSvg(G.sphereOf(tip, 3.2, P, { steps: 20 }), { tone: "hi", className: "cc-knob" })
  );
}

function switchUnit() {
  const z0 = MAT_H;
  const z1 = z0 + SW_H;
  const front = FRONT(S_PLAN);
  const F = frontFrame(S_PLAN, z0);
  const body = record(A.slab(S_PLAN, z0, SW_H, { name: "switch.mode" }, 4));
  const hubF = G.frameOf([0, -22, z1], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const hub = record(A.disc(hubF, 0, ARM_Z - z1, 2.6, { name: "switch.hub", owner: "switch.arm" }));
  const armShape = record(
    A.prism(
      ARM_F,
      [[-4, -3], [19, -3], [22, 0], [19, 3], [-4, 3]].map(([u, v]) => [u * Math.cos(0.2) - v * Math.sin(0.2), u * Math.sin(0.2) + v * Math.cos(0.2)]),
      -1.8,
      5.8,
      { name: "switch.arm", owner: "switch.arm" },
    ),
  );
  const keyF = G.frameOf([S_PLAN.x + 10, front + 0.5, z0 + 12], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const key =
    S(G.disc(0, 2.6, 4.2, keyF, P, { steps: 18 }), { tone: "mid" }) +
    Ln(G.circleOf(keyF, 2.7, 2.2, P), { tone: "lo" });
  const [dx, dy] = at([17, front + 1, z0 + 14]);
  const display =
    S(G.prismOf(F, [[6, 8], [28, 8], [28, 20], [6, 20]], 0.2, 0.9, P), { tone: "lo", className: "cc-display" }) +
    `<text class="cc-display-text" data-display x="${hx(dx)}" y="${hx(dy + 4)}" text-anchor="middle">A</text>`;
  const portAt = (p) => {
    const [px, py] = at(p);
    return `<circle class="cc-port" cx="${hx(px)}" cy="${hx(py)}" r="4.4"/><circle class="cc-port-ring" cx="${hx(px)}" cy="${hx(py)}" r="6.4"/>`;
  };
  const ports =
    portAt([S_PLAN.x, -10, MAT_H + 16]) +
    portAt([S_PLAN.x + S_PLAN.w, -10, MAT_H + 16]) +
    portAt([0, front, MAT_H + 10]);
  return put(
    "switch.mode",
    [0, S_PLAN.y + S_PLAN.d / 2, z0 + SW_H / 2],
    S(k.slabOf(S_PLAN, z0, SW_H, P, 4, 1.4), { tone: "hi", className: "cc-unit cc-unit-sw" }) +
      S(k.cylinder(0, -22, 2.6, z1, ARM_Z - z1, P, 18), { tone: "lo" }) +
      `<g data-part="arm">${armSvg(ARM_F, 0.2, P)}</g>` +
      key +
      display +
      ports,
    [body, hub, armShape],
    { bias: 0.6 },
  );
}

// ---------------------------------------------------------------------------
// The beacon: base, post, three-ring lens, halo
// ---------------------------------------------------------------------------
function beacon() {
  const basePlan = { x: BEACON.x - 17, y: BEACON.y - 17, w: 34, d: 34, r: 4 };
  const base = record(A.slab(basePlan, MAT_H, 6, { name: "users.base" }, 4));
  const post = record(A.cylinder(BEACON.x, BEACON.y, 2.4, MAT_H + 6, 18, { name: "users.post" }));
  const lens = record(A.cylinder(BEACON.x, BEACON.y, 9, MAT_H + 24, 9, { name: "users.lens" }));
  const cap = record(A.cylinder(BEACON.x, BEACON.y, 7, MAT_H + 33, 3, { name: "users.cap" }));
  const [lx, ly] = at([BEACON.x, BEACON.y, MAT_H + 28]);
  const screws = [[-12, -12], [12, -12], [-12, 12], [12, 12]]
    .map(([dx, dy]) => {
      const [sx, sy] = at([BEACON.x + dx, BEACON.y + dy, MAT_H + 6.2]);
      return `<circle class="cc-screw" cx="${hx(sx)}" cy="${hx(sy)}" r="1.9"/>`;
    })
    .join("");
  const [bpx, bpy] = at([BEACON.x, BEACON.y - 17, MAT_H + 10]);
  const port = `<circle class="cc-port" cx="${hx(bpx)}" cy="${hx(bpy)}" r="3.4"/><circle class="cc-port-ring" cx="${hx(bpx)}" cy="${hx(bpy)}" r="5"/>`;
  return put(
    "users",
    [BEACON.x, BEACON.y, MAT_H + 18],
    S(k.slabOf(basePlan, MAT_H, 6, P, 4, 1), { tone: "mid", className: "cc-beacon-base" }) +
      screws +
      port +
      S(k.cylinder(BEACON.x, BEACON.y, 2.4, MAT_H + 6, 18, P, 18), { tone: "lo" }) +
      `<g data-lamp="load" data-on=""><circle class="cc-halo" cx="${hx(lx)}" cy="${hx(ly)}" r="44"/><circle class="cc-lens-base" cx="${hx(lx)}" cy="${hx(ly + 9)}" r="9"/>${S(k.cylinder(BEACON.x, BEACON.y, 9, MAT_H + 24, 9, P, 28), { tone: "hi", className: "cc-lens" })}
        <path class="cc-lens-ring" d="${G.circleOf(G.frameOf([BEACON.x, BEACON.y, MAT_H + 26], [0, 0, 1], [1, 0, 0], [0, 1, 0]), 0, 9, P)}"/>
        <path class="cc-lens-ring" d="${G.circleOf(G.frameOf([BEACON.x, BEACON.y, MAT_H + 30], [0, 0, 1], [1, 0, 0], [0, 1, 0]), 0, 9, P)}"/>
      </g>` +
      S(k.cylinder(BEACON.x, BEACON.y, 7, MAT_H + 33, 3, P, 24), { tone: "mid" }),
    [base, post, lens, cap],
    { bias: 1.4 },
  );
}

// ---------------------------------------------------------------------------
// Reset button
// ---------------------------------------------------------------------------
function resetButton() {
  const plan = { x: RESET.x - 8, y: RESET.y - 8, w: 16, d: 16, r: 8 };
  const body = record(A.slab(plan, MAT_H, 5, { name: "reset" }, 10));
  const [cx, cy] = at([RESET.x, RESET.y, MAT_H + 5.4]);
  return put(
    "reset",
    [RESET.x, RESET.y, MAT_H + 3],
    S(k.slabOf(plan, MAT_H, 5, P, 10, 2.4), { tone: "mid", className: "cc-reset" }) +
      `<circle class="cc-reset-ring" cx="${hx(cx)}" cy="${hx(cy)}" r="4.2"/>` +
      `<circle class="cc-reset-cap" cx="${hx(cx)}" cy="${hx(cy)}" r="3"/>`,
    [body],
    { bias: 1.2 },
  );
}

// ---------------------------------------------------------------------------
// Cables, ports, shadows and labels
// ---------------------------------------------------------------------------
function cable(name, from, to, sag) {
  const a = at(from);
  const b = at(to);
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2 + sag;
  const d = `M${hx(a[0])} ${hx(a[1])}Q${hx(mx)} ${hx(my)} ${hx(b[0])} ${hx(b[1])}`;
  return `<g data-part="link.${name}"><path class="cc-cable-case" d="${d}"/><path class="cc-cable-core" d="${d}"/></g>`;
}

function mat() {
  const height = MAT_H - MAT_Z;
  const shadows = [A_PLAN, S_PLAN, B_PLAN].map((p) => shadow(p, 58)).join("") +
    `<ellipse class="cc-shadow" cx="${hx(at([BEACON.x, BEACON.y, MAT_H + 0.1])[0])}" cy="${hx(at([BEACON.x, BEACON.y, MAT_H + 0.1])[1])}" rx="26" ry="9"/>`;
  const screws = [[-138, -80], [138, -80], [-138, 80], [138, 80]]
    .map(([x, y]) => {
      const [sx, sy] = at([x, y, MAT_H]);
      return `<circle class="cc-screw" cx="${hx(sx)}" cy="${hx(sy)}" r="2.4"/>`;
    })
    .join("");
  return put(
    "mat.board",
    centre(MAT),
    S(k.slabOf(MAT, MAT_Z, height, P, 10, 2.4), { tone: "mid", className: "cc-mat" }) + shadows + screws,
    [record(A.slab(MAT, MAT_Z, height, { name: "mat.board", ground: true }, 10))],
    { bias: -2 },
  );
}

const centre = (plan) => [plan.x + plan.w / 2, plan.y + plan.d / 2];

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------
export function buildHall({ audit = false } = {}) {
  mat();
  rackUnit("A", A_PLAN, "a");
  rackUnit("B", B_PLAN, "b");
  switchUnit();
  beacon();
  resetButton();
  R.items.sort((a, b) => a.key - b.key);
  A.settle(R, P);
  R.items.sort((a, b) => a.key - b.key);
  A.auditOrExit(R, P, { argv: audit ? ["--audit"] : [] });

  const items = R.items.map((item) => `<g class="it" data-name="${item.name}"${item.attrs ?? ""}>${item.svg}</g>`).join("");
  const ax = A_PLAN.x + A_PLAN.w / 2;
  const bx = B_PLAN.x + B_PLAN.w / 2;
  const stencil = (text, x, y, z, key, size = 19) => {
    const [sx, sy] = at([x, y, z]);
    return `<text class="cc-name" data-label="${key}" font-size="${size}" x="${hx(sx)}" y="${hx(sy)}" text-anchor="middle" dominant-baseline="middle">${text}</text>`;
  };
  const labels = `<g class="cc-stencil" aria-hidden="true">${[
    ["SERVER A", ax, A_PLAN.y + 17, MAT_H + UNIT_H, "A"],
    ["SERVER B", bx, B_PLAN.y + 17, MAT_H + UNIT_H, "B"],
    ["SWITCH", 0, S_PLAN.y + S_PLAN.d - 10, MAT_H + SW_H, "switch", 15],
    ["USERS", BEACON.x, BEACON.y + 24, MAT_H, "users", 15],
    ["RESET", RESET.x + 24, RESET.y, MAT_H, "reset", 13],
  ]
    .map(([text, x, y, z, key, size]) => stencil(text, x, y, z, key, size))
    .join("")}</g>`;

  const tag = (text, at3, key, cls, attr) => {
    const [x, y] = at(at3);
    const w = text.length * 8.8 + 24;
    return `<g class="${cls}" ${attr}="${key}"><rect x="${hx(x - w / 2)}" y="${hx(y - 16)}" width="${Math.round(w)}" height="32" rx="16"/><text x="${hx(x)}" y="${hx(y + 1)}" text-anchor="middle" dominant-baseline="middle">${text}</text></g>`;
  };
  const tags = [
    tag("PRIMARY", [ax, -10, MAT_H + UNIT_H + 24], "A", "cc-tag", "data-tag"),
    tag("STANDBY", [bx, -10, MAT_H + UNIT_H + 24], "B", "cc-tag", "data-tag"),
    tag("HEALTH CHECK + TRANSFER", [0, -10, MAT_H + SW_H + 30], "switch", "cc-tag", "data-tag"),
    tag("THE LOAD", [BEACON.x, BEACON.y, MAT_H + 56], "users", "cc-tag", "data-tag"),
    tag("START OVER", [RESET.x, RESET.y, MAT_H + 26], "reset", "cc-tag", "data-tag"),
  ].join("");
  const annos = [
    tag("A stopped", [ax, -10, MAT_H + UNIT_H + 42], "stopped-a", "cc-anno", "data-anno"),
    tag("B stopped", [bx, -10, MAT_H + UNIT_H + 42], "stopped-b", "cc-anno", "data-anno"),
    tag("noticed in 1.5 s", [0, -10, MAT_H + SW_H + 48], "noticed", "cc-anno", "data-anno"),
    tag("dark for 4.1 s", [BEACON.x - 26, BEACON.y + 30, MAT_H + 26], "dark", "cc-anno", "data-anno"),
  ].join("");

  const cables = [
    cable("A", [A_PLAN.x + A_PLAN.w, -10, MAT_H + 14], [S_PLAN.x, -10, MAT_H + 16], 12),
    cable("B", [B_PLAN.x, -10, MAT_H + 14], [S_PLAN.x + S_PLAN.w, -10, MAT_H + 16], 12),
    cable("users", [0, FRONT(S_PLAN), MAT_H + 10], [BEACON.x, BEACON.y - 17, MAT_H + 10], 10),
  ].join("");

  const svg = k.figureSvg({
    width: W,
    height: H,
    label:
      "Two 2U rack servers, A and B, cabled to a transfer switch, which feeds a status beacon for users. A reset button sits on the board. Green cables show the live path; a lever on the switch points at the serving server.",
    body: `<defs><radialGradient id="cc-halo-g"><stop offset="0" stop-color="#6fc47f" stop-opacity=".5"/><stop offset=".45" stop-color="#6fc47f" stop-opacity=".28"/><stop offset="1" stop-color="#6fc47f" stop-opacity="0"/></radialGradient></defs><g data-part="hw">${items}</g>${cables}${labels}${tags}${annos}`,
  });
  return { svg, P, V, KS, R, data: { armF: ARM_F } };
}
