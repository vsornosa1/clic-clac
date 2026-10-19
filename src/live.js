const DATA = __DATA__;
const P = DATA.P;
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const status = stage.querySelector("[data-status]");
const display = svg.querySelector("[data-display]");
const still = matchMedia("(prefers-reduced-motion: reduce)");

const $ = (sel) => svg.querySelector(sel);
const arm = $('[data-part="arm"]');
const links = { A: $('[data-part="link.A"]'), B: $('[data-part="link.B"]'), users: $('[data-part="link.users"]') };

const START = DATA.startS;
const BREAK = DATA.breakS;
const ARM = { A: 0.45, B: -0.45 };
const CABLES = DATA.cables;
const DOT_LANE = 5.2;

const quadAt = (a, c, b, t) => {
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
};

const S = {
  t: 0,
  flow: 0,
  interval: DATA.interval,
  mode: "auto",
  units: {
    A: { running: true, beat: 0, beatAt: 0, repairAt: null },
    B: { running: true, beat: 0, beatAt: 0, repairAt: null },
  },
  source: "A",
  swing: { from: ARM.A, to: ARM.A, start: 0, live: false, now: ARM.A },
  bus: { downAt: null, restoredAt: null, dead: 0, detectS: 0 },
  pending: null,
};

const other = (unit) => (unit === "A" ? "B" : "A");
const healthy = (unit) => S.units[unit].running;

let annoTimer = 0;
let noticeTimer = 0;
function annotate(key, text) {
  const el = svg.querySelector(`[data-anno="${key}"] text`);
  if (el && text) el.textContent = text;
  stage.dataset.anno = key;
  clearTimeout(annoTimer);
  annoTimer = setTimeout(() => delete stage.dataset.anno, 2200);
}
function clearAnnotations() {
  clearTimeout(annoTimer);
  clearTimeout(noticeTimer);
  delete stage.dataset.anno;
}

function fault(unit) {
  if (!healthy(unit) || S.units[unit].repairAt !== null) return;
  S.units[unit].running = false;
  S.units[unit].repairAt = null;
  annotate(unit === "A" ? "stopped-a" : "stopped-b");
  if (unit !== S.source) {
    if (S.pending && S.pending.to === unit) S.pending = null;
    return;
  }
  S.bus.downAt = S.t;
  S.bus.restoredAt = null;
  S.bus.detectS = S.interval * 3;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => {
    if (S.bus.downAt !== null && S.bus.restoredAt === null) annotate("noticed", `noticed in ${S.bus.detectS.toFixed(1)} s`);
  }, S.bus.detectS * 1000);
  if (S.mode === "auto" && healthy(other(unit))) {
    S.pending = { at: S.t + S.bus.detectS + START, to: other(unit) };
  } else {
    S.pending = null;
  }
}

function repair(unit) {
  const u = S.units[unit];
  if (u.running || u.repairAt !== null) return;
  u.repairAt = S.t + 1.2;
}

function restoreAll() {
  repair("A");
  repair("B");
}

function transferTo(unit) {
  if (S.source === unit) return;
  if (still.matches) {
    S.swing = { from: ARM[unit], to: ARM[unit], start: S.t, live: false, now: ARM[unit] };
  } else {
    S.swing = { from: ARM[S.source], to: ARM[unit], start: S.t, live: true, now: S.swing.now };
  }
  S.source = unit;
}

function reset() {
  S.t = 0;
  S.mode = "auto";
  S.units.A = { running: true, beat: 0, beatAt: 0, repairAt: null };
  S.units.B = { running: true, beat: 0, beatAt: 0, repairAt: null };
  S.source = "A";
  S.swing = { from: ARM.A, to: ARM.A, start: 0, live: false, now: ARM.A };
  S.bus = { downAt: null, restoredAt: null, dead: 0, detectS: 0 };
  S.pending = null;
  S.flow = 0;
  clearAnnotations();
  draw(tick(0));
}

function tick(dt) {
  S.t += dt;
  if (!still.matches) S.flow = (S.flow + dt / 1.2) % 1;
  for (const key of ["A", "B"]) {
    const u = S.units[key];
    if (u.running) {
      if (S.t - u.beatAt >= S.interval) {
        u.beatAt = S.t;
        u.beat = 1;
      }
      u.beat = Math.max(0, u.beat - dt / 0.18);
    } else {
      u.beat = 0;
    }
    if (u.repairAt !== null && S.t >= u.repairAt) {
      u.repairAt = null;
      u.running = true;
      u.beatAt = S.t;
    }
  }
  if (S.pending && S.t >= S.pending.at) {
    transferTo(S.pending.to);
    S.bus.restoredAt = S.pending.at + BREAK;
    S.pending = null;
  }
  if (S.bus.downAt !== null && S.bus.restoredAt === null && !S.pending && healthy(S.source)) {
    S.bus.restoredAt = S.t;
  }
  const down = S.bus.downAt !== null && (S.bus.restoredAt === null || S.t < S.bus.restoredAt);
  if (down) {
    S.bus.dead += dt;
  } else if (S.bus.downAt !== null) {
    if (!down && S.bus.restoredAt !== null) {
      annotate("dark", `dark for ${(S.bus.restoredAt - S.bus.downAt).toFixed(1)} s`);
    }
    S.bus.downAt = null;
    S.bus.restoredAt = null;
  }
  if (S.swing.live) {
    const k = Math.min(1, (S.t - S.swing.start) / 0.55);
    const eased = 1 - Math.pow(1 - k, 3);
    S.swing.now = S.swing.from + (S.swing.to - S.swing.from) * eased;
    if (k >= 1) S.swing.live = false;
  }
  return { down };
}

let lastArm = null;
function draw({ down }) {
  for (const key of ["A", "B"]) {
    toggle(`unit.${key}`, S.units[key].running);
    toggle(`beat.${key}`, S.units[key].running && S.units[key].beat > 0.35);
  }
  const angle = S.swing.now;
  if (arm && (lastArm === null || Math.abs(angle - lastArm) > 0.002)) {
    arm.innerHTML = DATA.arm(DATA.armF, angle, P);
    lastArm = angle;
  }
  if (display && display.textContent !== S.source) display.textContent = S.source;
  toggle("load", !down);
  setLink("A", !down && S.source === "A");
  setLink("B", !down && S.source === "B");
  setLink("users", !down);
  const draining =
    down &&
    ((S.pending && healthy(S.pending.to)) ||
      S.bus.restoredAt !== null ||
      S.t - (S.bus.downAt ?? S.t) < 1.2);
  const lane = (key) => (!down && S.source === key && healthy(key) ? "both" : "none");
  setFlow("A", lane("A"));
  setFlow("B", lane("B"));
  setFlow("users", !down ? "both" : draining ? "resp" : "none");
  stage.dataset.stale = ["A", "B"].filter((key) => !S.units[key].running).join(" ");
  placeDots();
  const text = down ? `${S.mode} · light out` : `${S.mode} · ${S.source} serving · light on`;
  if (readout.textContent !== text) readout.textContent = text;
  if (status) {
    const stopped = ["A", "B"].filter((key) => !S.units[key].running);
    status.textContent = `${S.mode === "auto" ? "Automatic" : "Manual"}. ${stopped.length ? `Server ${stopped.join(" and ")} stopped.` : "Both servers are up."} ${
      down ? "The users are not being served." : `Server ${S.source} is serving.`
    }`;
  }
}

function setLink(name, live) {
  const group = links[name];
  if (!group) return;
  group.dataset.state = live ? "live" : "dead";
}

function setFlow(name, mode) {
  const group = links[name];
  if (group && group.dataset.flow !== mode) group.dataset.flow = mode;
}

function placeDots() {
  for (const name of ["A", "B", "users"]) {
    const group = links[name];
    const curve = CABLES[name];
    if (!group || !curve) continue;
    const mode = group.dataset.flow;
    if (mode === "none") continue;
    const phase = still.matches ? 0 : S.flow;
    for (const el of group.querySelectorAll(".cc-dot")) {
      const [, tone, index] = el.dataset.dot.split(":");
      if (mode === "req" && tone === "resp") continue;
      if (mode === "resp" && tone === "req") continue;
      const raw = (phase + Number(index) / curve.count) % 1;
      const [x, y] = quadAt(curve.a, curve.c, curve.b, tone === "resp" ? 1 - raw : raw);
      const lane = tone === "req" ? -DOT_LANE : DOT_LANE;
      el.setAttribute("cx", Math.round((x + curve.n[0] * lane) * 100) / 100);
      el.setAttribute("cy", Math.round((y + curve.n[1] * lane) * 100) / 100);
    }
  }
}

function toggle(lamp, on) {
  const el = svg.querySelector(`[data-lamp="${lamp}"]`);
  if (el) {
    if (on) el.setAttribute("data-on", "");
    else el.removeAttribute("data-on");
  }
}

let frame = 0;
let last = 0;
let visible = true;
function loop(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
  last = now;
  draw(tick(dt));
  frame = requestAnimationFrame(loop);
}
draw(tick(0));
if (!still.matches) frame = requestAnimationFrame(loop);
new IntersectionObserver((entries) => {
  visible = entries[entries.length - 1].isIntersecting;
  if (visible && !frame && !still.matches) {
    last = 0;
    frame = requestAnimationFrame(loop);
  } else if (!visible && frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
}, { rootMargin: "160px 0px" }).observe(stage);

const HOVER = { "A.server": "A", "B.server": "B", "switch.mode": "switch", users: "users", reset: "reset" };
stage.addEventListener("pointermove", (event) => {
  const name = event.target.closest(".it")?.dataset.name ?? "";
  const target = HOVER[name];
  if (target) stage.dataset.hover = target;
  else delete stage.dataset.hover;
  stage.dataset.cursor = target ? "pointer" : "";
});

stage.addEventListener("pointerleave", () => {
  delete stage.dataset.hover;
  delete stage.dataset.cursor;
});

stage.addEventListener("click", (event) => {
  const name = event.target.closest(".it")?.dataset.name ?? "";
  if (name === "A.server" || name === "B.server") {
    const unit = name[0];
    if (S.units[unit].running) fault(unit);
    else repair(unit);
  } else if (name === "switch.mode") {
    S.mode = S.mode === "auto" ? "manual" : "auto";
    if (S.mode === "manual") S.pending = null;
  } else if (name === "reset") {
    reset();
    return;
  } else {
    return;
  }
  draw(tick(0));
});

stage.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const step = (list, value, dir) => list[(list.indexOf(value) + dir + list.length) % list.length];
  if (key === "a" || key === "b") fault(key.toUpperCase());
  else if (key === "r") restoreAll();
  else if (key === "m") {
    S.mode = S.mode === "auto" ? "manual" : "auto";
    if (S.mode === "manual") S.pending = null;
  } else if (key === "[") S.interval = step(DATA.intervals, S.interval, -1);
  else if (key === "]") S.interval = step(DATA.intervals, S.interval, 1);
  else if (key === "0" || key === "backspace") {
    reset();
    event.preventDefault();
    return;
  } else return;
  event.preventDefault();
  draw(tick(0));
});
