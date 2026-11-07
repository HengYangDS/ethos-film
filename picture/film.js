/* Generated from picture/film/ by npm run compose: edit the modules, not this file. */
"use strict";

// picture/film/canvas.js
var canvas = document.getElementById("picture");
var ctx = canvas.getContext("2d", { alpha: false });
var resolution = Number(document.getElementById("film").dataset.width) / 1920;
var layout = { texts: [], scene: null };
var sceneFade = 1;
var wordFade = 1;
var measuring = false;
function setDrawing(next) {
  if ("ctx" in next) ctx = next.ctx;
  if ("layout" in next) layout = next.layout;
  if ("sceneFade" in next) sceneFade = next.sceneFade;
  if ("wordFade" in next) wordFade = next.wordFade;
  if ("measuring" in next) measuring = next.measuring;
}

// picture/film/palette.js
var PAPER = "#F6F1E8";
var P = {
  ground: "#0E1B20",
  row: "#1A2A30",
  line: "#5F7680",
  ink: PAPER,
  muted: "#C8CED0",
  accent: "#CF6A52",
  evidence: PAPER,
  authority: PAPER,
  unknown: PAPER
};
var LABEL = 26;
var TYPE = 1.12;

// picture/film/timing/easing.js
var clamp = (q) => Math.max(0, Math.min(1, q));
var mix = (a, b, q) => a + (b - a) * q;
var ease = (q) => {
  q = clamp(q);
  return q * q * (3 - 2 * q);
};
var ramp = (t, start, duration = 0.7) => ease((t - start) / duration);
var bezier = (x1, y1, x2, y2) => (q) => {
  q = clamp(q);
  let u = q;
  for (let i = 0; i < 8; i++) {
    const x = 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u ** 2 * x2 + u ** 3 - q;
    const dx = 3 * (1 - u) ** 2 * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u ** 2 * (1 - x2);
    if (Math.abs(x) < 1e-5 || Math.abs(dx) < 1e-6) break;
    u = clamp(u - x / dx);
  }
  return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u ** 2 * y2 + u ** 3;
};
var standard = bezier(0.4, 0, 0.2, 1);
var soon = (t, start, duration = 0.55) => standard((t - start) / duration);

// picture/film/drawing/colour.js
var groundLuminance = /* @__PURE__ */ (() => {
  const lin = (c) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return (rgb) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
})();
var rgbOf = (v) => /^#[0-9a-f]{6}$/i.test(v ?? "") ? [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16)) : null;
var GROUND = rgbOf(P.ground);
function contrastOf(color, alpha) {
  const rgb = rgbOf(color);
  if (!rgb) return 1;
  const mixed = rgb.map((v, i) => alpha * v + (1 - alpha) * GROUND[i]);
  return (groundLuminance(mixed) + 0.05) / (groundLuminance(GROUND) + 0.05);
}
function blend(a, b, q) {
  const rgb = (v) => [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16));
  const [x, y] = [rgb(a), rgb(b)];
  return "#" + x.map(
    (c, i) => Math.round(mix(c, y[i], clamp(q))).toString(16).padStart(2, "0")
  ).join("");
}

// picture/film/scenes/registry.js
var scenes = {};

// picture/film/timeline.js
var film = window.FILM;
var en = film.edition === "en";
var L = (zh, english) => en ? english : zh;

// picture/film/timing/cues.js
var units = (v) => v.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
var phraseEnd = /* @__PURE__ */ new Map();
var wordEnd = /* @__PURE__ */ new Map();
var cueCache = /* @__PURE__ */ new Map();
var clauseCache = /* @__PURE__ */ new Map();
function clauseEnds(s) {
  if (!clauseCache.has(s.id)) {
    const ends = [];
    let n = 0;
    for (const ch of s.text) {
      if (/[\p{L}\p{N}]/u.test(ch)) n += units(ch).length;
      else if (/[，。；：！？,.;:!?—]/u.test(ch)) ends.push(n);
    }
    clauseCache.set(s.id, ends);
  }
  return clauseCache.get(s.id);
}
function cue(s, zh, english, { last = false, end = false } = {}) {
  const key = `${s.id}:${zh}:${english}:${last}:${end}`;
  if (cueCache.has(key)) return cueCache.get(key);
  const target = units(L(zh, english));
  const spoken = s.words.map((w) => units(w.text)).join("");
  const index = last ? spoken.lastIndexOf(target) : spoken.indexOf(target);
  if (index < 0 || !target) throw Error(`Missing spoken cue ${key}`);
  const clause = clauseEnds(s).find((n) => n >= index + target.length) ?? spoken.length;
  let cursor = 0, first = null, close2 = null, said = null;
  for (const w of s.words) {
    const n = units(w.text).length;
    if (first === null && cursor + n > index) first = w.start;
    if (close2 === null && cursor + n >= index + target.length) close2 = w.end;
    if (cursor + n >= clause) {
      said = w.end;
      break;
    }
    cursor += n;
  }
  if (first === null || close2 === null) throw Error(`Unresolved spoken cue ${key}`);
  phraseEnd.set(
    first,
    Math.max(phraseEnd.get(first) ?? 0, Math.min(said ?? close2, first + 4.5), close2)
  );
  wordEnd.set(first, Math.max(wordEnd.get(first) ?? 0, close2));
  const value = end ? close2 : first;
  cueCache.set(key, value);
  return value;
}
var cues = (s, pairs) => pairs.map((pair) => cue(s, ...pair));
function cueFrom(s, zh, english, from) {
  const target = units(L(zh, english));
  let spoken = "";
  const starts = s.words.map((w) => {
    const at = spoken.length;
    spoken += units(w.text);
    return at;
  });
  const k = s.words.findIndex((w) => w.start >= from - 1e-6);
  const index = spoken.indexOf(target, k < 0 ? spoken.length : starts[k]);
  if (index < 0 || !target)
    throw Error(`Missing spoken cue ${s.id}:${zh}:${english} after ${from}`);
  let i = starts.length - 1;
  while (starts[i] > index) i--;
  let j = i;
  while (j + 1 < starts.length && starts[j + 1] < index + target.length) j++;
  wordEnd.set(s.words[i].start, Math.max(wordEnd.get(s.words[i].start) ?? 0, s.words[j].end));
  return s.words[i].start;
}

// picture/film/timing/pauses.js
var RECEDE = 0.6;
var thoughtJoins = (() => {
  const joins = [];
  let previous = null;
  for (const s of film.segments) {
    let k = 0;
    for (const group of s.utterance_groups) {
      const need = units(group).length, first = k;
      let n = 0;
      while (k < s.words.length && n < need) n += units(s.words[k++].text).length;
      if (previous !== null) joins.push([previous, s.words[first].start]);
      previous = s.words[k - 1].end;
    }
  }
  return joins;
})();
var pauseHold = (at, lasting = RECEDE) => {
  for (const [end, next] of thoughtJoins) if (at + lasting > end && at < next) return next;
  return at;
};
var thoughtEnd = (at) => {
  for (const [end] of thoughtJoins) if (end >= at) return end;
  return Infinity;
};
var HOLD = 0.05;
var SETTLE = 0.45;
var covered = (x) => x ** 3 - x ** 4 / 2;
var easings = (() => {
  const joins = thoughtJoins.map(([end, next]) => {
    const middle = (end + next) / 2;
    return { rest: Math.min(end + HOLD, middle), resume: Math.max(next - HOLD, middle) };
  });
  joins.forEach((j, k) => {
    j.down = Math.min(SETTLE, k ? (j.rest - joins[k - 1].resume) / 2 : j.rest);
    j.up = Math.min(SETTLE, k + 1 < joins.length ? (joins[k + 1].rest - j.resume) / 2 : SETTLE);
  });
  let taken = 0;
  for (const j of joins) {
    j.before = taken;
    taken += j.down / 2 + (j.resume - j.rest) + j.up / 2;
  }
  return joins;
})();
var voiceTime = (t) => {
  let lo = 0, hi = easings.length;
  while (lo < hi) {
    const mid = lo + hi >> 1;
    if (easings[mid].rest - easings[mid].down <= t) lo = mid + 1;
    else hi = mid;
  }
  if (!lo) return t;
  const { rest, resume, down, up, before } = easings[lo - 1];
  if (t < rest) return t - before - down * covered((t - rest + down) / down);
  if (t < resume) return t - before - down / 2 - (t - rest);
  if (t < resume + up) {
    const x = (t - resume) / up;
    return t - before - down / 2 - (resume - rest) - up * (x - covered(x));
  }
  return t - before - down / 2 - (resume - rest) - up / 2;
};
var GLIDE_PACE = 450;
var GLIDE_PICKUP = 2400;
var glideTime = (distance, least = 0.6) => Math.max(
  least,
  1.5 * Math.abs(distance) / GLIDE_PACE,
  Math.sqrt(6 * Math.abs(distance) / GLIDE_PICKUP)
);
var glideShare = (t, at, distance, least = 0.6) => ease((voiceTime(t) - voiceTime(at)) / glideTime(distance, least));
var DRAW_PACE = 820;
var drawTime = (length, least = 0.4) => Math.max(least, 1.5 * Math.abs(length) / DRAW_PACE, Math.sqrt(6 * Math.abs(length) / GLIDE_PICKUP));
var drawShare = (t, at, length, least = 0.4) => ease((voiceTime(t) - voiceTime(at)) / drawTime(length, least));
var glideSteps = (t, first, steps, least = 0.7) => {
  let x = first, aim = first;
  for (const [at, to] of steps) {
    x = mix(x, to, glideShare(t, at + 0.05, to - aim, least));
    aim = to;
  }
  return x;
};

// picture/film/framing/camera.js
var CAMERA = {
  push: ["01", "04", "07", "09", "13", "15", "18"],
  reveal: ["03", "06", "08", "11", "14", "16"],
  drift: ["02", "05", "10", "12", "17"]
};
function cameraOf(s, t, amount = scenes[s.id]?.push ?? 0.02) {
  const cx = film.segments.indexOf(s) % 2 ? 840 : 1080, cy = 500;
  const from = voiceTime(s.start), q = ease(clamp((voiceTime(t) - from) / Math.max(1, voiceTime(s.end) - from)));
  if (CAMERA.drift.includes(s.id))
    return { k: 1 + amount * 0.5, ox: 960 + mix(-12, 12, q), oy: cy, ax: 960, ay: cy };
  const k = CAMERA.reveal.includes(s.id) ? 1 + amount * (1 - q) : CAMERA.push.includes(s.id) ? 1 + amount * q : 1;
  return { k, ox: cx, oy: cy, ax: cx, ay: cy };
}
function push(s, t) {
  const c = cameraOf(s, t);
  ctx.translate(c.ox, c.oy);
  ctx.scale(c.k, c.k);
  ctx.translate(-c.ax, -c.ay);
}

// picture/film/drawing/strokes.js
function font(size, bold, sample) {
  const latin = !/[\u4e00-\u9fff]/u.test(sample);
  return `${bold ? "700 " : ""}${size}px ${latin ? bold ? "EthosLatinBold" : "EthosLatin" : bold ? "EthosBold" : "Ethos"}`;
}
var labelSize = (size) => size * TYPE;
var typeset = (v) => v.replaceAll("'", "’");
function measure(v, size = LABEL, bold = false, role = "label") {
  v = typeset(v);
  ctx.save();
  ctx.font = font(role === "label" ? labelSize(size) : size, bold, v);
  const w = ctx.measureText(v).width;
  ctx.restore();
  return w;
}
function text(v, x, y, size = LABEL, {
  color = P.ink,
  alpha = 1,
  align = "left",
  bold = false,
  baseline = "middle",
  role = "label",
  tracking = 0,
  group = null,
  whole = null,
  set = null
} = {}) {
  if (alpha < 0.015 || !v) return null;
  v = typeset(v);
  whole = whole === null ? null : typeset(whole);
  ctx.save();
  ctx.globalAlpha = clamp(alpha) * wordFade;
  ctx.font = font(role === "label" ? labelSize(size) : size, bold, v);
  ctx.letterSpacing = `${tracking}px`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillStyle = color;
  ctx.fillText(v, x, y);
  const m = ctx.measureText(v), tr = ctx.getTransform();
  const box2 = [
    x - m.actualBoundingBoxLeft,
    y - m.actualBoundingBoxAscent,
    x + m.actualBoundingBoxRight,
    y + m.actualBoundingBoxDescent
  ];
  const toScreen = (px, py) => [
    (tr.a * px + tr.c * py + tr.e) / resolution,
    (tr.b * px + tr.d * py + tr.f) / resolution
  ];
  const [x0, y0] = toScreen(box2[0], box2[1]), [x1, y1] = toScreen(box2[2], box2[3]);
  ctx.restore();
  const record2 = {
    text: v,
    bounds: [Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1)],
    alpha: clamp(alpha) * wordFade,
    role,
    scene: layout.scene,
    color,
    group,
    whole: whole ?? v,
    placed: whole !== null,
    size,
    set
  };
  layout.texts.push(record2);
  return record2;
}
var STRUCTURE = /* @__PURE__ */ new Set([P.line, P.muted]);
function stroke(build, { color = P.line, width = 2, alpha = 1, dash = null, cap = "round" } = {}) {
  if (alpha < 0.01) return;
  const structure = STRUCTURE.has(color), a = structure ? 1 - (1 - clamp(alpha)) ** 2 : clamp(alpha);
  ctx.save();
  ctx.globalAlpha = a * sceneFade;
  ctx.strokeStyle = color;
  ctx.lineWidth = structure ? Math.max(2, width) : width;
  ctx.lineCap = cap;
  ctx.lineJoin = "round";
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  build();
  ctx.stroke();
  ctx.restore();
}
function fill(build, { color = P.row, alpha = 1 } = {}) {
  if (alpha < 0.01) return;
  ctx.save();
  ctx.globalAlpha = clamp(alpha) * sceneFade;
  ctx.fillStyle = color;
  ctx.beginPath();
  build();
  ctx.fill();
  ctx.restore();
}
var line = (x1, y1, x2, y2, o = {}) => stroke(() => {
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
}, o);
var dashed = (x1, y1, x2, y2, o = {}) => line(x1, y1, x2, y2, { dash: [8, 9], ...o });
function box(x, y, w, h, { fill: f = null, stroke: s = null, width = 2, alpha = 1, radius = 8, dash = null } = {}) {
  if (f) fill(() => ctx.roundRect(x, y, w, h, radius), { color: f, alpha });
  if (s) stroke(() => ctx.roundRect(x, y, w, h, radius), { color: s, width, alpha, dash });
}
function dot(x, y, r, { color = P.evidence, alpha = 1, hollow = false, width = 2 } = {}) {
  if (hollow) stroke(() => ctx.arc(x, y, r, 0, Math.PI * 2), { color, alpha, width });
  else fill(() => ctx.arc(x, y, r, 0, Math.PI * 2), { color, alpha });
}
function path(points, { upto = 1, ...o } = {}) {
  if (points.length < 2 || upto <= 0) return;
  const n = Math.max(2, Math.round(points.length * clamp(upto)));
  stroke(
    () => points.slice(0, n).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)),
    { width: 2.5, color: P.ink, ...o }
  );
}
function ring(x, y, r, { color = P.evidence, alpha = 1, width = 2, upto = 1, start = -Math.PI / 2, dash = null } = {}) {
  if (upto <= 0) return;
  stroke(() => ctx.arc(x, y, r, start, start + Math.PI * 2 * clamp(upto)), {
    color,
    alpha,
    width,
    dash
  });
}

// picture/film/framing/captions.js
var CAPTION_JOIN = 0.3;
function caption(t) {
  const caps = film.captions;
  const joined = (a2, b) => a2 && b && b.start - a2.end <= CAPTION_JOIN;
  let i = caps.findIndex((v) => v.start <= t && t < v.end);
  if (i < 0)
    i = caps.findIndex((v, k) => v.end <= t && t < caps[k + 1]?.start && joined(v, caps[k + 1]));
  if (i < 0) return;
  const c = caps[i];
  const a = (joined(caps[i - 1], c) ? 1 : ramp(t, c.start - 0.04, 0.12)) * (joined(c, caps[i + 1]) ? 1 : 1 - ramp(t, c.end - 0.1, 0.1));
  text((c.display_text ?? c.text).trim(), 960, 970, 26, {
    align: "center",
    color: P.ink,
    alpha: 0.94 * Math.max(a, 1e-3),
    role: "caption"
  });
}

// picture/film/drawing/symbols.js
function diamond(x, y, r, { color = P.evidence, alpha = 1, solid = false, width = 2.5 } = {}) {
  const build = () => {
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r, y);
    ctx.closePath();
  };
  if (solid) fill(build, { color, alpha });
  else stroke(build, { color, alpha, width });
}
function token(x, y, { color = P.ink, alpha = 1, r = 14, hollow = false } = {}) {
  dot(x, y, r, { color, alpha, hollow, width: 3 });
  if (!hollow) ring(x, y, r + 7, { color, alpha: alpha * 0.45, width: 2 });
}
function lock(x, y, { closed = 1, color = P.authority, alpha = 1, size = 1 } = {}) {
  const w = 34 * size, h = 26 * size, lift = (1 - ease(closed)) * 12 * size;
  box(x - w / 2, y - h / 2, w, h, {
    fill: P.row,
    stroke: color,
    alpha,
    radius: 5 * size,
    width: 2.5
  });
  stroke(() => ctx.arc(x, y - h / 2 - lift, w * 0.32, Math.PI, 0), {
    color,
    alpha,
    width: 3 * size
  });
  dot(x, y + 1, 3.5 * size, { color, alpha });
}
function clock(x, y, r, { hand = 0, color = P.ink, alpha = 1 } = {}) {
  ring(x, y, r, { color, alpha, width: 2.5 });
  const a = -Math.PI / 2 + Math.PI * 2 * hand;
  line(x, y, x + r * 0.75 * Math.cos(a), y + r * 0.75 * Math.sin(a), { color, alpha, width: 3 });
  line(x, y, x, y - r * 0.5, { color, alpha: alpha * 0.6, width: 2 });
}
function seal(x, y, r, { color = P.authority, alpha = 1, hollow = false, stamp = alpha } = {}) {
  ring(x, y, r, { color, alpha, width: 3 });
  ring(x, y, r * 0.74, { color, alpha: stamp * 0.6, width: 1.5, dash: hollow ? [5, 5] : null });
  if (!hollow) check(x, y + r * 0.05, r * 0.8, { color, alpha: stamp });
}
function person(x, y, { color = P.ink, alpha = 1, size = 1, solid = true } = {}) {
  const r = 15 * size, fillQ = solid === true ? 1 : solid === false ? 0 : clamp(solid);
  if (fillQ < 1)
    dot(x, y - r * 1.15, r, { color, alpha: alpha * (1 - fillQ), hollow: true, width: 2.5 });
  if (fillQ > 0) dot(x, y - r * 1.15, r, { color, alpha: alpha * fillQ });
  stroke(() => ctx.arc(x, y + r * 1.9, r * 1.55, Math.PI * 1.08, Math.PI * 1.92), {
    color,
    alpha,
    width: 3 * size
  });
}
function agent(x, y, { alpha = 1, size = 1, color = P.evidence } = {}) {
  diamond(x, y, 22 * size, { color, alpha });
  dot(x, y, 4.5 * size, { color, alpha });
}
function documentIcon(x, y, w, h, { alpha = 1, stroke: s = P.ink, rows = 4, fillColor = P.row, fold = true } = {}) {
  if (alpha < 0.01) return;
  const c = Math.min(22, w * 0.2);
  fill(
    () => {
      ctx.moveTo(x, y);
      ctx.lineTo(x + w - c, y);
      ctx.lineTo(x + w, y + c);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
    },
    { color: fillColor, alpha }
  );
  stroke(
    () => {
      ctx.moveTo(x, y);
      ctx.lineTo(x + w - c, y);
      ctx.lineTo(x + w, y + c);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
    },
    { color: s, alpha, width: 2 }
  );
  if (fold)
    stroke(
      () => {
        ctx.moveTo(x + w - c, y);
        ctx.lineTo(x + w - c, y + c);
        ctx.lineTo(x + w, y + c);
      },
      { color: s, alpha, width: 1.5 }
    );
  for (let i = 0; i < rows; i++) {
    const ry = y + h * (0.3 + i * 0.55 / Math.max(1, rows));
    line(x + w * 0.14, ry, x + w * (i % 2 ? 0.62 : 0.82), ry, {
      color: P.muted,
      alpha: alpha * 0.8,
      width: 2
    });
  }
}
function check(x, y, s, { color = P.evidence, alpha = 1, upto = 1, width = 3.5 } = {}) {
  path(
    [
      [x - s * 0.5, y],
      [x - s * 0.12, y + s * 0.38],
      [x + s * 0.55, y - s * 0.42]
    ],
    { color, alpha, upto, width }
  );
}
function cross(x, y, s, { color = P.unknown, alpha = 1, width = 3.5 } = {}) {
  line(x - s / 2, y - s / 2, x + s / 2, y + s / 2, { color, alpha, width });
  line(x + s / 2, y - s / 2, x - s / 2, y + s / 2, { color, alpha, width });
}
function stopSign(x, y, r, { alpha = 1, color = P.unknown } = {}) {
  const build = () => {
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 8 + i * Math.PI / 4;
      const px = x + r * Math.cos(a), py = y + r * Math.sin(a);
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
  };
  stroke(build, { color, alpha, width: 3 });
  line(x - r * 0.45, y, x + r * 0.45, y, { color, alpha, width: 4 });
}
function pill(label, x, y, {
  alpha = 1,
  ink = null,
  color = P.ink,
  border = P.line,
  fillColor = P.row,
  size = LABEL,
  align = "center",
  padX = 18,
  h = null,
  bold = false,
  dash = null,
  dashed: dashed2 = null,
  group = null,
  role = "label"
} = {}) {
  if (alpha < 0.015) return null;
  const w = measure(label, size, bold, role) + padX * 2, height = h ?? size * TYPE + 22;
  const left = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  box(left, y - height / 2, w, height, { fill: fillColor, alpha, radius: height / 2 });
  if (dashed2 === null)
    box(left, y - height / 2, w, height, { stroke: border, alpha, radius: height / 2, dash });
  else {
    box(left, y - height / 2, w, height, {
      stroke: border,
      alpha: alpha * (1 - clamp(dashed2)),
      radius: height / 2
    });
    box(left, y - height / 2, w, height, {
      stroke: border,
      alpha: alpha * clamp(dashed2),
      radius: height / 2,
      dash: dash ?? [6, 6]
    });
  }
  text(label, left + w / 2, y + 1, size, {
    align: "center",
    color,
    alpha: ink ?? alpha,
    bold,
    group,
    role
  });
  return { left, right: left + w, top: y - height / 2, bottom: y + height / 2, width: w };
}

// picture/film/framing/chapters.js
var chapterOrder = film.chapters.map((c) => c.id);
var chapterNumber = (id) => String(chapterOrder.indexOf(id) + 1).padStart(2, "0");
var opensChapter = (s) => {
  const i = film.segments.indexOf(s);
  return i > 0 && film.segments[i - 1].chapter !== s.chapter;
};
var titleY = (s, t) => mix(540, 72, ease(clamp((t - (cardLanding(s) - RISE)) / RISE)));
var clearOfTitle = (s, t, y = 400) => {
  if (!opensChapter(s)) return 1;
  const c = cameraOf(s, t), sy = c.oy + c.k * (y - c.ay);
  return ease((sy - 45 - titleY(s, t)) / Math.min(240, Math.max(60, sy - 45 - 72)));
};
var cardLanding = (s) => s.voice_start + 0.1;
var RISE = 1.1;
function chapterCard(s, t) {
  if (!opensChapter(s) || t >= cardLanding(s)) return;
  const enter = ramp(t, s.start, 0.3);
  if (enter <= 0) return;
  const chapter = film.chapters.find((c) => c.id === s.chapter), number = chapterNumber(s.chapter);
  const large = en ? 54 : 60, p = clamp((t - (cardLanding(s) - RISE)) / RISE), q = ease(p), size = mix(large, 24, q);
  ctx.save();
  ctx.font = font(24, false, `${number}  ${chapter.title}`);
  const prefix = ctx.measureText(`${number}  `).width;
  ctx.restore();
  const gap = prefix * size / 24, total = gap + measure(chapter.title, size, false, "chapter");
  const left = mix(960 - total / 2, 96, q), y = mix(540, 72, q), ink = mix(1, 0.72, q) * enter;
  text(number, left, y, size, {
    color: blend(P.evidence, P.muted, q),
    alpha: ink,
    role: "chapter"
  });
  text(chapter.title, left + gap, y, size, {
    color: blend(P.ink, P.muted, q),
    alpha: ink,
    role: "chapter"
  });
  line(900, 600, 1020, 600, {
    color: P.line,
    alpha: enter * (1 - ramp(t, cardLanding(s) - RISE, 0.35))
  });
}
function illustrative(alpha) {
  if (alpha < 0.015 || measuring) return;
  ctx.save();
  ctx.setTransform(resolution, 0, 0, resolution, 0, 0);
  pill(L("示意", "Illustrative"), 1824, 74, {
    alpha,
    color: P.muted,
    border: P.line,
    size: 22 * TYPE,
    align: "right",
    padX: 14,
    h: 36,
    role: "marker"
  });
  ctx.restore();
}
function runningHead(s, t) {
  if (t < film.segments[0].voice_start) return;
  const first = film.segments.find((v) => v.chapter === s.chapter);
  const a = 0.72 * (first === film.segments[0] ? ramp(t, first.voice_start, 0.6) : t >= cardLanding(first) ? 1 : 0);
  const chapter = film.chapters.find((c) => c.id === s.chapter);
  text(`${chapterNumber(s.chapter)}  ${chapter.title}`, 96, 72, 24, {
    color: P.muted,
    alpha: a,
    role: "chapter"
  });
}

// picture/film/framing/measuring.js
function measuringContext() {
  let m = [1, 0, 0, 1, 0, 0], path2 = [], last = [0, 0];
  const stack = [], marks = { strong: null, seen: null };
  const keys = [
    "globalAlpha",
    "strokeStyle",
    "fillStyle",
    "lineWidth",
    "lineCap",
    "lineJoin",
    "font",
    "textAlign",
    "textBaseline",
    "letterSpacing"
  ];
  const tx = (x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  const by = (b) => {
    const a = m;
    m = [
      a[0] * b[0] + a[2] * b[1],
      a[1] * b[0] + a[3] * b[1],
      a[0] * b[2] + a[2] * b[3],
      a[1] * b[2] + a[3] * b[3],
      a[0] * b[4] + a[2] * b[5] + a[4],
      a[1] * b[4] + a[3] * b[5] + a[5]
    ];
  };
  const add = (key, [x, y]) => {
    const e = marks[key] ?? (marks[key] = [x, y, x, y]);
    e[0] = Math.min(e[0], x);
    e[1] = Math.min(e[1], y);
    e[2] = Math.max(e[2], x);
    e[3] = Math.max(e[3], y);
  };
  const sizeOf = () => Number(/(\d+(?:\.\d+)?)px/.exec(meter.font)?.[1] ?? 30);
  const widthOf = (v) => [...v].reduce(
    (w, ch) => w + (/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/u.test(ch) ? 1.02 : /[A-Z]/.test(ch) ? 0.72 : 0.6),
    0
  ) * sizeOf();
  function paint(color, points) {
    if (meter.globalAlpha <= 0.15) return;
    const strong = contrastOf(color, meter.globalAlpha) >= 3;
    for (const point of points) {
      add("seen", point);
      if (strong) add("strong", point);
    }
  }
  function arcPoints(x, y, rx, ry, a0, a1) {
    const n = Math.max(4, Math.ceil(Math.abs(a1 - a0) / (Math.PI / 12)));
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * i / n;
      path2.push(tx(x + rx * Math.cos(a), y + ry * Math.sin(a)));
    }
    last = [x + rx * Math.cos(a1), y + ry * Math.sin(a1)];
  }
  const meter = {
    marks,
    globalAlpha: 1,
    strokeStyle: "#000000",
    fillStyle: "#000000",
    lineWidth: 1,
    lineCap: "butt",
    lineJoin: "miter",
    font: "30px Ethos",
    textAlign: "left",
    textBaseline: "middle",
    letterSpacing: "0px",
    save() {
      stack.push([m, keys.map((k) => meter[k])]);
    },
    restore() {
      const [saved, values] = stack.pop();
      m = saved;
      keys.forEach((k, i) => {
        meter[k] = values[i];
      });
    },
    setTransform(a, b, c, d, e, f) {
      m = [a, b, c, d, e, f];
    },
    getTransform() {
      return { a: m[0], b: m[1], c: m[2], d: m[3], e: m[4], f: m[5] };
    },
    translate(x, y) {
      by([1, 0, 0, 1, x, y]);
    },
    scale(x, y) {
      by([x, 0, 0, y, 0, 0]);
    },
    setLineDash() {
    },
    fillRect() {
    },
    beginPath() {
      path2 = [];
    },
    closePath() {
    },
    moveTo(x, y) {
      path2.push(tx(x, y));
      last = [x, y];
    },
    lineTo(x, y) {
      path2.push(tx(x, y));
      last = [x, y];
    },
    arc(x, y, r, a0, a1) {
      arcPoints(x, y, r, r, a0, a1);
    },
    ellipse(x, y, rx, ry, rotation, a0, a1) {
      arcPoints(x, y, rx, ry, a0, a1);
    },
    quadraticCurveTo(cx, cy, x, y) {
      const [x0, y0] = last;
      for (let i = 1; i <= 8; i++) {
        const q = i / 8, u = 1 - q;
        path2.push(
          tx(u * u * x0 + 2 * u * q * cx + q * q * x, u * u * y0 + 2 * u * q * cy + q * q * y)
        );
      }
      last = [x, y];
    },
    roundRect(x, y, w, h) {
      path2.push(tx(x, y), tx(x + w, y), tx(x + w, y + h), tx(x, y + h));
      last = [x, y];
    },
    stroke() {
      paint(meter.strokeStyle, path2);
    },
    fill() {
      paint(meter.fillStyle, path2);
    },
    measureText(v) {
      const size = sizeOf(), width = widthOf(v), left = meter.textAlign === "center" ? width / 2 : meter.textAlign === "right" ? width : 0;
      const ascent = meter.textBaseline === "top" ? 0 : meter.textBaseline === "middle" ? size * 0.52 : size * 0.8;
      const descent = meter.textBaseline === "top" ? size * 1.05 : meter.textBaseline === "middle" ? size * 0.52 : size * 0.22;
      return {
        width,
        actualBoundingBoxLeft: left,
        actualBoundingBoxRight: width - left,
        actualBoundingBoxAscent: ascent,
        actualBoundingBoxDescent: descent
      };
    },
    fillText(v, x, y) {
      const b = meter.measureText(v);
      paint(meter.fillStyle, [
        tx(x - b.actualBoundingBoxLeft, y - b.actualBoundingBoxAscent),
        tx(x + b.actualBoundingBoxRight, y + b.actualBoundingBoxDescent)
      ]);
    }
  };
  return meter;
}

// picture/film/framing/titles.js
function titleSignature(alpha, signed = alpha) {
  text("ETHOS", 237, 300, 300, { bold: true, tracking: -4, alpha, baseline: "top", role: "title" });
  line(260, 652, 1624, 652, { color: P.line, width: 1, alpha });
  text(L("让信任建立在证据上", "Evidence-grounded Trust"), 260, 724, en ? 42 : 50, {
    alpha,
    role: "title"
  });
  text("Yang HENG", 1624, 846, 34, { align: "right", alpha: signed, role: "title" });
}
function credits(t) {
  const start = film.duration - film.credits_duration;
  const a = ramp(t, start, 0.5);
  titleSignature(a, ramp(t, start + 0.2, 0.5));
  text(L("旁白为合成语音", "Narration: synthetic voice"), 1624, 902, 24, {
    align: "right",
    color: P.muted,
    alpha: ramp(t, start + 0.1, 0.35),
    role: "title"
  });
}

// picture/film/drawing/mark.js
var ORIGIN = [274, 256];
var BOUNDARY = { r: 164, from: [399.6, 150.6], to: [399.6, 361.4], width: 25 };
var PASSAGES = [
  [[274, 256], [307, 243], [341, 216], [377, 178]],
  [[274, 256], [311, 272], [350, 307], [389, 343]]
];
var PASSAGE_WIDTH = 17;
var DATUM = 14;
var HOLE = 4.75;
var bezier2 = ([a, b, c, d], u) => {
  const v = 1 - u;
  return [0, 1].map((k) => v * v * v * a[k] + 3 * v * v * u * b[k] + 3 * v * u * u * c[k] + u * u * u * d[k]);
};
function ethosMark(x, y, size, { datum = 1, hole = 1, passages = 1, boundary = 1, alpha = 1 } = {}) {
  const k = size / 512, at = ([px, py]) => [x + (px - ORIGIN[0]) * k, y + (py - ORIGIN[1]) * k];
  if (boundary > 0) {
    const a0 = Math.atan2(BOUNDARY.from[1] - ORIGIN[1], BOUNDARY.from[0] - ORIGIN[0]);
    const a1 = Math.atan2(BOUNDARY.to[1] - ORIGIN[1], BOUNDARY.to[0] - ORIGIN[0]) - 2 * Math.PI;
    const end = a0 + (a1 - a0) * clamp(boundary);
    stroke(() => ctx.arc(x, y, BOUNDARY.r * k, a0, end, true), { color: P.ink, alpha, width: BOUNDARY.width * k });
  }
  if (passages > 0)
    for (const curve of PASSAGES)
      stroke(() => {
        const share = clamp(passages), steps = 24;
        ctx.moveTo(...at(curve[0]));
        for (let i = 1; i <= steps; i++) ctx.lineTo(...at(bezier2(curve, i / steps * share)));
      }, { color: P.ink, alpha, width: PASSAGE_WIDTH * k });
  if (datum > 0) dot(x, y, DATUM * k, { color: P.accent, alpha: alpha * clamp(datum) });
  if (hole > 0 && datum > 0) dot(x, y, HOLE * k, { color: P.ground, alpha: alpha * clamp(datum) * clamp(hole) });
}
function markExtent(size, { datum = 1, passages = 1, boundary = 1 } = {}) {
  const k = size / 512, xs = [], ys = [];
  const add = ([px, py], pad) => {
    xs.push(px - ORIGIN[0] - pad, px - ORIGIN[0] + pad);
    ys.push(py - ORIGIN[1] - pad, py - ORIGIN[1] + pad);
  };
  if (datum > 0) add(ORIGIN, DATUM);
  if (passages > 0) for (const curve of PASSAGES) for (let i = 0; i <= 24; i++) add(bezier2(curve, i / 24), PASSAGE_WIDTH / 2);
  if (boundary > 0) {
    const a0 = Math.atan2(BOUNDARY.from[1] - ORIGIN[1], BOUNDARY.from[0] - ORIGIN[0]);
    const a1 = Math.atan2(BOUNDARY.to[1] - ORIGIN[1], BOUNDARY.to[0] - ORIGIN[0]) - 2 * Math.PI;
    for (let i = 0; i <= 72; i++) {
      const a = a0 + (a1 - a0) * i / 72;
      add([ORIGIN[0] + BOUNDARY.r * Math.cos(a), ORIGIN[1] + BOUNDARY.r * Math.sin(a)], BOUNDARY.width / 2);
    }
  }
  if (!xs.length) return { left: 0, right: 0, top: 0, bottom: 0 };
  return { left: Math.min(...xs) * k, right: Math.max(...xs) * k, top: Math.min(...ys) * k, bottom: Math.max(...ys) * k };
}

// picture/film/naming/names.js
var NAME_GAP = 22;
var LEADING = 1.3;
var NAME_JOINT = /[、，。；：,]$/u;
var CLAUSE_JOINT = /[，。；：,]$/u;
function wrapName(v, width, size = LABEL) {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v.includes("\n")) return v.split("\n");
  if (!Number.isFinite(width) || measure(v, size) <= width) return [v];
  const latin = !/[\u4e00-\u9fff]/u.test(v), tokens = latin ? v.split(/(?<= )/) : [...v], splits = [];
  for (let k = 1; k < tokens.length; k++) {
    const a = tokens.slice(0, k).join("").trimEnd(), b = tokens.slice(k).join("").trimStart();
    if (!a || !b || /^[、，。；：）”]/u.test(b)) continue;
    splits.push({
      a,
      b,
      joint: !latin && NAME_JOINT.test(a),
      worst: Math.max(measure(a, size), measure(b, size))
    });
  }
  const joints = splits.filter((s) => s.joint), fitting = joints.filter((s) => s.worst <= width);
  const clauses = fitting.filter((s) => CLAUSE_JOINT.test(s.a));
  const pool = clauses.length ? clauses : fitting.length ? fitting : joints.length ? joints : splits;
  if (!pool.length) return [v];
  const best = pool.reduce((x, s) => s.worst < x.worst ? s : x);
  if (best.worst <= width || tokens.length < 3) return [best.a, best.b];
  const [head, ...rest] = wrapName(best.a, width, size);
  return [head, ...wrapName([...rest, best.b].join(latin ? " " : ""), width, size)];
}
var hangOf = (line2, align, em) => /[、，。；：！？]$/u.test(line2) ? (align === "right" ? 0.5 : align === "center" ? 0.3 : 0) * em : 0;
function nameText(v, x, y, { width = Infinity, size = LABEL, valign = "middle", align = "center", ...o } = {}) {
  const lines = Array.isArray(v) ? v : wrapName(v, width, size), em = labelSize(size), step = em * LEADING;
  const top = valign === "top" ? y + em / 2 : valign === "bottom" ? y - em / 2 - step * (lines.length - 1) : y - step * (lines.length - 1) / 2;
  lines.forEach(
    (line2, k) => text(line2, x + hangOf(line2, align, em), top + k * step, size, {
      align,
      ...o,
      whole: lines.join(" ")
    })
  );
  return { lines, top: top - em / 2, bottom: top + step * (lines.length - 1) + em / 2 };
}
var lineCaches = /* @__PURE__ */ new WeakMap();
function growLines(parts2, width = Infinity, size = LABEL) {
  const cache = lineCaches.get(ctx) ?? /* @__PURE__ */ new Map(), key = JSON.stringify([String(width), size, parts2]);
  lineCaches.set(ctx, cache);
  if (cache.has(key)) return cache.get(key);
  const greedy = [[]];
  parts2.forEach((part, k) => {
    const line2 = greedy.at(-1);
    if (line2.length && measure([...line2.map((j) => parts2[j]), part].join(""), size) > width)
      greedy.push([k]);
    else line2.push(k);
  });
  let lines = greedy;
  const n = greedy.length, span = (a, b) => measure(parts2.slice(a, b).join(""), size);
  const widths = greedy.map((line2) => span(line2[0], line2.at(-1) + 1));
  if (n > 1 && parts2.length <= 16 && widths.at(-1) < 0.4 * Math.max(...widths)) {
    let best = null;
    const search = (left, cuts) => {
      const from = cuts.at(-1) ?? 0;
      if (left === 1) {
        const ends = [...cuts, parts2.length], starts = [0, ...cuts], widths2 = ends.map((end, i) => span(starts[i], end));
        if (!widths2.every((w, i) => w <= width || ends[i] - starts[i] === 1)) return;
        const worst = Math.max(...widths2), spread = widths2.reduce((sum, v) => sum + v * v, 0);
        if (!best || worst < best.worst - 0.5 || Math.abs(worst - best.worst) <= 0.5 && spread < best.spread)
          best = { starts, ends, worst, spread };
        return;
      }
      for (let cut = from + 1; cut <= parts2.length - left + 1; cut++)
        search(left - 1, [...cuts, cut]);
    };
    search(n, []);
    if (best)
      lines = best.ends.map(
        (end, i) => Array.from({ length: end - best.starts[i] }, (_, j) => best.starts[i] + j)
      );
  }
  cache.set(key, lines);
  return lines;
}
var blockHeight = (lines, size = LABEL) => labelSize(size) * (1 + LEADING * (lines - 1));
function growTexts(parts2, width = Infinity, size = LABEL) {
  const lines = growLines(parts2, width, size).map((line2) => line2.map((k) => [k, parts2[k]]));
  lines.forEach((line2, r) => {
    const [k, v] = line2[0], lead = r ? v.match(/^[、，,;；\s]+/u)?.[0] ?? "" : "";
    if (!lead) return;
    line2[0] = [k, v.slice(lead.length)];
    const mark = lead.replace(/\s+/gu, "");
    if (mark) lines[r - 1].push([k, mark]);
  });
  return lines;
}
function growName(t, parts2, ats, x, y, {
  width = Infinity,
  size = LABEL,
  valign = "top",
  alpha = 1,
  build = false,
  align = "left",
  ...o
} = {}) {
  const em = labelSize(size), step = em * LEADING, lines = growTexts(parts2, width, size);
  const top = valign === "top" ? y + em / 2 : valign === "bottom" ? y - em / 2 - step * (lines.length - 1) : y - step * (lines.length - 1) / 2;
  lines.forEach((line2, r) => {
    const span = line2.reduce((w, [, v]) => w + measure(v, size), 0);
    let left = (align === "center" ? x - span / 2 : align === "right" ? x - span : x) + hangOf(line2.map(([, v]) => v).join(""), align, em);
    line2.forEach(([k, v]) => {
      const at = build ? ats[k] ?? ats[0] : ats[0];
      text(v, left, top + r * step, size, {
        align: "left",
        ...o,
        alpha: alpha * ramp(t, at - 0.15, 0.4),
        whole: o.whole ?? parts2.join("")
      });
      left += measure(v, size);
    });
  });
  return {
    lines: lines.length,
    top: top - em / 2,
    bottom: top + step * (lines.length - 1) + em / 2
  };
}
var NOTE = 22;
var TERM_GAP = 16;
var TERM_STACK = 10;
function termRowLayout(term, qual, width = Infinity, inline = null) {
  const one = !qual.length || (inline ?? measure(term.join(""), LABEL) + TERM_GAP + measure(qual.join(""), NOTE) <= width);
  const head = blockHeight(growLines(term, width).length);
  return {
    one,
    height: one ? head : head + TERM_STACK + blockHeight(growLines(qual, width, NOTE).length, NOTE)
  };
}
function termRow(t, term, termAts, qual, qualAts, x, y, {
  width = Infinity,
  alpha = 1,
  color = P.ink,
  set = null,
  build = false,
  inline = null,
  align = "left",
  qualLeft = null
} = {}) {
  const whole = [...term, ...qual].join(" "), { one } = termRowLayout(term, qual, width, inline ?? (align === "left" ? null : false)), shared = one && qual.length, span = measure(term.join(""), LABEL) + TERM_GAP + measure(qual.join(""), NOTE), left = shared ? align === "center" ? x - span / 2 : align === "right" ? x - span : x : x, head = growName(t, term, termAts, left, y, {
    width,
    alpha,
    color,
    whole,
    set,
    align: shared ? "left" : align
  });
  if (!qual.length) return head;
  const after = qualLeft !== null && align === "left" ? qualLeft : left + measure(term.join(""), LABEL) + TERM_GAP;
  const tail = growName(
    t,
    qual,
    qualAts,
    one ? after : x,
    one ? head.top + (labelSize(LABEL) - labelSize(NOTE)) / 2 : head.bottom + TERM_STACK,
    {
      size: NOTE,
      alpha,
      color: P.muted,
      width: one ? Infinity : width,
      whole,
      set,
      build,
      align: one ? "left" : align
    }
  );
  return { top: head.top, bottom: Math.max(head.bottom, tail.bottom) };
}
function rejectedName(v, x, y, {
  alpha = 1,
  mark = 1,
  size = LABEL,
  align = "center",
  valign = "middle",
  width = Infinity,
  set = null,
  markLeft = null
} = {}) {
  const s = Math.min(26, labelSize(size) * 0.9), at = align === "center" && markLeft === null ? x - (16 + s) / 2 : x;
  const block = nameText(v, at, y, {
    align,
    valign,
    width,
    size,
    color: P.muted,
    alpha: alpha * mix(1, 0.7, clamp(mark)),
    set
  });
  const w = Math.max(...block.lines.map((line2) => measure(line2, size))), left = align === "left" ? at : align === "right" ? at - w : at - w / 2, markAt = markLeft ?? left + w + 16;
  cross(markAt + s / 2, (block.top + block.bottom) / 2, s, {
    alpha: alpha * mark,
    width: 3
  });
  return { ...block, left, right: markAt + s };
}

// picture/film/scenes/claim.js
var CLAIM_H = 84;
var CLAIM_PAD = 60;
var CLAIM_DATUM = 12;
var claimParts = () => L(["“做完了", "，测试全过”"], ["“Done. ", "All tests pass.”"]);
var claimWidth = () => measure(claimParts().join("")) + 2 * CLAIM_PAD;
var datumMark = (x, y, r = CLAIM_DATUM, alpha = 1) => ethosMark(x, y, 512 * r / 14, { datum: 1, hole: 0, passages: 0, boundary: 0, alpha });
function claimPanel(t, x, y, { alpha = 1, words = alpha, ats = null, datum = 1, datumAt = null } = {}) {
  const parts2 = claimParts(), w = claimWidth(), left = x - w / 2, right = x + w / 2;
  box(left, y - CLAIM_H / 2, w, CLAIM_H, { stroke: P.ink, alpha, radius: 16, width: 2.5 });
  growName(t, parts2, ats ?? [-Infinity], left + CLAIM_PAD, y, {
    valign: "middle",
    alpha: words,
    build: ats !== null
  });
  const at = datumAt ?? [right, y];
  if (datum > 0.01) datumMark(at[0], at[1], CLAIM_DATUM * datum, alpha);
  return { left, right, top: y - CLAIM_H / 2, bottom: y + CLAIM_H / 2, width: w, datum: at };
}

// picture/film/drawing/links.js
function rounded(corners, r) {
  const out = [corners[0]];
  for (let i = 1; i < corners.length - 1; i++) {
    const [ax, ay] = corners[i - 1], [bx, by] = corners[i], [cx2, cy2] = corners[i + 1];
    const d1 = Math.hypot(bx - ax, by - ay), d2 = Math.hypot(cx2 - bx, cy2 - by);
    if (d1 < 1e-6 || d2 < 1e-6) continue;
    const k = Math.min(r, d1 / 2, d2 / 2), p = [bx - (bx - ax) / d1 * k, by - (by - ay) / d1 * k], q = [bx + (cx2 - bx) / d2 * k, by + (cy2 - by) / d2 * k];
    for (let n = 0; n <= 6; n++) {
      const u = n / 6;
      out.push([
        (1 - u) ** 2 * p[0] + 2 * (1 - u) * u * bx + u * u * q[0],
        (1 - u) ** 2 * p[1] + 2 * (1 - u) * u * by + u * u * q[1]
      ]);
    }
  }
  out.push(corners.at(-1));
  return out;
}
function along(points, q) {
  const lengths = points.slice(1).map((pt, i) => Math.hypot(pt[0] - points[i][0], pt[1] - points[i][1])), total = lengths.reduce((a, b) => a + b, 0);
  let left = clamp(q) * total;
  const kept = [points[0]];
  for (let i = 0; i < lengths.length; i++) {
    if (left >= lengths[i]) {
      kept.push(points[i + 1]);
      left -= lengths[i];
      continue;
    }
    const f = lengths[i] ? left / lengths[i] : 0, a = points[i], b = points[i + 1];
    kept.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
    break;
  }
  return { point: kept.at(-1), kept };
}
var FLOW_PACE = 180;
var FLOW_EVERY = 2.2;
var FLOW_SOONEST = 1;
var FLOW_EDGE = 0.25;
var flowClock = (t, stagger = 0) => voiceTime(t) + stagger * FLOW_EVERY;
function flowAlong(points, clock2, r, {
  upto = 1,
  since = -Infinity,
  every = null,
  single = false,
  clear = [],
  color = P.line,
  alpha = 1
} = {}) {
  if (clock2 === null || alpha < 0.01 || upto <= 0.9 || points.length < 2) return;
  let total = 0;
  for (let i = 1; i < points.length; i++)
    total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  const travel2 = total / FLOW_PACE, period = single ? Math.max(every ?? FLOW_EVERY, travel2) : every ?? Math.min(FLOW_EVERY, Math.max(FLOW_SOONEST, travel2)), edge = Math.min(FLOW_EDGE, travel2 / 2), grown = ease((upto - 0.9) / 0.1);
  for (let time = (clock2 % period + period) % period; time < travel2; time += period) {
    if (clock2 - time < since) continue;
    const [x, y] = along(points, time / travel2).point;
    const size = grown * ease(time / edge) * ease((travel2 - time) / edge) * clear.reduce(
      (k, [cx, cy, cr, presence = 1]) => k * (1 - ease(presence / 0.3) * (1 - ease((Math.hypot(x - cx, y - cy) - cr) / (FLOW_PACE * edge)))),
      1
    );
    if (r * size < 0.5) continue;
    dot(x, y, r * size, { color, alpha });
  }
}
function link(x1, y1, x2, y2, {
  route: route2 = null,
  mid = null,
  r = 14,
  color = P.line,
  alpha = 1,
  upto = 1,
  width = 2,
  dash = null,
  flow = null,
  flowSince = -Infinity,
  flowEvery = null,
  end = true
} = {}) {
  if (alpha < 0.01 || upto <= 0 || Math.hypot(x2 - x1, y2 - y1) < 1) return;
  const kind = route2 ?? (Math.abs(x1 - x2) < 0.5 || Math.abs(y1 - y2) < 0.5 ? "straight" : "vhv");
  const m = mid ?? (kind === "vhv" ? (y1 + y2) / 2 : (x1 + x2) / 2);
  const corners = {
    straight: [
      [x1, y1],
      [x2, y2]
    ],
    vhv: [
      [x1, y1],
      [x1, m],
      [x2, m],
      [x2, y2]
    ],
    hvh: [
      [x1, y1],
      [m, y1],
      [m, y2],
      [x2, y2]
    ],
    vh: [
      [x1, y1],
      [x1, y2],
      [x2, y2]
    ],
    hv: [
      [x1, y1],
      [x2, y1],
      [x2, y2]
    ]
  }[kind];
  const points = rounded(corners, r), drawn = along(points, upto).kept;
  if (drawn.length > 1)
    stroke(() => drawn.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)), {
      color,
      alpha,
      width,
      dash
    });
  const point = (width + 2.5) * ease((upto - 0.9) / 0.1);
  if (end && point > 0.3) dot(x2, y2, point, { color, alpha });
  if (flow !== null)
    flowAlong(points, flow, width + 2, { upto, since: flowSince, every: flowEvery, color, alpha });
}

// picture/film/drawing/workspace.js
function repoIcon(x, y, w, h, { alpha = 1, color = P.ink, fillColor = P.row } = {}) {
  if (alpha < 0.01) return;
  box(x - w / 2, y - h / 2, w, h, {
    fill: fillColor,
    stroke: color,
    alpha,
    radius: 14,
    width: 2.5
  });
  const gx = x - w / 2 + 34, gy = y - h / 2 + 30;
  line(gx, gy, gx, gy + 34, { color, alpha, width: 2.5 });
  stroke(
    () => {
      ctx.moveTo(gx, gy + 24);
      ctx.quadraticCurveTo(gx, gy + 10, gx + 18, gy + 8);
    },
    { color, alpha, width: 2.5 }
  );
  dot(gx, gy, 4.5, { color, alpha });
  dot(gx, gy + 34, 4.5, { color, alpha });
  dot(gx + 20, gy + 8, 4.5, { color, alpha });
}
function folderIcon(x, y, w, h, { alpha = 1, color = P.ink, fillColor = P.row } = {}) {
  if (alpha < 0.01) return;
  const tab = Math.min(46, w * 0.4);
  const build = () => {
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y + 14);
    ctx.lineTo(x + tab + 10, y + 14);
    ctx.lineTo(x + tab, y);
    ctx.lineTo(x + 8, y);
    ctx.closePath();
  };
  fill(build, { color: fillColor, alpha });
  stroke(build, { color, alpha, width: 2.5 });
}
function terminalIcon(x, y, w, h, { alpha = 1, color = P.ink, command = null, commandAlpha = alpha } = {}) {
  if (alpha < 0.01) return;
  box(x, y, w, h, { fill: P.row, stroke: color, alpha, radius: 10, width: 2.5 });
  line(x, y + 30, x + w, y + 30, { color: P.line, alpha, width: 2 });
  [0, 1, 2].forEach((i) => dot(x + 20 + i * 18, y + 15, 4, { color: P.muted, alpha }));
  if (command) {
    text("$", x + 22, y + 30 + (h - 30) / 2, 26, {
      role: "mark",
      color: P.muted,
      alpha: commandAlpha
    });
    text(command, x + 48, y + 30 + (h - 30) / 2, 26, {
      role: "mark",
      color: P.evidence,
      alpha: commandAlpha
    });
  }
}
function kernelIcon(x, y, r, { alpha = 1, color = P.authority, beat = 0, turn = 0 } = {}) {
  if (alpha < 0.01) return;
  const build = () => {
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + i * Math.PI / 3 + turn, px = x + r * Math.cos(a), py = y + r * Math.sin(a);
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
  };
  fill(build, { color: P.row, alpha });
  stroke(build, { color, alpha, width: 3 });
  dot(x, y, r * 0.26 * (1 + 0.25 * clamp(beat)), { color, alpha });
  ring(x, y, r * 0.52, { color, alpha: alpha * 0.5, width: 2 });
}
function tagIcon(x, y, w, h, { alpha = 1, color = P.authority } = {}) {
  if (alpha < 0.01) return;
  const build = () => {
    ctx.moveTo(x, y);
    ctx.lineTo(x + h / 2, y - h / 2);
    ctx.lineTo(x + w, y - h / 2);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + h / 2, y + h / 2);
    ctx.closePath();
  };
  fill(build, { color: P.row, alpha });
  stroke(build, { color, alpha, width: 2.5 });
  dot(x + h / 2 + 2, y, 4, { color, alpha });
}
function recoverIcon(x, y, r, { alpha = 1, color = P.evidence, upto = 1 } = {}) {
  if (alpha < 0.01) return;
  ring(x, y, r, { color, alpha, width: 3, upto: 0.78 * clamp(upto), start: -Math.PI * 0.35 });
  const a = -Math.PI * 0.35 + Math.PI * 2 * 0.78 * clamp(upto);
  const point = 5 * ease((upto - 0.9) / 0.1);
  if (point > 0.3) dot(x + r * Math.cos(a), y + r * Math.sin(a), point, { color, alpha });
}
function askIcon(x, y, r, { alpha = 1, color = P.evidence } = {}) {
  if (alpha < 0.01) return;
  stroke(
    () => {
      ctx.arc(x, y, r, Math.PI * 0.7, Math.PI * 0.55 + Math.PI * 2 * 0.95);
      ctx.lineTo(x - r * 0.9, y + r * 1.15);
      ctx.closePath();
    },
    { color, alpha, width: 2.5 }
  );
  text("?", x, y + 1, 26, { role: "mark", align: "center", color, alpha });
}
function layersIcon(x, y, w, h, { alpha = 1, color = P.ink, fillColor = P.row, layers = 3 } = {}) {
  if (alpha < 0.01) return;
  const slab = h / (layers + 0.4), build = () => {
    for (let i = 0; i < layers; i++)
      ctx.roundRect(x - w / 2, y - h / 2 + i * slab * 1.05, w, slab * 0.86, 8);
  };
  fill(build, { color: fillColor, alpha });
  stroke(build, { color, alpha, width: 2.5 });
  stroke(
    () => {
      for (let i = 0; i < layers; i++) {
        const ry = y - h / 2 + (i * 1.05 + 0.43) * slab;
        ctx.moveTo(x - w / 2 + 24, ry);
        ctx.lineTo(x + w / 2 - 24, ry);
      }
    },
    { color, alpha: alpha * 0.6, width: 2 }
  );
}
function commitDot(x, y, { alpha = 1, color = P.ink, picked = 0, r = 9 } = {}) {
  if (alpha < 0.01) return;
  dot(x, y, r, { color: P.ground, alpha });
  ring(x, y, r, { color, alpha, width: 3 });
  if (picked > 0.01) ring(x, y, r + 9, { color: P.evidence, alpha: alpha * picked, width: 2.5 });
}
function bubble(x, y, r, { alpha = 1, color = P.muted } = {}) {
  if (alpha < 0.01) return;
  const build = () => {
    ctx.roundRect(x - r * 1.3, y - r * 0.85, r * 2.6, r * 1.7, r * 0.5);
  };
  fill(build, { color: P.row, alpha });
  stroke(build, { color, alpha, width: 2.5 });
  stroke(
    () => {
      ctx.moveTo(x - r * 0.7, y - r * 0.1);
      ctx.lineTo(x + r * 0.7, y - r * 0.1);
      ctx.moveTo(x - r * 0.7, y + r * 0.3);
      ctx.lineTo(x + r * 0.2, y + r * 0.3);
    },
    { color, alpha, width: 2 }
  );
}
function ledger(x, y, w, h, { alpha = 1 } = {}) {
  if (alpha < 0.01) return;
  documentIcon(x - w / 2, y - h / 2, w, h, { alpha, rows: 0 });
  const rows = [-2, -1, 1, 2].map((k) => y + k * h * 0.17);
  stroke(
    () => rows.forEach((ry, k) => {
      ctx.moveTo(x - w * 0.34, ry);
      ctx.lineTo(x + w * (k % 2 ? 0.18 : 0.3), ry);
    }),
    { color: P.muted, alpha: alpha * 0.8, width: 2 }
  );
  line(x - w * 0.34, y, x + w / 2 - 34, y, { color: P.authority, alpha, width: 3 });
}

// picture/film/timing/stages.js
var STAGE_CUT = 0.18;
var stageCuts = /* @__PURE__ */ new Map();
var declareCut = (at) => {
  const id = layout.scene;
  if (id === null) return;
  const v = stageCuts.get(id) ?? /* @__PURE__ */ new Set();
  v.add(at);
  stageCuts.set(id, v);
};
var stageOut = (t, word) => {
  declareCut(word + STAGE_CUT);
  return t < word + STAGE_CUT ? 1 : 0;
};
var stageIn = (t, word) => {
  declareCut(word + STAGE_CUT);
  return t < word + STAGE_CUT ? 0 : 1;
};

// picture/film/naming/lists.js
var named = (t, at) => ramp(t, at - 0.15, 0.4);
var SECOND = 0.58;
var WHOLE = 0.6;
var listLevel = (t, ats, i, until = Infinity) => {
  const last = ats.at(-1), spoken = wordEnd.get(last) ?? last;
  const cut = Math.min(
    ...[...stageCuts.get(layout.scene) ?? []].filter((c) => c > last && c < thoughtEnd(last))
  );
  const end = Math.min(thoughtEnd(last), cut);
  const done = Math.max(last - 0.1, Math.min(spoken, end - WHOLE - 0.4)), back = Math.min(0.4, Math.max(0.15, end - 0.05 - done));
  const dims = i + 1 < ats.length && done - ats[i + 1] > 0.6;
  const level = i + 1 < ats.length ? mix(
    mix(1, SECOND, dims ? ramp(t, pauseHold(ats[i + 1] - 0.15, 0.3), 0.3) : 0),
    1,
    ramp(t, done, back)
  ) : 1;
  return level * (1 - ramp(t, pauseHold(until, 0.4), 0.4));
};
var listIn = (t, ats, i, until = Infinity) => ramp(t, ats[i] - 0.15, 0.4) * listLevel(t, ats, i, until);
var speaking = (t, ats, i) => {
  const until = i + 1 < ats.length ? ats[i + 1] - 0.15 : pauseHold(Math.max(ats[i] + 1.5, (phraseEnd.get(ats[i]) ?? ats[i]) + 0.3), 0.3);
  return ramp(t, ats[i] - 0.15, 0.3) * (1 - ramp(t, until, 0.3));
};
var saidShare = (t, ats) => ats.reduce((v, at) => v + soon(t, at + 0.05, 0.35), 0) / ats.length;
function beats(t, x, y, r, ats, { color = P.ink, alpha = 1 } = {}) {
  const flash = Math.max(
    0,
    ...ats.map((at) => {
      const p = clamp((t - at - 0.05) / 0.5);
      return p > 0 && p < 1 ? Math.sin(Math.PI * p) : 0;
    })
  );
  if (flash > 0) ring(x, y, r, { color, alpha: alpha * flash * 0.5, width: 3.5 });
}
var building = (t, ats, step = 48, lead = 0.1) => step * ats.slice(1).reduce((v, at) => v + 1 - glideShare(t, at - lead, step), 0);
function reachAt(t, base, parts2, duration = 0.7) {
  let reach = base, now = base;
  for (const [at, v] of [...parts2].sort((a, b) => a[0] - b[0])) {
    if (v <= reach) continue;
    now += (v - reach) * glideShare(t, at + 0.05, (v - reach) / 2, duration);
    reach = v;
  }
  return now;
}

// picture/film/naming/placement.js
var rowNameTop = (bottoms, gap = NAME_GAP) => Math.max(...bottoms) + gap;
function railNames(names2, xs, y, {
  side = 1,
  gap = NAME_GAP + 18,
  size = LABEL,
  alpha = () => 1,
  color = () => P.ink,
  wrap = RAIL_WRAP,
  set = `rail:${names2[0]}`
} = {}) {
  const room = (i) => Math.min(i ? xs[i] - xs[i - 1] : Infinity, i + 1 < xs.length ? xs[i + 1] - xs[i] : Infinity) - 30;
  names2.forEach((v, i) => {
    const width = Math.min(wrap, room(i));
    nameText(v, xs[i], y + side * gap, {
      width,
      size,
      valign: side > 0 ? "top" : "bottom",
      align: "center",
      alpha: alpha(i),
      color: color(i),
      set
    });
  });
}
var RAIL_WRAP = 240;
function railStations(names2, first, last, { size = LABEL, gap = 34, wrap = RAIL_WRAP } = {}) {
  const widths = names2.map(
    (v) => Math.max(...wrapName(v, wrap, size).map((line2) => measure(line2, size)))
  );
  const need = widths.slice(1).map((w, i) => (widths[i] + w) / 2 + gap), pitch = names2.length > 1 ? (last - first) / (names2.length - 1) : 0;
  if (need.every((d) => d <= pitch)) return names2.map((_, i) => first + i * pitch);
  const slack = Math.max(0, last - first - need.reduce((a, b) => a + b, 0)) / Math.max(1, need.length);
  return need.reduce((xs, d) => [...xs, xs.at(-1) + d + slack], [first]);
}

// picture/film/scenes/p01/done.js
var route = (corners) => rounded(corners, 14);
function agentRow(xs, y, { alpha = 1, size = 1 } = {}) {
  if (alpha < 0.01) return;
  const r = 22 * size, c = 4.5 * size;
  stroke(
    () => xs.forEach((x) => {
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r, y);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r, y);
      ctx.closePath();
    }),
    { color: P.ink, alpha, width: 2.5 }
  );
  fill(
    () => xs.forEach((x) => {
      ctx.moveTo(x + c, y);
      ctx.arc(x, y, c, 0, Math.PI * 2);
    }),
    { color: P.ink, alpha }
  );
}
function die(x, y, s, { alpha = 1 } = {}) {
  box(x - s / 2, y - s / 2, s, s, { stroke: P.ink, alpha, radius: s * 0.2, width: 2.5 });
  fill(
    () => [
      [-1, -1],
      [1, -1],
      [0, 0],
      [-1, 1],
      [1, 1]
    ].forEach(([i, j]) => {
      const px = x + i * s * 0.25, py = y + j * s * 0.25;
      ctx.moveTo(px + 3.5, py);
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    }),
    { color: P.ink, alpha }
  );
}
function checksGrid(x, y, n, { alpha = 1, step = 46 } = {}) {
  if (alpha < 0.01) return;
  const cols = Array.from({ length: Math.ceil(n - 1e-6) }, (_, i) => [
    x + (i - (n - 1) / 2) * step,
    clamp(n - i)
  ]), r = 22 * 0.55, c = 4.5 * 0.55;
  stroke(
    () => cols.forEach(([cx, k]) => {
      ctx.moveTo(cx, y - r * k);
      ctx.lineTo(cx + r * k, y);
      ctx.lineTo(cx, y + r * k);
      ctx.lineTo(cx - r * k, y);
      ctx.closePath();
    }),
    { color: P.ink, alpha, width: 2.5 }
  );
  fill(
    () => cols.forEach(([cx, k]) => {
      ctx.moveTo(cx + c * k, y);
      ctx.arc(cx, y, c * k, 0, Math.PI * 2);
    }),
    { color: P.ink, alpha }
  );
  stroke(
    () => cols.forEach(([cx, k]) => {
      ctx.moveTo(cx - 7 * k, y + 37.5 + 0.5 * k);
      ctx.lineTo(cx - 2 * k, y + 37.5 + 5.5 * k);
      ctx.lineTo(cx + 8 * k, y + 37.5 - 5.5 * k);
    }),
    { color: P.ink, alpha, width: 2.5 }
  );
}
scenes["01"] = function(s, t) {
  if (t < s.words[0].start - 0.12) {
    titleSignature(1);
    return;
  }
  const first = s.words[0].start;
  const [hand, done, pass, landed, much] = cues(s, [
    ["交回来", "hands back"],
    ["做完了", "Done"],
    ["测试全过", "All tests pass"],
    ["全过", "pass"],
    ["说明了多少", "How much"]
  ]);
  const opens = cue(s, "它说的是", "Which commit"), qs = cues(s, [
    ["哪一次提交", "Which commit"],
    ["哪些测试", "Which tests ran"],
    ["是不是提需求的人真正要的", "really asked for"],
    ["能不能退回去", "can you get back"]
  ]);
  const [relay, codeAt, inter, ends, pick] = cues(s, [
    ["越来越多", "our code"],
    ["改代码", "our code"],
    ["可以互相替换", "interchangeable Agents"],
    ["会话结束了", "session ends"],
    ["换一个接着做", "another picks up"]
  ]);
  const [writing, easier, flatAt, rely, hard] = cues(s, [
    ["写一个改动", "Writing code"],
    ["越来越容易", "keeps getting easier"],
    ["能不能信得过它", "Knowing whether"],
    ["能不能信得过它", "whether you can rely on it"],
    ["难的是", "does not"]
  ]);
  const [heard, people, two, trust, again, luck, cant, cantName, many] = cues(s, [
    ["这样一句话", "a sentence like that"],
    ["人", "people"],
    ["两种做法", "two things"],
    ["照单全收", "take it on trust"],
    ["从头再查一遍", "check everything again"],
    ["靠的是运气", "a gamble"],
    ["Agent 一多", "stops working"],
    ["查不过来", "stops working"],
    ["Agent 一多", "many Agents"]
  ]);
  const ethos = cue(s, "ETHOS", "ETHOS");
  const stageA = stageOut(t, relay), stageB = stageIn(t, relay) * stageOut(t, writing), stageC = stageIn(t, writing) * stageOut(t, heard), stageD = stageIn(t, heard) * stageOut(t, ethos), stageE = stageIn(t, ethos);
  const q = flowClock(t);
  illustrative(Math.max(stageA, stageD, stageE));
  const W = claimWidth();
  if (stageA > 0) {
    const aside = glideShare(t, hand + 0.05, Math.hypot(220, 80)), AX2 = mix(960, 740, aside), AY = mix(560, 640, aside), AR = 33, gone = ramp(t, opens - 0.15, 0.4), lead = Math.max(first - 0.28, s.voice_start - 0.1, cue(s, "Agent", "Agent") - 0.27), seen = stageA * ramp(t, lead - 0.15, 0.4) * (1 - gone);
    const slide = glideShare(t, opens + 0.05, 100, 0.7), PX2 = mix(1060, 960, slide), PY = 360, left = PX2 - W / 2;
    agent(AX2, AY, { size: 1.5, alpha: seen });
    nameText("Agent", AX2, AY + AR + NAME_GAP, {
      valign: "top",
      alpha: stageA * named(t, lead) * (1 - gone)
    });
    const handed = soon(t, hand + 0.05, 0.6), corners = [
      [AX2, AY - AR],
      [AX2, PY],
      [left, PY]
    ];
    link(AX2, AY - AR, left, PY, { route: "vh", alpha: seen, upto: handed, end: false });
    flowAlong(route(corners), q, 6, { upto: handed, every: FLOW_EVERY, color: P.ink, alpha: seen });
    const panel = stageA * ramp(t, hand + 0.35, 0.4);
    const placed = claimPanel(t, PX2, PY, {
      alpha: panel,
      words: stageA,
      ats: [done, pass],
      datum: soon(t, landed + 0.05, 0.35)
    });
    const [DX, DY] = placed.datum;
    nameText(L("说明了多少？", "How much?"), PX2, PY - CLAIM_H / 2 - NAME_GAP, {
      valign: "bottom",
      alpha: stageA * named(t, much)
    });
    beats(t, DX, DY, 30, [much], { alpha: stageA });
    const names2 = L(
      ["哪一次提交？", "哪些测试，在哪儿？", "是不是真正要的？", "能不能退回去？"],
      ["Which commit?", "Which tests, and where?", "Really asked for?", "Can you get back?"]
    );
    const RY = 620, RR = 34, base = railStations(names2, 420, 1500, { wrap: 330 }), shift = building(t, qs, (base[1] - base[0]) / 2), xs = base.map((x) => x + shift), mid = (PY + CLAIM_H / 2 + RY - RR) / 2;
    xs.forEach((x, i) => {
      const on = stageA * ramp(t, qs[i] - 0.15, 0.4), lit = speaking(t, qs, i);
      if (on < 0.01) return;
      const drawn = soon(t, qs[i] + 0.05, 0.5);
      link(PX2, PY + CLAIM_H / 2, x, RY - RR, {
        route: "vhv",
        mid,
        alpha: on,
        upto: drawn
      });
      flowAlong(
        route([
          [PX2, PY + CLAIM_H / 2],
          [PX2, mid],
          [x, mid],
          [x, RY - RR]
        ]),
        q,
        5,
        // The rail's stations glide while it builds, so the flow keeps one period.
        { upto: drawn, every: FLOW_EVERY, color: P.ink, alpha: on * lit }
      );
      dot(x, RY, RR, { color: P.ground, alpha: on });
      ring(x, RY, RR, { color: P.ink, alpha: on, width: 2.5 + lit });
      if (i === 0) {
        line(x - 20, RY, x + 20, RY, { color: P.ink, alpha: on, width: 2.5 });
        commitDot(x, RY, { alpha: on, r: 8 });
      }
      if (i === 1) {
        box(x - 19, RY - 15, 38, 30, { stroke: P.ink, alpha: on, radius: 5, width: 2.5 });
        check(x, RY + 1, 16, { color: P.ink, alpha: on, width: 3 });
      }
      if (i === 2) documentIcon(x - 13, RY - 17, 26, 34, { alpha: on, rows: 3 });
      if (i === 3) recoverIcon(x, RY, 15, { color: P.ink, alpha: on });
    });
    railNames(names2, xs, RY + RR, {
      gap: NAME_GAP,
      wrap: 330,
      alpha: (i) => stageA * listIn(t, qs, i),
      set: "questions"
    });
  }
  if (stageB > 0) {
    const xs = [560, 720, 880], Y3 = 500, R = 33, S = 48, RX = 1330, RW = 260, RH = 200;
    const row = stageB;
    ctx.save();
    ctx.translate(960 - (xs[0] - S + RX + RW / 2) / 2, 0);
    repoIcon(RX, Y3, RW, RH, { alpha: stageB });
    stroke(
      () => [0.7, 0.5, 0.8, 0.45].forEach((w, k) => {
        ctx.moveTo(RX - 70, Y3 - 30 + k * 30);
        ctx.lineTo(RX - 70 + 170 * w, Y3 - 30 + k * 30);
      }),
      { color: P.muted, alpha: stageB * 0.8, width: 2 }
    );
    agentRow(xs, Y3, { alpha: row, size: 1.5 });
    link(xs[2] + R, Y3, RX - RW / 2, Y3, {
      alpha: row,
      flow: q,
      width: 2.5
    });
    const namesTop = en ? rowNameTop([Y3 + S, Y3 + RH / 2]) : Y3 + S + NAME_GAP;
    if (!en)
      nameText("改代码", (xs[2] + R + RX - RW / 2) / 2, Y3 - NAME_GAP, {
        valign: "bottom",
        alpha: stageB
      });
    else
      nameText("Our code", RX, namesTop, {
        valign: "top",
        alpha: stageB * named(t, codeAt)
      });
    nameText(L("可以互相替换的 Agent", "Interchangeable Agents"), xs[1], namesTop, {
      valign: "top",
      alpha: stageB * named(t, inter)
    });
    const ended = ramp(t, ends - 0.15, 0.4), moved = glideShare(t, pick + 0.05, xs[1] - xs[0], 0.7), FX = mix(xs[0], xs[1], moved), dashedShare = ended * (1 - ramp(t, pick + 0.45, 0.4));
    box(FX - S, Y3 - S, 2 * S, 2 * S, {
      stroke: P.ink,
      alpha: row * (1 - dashedShare),
      radius: 14,
      width: 2.5
    });
    box(FX - S, Y3 - S, 2 * S, 2 * S, {
      stroke: P.ink,
      alpha: row * dashedShare * 0.8,
      radius: 14,
      width: 2.5,
      dash: [7, 7]
    });
    const parts2 = L(["会话结束了", "，换一个"], ["Session ends", ", another picks up"]), ending = parts2[0].trimEnd(), hung = /[、，。；：！？]$/u.test(ending) ? 0.3 * labelSize(LABEL) : 0, alone = xs[0] - measure(ending) / 2 + hung, whole = xs[1] - measure(parts2.join("")) / 2;
    growName(t, parts2, [ends, pick], mix(alone, whole, moved), Y3 - S - NAME_GAP, {
      valign: "bottom",
      alpha: stageB,
      build: true
    });
    ctx.restore();
  }
  if (stageC > 0) {
    const X02 = 340, X1 = 1300, Y0 = 610, writingName = L("写一个改动", "Writing code"), relyName = L("能不能信得过它", "Whether you can rely on it"), relyWide = Math.max(...wrapName(relyName, 300).map((v) => measure(v))), ends2 = X1 + 7 + NAME_GAP, centre = (w) => 960 - (X02 + ends2 + w) / 2, shift = mix(
      centre(measure(writingName)),
      centre(Math.max(measure(writingName), relyWide)),
      glideShare(t, rely + 0.05, Math.abs(relyWide - measure(writingName)) / 2, 0.7)
    ), climb = 120 + 160 * soon(t, easier + 0.05, 1.6) + 6 * Math.max(0, voiceTime(t) - voiceTime(easier + 1.65));
    const rise = (x) => Y0 - climb * ((x - X02) / (X1 - X02)) ** 1.7, points = [];
    for (let x = X02; x < X1; x += 12) points.push([x, rise(x)]);
    points.push([X1, rise(X1)]);
    ctx.save();
    ctx.translate(shift, 0);
    path(points, { color: P.ink, alpha: stageC, width: 4 });
    dot(X1, rise(X1), 7, { color: P.ink, alpha: stageC });
    nameText(writingName, ends2, rise(X1), {
      align: "left",
      alpha: stageC * named(t, writing)
    });
    const flat = stageC * ramp(t, flatAt - 0.15, 0.4), flatDrawn = ease((t - flatAt + 0.1) / 1.3), flatReach = mix(X02, X1, flatDrawn);
    line(X02, Y0, flatReach, Y0, { color: P.ink, alpha: flat, width: 4 });
    dot(X1, Y0, 7, { color: P.ink, alpha: flat * ramp(t, flatAt + 0.8, 0.4) });
    beats(t, X1, Y0, 22, [hard - 0.1], { alpha: flat });
    nameText(relyName, ends2, Y0, {
      align: "left",
      width: 300,
      alpha: stageC * named(t, rely)
    });
    ctx.restore();
  }
  if (stageD > 0 || stageE > 0) {
    const PY = 300, move = glideShare(t, ethos + 0.05, Math.hypot(W / 2, 620 - PY), 0.8);
    claimPanel(t, 960, PY, {
      alpha: stageD + stageE,
      datum: mix(1, 1.5, move),
      datumAt: [mix(960 + W / 2, 960, move), mix(PY, 620, move)]
    });
    nameText("ETHOS", 960, 620 + 18 + NAME_GAP, { valign: "top", alpha: stageE * named(t, ethos) });
    if (stageD > 0) {
      const HX = 960, HY = 450 + 170 * (1 - glideShare(t, two + 0.05, 170, 0.5)), heard1 = stageD;
      link(HX, PY + CLAIM_H / 2, HX, HY - 44, { alpha: heard1 });
      person(HX, HY, { size: 1.3, alpha: heard1 });
      nameText(L("人", "People"), HX + 34 + NAME_GAP, HY - 12, {
        align: "left",
        alpha: stageD * named(t, people)
      });
      const XS2 = [620, 1300], FY = HY + 42, MID2 = 525, BY = 565, NY = BY + NAME_GAP, LINK = NY + labelSize(LABEL) + TERM_STACK + labelSize(NOTE) + 14, GY = LINK + 62, ways = [trust, again], costs = [cue(s, "运气", "a gamble"), cantName], marks = [luck, cant], fork = stageD * ramp(t, two + 0.25, 0.3);
      XS2.forEach((x, i) => {
        const forked = soon(t, two + 0.4, 0.6);
        link(HX, FY, x, BY, {
          route: "vhv",
          mid: MID2,
          alpha: fork,
          upto: forked
        });
        flowAlong(
          route([
            [HX, FY],
            [HX, MID2],
            [x, MID2],
            [x, BY]
          ]),
          q,
          5,
          { upto: forked, color: P.ink, alpha: fork * speaking(t, ways, i) }
        );
        termRow(
          t,
          [L(["照单全收", "从头再查一遍"], ["Take it on trust", "Check everything again"])[i]],
          [ways[i]],
          [L(["运气", "查不过来"], ["a gamble", "stops working"])[i]],
          [costs[i]],
          x,
          NY,
          { alpha: stageD * listLevel(t, ways, i), align: "center", set: "ways" }
        );
        const on = stageD * ramp(t, marks[i] - 0.15, 0.4);
        link(x, LINK, x, GY - 42, { alpha: on, upto: soon(t, marks[i] - 0.1, 0.4) });
      });
      die(XS2[0], GY, 46, { alpha: stageD * ramp(t, luck - 0.15, 0.4) });
      const grid = stageD * ramp(t, cant - 0.15, 0.4);
      checksGrid(XS2[1], GY - 16, mix(2, 7, glideShare(t, many + 0.05, 5 * 46 / 2, 0.65)), {
        alpha: grid
      });
    }
  }
};

// picture/film/scenes/p02/drift.js
function papers(list, alpha = 1) {
  if (alpha < 0.01 || !list.length) return;
  const sheet = ([x, y, w, h]) => {
    const c = Math.min(22, w * 0.2);
    ctx.moveTo(x, y);
    ctx.lineTo(x + w - c, y);
    ctx.lineTo(x + w, y + c);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
  };
  stroke(
    () => list.forEach((v) => {
      sheet(v);
      const [x, y, w] = v, c = Math.min(22, w * 0.2);
      ctx.moveTo(x + w - c, y);
      ctx.lineTo(x + w - c, y + c);
      ctx.lineTo(x + w, y + c);
    }),
    { color: P.ink, alpha, width: 2 }
  );
  stroke(
    () => list.forEach(([x, y, w, h, rows]) => {
      for (let i = 0; i < rows; i++) {
        const ry = y + h * (0.3 + i * 0.55 / Math.max(1, rows));
        ctx.moveTo(x + w * 0.14, ry);
        ctx.lineTo(x + w * (i % 2 ? 0.62 : 0.82), ry);
      }
    }),
    { color: P.muted, alpha: alpha * 0.8, width: 2 }
  );
}
var paper = (x, y, w, h, { alpha = 1, rows = 3 } = {}) => papers([[x, y, w, h, rows]], alpha);
function railLine(alpha) {
  const { y, x0, x1 } = RAIL;
  stroke(
    () => {
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      [x0, x1].forEach((x) => {
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x, y + 10);
      });
    },
    { color: P.line, alpha, width: 2.5 }
  );
}
var RAIL = { y: 690, x0: 400, x1: 1520, xs: [680, 960, 1240], heads: [604, 624, 604] };
function handlers(seen) {
  const { xs } = RAIL;
  person(xs[0], 640, { size: 1.1, alpha: seen[0] });
  agent(xs[1], 646, { alpha: seen[1] });
  person(xs[2], 640, { size: 1.1, alpha: seen[2] });
}
var DOC_W = 72;
var DOC_H = 96;
var DOC_TOP = RAIL.y - 4 - DOC_H;
var requestDoc = (alpha) => paper(RAIL.x0 - DOC_W / 2, DOC_TOP, DOC_W, DOC_H, { alpha, rows: 4 });
function railEnd(alpha) {
  ring(RAIL.x1, RAIL.y, 14, { color: P.ink, alpha, width: 2.5 });
  dot(RAIL.x1, RAIL.y, 5, { color: P.ink, alpha });
}
function stagePerson(t, a, c) {
  if (a <= 0) return;
  const Y3 = 700, walk = glideShare(t, c.span - 0.05, 800, 3), ux = mix(560, 1360, walk), work2 = a * ramp(t, c.work - 0.15, 0.4), who = a * ramp(t, c.person - 0.15, 0.4);
  stroke(
    () => {
      ctx.moveTo(520, Y3 - 12);
      ctx.lineTo(520, Y3 + 12);
      ctx.moveTo(520, Y3);
      ctx.lineTo(1400, Y3);
      ctx.moveTo(1400, Y3 - 12);
      ctx.lineTo(1400, Y3 + 12);
    },
    { color: P.line, alpha: a, width: 2.5 }
  );
  line(520, Y3, ux, Y3, { color: P.ink, alpha: a * ramp(t, c.span - 0.15, 0.4), width: 3 });
  person(ux, 662, { size: 1.5, alpha: who });
  paper(ux + 30, 610, 44, 56, { alpha: work2, rows: 3 });
  nameText(L("一个人", "One person"), ux - 40 - NAME_GAP, 640, {
    align: "right",
    alpha: a * named(t, c.person)
  });
  nameText(L("一件事", "A piece of work"), ux + 74 + NAME_GAP, 638, {
    align: "left",
    alpha: a * named(t, c.work)
  });
  nameText(L("从头做到尾", "Start to finish"), 960, Y3 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.span)
  });
  const story = a * ramp(t, c.story - 0.15, 0.4), BY = 515;
  if (story > 0.01) {
    box(ux - 100, BY - 38, 200, 76, { stroke: P.ink, alpha: story, radius: 18, width: 2.5 });
    line(ux, BY + 38, ux, 610, { color: P.ink, alpha: story, width: 2.5 });
    stroke(
      () => [0.8, 0.55, 0.7].forEach((w, k) => {
        ctx.moveTo(ux - 70, BY - 18 + k * 18);
        ctx.lineTo(ux - 70 + 140 * w, BY - 18 + k * 18);
      }),
      { color: P.muted, alpha: story * 0.8, width: 2 }
    );
  }
  nameText(L("来龙去脉", "The whole story"), ux - 100 - NAME_GAP, BY, {
    align: "right",
    alpha: a * named(t, c.story)
  });
}
function stageRail(t, a, c) {
  if (a <= 0) return;
  const { y, x0, x1, xs } = RAIL, stations = [c.st1, c.st2, c.st3];
  railLine(a);
  requestDoc(a);
  nameText(L("一项需求", "A request"), x0, y + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.rCut)
  });
  railEnd(a * ramp(t, c.delivery - 0.15, 0.4));
  const ats = [...stations, c.delivery], order = [...ats].sort((p, q) => p - q);
  railNames(
    L(["理解", "转述", "交接", "落地"], ["Interpretation", "Retelling", "Handoffs", "Delivery"]),
    [...xs, x1],
    y,
    { gap: NAME_GAP, alpha: (i) => a * listIn(t, order, order.indexOf(ats[i])), set: "stations" }
  );
  const seen = stations.map((at) => a * ramp(t, at - 0.15, 0.4));
  handlers(seen);
  beats(t, xs[0], 634, 46, [c.people], { alpha: seen[0] });
  beats(t, xs[2], 634, 46, [c.people], { alpha: seen[2] });
  beats(t, xs[1], 646, 46, [c.agents], { alpha: seen[1] });
  const stops = [...xs, x1], steps = [...stations, en ? c.delivery : c.people], px = glideSteps(
    t,
    x0,
    steps.map((at, i) => [at, stops[i]]),
    0.5
  );
  token(px, y, { r: 9, alpha: a });
}
function stageSummaries(t, a, c) {
  if (a <= 0) return;
  const { y, x0, x1, xs, heads } = RAIL;
  const sheets = [
    [xs[0], 56, 3, heads[0] - 4],
    [xs[1], 48, 2, heads[1] - 4],
    [xs[2], 40, 1, heads[2] - 4],
    [x1, 32, 1, y - 18]
  ].map(([x, w, rows, foot]) => [x - w / 2, foot - w * 1.27, w, w * 1.27, rows]), above = Math.min(DOC_TOP, ...sheets.map(([, top]) => top)) - NAME_GAP;
  const original = L("原话", "The words before it"), overhang = Math.max(0, measure(original) / 2 - DOC_W / 2);
  ctx.save();
  ctx.translate(overhang / 2 * glideShare(t, c.orig + 0.05, overhang / 2, 0.7), 0);
  railLine(a);
  requestDoc(a);
  railEnd(a);
  handlers([a, a, a]);
  flowAlong(
    [
      [x0 + 44, y],
      [x1 - 20, y]
    ],
    flowClock(t),
    7,
    { single: true, color: P.ink, alpha: a }
  );
  nameText(original, x0, above, {
    valign: "bottom",
    alpha: a * named(t, c.orig - 0.1)
  });
  papers(sheets, a * ramp(t, c.summary - 0.15, 0.4));
  nameText(L("一份总结顶替一次", "A summary takes the place"), (xs[0] + x1) / 2, above, {
    valign: "bottom",
    alpha: a * named(t, c.summary)
  });
  const lost = [L(c.unwritten, c.anyConstraint), c.mustNot, c.benefit], LY = y + 34;
  xs.forEach((x, i) => {
    const on = a * ramp(t, lost[i] - 0.15, 0.4), gone = i ? 1 : ramp(t, c.gone - 0.15, 0.4);
    line(x - 44, LY, x + 44, LY, { color: P.ink, alpha: on * (1 - gone), width: 3 });
    dashed(x - 44, LY, x + 44, LY, { color: P.ink, alpha: on * gone * 0.85, width: 3 });
  });
  const terms = L(
    ["没写下来的约束", "不能做什么", "本来要带来的效益"],
    ["Any constraint", "What must not be done", "The benefit"]
  ), quals = L([[], [], []], [["never written down"], [], []]);
  xs.forEach(
    (x, i) => termRow(t, [terms[i]], [lost[i]], quals[i], [c.unwritten], x, LY + NAME_GAP, {
      alpha: a * listLevel(t, lost, i),
      align: "center",
      set: "lost"
    })
  );
  ctx.restore();
}
function stageWrongGoal(t, a, c) {
  if (a <= 0) return;
  const DX = 640, DY = 580, TX = 1280, q = flowClock(t), aim = a * ramp(t, c.wrong - 0.15, 0.4);
  paper(DX - 70, DY - 90, 140, 180, { alpha: a, rows: 6 });
  dot(DX + 70, DY + 90, 22, { color: P.ground, alpha: a });
  ring(DX + 70, DY + 90, 22, { color: P.ink, alpha: a, width: 2.5 });
  check(DX + 70, DY + 91, 20, { color: P.ink, alpha: a, width: 3 });
  const namesTop = rowNameTop([DY + 90 + 22, DY + 58]);
  termRow(
    t,
    [L("需求", "A specification")],
    [c.gCut],
    [L("格式齐全、挑不出毛病", "complete and well formed")],
    [c.wellFormed],
    DX,
    namesTop,
    { width: 400, alpha: a, align: "center" }
  );
  link(DX + 70, DY, TX - 58, DY, {
    alpha: a,
    upto: soon(t, c.gCut + 0.3, 0.6),
    flow: q,
    width: 2.5
  });
  [58, 36].forEach((r) => ring(TX, DY, r, { color: P.ink, alpha: a, width: 2.5 }));
  dot(TX, DY, 10, { color: P.ink, alpha: a });
  cross(TX + 62, DY - 62, 26, { color: P.ink, alpha: aim, width: 3.5 });
  termRow(
    t,
    [L("目标", "The wrong goal")],
    [c.goal],
    L(["从一开始就定错了"], []),
    [c.wrong],
    TX,
    namesTop,
    {
      width: 400,
      alpha: a,
      align: "center"
    }
  );
}

// picture/film/drawing/lanes.js
function writeGate(x, y, h, { alpha = 1, open = 0, color = P.authority, single = false } = {}) {
  if (alpha < 0.01) return;
  const top = y - h / 2, bottom = y + h / 2, lift = clamp(open) * (h - 40);
  if (single)
    stroke(
      () => {
        ctx.moveTo(x - 30, top);
        ctx.lineTo(x - 30, bottom);
        ctx.moveTo(x + 30, top);
        ctx.lineTo(x + 30, bottom);
      },
      { color, alpha, width: 3 }
    );
  else {
    line(x - 30, top, x - 30, bottom, { color, alpha, width: 3 });
    line(x + 30, top, x + 30, bottom, { color, alpha, width: 3 });
  }
  box(x - 30, bottom - 22 - lift, 60, 22, { fill: color, alpha, radius: 4 });
}

// picture/film/scenes/p03/kernel.js
var KERNEL = { IX: 560, KX: 860, PX: 1180, GX: 1380, SX: 1620 };
var centring = (x0, x1) => 960 - (x0 + x1) / 2;
function stageKernel(t, a, c) {
  if (a <= 0) return;
  const PY = 380, KY = 560, KR = 54, ys = [440, 560, 680], LOOP = 780, q = flowClock(t);
  const inputNames = L(
    ["已经采纳的意图", "刚观察到的事实", "留下的存证"],
    ["Intent", "Fresh facts", "Attestations"]
  ), intentQual = ["that has been accepted"], attQual = [L("谁出具、在哪儿成立", "who verified it, where it holds")], inputsWide = Math.max(
    ...inputNames.map((v) => measure(v)),
    en ? measure(intentQual.join(""), NOTE) : 0,
    measure(attQual.join(""), NOTE)
  );
  const parts2 = L(
    ["看到了什么", "判断了什么", "做了什么"],
    ["What it observed,", " what it decided", " and what it did"]
  ), recordWidth = Math.max(...parts2.map((v) => measure(v.trim()))) + 1, recordWide = Math.max(
    ...growTexts(parts2, recordWidth).map((r) => measure(r.map(([, v]) => v).join("")))
  );
  const gateName = L(["写入"], ["The moment", " it writes"]), newName = L("新的存证", "New attestations"), loopX = KERNEL.SX + Math.max(120, measure(newName) / 2 + 24), left = KERNEL.IX - 34 - NAME_GAP - inputsWide, right = Math.max(loopX + 1.25, KERNEL.SX + recordWide / 2), pathFrom = KERNEL.KX - 260, pathTo = KERNEL.GX + 90, whole = centring(left, right), dx = glideSteps(t, whole, [
    [c.in1, centring(left, pathTo + 7)],
    [c.recCut, whole]
  ]);
  const IX = KERNEL.IX + dx, KX = KERNEL.KX + dx, PX2 = KERNEL.PX + dx, GX2 = KERNEL.GX + dx, SX = KERNEL.SX + dx, RX = loopX + dx, NX = IX - 34 - NAME_GAP, namesTop = rowNameTop([KY + KR, KY + 45, KY + 50, KY + 34]);
  line(pathFrom + dx, PY, pathTo + dx, PY, { color: P.ink, alpha: a, width: 3 });
  dot(pathTo + dx, PY, 7, { color: P.ink, alpha: a });
  kernelIcon(KX, KY, KR, {
    alpha: a,
    color: P.ink,
    beat: Math.max(speaking(t, [c.takes], 0), speaking(t, [c.plan], 0)),
    turn: 0.1 * voiceTime(t)
  });
  link(KX, KY - KR, KX, PY + 3, { alpha: a, end: false });
  nameText(L("很小的信任内核", "A small trust kernel"), KX, namesTop, {
    valign: "top",
    alpha: a * named(t, L(c.kernel - 0.55, c.kCut))
  });
  const ats = [c.in1, c.in2, c.in3];
  ats.forEach((at, i) => {
    const on = a * ramp(t, at - 0.15, 0.4), y = ys[i];
    if (on < 0.01) return;
    if (i === 0) paper(IX - 32, y - 40, 64, 80, { alpha: on, rows: 3 });
    if (i === 1)
      fill(
        () => [
          [-16, -12],
          [14, -16],
          [-8, 12],
          [16, 12]
        ].forEach(([ox, oy]) => {
          ctx.moveTo(IX + ox + 7, y + oy);
          ctx.arc(IX + ox, y + oy, 7, 0, Math.PI * 2);
        }),
        { color: P.ink, alpha: on }
      );
    if (i === 2) seal(IX, y, 28, { color: P.ink, alpha: on });
    link(IX + 34, y, KX - KR * 0.87, KY + (i - 1) * 24, {
      route: "hvh",
      mid: KX - KR - 120,
      alpha: on,
      upto: soon(t, at + 0.05, 0.5),
      flow: q
    });
  });
  const qualified = (i, term, termAt, qual, qualAt) => termRow(t, [term], [termAt], qual, [qualAt], NX, ys[i] - labelSize(LABEL) / 2, {
    width: 360,
    inline: false,
    align: "right",
    alpha: a * listLevel(t, ats, i),
    set: "inputs"
  });
  if (en) qualified(0, inputNames[0], c.in1, intentQual, c.in1q);
  else
    nameText(inputNames[0], NX, ys[0], {
      align: "right",
      alpha: a * listIn(t, ats, 0),
      set: "inputs"
    });
  nameText(inputNames[1], NX, ys[1], {
    align: "right",
    alpha: a * listIn(t, ats, 1),
    set: "inputs"
  });
  qualified(2, inputNames[2], c.in3, attQual, c.in3);
  const rules = a * ramp(t, c.rules - 0.15, 0.4), plan2 = a * ramp(t, c.plan - 0.15, 0.4), gate = a * ramp(t, c.writeAt - 0.15, 0.4), rec = a * ramp(t, c.rec1 - 0.15, 0.4), stamped = a * ramp(t, c.newAtt - 0.15, 0.4);
  link(KX + KR * 0.87, KY, PX2, KY, { alpha: rules, upto: soon(t, c.rules + 0.05, 0.6), flow: q });
  nameText(L("按固定的规则", "By fixed rules"), (KX + KR * 0.87 + PX2) / 2, KY - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, c.rules)
  });
  paper(PX2, KY - 45, 70, 90, { alpha: plan2, rows: 4 });
  nameText(L("一份计划", "A plan"), PX2 + 35, namesTop, {
    valign: "top",
    alpha: a * named(t, c.plan)
  });
  link(PX2 + 70, KY, GX2 - 30, KY, { alpha: gate, upto: soon(t, c.writeAt + 0.05, 0.4) });
  writeGate(GX2, KY, 100, {
    alpha: gate,
    color: P.ink,
    single: true,
    open: glideShare(t, c.check + 0.3, 60, 0.6)
  });
  termRow(t, gateName, [c.gateName], [L("再核对一遍", "checks again")], [c.check], GX2, namesTop, {
    width: 200,
    alpha: a,
    align: "center"
  });
  link(GX2 + 30, KY, SX - 34, KY, { alpha: rec, upto: soon(t, c.rec1 + 0.05, 0.4) });
  const recordAts = [c.rec1, c.rec2, c.rec3];
  ring(SX, KY, 34, {
    color: P.ink,
    // The ring's ink rises as its first third draws on, so its first arc never stands at full ink at once.
    alpha: a * ramp(t, c.rec1 + 0.05, 0.3),
    width: 3,
    upto: saidShare(t, recordAts),
    start: Math.PI
  });
  ring(SX, KY, 34 * 0.74, { color: P.ink, alpha: stamped * 0.6, width: 1.5 });
  check(SX, KY + 34 * 0.05, 34 * 0.8, { color: P.ink, alpha: stamped });
  growName(t, parts2, recordAts, SX, KY - 34 - NAME_GAP, {
    width: recordWidth,
    valign: "bottom",
    align: "center",
    alpha: a,
    build: true
  });
  nameText(newName, SX, namesTop, {
    valign: "top",
    alpha: a * named(t, c.newAtt)
  });
  const back = soon(t, c.newAtt + 0.05, 0.25);
  link(SX + 34, KY, RX, LOOP, {
    route: "hv",
    alpha: a * ramp(t, c.newAtt + 0.05, 0.25),
    upto: back,
    end: false
  });
  link(RX, LOOP, IX, ys[2] + 28, {
    route: "hv",
    alpha: stamped,
    upto: soon(t, c.newAtt + 0.3, 0.3),
    flow: q
  });
}
var FACT_TICKS = 13;
var FACT_PACE = 3;
var FACT_CORE = 1.2;
var FACT_EDGE = 1;
function stageLifetimes(t, a, c) {
  if (a <= 0) return;
  const ys = [440, 590, 740], X02 = 290, X1 = 1630, M0 = 960, starts = [c.intent, c.facts, c.planRow];
  stroke(
    () => ys.forEach((y) => {
      ctx.moveTo(X02, y);
      ctx.lineTo(X1, y);
    }),
    { color: P.ink, alpha: a * 0.7, width: 2.5 }
  );
  const rows = [
    [[L("意图", "Intent")], [c.intent], [L("一份正式变更", "one official Change")], [c.change]],
    [
      [L("刚观察到的事实", "Fresh facts")],
      [c.facts],
      // A part that waits for the next one holds no trailing mark: the mark comes with the words after it.
      L(["每次都重新去看", "，从不存下来"], ["observed again every time", ", never stored"]),
      [c.again, c.never]
    ],
    [
      [L("计划", "A plan")],
      [c.planRow],
      L(["要么执行", "，要么作废"], ["carried out", " or discarded"]),
      [c.carried, c.discarded]
    ]
  ], termTops = rows.map(([term, , qual], i) => ys[i] - 14 - termRowLayout(term, qual, 640).height);
  nameText(
    L("寿命不一样", "Different lengths of time"),
    X02,
    termTops[0] - labelSize(LABEL) * LEADING,
    {
      align: "left",
      valign: "bottom",
      alpha: a * named(t, L(c.lifetimes - 0.25, c.lifetimes))
    }
  );
  ys.forEach(
    (y, i) => flowAlong(
      [
        [X02 + 20, y],
        [X1 - 20, y]
      ],
      flowClock(t, i * 0.33),
      6,
      { single: true, color: P.ink, alpha: a }
    )
  );
  const kept = a * ramp(t, c.change - 0.15, 0.4);
  folderIcon(M0 - 4, ys[0] - 44, 56, 44, { alpha: a * ramp(t, c.intent - 0.15, 0.4) });
  line(M0 + 52, ys[0], X1, ys[0], { color: P.ink, alpha: kept, width: 6 });
  papers(
    [1160, 1380, 1580].map((x) => [x - 12, ys[0] + 6, 24, 30, 2]),
    a * ramp(t, c.afresh - 0.15, 0.4)
  );
  const facts = a * ramp(t, c.facts - 0.15, 0.4);
  if (facts > 0.01) {
    const reach = FACT_CORE + FACT_EDGE, middle = -reach + FACT_PACE * voiceTime(t) % (FACT_TICKS - 1 + 2 * reach);
    stroke(
      () => {
        for (let k = 0; k < FACT_TICKS; k++) {
          const h = 18 * ease((reach - Math.abs(k - middle)) / FACT_EDGE);
          if (h < 0.5) continue;
          ctx.moveTo(M0 + 20 + k * 52, ys[1] - h);
          ctx.lineTo(M0 + 20 + k * 52, ys[1]);
        }
      },
      { color: P.ink, alpha: facts, width: 3 }
    );
  }
  const p1 = a * ramp(t, c.carried - 0.15, 0.4), p2 = a * ramp(t, c.discarded - 0.15, 0.4), gone = 1 - 0.6 * ramp(t, c.notKept - 0.15, 0.4), p3 = a * ramp(t, c.again2 - 0.15, 0.4);
  stroke(
    () => {
      if (p1 > 0.01) {
        ctx.moveTo(M0 + 40, ys[2]);
        ctx.lineTo(M0 + 40 + 180 * soon(t, c.carried, 0.5), ys[2]);
      }
      if (p2 > 0.01) {
        ctx.moveTo(M0 + 300, ys[2]);
        ctx.lineTo(M0 + 300 + 180 * soon(t, c.discarded, 0.5), ys[2]);
      }
    },
    { color: P.ink, alpha: Math.max(p1, p2) * gone, width: 6 }
  );
  check(M0 + 240, ys[2] - 4, 26, {
    color: P.ink,
    alpha: p1 * gone * ramp(t, c.carried + 0.35, 0.4),
    width: 3.5
  });
  cross(M0 + 500, ys[2], 22, {
    color: P.ink,
    alpha: p2 * gone * ramp(t, c.discarded + 0.35, 0.4),
    width: 3.5
  });
  line(M0 + 560, ys[2], M0 + 560 + 100 * soon(t, c.again2, 0.6), ys[2], {
    color: P.ink,
    alpha: p3,
    width: 6
  });
  const qualLeft = X02 + Math.max(...rows.map(([term]) => measure(term.join("")))) + labelSize(LABEL);
  rows.forEach(([term, termAts, qual, qualAts], i) => {
    termRow(t, term, termAts, qual, qualAts, X02, termTops[i], {
      width: 640,
      alpha: a * listLevel(t, starts, i),
      set: "lifetimes",
      build: true,
      qualLeft
    });
  });
}
function stageScope(t, a, c) {
  if (a <= 0) return;
  const K0 = 480, kernelName = L("内核", "The kernel"), outsideName = L("范围之外", "Outside that scope"), voidName = L("就不算数", "does not count"), fieldNames2 = L(["谁出具的", "范围"], ["Who verified it", "Where it holds"]), head = L(["长期留下的", "存证"], ["For the long term", "The attestation"]), W = 24 + 72 + 24 + Math.max(...fieldNames2.map((v) => measure(v))) + 24, scopeEnd = 1e3 + W / 2 + 40, copyAt = scopeEnd + 100, left = Math.min(K0 - 44, K0 - measure(kernelName) / 2), right = Math.max(
    copyAt + 180,
    copyAt + 90 + Math.max(measure(outsideName), measure(voidName, NOTE)) / 2
  ), cardAt = c.att - L(0.15, 0.45), headRight = 1e3 + L(measure(head.join("")) / 2 - measure(head[1]), measure(head[0]) / 2), dx = glideSteps(t, centring(left, headRight), [
    [cardAt + 0.4, centring(left, scopeEnd)],
    [c.outside, centring(left, right)]
  ]);
  const CX = 1e3 + dx, CY = 520, H = 150, KX = K0 + dx, namesTop = rowNameTop([CY + 44, CY + 50]), headBottom = CY - H / 2 - NAME_GAP - 40 * soon(t, c.scope - 0.5, 0.5), joins = c.att - c.longTerm >= 1.5 ? soon(t, c.att - 0.5, 0.5) : 1, card2 = a * ramp(t, cardAt, 0.4), q = flowClock(t);
  kernelIcon(KX, CY, 44, { alpha: a, color: P.ink, turn: 0.1 * voiceTime(t) });
  nameText(kernelName, KX, namesTop, {
    valign: "top",
    alpha: a * named(t, c.aCut + 0.1)
  });
  link(KX + 44 * 0.87, CY, CX - W / 2, CY, {
    alpha: card2,
    upto: soon(t, cardAt + 0.05, 0.4),
    flow: q
  });
  box(CX - W / 2, CY - H / 2, W, H, { stroke: P.ink, alpha: card2, radius: 14, width: 2.5 });
  seal(CX - W / 2 + 60, CY, 36, { color: P.ink, alpha: card2, stamp: card2 });
  if (en) {
    nameText(head[0], CX, headBottom - labelSize(LABEL) * LEADING * joins, {
      valign: "bottom",
      alpha: a * named(t, c.longTerm)
    });
    nameText(head[1], CX, headBottom, { valign: "bottom", alpha: a * named(t, c.att) });
  } else
    growName(t, head, [c.longTerm, c.att], CX, headBottom, {
      valign: "bottom",
      align: "center",
      alpha: a,
      build: true
    });
  const fields = [c.who, c.scopeName];
  fieldNames2.forEach(
    (v, i) => nameText(v, CX - W / 2 + 120, CY - 28 + 56 * i, {
      align: "left",
      alpha: a * listIn(t, fields, i),
      set: "fields"
    })
  );
  const scope = a * ramp(t, c.scope - 0.15, 0.4), bottom = CY + H / 2 + 40;
  box(CX - W / 2 - 40, CY - H / 2 - 40, W + 80, H + 80, {
    stroke: P.line,
    alpha: scope,
    radius: 26,
    width: 2
  });
  const later = a * ramp(t, c.reader - 0.15, 0.4), RY = CY + 260, RX = CX + 30 + NAME_GAP;
  person(CX, RY, { size: 1, alpha: later });
  link(CX, RY - 34, CX, bottom + 2, {
    alpha: later,
    upto: soon(t, c.reader + 0.05, 0.5),
    flow: q,
    end: false
  });
  nameText(L("后来的人", "Someone"), RX, RY - 6, {
    align: "left",
    alpha: a * named(t, c.reader)
  });
  nameText(L("回头去查", "Check it later"), RX, (RY - 34 + bottom) / 2, {
    align: "left",
    alpha: a * named(t, c.later)
  });
  const copy = a * ramp(t, c.outside - 0.15, 0.4), void_ = ramp(t, c.notCount - 0.15, 0.4);
  box(copyAt + dx, CY - 50, 180, 100, {
    stroke: P.ink,
    alpha: copy * mix(1, 0.6, void_),
    radius: 12,
    width: 2.5
  });
  seal(copyAt + 40 + dx, CY, 18, { color: P.ink, alpha: copy * mix(1, 0.6, void_) });
  cross(copyAt + 130 + dx, CY, 26, { color: P.ink, alpha: copy * void_, width: 3.5 });
  termRow(t, [outsideName], [c.outside], [voidName], [c.notCount], copyAt + 90 + dx, namesTop, {
    width: 400,
    alpha: a,
    align: "center"
  });
}

// picture/film/scenes/p02/beyond.js
function stageClaims(t, a, c) {
  if (a <= 0) return;
  const X02 = 760, EW = 130, CW = 500, H = 30, ys = [430, 570, 710].map((y) => y + building(t, [c.eCut, c.merge, c.deploy], 105)), evidence = [c.local, c.merge, c.deploy], claims = [c.everything, c.release, c.benefit2], own = ramp(t, c.ownPart - 0.15, 0.4);
  const evidenceNames = L(
    ["本地跑通", "代码合进去", "部署成功"],
    ["A run", "A merge", "A deployment"]
  ), evidenceQuals = L([[], [], []], [["passed on one machine"], [], []]), claimNames = L(
    ["全部通过", "发布", "实际效益"],
    ["Everything passes", "A release", "Actual benefit"]
  ), claimAts = [c.everything, L(c.releaseName, c.release), c.benefit2], em = labelSize(LABEL);
  ys.forEach((y, i) => {
    const on = a * ramp(t, (i ? evidence[i] : c.eCut) - 0.15, 0.4), grow = soon(t, claims[i] - 0.1, 0.6), w = mix(EW, CW, grow);
    if (on < 0.01) return;
    box(X02, y - H / 2, EW, H, { fill: P.ink, alpha: on, radius: 6 });
    box(X02, y - H / 2, w, H, {
      stroke: P.ink,
      alpha: on * (1 - own * grow),
      radius: 8,
      width: 2.5
    });
    box(X02, y - H / 2, w, H, {
      stroke: P.ink,
      alpha: on * own * grow * 0.85,
      radius: 8,
      width: 2.5,
      dash: [8, 8]
    });
    const flash = clamp((t - c.ownPart - 0.05 - 0.3 * i) / 0.5);
    if (flash > 0 && flash < 1)
      box(X02 - 7, y - H / 2 - 7, EW + 14, H + 14, {
        stroke: P.ink,
        alpha: on * Math.sin(Math.PI * flash) * 0.6,
        radius: 10,
        width: 3
      });
    const said = [c.eCut, ...evidence.slice(1)];
    termRow(
      t,
      [evidenceNames[i]],
      [said[i]],
      evidenceQuals[i],
      [c.local],
      X02 - NAME_GAP,
      y - em / 2,
      {
        align: "right",
        alpha: a * listLevel(t, said, i),
        set: "evidence"
      }
    );
    nameText(claimNames[i], X02 + CW + NAME_GAP, y, {
      align: "left",
      alpha: a * listIn(t, claimAts, i),
      set: "claims"
    });
  });
  nameText(L("它自己那一段", "Its own part"), X02 + CW / 2, ys[2] + H / 2 + 40, {
    valign: "top",
    alpha: a * named(t, c.ownName)
  });
}
function stageTests(t, a, c) {
  if (a <= 0) return;
  illustrative(a);
  const S = 46, cols = 8, rows = 4, writtenName = L("已经写好的那些测试", "The tests someone wrote"), enoughName = L("这些测试够不够", "Whether those tests are enough"), reachLeft = cols * S / 2 + NAME_GAP + measure(writtenName), reachRight = Math.max(cols * S / 2, claimWidth() / 2 + CLAIM_DATUM, measure(enoughName) / 2), dx = glideSteps(t, 0, [[c.written, centring(960 - reachLeft, 960 + reachRight)]]), PY = 380, GX2 = 960 + dx, GY = 650, left = GX2 - cols * S / 2, top = GY - rows * S / 2;
  claimPanel(t, GX2, PY, { alpha: a });
  const tests = a * ramp(t, c.written - 0.15, 0.4), q = flowClock(t);
  const cells = (pick) => () => {
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++)
        if (pick(i, j)) ctx.roundRect(left + i * S + 4, top + j * S + 4, S - 8, S - 8, 6);
  };
  const written = (i, j) => i < 3 && j < 2;
  stroke(cells(written), { color: P.ink, alpha: tests, width: 2.5 });
  stroke(
    () => {
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 2; j++) {
          const x = left + i * S + S / 2, y = top + j * S + S / 2;
          ctx.moveTo(x - 9, y);
          ctx.lineTo(x - 3, y + 7);
          ctx.lineTo(x + 10, y - 8);
        }
    },
    { color: P.ink, alpha: tests, width: 3 }
  );
  stroke(
    cells((i, j) => !written(i, j)),
    { color: P.line, alpha: a, width: 2 }
  );
  stroke(cells(written), { color: P.line, alpha: a * (1 - tests), width: 2 });
  link(GX2, PY + 42, left + 1.5 * S, top + 4, {
    route: "vhv",
    mid: (PY + 42 + top) / 2,
    alpha: a,
    flow: q
  });
  nameText(writtenName, left - NAME_GAP, top + S, {
    align: "right",
    alpha: a * named(t, c.written)
  });
  nameText(enoughName, GX2, top + rows * S + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.enough)
  });
}

// picture/film/drawing/history.js
function commitRow(x0, step, y, n, { alpha = 1, color = P.ink, single = false } = {}) {
  if (alpha < 0.01) return;
  line(x0, y, x0 + step * (n - 1), y, { color, alpha, width: 2.5 });
  if (!single) {
    for (let i = 0; i < n; i++) commitDot(x0 + step * i, y, { alpha, color });
    return;
  }
  const discs = () => {
    for (let i = 0; i < n; i++) {
      ctx.moveTo(x0 + step * i + 9, y);
      ctx.arc(x0 + step * i, y, 9, 0, Math.PI * 2);
    }
  };
  fill(discs, { color: P.ground, alpha });
  stroke(discs, { color, alpha, width: 3 });
}

// picture/film/scenes/p02/facts.js
function agentPair(xs, y, { alpha = 1, size = 1 } = {}) {
  const r = 22 * size, c = 4.5 * size;
  stroke(
    () => xs.forEach((x) => {
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r, y);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r, y);
      ctx.closePath();
    }),
    { color: P.ink, alpha, width: 2.5 }
  );
  fill(
    () => xs.forEach((x) => {
      ctx.moveTo(x + c, y);
      ctx.arc(x, y, c, 0, Math.PI * 2);
    }),
    { color: P.ink, alpha }
  );
}
var UNKNOWN_R = 20;
function unknownMark(x, y, alpha) {
  if (alpha < 0.01) return;
  ring(x, y, UNKNOWN_R, { color: P.ink, alpha, width: 3 });
  text("?", x, y + 1, UNKNOWN_R * 1.25, { role: "mark", align: "center", alpha });
}
function standing(t, parts2) {
  const [[, x0, x1], ...rest] = parts2;
  let left = x0, right = x1;
  const states = [];
  for (const [at, l, r] of rest.sort((p, q) => p[0] - q[0])) {
    if (l >= left && r <= right) continue;
    left = Math.min(left, l);
    right = Math.max(right, r);
    states.push([at, centring(left, right)]);
  }
  const first = centring(x0, x1), last = states.at(-1)?.[1] ?? first, way = Math.sign(last - first), steps = [];
  let shift = first;
  for (const [at, v] of states) {
    const next = way < 0 ? Math.max(last, Math.min(shift, v)) : Math.min(last, Math.max(shift, v));
    if (next !== shift) steps.push([at, next]);
    shift = next;
  }
  return glideSteps(t, first, steps);
}
function stageBranch(t, a, c) {
  if (a <= 0) return;
  const xs = [760, 920, 1080, 1240], Y3 = 640, AX2 = 920, BX2 = 1240, AY = 460, R = 31;
  agentPair([AX2, BX2], AY, { alpha: a, size: 1.4 });
  nameText(L("两个 Agent", "Two Agents"), (AX2 + BX2) / 2, AY + R + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.bCut)
  });
  const over = glideShare(t, c.overwritten + 0.05, 96, 0.6), branch2 = a * ramp(t, c.branch - 0.15, 0.4);
  line(xs[2], Y3, xs[3], Y3, { color: P.ink, alpha: branch2, width: 2.5 });
  commitRow(xs[0], xs[1] - xs[0], Y3, 3, { alpha: branch2, single: true });
  nameText(L("一条分支", "The same branch"), xs[0] - 9 - NAME_GAP, Y3, {
    align: "right",
    alpha: a * named(t, c.branch)
  });
  const dropY = mix(Y3, Y3 + 96, over);
  commitDot(BX2, dropY, { alpha: branch2 * mix(1, 0.75, over) });
  cross(BX2, dropY, 30, { color: P.ink, alpha: branch2 * over, width: 3.5 });
  termRow(
    t,
    [L("另一个的工作", "The other one's work")],
    [c.otherWork],
    [L("被覆盖了", "overwritten")],
    [c.overwritten],
    BX2,
    dropY + 15 + NAME_GAP,
    { alpha: a, align: "center" }
  );
  const mem = a * ramp(t, c.memory - 0.15, 0.4), MY = 330;
  box(AX2 - 80, MY - 30, 160, 60, { stroke: P.ink, alpha: mem, radius: 14, width: 2.5 });
  line(AX2 - 50, MY, AX2 + 50, MY, { color: P.muted, alpha: mem, width: 2 });
  fill(
    () => [-50, 0, 50].forEach((dx) => {
      ctx.moveTo(AX2 + dx + 6, MY);
      ctx.arc(AX2 + dx, MY, 6, 0, Math.PI * 2);
    }),
    { color: P.ink, alpha: mem }
  );
  line(AX2, MY + 30, AX2, AY - R, { color: P.ink, alpha: mem, width: 2.5 });
  nameText(L("过时的记忆", "An outdated memory"), AX2 - 80 - NAME_GAP, MY, {
    align: "right",
    alpha: a * named(t, c.memory)
  });
  const write = a * ramp(t, c.writes - 0.15, 0.4);
  link(AX2, AY + R, BX2, Y3 - 9, {
    route: "vhv",
    mid: 560,
    alpha: write,
    upto: soon(t, c.writes + 0.05, 0.8),
    flow: flowClock(t)
  });
  dot(BX2, Y3, 9 * soon(t, c.writes + 0.75, 0.3), { color: P.ink, alpha: a });
}
function stagePlatforms(t, a, c) {
  if (a <= 0) return;
  const VX = 470, VY = 600 + 40 * (1 - glideShare(t, c.github + 0.05, 40, 0.7)), PX2 = 1100, ys = [VY - 140, VY + 140], RY = VY + 240, W = 220, H = 84, q = flowClock(t);
  const versionName = L("同一个版本", "The same version"), resultNames = L(["一边成功", "一边失败"], ["Succeeds on one", "Fails on the other"]), unclearName = L("谁也说不清", "Nobody can say"), retryName = L("再试一遍", "Trying again");
  const come = [c.gitlab, c.github], results = [c.ok, c.fail];
  const from = Math.min(VX, VX + 70 - measure(versionName) / 2), after = PX2 + W / 2 + 76;
  ctx.save();
  ctx.translate(
    standing(t, [
      [-Infinity, from, Math.max(VX + 140, VX + 70 + measure(versionName) / 2)],
      [come[0], from, PX2 + W / 2],
      ...results.map((at, i) => [at, from, after + measure(resultNames[i])]),
      [c.unclear, from, after + measure(unclearName)],
      [c.retry, from, VX + 70 + 330 + UNKNOWN_R + 16 + measure(retryName)]
    ]),
    0
  );
  tagIcon(VX, VY, 140, 56, { alpha: a, color: P.ink });
  nameText(versionName, VX + 70, VY - 28 - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, c.vCut)
  });
  ys.forEach((y, i) => {
    const on = a * ramp(t, come[i] - 0.15, 0.4);
    link(VX + 140, VY, PX2 - W / 2, y, {
      route: "hvh",
      mid: 840,
      alpha: on,
      upto: soon(t, come[i] + 0.05, 0.5),
      flow: q
    });
    box(PX2 - W / 2, y - H / 2, W, H, { stroke: P.ink, alpha: on, radius: 14, width: 2.5 });
    nameText(["GitLab", "GitHub"][i], PX2, y, { alpha: a * named(t, come[i]), set: "hosts" });
    const done = a * ramp(t, results[i] - 0.15, 0.4);
    if (i === 0) check(PX2 + W / 2 + 40, y, 30, { color: P.ink, alpha: done, width: 4 });
    else stopSign(PX2 + W / 2 + 40, y, 20, { color: P.ink, alpha: done });
    nameText(resultNames[i], after, y, {
      align: "left",
      alpha: a * listIn(t, results, i),
      set: "results"
    });
  });
  const unknown = a * ramp(t, c.unclear - 0.15, 0.4), UY = (ys[0] + ys[1]) / 2;
  unknownMark(PX2 + W / 2 + 40, UY, unknown);
  nameText(unclearName, after, UY, {
    align: "left",
    alpha: a * named(t, c.unclear)
  });
  const again = a * ramp(t, c.retry - 0.15, 0.4);
  link(VX + 70, VY + 28, VX + 70 + 300, RY, {
    route: "vh",
    alpha: again,
    upto: soon(t, c.retry + 0.05, 0.6),
    dash: [8, 8]
  });
  unknownMark(VX + 70 + 330, RY, again * ramp(t, c.retry + 0.5, 0.4));
  nameText(retryName, VX + 70 + 330 + UNKNOWN_R + 16, RY, {
    align: "left",
    alpha: a * named(t, c.retry)
  });
  ctx.restore();
}
function stageSent(t, a, c) {
  if (a <= 0) return;
  const X02 = 760, X1 = 1160, ys = [560, 760].map((y) => y + building(t, [c.s2Cut, c.error], 100)), near = [c.sent, c.error], far = [c.received, c.nothing], q = flowClock(t);
  const nearNames = L(["请求", "报错"], ["A request", "An error message"]), nearQuals = L([["发出去了"], []], [["that was sent"], []]), nearAts = [L(c.sent, c.s2Cut), L(c.errorName, c.error)], farNames = L(["对方收下了", "什么都没发生"], ["Received", "Nothing happened"]), nearLeft = (i) => X02 - 10 - NAME_GAP - Math.max(measure(nearNames[i]), measure(nearQuals[i].join(""), NOTE)), farRight = (i) => X1 + 14 + NAME_GAP + measure(farNames[i]);
  ctx.save();
  ctx.translate(
    standing(t, [
      [-Infinity, nearLeft(0), 930],
      [far[0], nearLeft(0), farRight(0)],
      [near[1], nearLeft(1), 930],
      [far[1], nearLeft(1), farRight(1)]
    ]),
    0
  );
  ys.forEach((y, i) => {
    const on = a * ramp(t, (i ? near[i] : c.s2Cut) - 0.15, 0.4), off = a * ramp(t, far[i] - 0.15, 0.4);
    dot(X02, y, 10, { color: P.ink, alpha: on });
    link(X02 + 10, y, 930, y, {
      alpha: on,
      upto: soon(t, near[i] + 0.05, 0.4),
      end: false,
      flow: q
    });
    unknownMark(960, y, off);
    dashed(990, y, X1 - 14, y, { color: P.line, alpha: off, width: 2.5 });
    ring(X1, y, 14, { color: P.ink, alpha: off, width: 2.5 });
    termRow(
      t,
      [nearNames[i]],
      [nearAts[i]],
      nearQuals[i],
      [c.sentName],
      X02 - 10 - NAME_GAP,
      y - labelSize(LABEL) / 2,
      { align: "right", alpha: a * listLevel(t, nearAts, i), set: "near" }
    );
    nameText(farNames[i], X1 + 14 + NAME_GAP, y, {
      align: "left",
      alpha: a * listIn(t, far, i),
      set: "far"
    });
  });
  ctx.restore();
}

// picture/film/scenes/p02/process.js
function record(x, y, w, h, { alpha = 1, stale = 0 } = {}) {
  if (alpha < 0.01) return;
  documentIcon(x - w / 2, y - h / 2, w, h, { alpha: alpha * (1 - stale), rows: 0 });
  box(x - w / 2, y - h / 2, w, h, {
    stroke: P.ink,
    alpha: alpha * stale * 0.7,
    radius: 4,
    width: 2,
    dash: [7, 7]
  });
  stroke(
    () => [-2, -1, 1, 2].forEach((k) => {
      ctx.moveTo(x - w * 0.32, y + k * h * 0.16);
      ctx.lineTo(x + w * (k % 2 ? 0.16 : 0.3), y + k * h * 0.16);
    }),
    { color: P.muted, alpha: alpha * mix(0.8, 0.5, stale), width: 2 }
  );
  line(x - w * 0.32, y, x + w * 0.32, y, {
    color: P.ink,
    alpha: alpha * mix(1, 0.6, stale),
    width: 3
  });
}
function stageLedgers(t, a, c) {
  if (a <= 0) return;
  const xs = [720, 960, 1200], W = 136, H = 166, ats = [c.register, c.ledger, c.copyRule], stale = ramp(t, c.stale - 0.15, 0.4), fight = ramp(t, c.fight - 0.15, 0.4), sink = 28 * glideShare(t, c.burden + 0.05, 28, 0.6), SY = 700 + sink;
  line(xs[0] - W / 2 - 40, SY, xs[2] + W / 2 + 40, SY, { color: P.ink, alpha: a, width: 3 });
  nameText(L("加流程", "More process"), 960, SY + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.process)
  });
  xs.forEach((x, i) => {
    const on = a * ramp(t, ats[i] - 0.15, 0.4), kept = clamp((t - c.keepUp - 0.05 - 0.3 * i) / 0.5), lit = kept > 0 && kept < 1 ? Math.sin(Math.PI * kept) : 0;
    record(x, SY - 4 - H / 2, W, H, { alpha: on, stale });
    if (lit > 0)
      box(x - W / 2 - 8, SY - 12 - H, W + 16, H + 16, {
        stroke: P.ink,
        alpha: on * lit * 0.6,
        radius: 8,
        width: 3
      });
  });
  railNames(
    L(["登记表", "台账", "重复的规定"], ["Register", "Ledger", ["Copy of the same rule"]]),
    xs,
    SY - 4 - H,
    { side: -1, gap: NAME_GAP, alpha: (i) => a * listIn(t, ats, i), set: "process" }
  );
  [0, 1].forEach(
    (i) => cross((xs[i] + xs[i + 1]) / 2, SY - 4 - H / 2, 26, {
      color: P.ink,
      alpha: a * fight,
      width: 3.5
    })
  );
  nameText(L("新的负担", "A burden of their own"), 960, 806, {
    valign: "top",
    alpha: a * named(t, c.burden)
  });
}

// picture/film/scenes/p02/hard.js
var INDEX_XS = [420, 960, 1500];
var CENTRE_POINT = 12;
var CENTRE_R = 54;
var DOCK_Y = 166;
var DOCK_GAP = 12;
var DOCK_POINT = 6;
var DOCK_R = 16;
var WRAP = 460;
var halfName = (v) => Math.max(...wrapName(v, WRAP).map((line2) => measure(line2))) / 2;
function dockReach(heading, names2, shown) {
  const past = [0, 2].map((i) => mix(DOCK_POINT, Math.max(DOCK_R, halfName(names2[i])), shown[i]));
  return [Math.max(past[0], measure(heading, NOTE) / 2), past[1]];
}
var centreReach = (names2, shown) => [0, 2].map((i) => mix(CENTRE_POINT, Math.max(CENTRE_R, halfName(names2[i])), shown[i]));
function hardIndex(t, k, { heading, headAt, names: names2, ats, levels, kicker }) {
  const Y3 = mix(540, DOCK_Y, k), R = mix(CENTRE_R, DOCK_R, k), pointR = mix(CENTRE_POINT, DOCK_POINT, k), gap = mix(NAME_GAP, DOCK_GAP, k), shown = ats.map((at) => ramp(t, at - 0.15, 0.4)), reach = shown.map((v) => Math.max(pointR * (1 - v), R * v));
  const [before, after] = dockReach(heading, names2, shown), [from, to] = centreReach(
    names2,
    ats.map(
      (at, i) => glideShare(t, at + 0.05, (Math.max(CENTRE_R, halfName(names2[i])) - CENTRE_POINT) / 2, 0.7)
    )
  ), xs = INDEX_XS.map((x) => x + mix((from - to) / 2, (before - after) / 2, k));
  stroke(
    () => [0, 1].forEach((i) => {
      ctx.moveTo(xs[i] + reach[i], Y3);
      ctx.lineTo(xs[i + 1] - reach[i + 1], Y3);
    }),
    { color: P.line, width: 2.5 }
  );
  fill(
    () => xs.forEach((x, i) => {
      const r = pointR * (1 - ease(shown[i] / 0.45));
      if (r < 0.3) return;
      ctx.moveTo(x + r, Y3);
      ctx.arc(x, Y3, r, 0, Math.PI * 2);
    }),
    { color: P.ink }
  );
  xs.forEach((x, i) => {
    if (shown[i] <= 0) return;
    ring(x, Y3, R * shown[i], { color: P.ink, alpha: shown[i], width: mix(2.5, 3.5, levels[i]) });
    text(String(i + 1), x, Y3 + 1, mix(30, 18, k), {
      role: "mark",
      align: "center",
      // The number joins by its short fade from just after the station's point has shrunk away (0.03 s after its
      // words), so it never stands over the point and never takes firm ink at once.
      alpha: ramp(t, ats[i] + 0.04, 0.4) * mix(0.58, 1, levels[i])
    });
  });
  railNames(names2, xs, Y3 + R, {
    gap,
    wrap: WRAP,
    alpha: (i) => named(t, ats[i]) * mix(0.58, 1, levels[i]),
    set: "hard"
  });
  nameText(heading, xs[1], Y3 - 98, {
    valign: "bottom",
    alpha: named(t, headAt) * clamp(1.5 - 2 * k)
  });
  nameText(heading, xs[0], Y3 - R - gap, {
    valign: "bottom",
    size: NOTE,
    color: P.muted,
    alpha: named(t, headAt) * kicker
  });
}
scenes["02"] = function(s, t) {
  const c = {};
  const take = (pairs) => cues(s, Object.values(pairs)).forEach((v, i) => c[Object.keys(pairs)[i]] = v);
  take({
    head: ["难处", "three parts"],
    first: ["第一个", "The first"],
    n1: ["原意会走样", "meaning drifts"],
    pCut: ["一件事", "one person"],
    work: ["一件事", "a piece of work"],
    person: ["一个人", "one person"],
    span: ["从头做到尾", "start to finish"],
    story: ["来龙去脉", "the whole story"],
    rCut: ["一项需求", "a request"],
    delivery: ["落地", "delivery"],
    st1: ["理解", "interpretation"],
    st2: ["转述", "retelling"],
    st3: ["交接", "handoffs"],
    people: ["好几个人", "several people"],
    agents: ["好几个 Agent", "several Agents"],
    sCut: ["每转一手", "At every handoff"],
    orig: ["原话", "the words before it"],
    summary: ["一份总结顶替一次", "a summary takes the place"],
    unwritten: ["没写下来的约束", "never written down"],
    anyConstraint: ["没写下来的约束", "any constraint"],
    gone: ["跟着没了", "ends with it"],
    mustNot: ["不能做什么", "what must not be done"],
    benefit: ["本来要带来的效益", "the benefit"],
    gCut: ["需求哪怕", "A specification"],
    wellFormed: ["格式齐全", "complete and well formed"],
    goal: ["目标", "the wrong goal"],
    wrong: ["从一开始就定错了", "aimed at the wrong goal"],
    second: ["第二个", "The second"],
    n2: ["结论超出了证据", "claims go beyond their evidence"],
    eCut: ["本地跑通了", "A run that passed"],
    local: ["本地跑通了", "passed on one machine"],
    everything: ["全部通过", "everything passes"],
    merge: ["代码合进去了", "A merge"],
    release: ["已经发布", "a release"],
    releaseName: ["发布", "a release"],
    deploy: ["部署成功了", "a deployment"],
    benefit2: ["实际效益", "actual benefit"],
    ownPart: ["只证明了它自己那一段", "proves only its own part"],
    ownName: ["它自己那一段", "its own part"],
    tCut: ["就连", "Even"],
    allPass: ["测试全过", "all tests pass"],
    written: ["已经写好的那些测试", "the tests someone wrote"],
    enough: ["这些测试够不够", "whether those tests are enough"],
    third: ["第三个", "The third"],
    // The third difficulty is told from its clause, 是事实 / changes; its name, which keeps its subject, 事实, stands on
    // its own words.
    n3: ["是事实", "changes are made"],
    n3name: ["事实还没看清", "changes are made"],
    bCut: ["两个 Agent", "Two Agents"],
    branch: ["一条分支", "the same branch"],
    memory: ["过时的记忆", "an outdated memory"],
    writes: ["写下去", "writes"],
    otherWork: ["另一个的工作", "the other one's work"],
    overwritten: ["被覆盖了", "overwritten"],
    vCut: ["同一个版本", "The same version"],
    gitlab: ["GitLab", "GitLab"],
    github: ["GitHub", "GitHub"],
    ok: ["一边成功", "succeeds on one"],
    fail: ["一边失败", "fails on the other"],
    unclear: ["谁也说不清", "nobody can say"],
    retry: ["再试一遍", "trying again"],
    s2Cut: ["因为请求", "A request that was sent"],
    sent: ["请求发出去了", "was sent"],
    sentName: ["发出去了", "that was sent"],
    received: ["对方收下了", "received"],
    error: ["看到报错", "an error message"],
    errorName: ["报错", "an error message"],
    nothing: ["什么都没发生", "nothing happened"],
    lCut: ["常见的办法", "The usual answer"],
    process: ["加流程", "more process"],
    register: ["登记表", "register"],
    ledger: ["台账", "ledger"],
    copyRule: ["重复的规定", "copy of the same rule"],
    keepUp: ["有人维护", "someone to maintain it"],
    stale: ["过期", "go stale"],
    fight: ["互相打架", "contradict each other"],
    burden: ["新的负担", "a burden of their own"]
  });
  const riseFor = (at) => {
    let start = s.words[0].start;
    for (const w of s.words) {
      if (w.start > at - 0.7) break;
      start = w.start;
    }
    return Math.max(start + 0.05, at - 0.95);
  };
  const [upP, upE, upB] = [c.pCut, c.eCut, c.bCut].map(riseFor);
  const move = (at) => glideShare(t, at, 540 - DOCK_Y);
  const k = move(upP) - move(c.second + 0.2) + move(upE) - move(c.third + 0.2) + move(upB);
  const docked = (up, down = Infinity) => ramp(t, up + 0.75, 0.45) * (1 - ramp(t, down - 0.05, 0.25));
  const kicker = docked(upP, c.second + 0.2) + docked(upE, c.third + 0.2) + docked(upB);
  const told = [
    [c.n1, c.n2 - 0.15],
    [c.n2 - 0.15, c.n3 - 0.1],
    [c.n3 - 0.1, c.lCut]
  ];
  const levels = told.map(
    ([from, to]) => ramp(t, from - 0.15, 0.4) * (1 - ramp(t, to - 0.15, 0.4))
  );
  hardIndex(t, clamp(k), {
    heading: L("难处", "Three parts"),
    headAt: c.head,
    names: L(
      ["原意会走样", "结论超出了证据", "事实还没看清，就先动了手"],
      ["Meaning drifts", "Claims go beyond their evidence", "Acting before the facts"]
    ),
    ats: [c.n1, c.n2 - 0.15, c.n3name - 0.1],
    levels,
    kicker
  });
  const stage = (from, to) => stageIn(t, c[from]) * (to ? stageOut(t, c[to]) : 1);
  stagePerson(t, stage("pCut", "rCut"), c);
  stageRail(t, stage("rCut", "sCut"), c);
  stageSummaries(t, stage("sCut", "gCut"), c);
  stageWrongGoal(t, stage("gCut", "second"), c);
  stageClaims(t, stage("eCut", "tCut"), c);
  stageTests(t, stage("tCut", "third"), c);
  stageBranch(t, stage("bCut", "vCut"), c);
  stagePlatforms(t, stage("vCut", "s2Cut"), c);
  stageSent(t, stage("s2Cut", "process"), c);
  stageLedgers(t, stage("process", null), c);
};

// picture/film/scenes/p03/path.js
function pathLine(x0, x1, y, gaps, { alpha = 1, split = Infinity } = {}) {
  const ends = [x0, ...gaps.flatMap((x) => [x - 28, x + 28]), x1], pieces = [];
  for (let k = 0; k < ends.length; k += 2) pieces.push([ends[k], ends[k + 1]]);
  stroke(
    () => pieces.forEach(([a, b]) => {
      if (Math.min(b, split) <= a) return;
      ctx.moveTo(a, y);
      ctx.lineTo(Math.min(b, split), y);
    }),
    { color: P.ink, alpha, width: 3 }
  );
  if (split < x1)
    stroke(
      () => pieces.forEach(([a, b]) => {
        if (b <= Math.max(a, split)) return;
        ctx.moveTo(Math.max(a, split), y);
        ctx.lineTo(b, y);
      }),
      { color: P.ink, alpha: alpha * 0.85, width: 3, dash: [9, 9] }
    );
}
var STATION_NAMES = () => L(["一个问题", "代码仓库", "用起来怎么样"], ["A problem", "A repository", "In use"]);
var NAME_PATH_Y = () => 600;
function station(x, y, i, alpha) {
  if (alpha < 0.01) return;
  dot(x, y, 28, { color: P.ground, alpha });
  ring(x, y, 28, { color: P.ink, alpha, width: 2.5 });
  if (i === 0) text("?", x, y + 1, 30, { role: "mark", align: "center", alpha, bold: true });
  if (i === 1) {
    line(x - 6, y - 12, x - 6, y + 12, { color: P.ink, alpha, width: 2.5 });
    stroke(
      () => {
        ctx.moveTo(x - 6, y + 4);
        ctx.quadraticCurveTo(x - 6, y - 6, x + 8, y - 8);
      },
      { color: P.ink, alpha, width: 2.5 }
    );
  }
  if (i === 2) person(x, y + 6, { size: 0.55, alpha });
}
function stageName(s, t, a, c) {
  if (a <= 0) return;
  const g = a * clearOfTitle(s, t, 330), open = g * ramp(t, c.first - 0.4, 0.4), xs = [560, 760, 960, 1160, 1360], LY = 430, LR = 40, Y3 = NAME_PATH_Y(), X02 = (xs[0] + xs[1]) / 2, X1 = (xs[3] + xs[4]) / 2, lights = [c.w1, c.w2, c.w3, c.w4, c.w5];
  nameText("ETHOS", 960, 350, { alpha: g * named(t, c.first - 0.25) });
  stroke(
    () => xs.forEach((x) => {
      ctx.moveTo(x + LR, LY);
      ctx.arc(x, LY, LR, 0, Math.PI * 2);
    }),
    { color: P.ink, alpha: open, width: 2.5 }
  );
  "ETHOS".split("").forEach((letter, i) => {
    const lit = en ? speaking(t, lights, i) : ramp(t, lights[i] - 0.1, 0.4);
    ring(xs[i], LY, LR + 8, { color: P.ink, alpha: open * lit * 0.6, width: 3 });
    text(letter, xs[i], LY + 1, 40, {
      role: "mark",
      align: "center",
      bold: true,
      alpha: open * mix(0.75, 1, lit)
    });
  });
  const drawn = drawShare(t, c.otherPath - 0.2, X1 - X02 - 14, 0.9), reach = mix(X02 + 14, X1, drawn), on = a * ramp(t, c.otherPath - 0.15, 0.4);
  datumMark(X02, Y3, 14, on);
  line(X02 + 14, Y3, reach, Y3, { color: P.ink, alpha: on, width: 3 });
  dot(reach, Y3, 7, { color: P.ink, alpha: on });
  flowAlong(
    [
      [X02 + 14, Y3],
      [X1, Y3]
    ],
    flowClock(t),
    6,
    { upto: drawn, color: P.ink, alpha: on }
  );
  nameText(L("另一条路", "A different path"), X1 + 7 + NAME_GAP, Y3, {
    align: "left",
    alpha: a * named(t, c.otherPath)
  });
  const spoken = [...lights].sort((p, q) => p - q);
  railNames(
    L(
      ["证据", "信任", "人和 Agent", "工作", "打理"],
      ["Evidence-grounded", "Trust", "Human-Agent", "Operational", "Stewardship"]
    ),
    xs,
    LY + LR,
    {
      gap: NAME_GAP,
      alpha: (i) => a * listIn(t, spoken, spoken.indexOf(lights[i])),
      set: "initials"
    }
  );
}
var PATH_LEN = 1080;
var PROMISE_PITCH = 80;
var softMax = (a, b, s = 80) => (a + b + Math.hypot(a - b, s)) / 2;
function stagePath(t, a, c) {
  if (a <= 0) return;
  const nameAt = c.reliable, from = c.pCut + 0.18, drawn = drawShare(t, from, PATH_LEN, L(1.8, 2)), on = a * ramp(t, from - 0.05, 0.4), endName = L("靠得住的路", "One reliable path"), party = L(["人", "和可以互相替换的 Agent"], ["People and interchangeable Agents"]), travellers = party.join(""), alone = Math.max(60, measure(party[0])), heading = en ? measure(travellers) : mix(alone, measure(travellers), glideShare(t, c.agents + 0.05, (measure(travellers) - alone) / 2, 0.7)), named2 = glideShare(t, nameAt - 0.1, (NAME_GAP + measure(endName)) / 2, 0.6), X02 = 960 - softMax(10 + heading, PATH_LEN * drawn + 7 + (NAME_GAP + measure(endName)) * named2) / 2, PY = mix(560, 380, glideShare(t, c.three + 0.05, 180, 0.7)), X1 = X02 + PATH_LEN, reach = mix(X02, X1, drawn), nameX = Math.max(reach + 7 + NAME_GAP, X02 + 10 + measure(travellers) - measure(endName)), names2 = STATION_NAMES(), xs = railStations(names2, X02 + 240, X1 - 60), sts = [c.st1, c.st2, c.st3];
  pathLine(
    X02,
    reach,
    PY,
    xs.filter((x, i) => t > sts[i] - 0.15 && x + 28 < reach),
    { alpha: on }
  );
  dot(reach, PY, 7, { color: P.ink, alpha: on });
  flowAlong(
    [
      [X02, PY],
      [reach, PY]
    ],
    flowClock(t),
    6,
    {
      // The path grows, so its dots keep one period whatever its length: 1.6 s, 288 px apart, out of step with the
      // stations' pitch of about 390 px, so the dots never all shrink at the stations at once.
      every: 1.6,
      clear: xs.map((x, i) => [x, PY, 28, ramp(t, sts[i] - 0.15, 0.4)]),
      color: P.ink,
      alpha: on
    }
  );
  nameText(endName, nameX, PY, {
    align: "left",
    alpha: a * named(t, nameAt)
  });
  const TX = X02 + 40;
  person(TX, PY - 38, { size: 1.3, alpha: a });
  agent(TX + 64, PY - 32, { size: 1.1, alpha: a * (en ? 1 : ramp(t, c.agents - 0.15, 0.4)) });
  growName(t, party, L([c.people, c.agents], [c.pCut + 0.15]), TX - 30, PY - 102, {
    valign: "bottom",
    alpha: a,
    build: true
  });
  xs.forEach((x, i) => station(x, PY, i, a * ramp(t, sts[i] - 0.15, 0.4)));
  railNames(names2, xs, PY + 28, {
    gap: NAME_GAP,
    alpha: (i) => a * listIn(t, sts, i),
    set: "stations"
  });
  const ps = [c.p1, c.p2, c.p3], edge = xs[0] - measure(names2[0]) / 2, IX = edge + 22, rowY = (i) => PY + 185 + PROMISE_PITCH * i;
  ps.forEach((at, i) => {
    const on2 = a * ramp(t, at - 0.15, 0.4), y = rowY(i);
    if (on2 < 0.01) return;
    dot(IX, y, 22, { color: P.ground, alpha: on2 });
    ring(IX, y, 22, { color: P.ink, alpha: on2, width: 2.5 });
    if (i === 0) check(IX, y + 1, 18, { color: P.ink, alpha: on2, width: 3 });
    if (i === 1) text("?", IX, y + 1, 26, { role: "mark", align: "center", alpha: on2, bold: true });
    if (i === 2) recoverIcon(IX, y, 11, { color: P.ink, alpha: on2 });
  });
  ps.forEach(
    (at, i) => nameText(
      L(
        ["原意不丢", "拿不准的地方说清楚", "能恢复"],
        ["Meaning is kept", "Uncertainty is stated", "The result can be recovered"]
      )[i],
      IX + 22 + NAME_GAP,
      rowY(i),
      { align: "left", alpha: a * listIn(t, ps, i), set: "promises" }
    )
  );
  rejectedName(L("多加一层治理", "More governance"), edge, rowY(2) + 1.5 * PROMISE_PITCH, {
    align: "left",
    alpha: a * named(t, c.gov),
    mark: ramp(t, c.notPromise + 0.1, 0.4)
  });
}
function stageAims(t, a, c) {
  if (a <= 0) return;
  const names2 = STATION_NAMES(), kernelName = L("光有这个内核", "The kernel alone"), claim = L(["整条路已经走通"], ["The whole path", "has been delivered"]), claimWide = Math.max(...claim.map((v) => measure(v))), base = railStations(names2, 850, 1390), left = Math.min(600, 700 - measure(kernelName) / 2), right = Math.max(1440 + 7, base[2] + measure(names2[2]) / 2, 1282 + claimWide + 42), dx = 960 - (left + right) / 2;
  const PY = 430, X02 = 600 + dx, X1 = 1440 + dx, KX = 700 + dx, split = 800 + dx, xs = base.map((x) => x + dx);
  pathLine(X02, X1, PY, xs, { alpha: a, split });
  dot(X1, PY, 7, { color: P.ink, alpha: a });
  xs.forEach((x, i) => station(x, PY, i, a));
  railNames(names2, xs, PY + 28, { gap: NAME_GAP, alpha: () => a, set: "aims stations" });
  nameText(L("设计目标", "Design aims"), xs[1], PY - 28 - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, c.aimsCut + 0.15)
  });
  const namesTop = rowNameTop([640 + 46, 590 + 92]);
  const kernel = a * ramp(t, c.alone - 0.15, 0.4);
  kernelIcon(KX, 640, 46, { alpha: kernel, color: P.ink, turn: 0.12 * voiceTime(t) });
  link(KX, 594, KX, PY + 3, { alpha: kernel, upto: soon(t, c.alone + 0.05, 0.5), end: false });
  nameText(kernelName, KX, namesTop, {
    valign: "top",
    alpha: a * named(t, c.alone)
  });
  const docs = a * ramp(t, c.docs - 0.15, 0.4);
  paper(1150 + dx, 590, 72, 92, { alpha: docs, rows: 4 });
  nameText(L("它自己的文档", "Its own documents"), 1186 + dx, namesTop, {
    valign: "top",
    alpha: a * named(t, c.docs)
  });
  rejectedName(claim, 1260 + NAME_GAP + dx, 636, {
    align: "left",
    alpha: a * named(t, c.wholePath),
    mark: 1
  });
}

// picture/film/scenes/p03/tools.js
function stageTools(t, a, c) {
  if (a <= 0) return;
  const KX = 960, KY = 420, KR = 36, gather = glideShare(t, c.oneJob + 0.05, (560 - 2 * KR) / 2, Math.max(0.9, c.elseAt - c.oneJob - 0.2)), PW = mix(560, 2 * KR, gather), PH = mix(240, 2 * KR, gather), code = a * (1 - gather), turnTo = a * ramp(t, c.elseAt - 0.15, 0.4), tooled = a * ramp(t, c.toolsAt - 0.15, 0.4), tools = [
    [620, 640, 280, 178],
    [1300, 640, 280, 178]
  ];
  box(KX - PW / 2, KY - PH / 2, PW, PH, { stroke: P.ink, alpha: code, radius: 16, width: 2.5 });
  stroke(
    () => [-0.34, -0.17, 0, 0.17, 0.34].forEach((k, i) => {
      const y = KY + k * PH, inner = KR + 20, outer = PW / 2 - 26;
      if (outer <= inner) return;
      ctx.moveTo(KX - outer, y);
      ctx.lineTo(KX - inner - (outer - inner) * [0, 0.3, 0.5, 0.15, 0.4][i], y);
      ctx.moveTo(KX + inner, y);
      ctx.lineTo(KX + outer - (outer - inner) * [0.35, 0, 0.2, 0.45, 0.1][i], y);
    }),
    { color: P.muted, alpha: code * 0.8, width: 2.5 }
  );
  kernelIcon(KX, KY, KR, { alpha: a, color: P.ink, turn: 0.1 * voiceTime(t) });
  beats(t, KX, KY, KR + 16, [c.less], { alpha: a });
  nameText(L("ETHOS 的代码", "Its own code"), KX, KY - Math.max(PH / 2, KR) - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, c.tCut + 0.15)
  });
  const under = KY + Math.max(PH / 2, KR) + NAME_GAP;
  const job = nameText(L("内核这一件事", "The kernel's one job"), KX, under, {
    valign: "top",
    alpha: a * named(t, c.oneJob)
  });
  nameText(L("就少得多", "much less to verify"), KX, job.bottom + TERM_STACK, {
    valign: "top",
    size: NOTE,
    color: P.muted,
    alpha: a * named(t, c.less)
  });
  tools.forEach(([x, y, w, h], i) => {
    box(x - w / 2, y - h / 2, w, h, { stroke: P.ink, alpha: tooled, radius: 18, width: 2.5 });
    link(KX + (i ? 1 : -1) * KR * 0.87, KY, x, y - h / 2, {
      route: "hv",
      alpha: turnTo,
      upto: soon(t, c.elseAt + 0.05, 0.6),
      flow: flowClock(t, 0.5 * i),
      flowEvery: FLOW_EVERY
    });
  });
  nameText(L("别的功能", "Everything else"), KX, tools[0][1], { alpha: turnTo });
  const [gx, gy] = tools[0];
  stroke(
    () => {
      ctx.moveTo(gx - 70, gy - 30);
      ctx.lineTo(gx - 70, gy + 30);
      ctx.moveTo(gx - 70, gy + 8);
      ctx.quadraticCurveTo(gx - 70, gy - 16, gx - 40, gy - 20);
    },
    { color: P.ink, alpha: tooled, width: 3 }
  );
  const [fx, fy] = tools[1];
  stroke(
    () => [-32, 0, 32].forEach((dy, k) => {
      ctx.moveTo(fx - 80, fy + dy);
      ctx.lineTo(fx - 80 + [160, 110, 140][k], fy + dy);
    }),
    { color: P.muted, alpha: tooled * 0.8, width: 2.5 }
  );
  nameText("Git", gx + 20, gy, { alpha: a * named(t, L(c.git, c.git - 1.45)) });
  termRow(
    t,
    [L("现成、成熟的工具", "Mature tools")],
    [c.mature],
    L([], ["that already exist"]),
    [c.exist],
    KX,
    760,
    { alpha: a, align: "center" }
  );
}
function stageSystems(t, a, c) {
  if (a <= 0) return;
  const KX = 960, KY = 480, KR = 40, W = L(370, 400), H = 84, spots = [
    [L(520, 470), 380],
    [L(1400, 1450), 380],
    [L(520, 470), 600],
    [L(1400, 1450), 600]
  ], ats = [c.sys1, c.sys2, c.sys3, c.sys4], q = flowClock(t), joined = a * ramp(t, c.connect - 0.15, 0.4);
  const places = a * ramp(t, c.systems - 0.45, 0.4);
  nameText(L("原有的系统", "The systems you already have"), KX, 290, { alpha: places });
  kernelIcon(KX, KY, KR, { alpha: a, color: P.ink, turn: 0.1 * voiceTime(t) });
  nameText("ETHOS", KX, KY - KR - NAME_GAP, { valign: "bottom", alpha: a * named(t, c.sCut) });
  stroke(() => spots.forEach(([x, y]) => ctx.roundRect(x - W / 2, y - H / 2, W, H, 14)), {
    color: P.ink,
    alpha: places,
    width: 2.5
  });
  spots.forEach(([x, y], i) => {
    nameText(
      L(
        ["描述业务用的模型", "持续集成", "运行那些 Agent 的应用", "问题跟踪系统"],
        ["Model of your business", "Automated checks", "Apps your Agents run in", "Issue tracker"]
      )[i],
      x,
      y,
      { alpha: a * named(t, ats[i]), set: "systems" }
    );
    const right = x > KX, side = right ? 1 : -1;
    link(x - side * (W / 2), y, KX + side * KR * 0.87, KY + (y < KY ? -12 : 12), {
      route: "hvh",
      mid: KX + side * 100,
      alpha: joined,
      upto: soon(t, c.connect + 0.05 + 0.15 * i, 0.5),
      flow: q
    });
  });
  const machine = a * ramp(t, c.machine - 0.15, 0.4);
  terminalIcon(KX - 90, 560, 180, 76, { alpha: machine });
  termRow(
    t,
    [L("自己的机器", "Your own machine")],
    [c.machine],
    [L("不依赖哪一家平台", "without depending on any one vendor")],
    [c.vendor],
    KX,
    560 + 76 + NAME_GAP - 6,
    { width: 560, alpha: a, align: "center" }
  );
  rejectedName(L("真相的来源", "A source of truth"), KX, 800, {
    alpha: a * named(t, c.truth),
    mark: ramp(t, c.truth + 0.4, 0.4)
  });
}
var REPO_W = 260;
var REPO_GAP = 140;
function stageLayer(t, a, c) {
  if (a <= 0) return;
  const total = 3 * REPO_W + 2 * REPO_GAP, x0 = 960 - total / 2, x1 = x0 + total, repos = [0, 1, 2].map((i) => [x0 + REPO_W / 2 + i * (REPO_W + REPO_GAP), REPO_W]), RH = 150, RY = 520, LY = RY + RH / 2 + 50;
  repos.forEach(
    ([x, w]) => box(x - w / 2, RY - RH / 2, w, RH, { stroke: P.ink, alpha: a, radius: 14, width: 2.5 })
  );
  stroke(
    () => repos.forEach(([x, w]) => {
      const gx = x - w / 2 + 34, gy = RY - RH / 2 + 26;
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx, gy + 30);
      ctx.moveTo(gx, gy + 20);
      ctx.quadraticCurveTo(gx, gy + 8, gx + 16, gy + 6);
    }),
    { color: P.ink, alpha: a, width: 2.5 }
  );
  box(x0, LY - 36, x1 - x0, 72, { stroke: P.ink, alpha: a, radius: 16, width: 2.5 });
  stroke(
    () => repos.forEach(([x]) => {
      ctx.moveTo(x, RY + RH / 2);
      ctx.lineTo(x, LY - 36);
    }),
    { color: P.ink, alpha: a, width: 2.5 }
  );
  flowAlong(
    [
      [x0 + 30, LY + 22],
      [x1 - 30, LY + 22]
    ],
    flowClock(t),
    6,
    { single: true, color: P.ink, alpha: a }
  );
  nameText(L("共有的部分，归 ETHOS", "ETHOS owns in one place"), (x0 + x1) / 2, LY - 6, {
    alpha: a * named(t, c.owns)
  });
  const own = a * ramp(t, c.own - 0.15, 0.4), [ax, bx, cx] = repos.map(([x]) => x + 30), SY = RY + 8;
  ring(ax, SY, 26, { color: P.ink, alpha: own, width: 3 });
  stroke(
    () => {
      ctx.moveTo(bx, SY - 24);
      ctx.lineTo(bx + 28, SY + 24);
      ctx.lineTo(bx - 28, SY + 24);
      ctx.closePath();
    },
    { color: P.ink, alpha: own, width: 3 }
  );
  box(cx - 24, SY - 24, 48, 48, { stroke: P.ink, alpha: own, radius: 6, width: 3 });
  const term = [L("每个仓库", "Each repository")], qual = [L("自己特有的事", "only what is its own")], { height } = termRowLayout(term, qual, 520, false);
  termRow(t, term, [c.each], qual, [c.own], (x0 + x1) / 2, RY - RH / 2 - NAME_GAP - height, {
    width: 520,
    alpha: a,
    align: "center"
  });
}

// picture/film/scenes/p03/what.js
scenes["03"] = function(s, t) {
  const c = { first: s.words[0].start };
  const take = (pairs) => cues(s, Object.values(pairs)).forEach((v, i) => c[Object.keys(pairs)[i]] = v);
  take({
    // 03.1 the name.
    otherPath: ["另一条路", "a different path"],
    w1: ["证据", "Evidence-grounded"],
    w2: ["信任", "Trust"],
    w3: ["人和 Agent", "Human-Agent"],
    w4: ["工作", "Operational"],
    w5: ["打理", "Stewardship"],
    // 03.2 the path and its promises.
    // English names the travellers in the words that follow its first two, so its stage cuts in on those words.
    pCut: ["它想给", "people and interchangeable Agents"],
    // Chinese names the travellers in two clauses, the people and then the Agents; English in one phrase.
    people: ["给人", "people and interchangeable Agents"],
    agents: ["可以互相替换的 Agent", "people and interchangeable Agents"],
    reliable: ["靠得住的路", "one reliable path"],
    st1: ["弄清一个问题", "a problem"],
    st2: ["改动代码仓库", "a repository"],
    st3: ["用起来到底怎么样", "in use"],
    three: ["它承诺三件事", "It promises three things"],
    p1: ["原意不丢", "meaning is kept"],
    p2: ["拿不准的地方说清楚", "uncertainty is stated"],
    p3: ["能恢复", "the result can be recovered"],
    gov: ["多加一层治理", "More governance"],
    notPromise: ["不在它的承诺里", "is not one of its promises"],
    // 03.3 the kernel.
    // The Chinese cut falls on the clause that brings the kernel, so the kernel stands on its own words; its name
    // leads them as before. While "这条路" is said the path stays as 03.2 leaves it.
    kCut: ["靠一个", "A small trust kernel"],
    kernel: ["很小的信任内核", "a small trust kernel"],
    takes: ["内核拿三样东西", "takes three inputs"],
    in1: ["已经采纳的意图", "the intent"],
    in1q: ["已经采纳的意图", "that has been accepted"],
    in2: ["刚观察到的事实", "fresh facts"],
    in3: ["留下的存证", "attestations already on record"],
    rules: ["按固定的规则", "by fixed rules"],
    plan: ["一份计划", "a plan"],
    writeAt: ["真要写入的那一刻", "At the moment it writes"],
    gateName: ["写入", "the moment it writes"],
    check: ["再核对一遍", "checks again"],
    recCut: ["最后把", "Then it records"],
    rec1: ["看到了什么", "what it observed"],
    rec2: ["判断了什么", "what it decided"],
    rec3: ["做了什么", "and what it did"],
    newAtt: ["新的存证", "new attestations"],
    // 03.4 lifetimes.
    // English cuts in on the words that bring the lifetimes, two words before their name, so the heading stands on it.
    lCut: ["这几样东西", "last for different"],
    lifetimes: ["寿命不一样", "different lengths of time"],
    intent: ["意图写在", "Intent is written"],
    change: ["一份正式变更", "one official Change"],
    afresh: ["重新编译一份", "compiles it afresh"],
    facts: ["事实每次", "Facts are observed"],
    again: ["每次都重新去看", "observed again every time"],
    never: ["从不存下来", "never stored"],
    planRow: ["计划要么执行", "A plan is either"],
    carried: ["要么执行", "carried out"],
    discarded: ["要么作废", "or discarded"],
    notKept: ["都不留下", "never kept"],
    again2: ["重新编出来", "compiled again"],
    // 03.5 the attestation's scope.
    aCut: ["内核长期留下的", "The kernel keeps"],
    longTerm: ["长期留下的", "for the long term"],
    who: ["是谁出具的", "who verified it"],
    scope: ["在什么范围内成立", "where it holds"],
    scopeName: ["范围", "where it holds"],
    later: ["回头去查", "check it later"],
    outside: ["出了这个范围", "outside that scope"],
    notCount: ["就不算数", "does not count"],
    // 03.6 the tools it relies on.
    tCut: ["ETHOS 自己的代码", "its own code"],
    ownCode: ["ETHOS 自己的代码", "its own code"],
    oneJob: ["内核这一件事", "the kernel's one job"],
    elseAt: ["别的功能", "everything else"],
    mature: ["现成、成熟的工具", "mature tools that already exist"],
    exist: ["现成、成熟的工具", "that already exist"],
    git: ["Git", "Git"],
    less: ["就少得多", "much less"],
    // 03.7 the systems it leaves as they are, and what it owns in one place.
    sCut: ["ETHOS 也不接管", "ETHOS does not take over"],
    systems: ["原有的系统", "the systems you already have"],
    sys1: ["描述业务用的模型", "the model that describes your business"],
    sys2: ["持续集成", "automated checks"],
    sys3: ["运行那些 Agent 的应用", "the apps your Agents run in"],
    sys4: ["问题跟踪系统", "your issue tracker"],
    machine: ["自己的机器", "your own machine"],
    vendor: ["不依赖哪一家平台", "without depending on any one vendor"],
    connect: ["接进来的系统", "connecting a system"],
    truth: ["真相的来源", "a source of truth"],
    // The layer's stage cuts in on the words that open its sentence in Chinese, which name the layer, and on the words
    // of the layer's name in English, which follow the words that open the sentence, so the layer arrives named.
    layerCut: ["所有仓库共有的部分", "ETHOS owns in one place"],
    owns: ["共有的部分", "ETHOS owns in one place"],
    each: ["每个仓库", "each repository"],
    own: ["自己特有的事", "only what is its own"],
    // 03.8 design aims.
    // The aims' stage cuts in on the words that name it, so its heading stands on them.
    aimsCut: ["设计目标", "design aims"],
    aims: ["设计目标", "design aims"],
    docs: ["它自己的文档", "its own documents"],
    alone: ["光有这个内核", "the kernel alone"],
    wholePath: ["整条路", "the whole path"]
  });
  c.att = cueFrom(s, "只有存证", "the attestation", c.aCut);
  c.reader = cueFrom(s, "后来的人", "someone", c.aCut);
  c.toolsAt = cueFrom(s, "别的功能", "tools", c.elseAt);
  const stage = (from, to) => (from ? stageIn(t, c[from]) : 1) * (to ? stageOut(t, c[to]) : 1);
  stageName(s, t, stage(null, "pCut"), c);
  stagePath(t, stage("pCut", "kCut"), c);
  stageKernel(t, stage("kCut", "lCut"), c);
  stageLifetimes(t, stage("lCut", "aCut"), c);
  stageScope(t, stage("aCut", "tCut"), c);
  stageTools(t, stage("tCut", "sCut"), c);
  stageSystems(t, stage("sCut", "layerCut"), c);
  stageLayer(t, stage("layerCut", "aimsCut"), c);
  stageAims(t, stage("aimsCut", null), c);
};

// picture/film/drawing/examples.js
function pipelineMark(x, y, w, { alpha = 1, flow = null, back = 0, lit = 0, color = P.ink, backColor = P.evidence } = {}) {
  const k = w / 1200, feedX = x - w / 2 + 40 * k, storeX = x + w / 2 - 110 * k, r = 40 * k, runW = 300 * k, runH = 110 * k, storeW = 220 * k, storeH = 170 * k;
  const place = {
    feedX,
    runX: x,
    storeX,
    top: y - storeH / 2,
    bottom: y + storeH / 2,
    loop: y + storeH / 2 + 60 * k
  };
  if (alpha < 0.01) return place;
  ring(feedX, y, r, { color, alpha, width: 2.5 });
  dot(feedX, y, r * 0.32, { color, alpha });
  box(x - runW / 2, y - runH / 2, runW, runH, {
    fill: P.row,
    stroke: color,
    alpha,
    radius: 10,
    width: 2.5
  });
  stroke(
    () => {
      for (let i = -1; i <= 1; i++) {
        const cx = x + i * runW * 0.22, s = 16 * Math.max(k, 0.5);
        ctx.moveTo(cx - s / 2, y - s);
        ctx.lineTo(cx + s / 2, y);
        ctx.lineTo(cx - s / 2, y + s);
      }
    },
    { color, alpha, width: 2.5 }
  );
  box(storeX - storeW / 2, y - storeH / 2, storeW, storeH, {
    fill: P.row,
    stroke: blend(color, P.evidence, lit),
    alpha,
    radius: 8,
    width: 2.5 + lit
  });
  stroke(
    () => {
      for (let i = 0; i < 4; i++) {
        const ry = y - storeH / 2 + storeH * (i + 1) / 5;
        ctx.moveTo(storeX - storeW * 0.36, ry);
        ctx.lineTo(storeX + storeW * 0.36, ry);
      }
    },
    { color: P.muted, alpha, width: 2 }
  );
  line(feedX + r, y, x - runW / 2, y, { alpha });
  line(x + runW / 2, y, storeX - storeW / 2, y, { alpha });
  if (back > 0)
    link(storeX, y + storeH / 2, feedX, y + r, {
      route: "vhv",
      mid: place.loop,
      color: backColor,
      alpha,
      upto: back
    });
  if (flow !== null)
    flowAlong(
      [
        [feedX + r, y],
        [storeX - storeW / 2, y]
      ],
      flow,
      8 * Math.max(k, 0.6),
      { every: FLOW_EVERY, color: P.evidence, alpha }
    );
  return place;
}

// picture/film/scenes/p04/marks.js
function card(x, y, w, h, { alpha = 1, color = P.line, dash = null, width = 2.5 } = {}) {
  box(x, y, w, h, { stroke: color, alpha, radius: 12, width, dash });
}
var CELLS = [0.2, 0.34, 0.22];
function recordRows(x, y, w, rows, { step = 36, alpha = 1, color = P.muted, width = 3 } = {}) {
  if (!rows.length) return;
  stroke(
    () => {
      for (const r of rows) {
        let cx = x;
        for (const share of CELLS) {
          ctx.moveTo(cx, y + r * step);
          ctx.lineTo(cx + w * share, y + r * step);
          cx += w * share + w * 0.08;
        }
      }
    },
    { color, alpha, width }
  );
}
var valueCell = (x, w) => [x + w * 0.7, x + w * 0.92];
function agents(points, { alpha = 1, size = 1, color = P.ink } = {}) {
  if (alpha < 0.01 || !points.length) return;
  const r = 22 * size;
  stroke(
    () => points.forEach(([x, y]) => {
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r, y);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r, y);
      ctx.closePath();
    }),
    { color, alpha, width: 2.5 }
  );
  stroke(
    () => points.forEach(([x, y]) => {
      ctx.moveTo(x + 2.25 * size, y);
      ctx.arc(x, y, 2.25 * size, 0, Math.PI * 2);
    }),
    { color, alpha, width: 4.5 * size }
  );
}
function linkSet(routes, { alpha = 1, upto = 1, color = P.line, width = 2, flow = null, end = true } = {}) {
  if (alpha < 0.01 || upto <= 0) return;
  const paths = routes.map(([x1, y1, x2, y2, kind, mid]) => {
    const m = mid ?? (kind === "vhv" ? (y1 + y2) / 2 : (x1 + x2) / 2);
    const corners = {
      vhv: [
        [x1, y1],
        [x1, m],
        [x2, m],
        [x2, y2]
      ],
      hvh: [
        [x1, y1],
        [m, y1],
        [m, y2],
        [x2, y2]
      ],
      vh: [
        [x1, y1],
        [x1, y2],
        [x2, y2]
      ],
      hv: [
        [x1, y1],
        [x2, y1],
        [x2, y2]
      ]
    }[kind];
    return rounded(corners, 14);
  });
  stroke(
    () => paths.forEach(
      (points) => along(points, upto).kept.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))
    ),
    { color, alpha, width }
  );
  const ends = end ? ease((upto - 0.9) / 0.1) : 0;
  if (ends > 0.07)
    stroke(
      () => paths.forEach((points) => {
        const [x, y] = points.at(-1);
        ctx.moveTo(x + 2.25 * ends, y);
        ctx.arc(x, y, 2.25 * ends, 0, Math.PI * 2);
      }),
      { color, alpha: alpha * ends, width: 4.5 * ends }
    );
  if (flow !== null)
    paths.forEach(
      (points, k) => flowAlong(points, flow + k / paths.length * FLOW_EVERY, width + 2, { upto, color, alpha })
    );
}
function verdictMark(kind, x, y, r = 22, { alpha = 1, color = P.ink } = {}) {
  if (alpha < 0.01) return;
  if (kind === "pass") check(x, y + r * 0.08, r * 1.4, { color, alpha, width: 4 });
  else if (kind === "block") stopSign(x, y, r, { color, alpha });
  else {
    ring(x, y, r, { color, alpha, width: 3 });
    text("?", x, y + 1, r * 1.25, { role: "mark", align: "center", color, alpha });
  }
}

// picture/film/scenes/p04/example.js
var REQUEST = () => L(["不能多出重复记录", "更正过的数据一定留下"], ["No duplicate records", "Corrections stay"]);
var QUOTE = () => L("按股票代码和日期去重", "Deduplicate by stock code and date");
function contractStage(s, t, c, g) {
  const W = 520, H = 250, x = 960 - W / 2, y = 470 - H / 2, a = g * clearOfTitle(s, t, y);
  documentIcon(x, y, W, H, { alpha: a, rows: 0 });
  const lit = soon(t, c.rules + 0.05, 0.5);
  stroke(
    () => {
      for (let k = 0; k < 4; k++) {
        const ry = y + H * (0.22 + k * 0.2);
        ctx.moveTo(x + 40, ry);
        ctx.lineTo(x + W - (k % 2 ? 120 : 40), ry);
      }
    },
    { color: P.ink, alpha: a * mix(0.45, 1, lit), width: 3 }
  );
  nameText("ETHOS", 960, y - NAME_GAP, { valign: "bottom", alpha: a * named(t, c.ethos) });
  nameText(L("产品设计契约", "Product Design Contract"), 960, y + H + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.contract)
  });
  nameText(L("四条判断的准则", "Four rules of judgment"), 960, y + H + NAME_GAP + 44, {
    valign: "top",
    alpha: a * named(t, c.rules)
  });
}
function exampleStage(s, t, c, g) {
  const m = pipelineMark(960, 470, 900, { alpha: g, flow: flowClock(t) });
  nameText(L("一个例子", "One example"), 960, m.top - NAME_GAP, {
    valign: "bottom",
    alpha: g * named(t, c.example)
  });
  const idea = L("只为说明道理", "To show the idea"), refused = L("实测", "A measured case");
  const w1 = measure(idea), row = w1 + 80 + measure(refused) + 42, x1 = mix(960 - w1 / 2, 960 - row / 2, glideShare(t, c.measured + 0.05, (row - w1) / 2, 0.6)), y = m.bottom + NAME_GAP + 18;
  nameText(idea, x1, y, { align: "left", alpha: g * named(t, c.idea) });
  rejectedName(refused, x1 + w1 + 80, y, {
    align: "left",
    alpha: g * named(t, c.measured),
    mark: 1
  });
}
function requestStage(s, t, c, g) {
  const Y3 = mix(470, 400, glideShare(t, c.researcher + 0.05, 70, 0.6));
  const m = pipelineMark(960, Y3, 900, {
    alpha: g,
    flow: flowClock(t),
    back: soon(t, c.runAgain + 0.05, 0.6)
  });
  const term = [L("行情数据管线", "Market-data pipeline")], qual = [L("可以再跑一遍", "can be run again")], { height } = termRowLayout(term, qual, Infinity, false);
  termRow(t, term, [c.pipe], qual, [c.runAgain], 960, m.top - NAME_GAP - height, {
    alpha: g,
    align: "center"
  });
  const lines = REQUEST(), ats = [c.dup, c.corrected], who = L("研究员", "A researcher"), figure = 1.55 * 15 * 1.2, nameHalf = measure(who) / 2, unit = Math.max(figure, nameHalf), lead = Math.max(figure + 36, nameHalf + 30), reach = reachAt(
    t,
    unit,
    lines.map((v, i) => [ats[i], lead + measure(v)])
  ), PX2 = 960 - (reach - unit) / 2, RY = 690, on = g * named(t, c.researcher);
  person(PX2, RY, { alpha: on, size: 1.2 });
  nameText(who, PX2, RY + 28 + NAME_GAP, { valign: "top", alpha: on });
  lines.forEach(
    (v, i) => nameText(v, PX2 + lead, RY - 24 + i * 50, {
      align: "left",
      alpha: g * listIn(t, ats, i),
      set: "request"
    })
  );
}
var requestWidth = () => Math.max(...REQUEST().map((v) => measure(v))) + 56;
function requestCard(x, y, { alpha = 1, ink = 1, frame = alpha, dash = 0 } = {}) {
  const w = requestWidth();
  card(x, y - 54, w, 108, { alpha: frame * (1 - dash) });
  if (dash > 0) card(x, y - 54, w, 108, { alpha: frame * dash * 0.8, dash: [8, 9] });
  REQUEST().forEach(
    (v, i) => nameText(v, x + 28, y - 21 + i * 42, { align: "left", alpha: alpha * ink, set: "original" })
  );
  return w;
}
var quoteWidth = () => measure(QUOTE()) + 56;
function quoteCard(x, y, { alpha = 1, words = alpha } = {}) {
  const w = quoteWidth();
  card(x, y - 32, w, 64, { alpha, color: P.ink });
  nameText(QUOTE(), x + w / 2, y, { alpha: words });
  return w;
}
function handoffStage(s, t, c, g) {
  const cw = requestWidth(), qw = quoteWidth(), first = cw + 323.25, whole = cw + 421.25 + qw, x0 = 960 - (cw + 120 + 180 + 120 + qw) / 2 + (whole - first) / 2 * (1 - glideShare(t, c.summary + 0.05, (whole - first) / 2, 0.9)), a1 = x0 + cw + 120, a2 = a1 + 180, qx = a2 + 120, [Y0, Y1, Y22, Y3] = [380, 465, 550, 640], h = g * named(t, c.handoffs);
  requestCard(x0, Y0, { alpha: g });
  const draw = soon(t, c.handoffs + 0.05, 0.6);
  link(x0 + cw, Y0, a1, Y1 - 22, { route: "hv", alpha: h, upto: draw });
  link(a1 + 22, Y1, a2, Y22 - 22, { route: "hv", alpha: h, upto: draw });
  agents(
    [
      [a1, Y1],
      [a2, Y22]
    ],
    { alpha: h }
  );
  nameText(L("两次交接", "Two handoffs"), a1, Y1 + 22 + NAME_GAP, { valign: "top", alpha: h });
  nameText(L("总结", "An Agent's summary"), a2 + 22 + NAME_GAP, Y22, {
    align: "left",
    alpha: g * named(t, c.summaryName)
  });
  const path2 = [
    [x0 + cw, Y0],
    [a1, Y0],
    [a1, Y1],
    [a2, Y1],
    [a2, Y22]
  ], p = drawShare(t, c.handoffs + 0.65, 470);
  if (p > 0 && p < 1)
    dot(
      ...along(path2, p).point,
      (12 - 3 * ease((p - 0.37) / 0.1) - 3 * ease((p - 0.7) / 0.1)) * ease(p / 0.08) * ease((1 - p) / 0.08),
      { color: P.ink, alpha: g }
    );
  const q = g * named(t, c.single);
  link(a2, Y22 + 22, qx, Y3, { route: "vh", alpha: q, upto: soon(t, c.single + 0.05, 0.4) });
  quoteCard(qx, Y3, { alpha: q, words: g * named(t, c.quote) });
  nameText(L("一句", "One line"), qx + qw / 2, Y3 + 32 + NAME_GAP, {
    valign: "top",
    alpha: g * named(t, c.oneLine)
  });
}
function deleteStage(s, t, c, g) {
  const TW = 560, TH = 226, keepName = L("要留下的更正", "Corrections that had to stay"), room = glideShare(t, c.corrections - 0.1, (40 + measure(keepName)) / 2, 0.8), tx = 960 - (TW + room * (40 + measure(keepName))) / 2, ty = 420, qw = quoteWidth(), qy = 300;
  quoteCard(tx + TW / 2 - qw / 2, qy, { alpha: g });
  link(tx + TW / 2, qy + 32, tx + TW / 2, ty, { alpha: g, upto: soon(t, c.follow + 0.05, 0.5) });
  nameText(L("照这句话去做", "To the letter"), tx + TW / 2 + NAME_GAP, (qy + 32 + ty) / 2, {
    align: "left",
    alpha: g * named(t, c.follow)
  });
  card(tx, ty, TW, TH, { alpha: g });
  const rx = tx + 60, rw = TW - 120, ry = ty + 37, step = 38;
  recordRows(rx, ry, rw, [0, 1, 3], { step, alpha: g });
  const named2 = g * named(t, c.corrections), struck = soon(t, c.deleted + 0.05, 0.5);
  recordRows(rx, ry, rw, [2, 4], {
    step,
    alpha: g * mix(1, 0.5, struck),
    color: blend(P.muted, P.ink, named2)
  });
  const v1 = valueCell(rx, rw)[1];
  stroke(
    () => {
      for (const r of [2, 4]) {
        ctx.moveTo(rx - 22 + 7, ry + r * step);
        ctx.arc(rx - 22, ry + r * step, 7, 0, Math.PI * 2);
      }
    },
    { color: P.ink, alpha: named2, width: 2.5 }
  );
  stroke(
    () => {
      for (const r of [2, 4]) {
        ctx.moveTo(rx - 8, ry + r * step);
        ctx.lineTo(mix(rx - 8, v1 + 10, struck), ry + r * step);
      }
    },
    { color: P.ink, alpha: g * ramp(t, c.deleted - 0.15, 0.3), width: 3 }
  );
  termRow(
    t,
    [keepName],
    [c.corrections],
    [L("被删掉", "deleted")],
    [L(c.deletedName, c.corrections)],
    tx + TW + 40,
    ry + 3 * step - labelSize(LABEL) / 2,
    { alpha: g, inline: false }
  );
}
function replaceStage(s, t, c, g) {
  const cw = requestWidth(), qw = quoteWidth(), gone = L("没人再回头看", "No one goes back"), summary = [L("总结", "The summary")], takes = [L("顶替了原话", "takes the place")], nameW = Math.max(measure(summary[0]), measure(takes[0], NOTE)), col = Math.max(cw, qw), left = 960 - (col + 40 + Math.max(measure(gone), nameW)) / 2, start = 960 - (cw + 160 + qw + 40 + measure(summary[0])) / 2;
  const step = glideShare(t, c.replace + 0.05, 270, 0.6), take = glideShare(t, c.replace + 0.35, Math.hypot(start + cw + 160 - left - (col - qw) / 2, 160), 0.7), fade = soon(t, c.noOne + 0.05, 1);
  const ox = mix(start, left + (col - cw) / 2, take), oy = mix(400, 670, step), qx = mix(start + cw + 160, left + (col - qw) / 2, take), qy = mix(560, 400, take);
  link(start + cw, 400, start + cw + 160 + qw / 2, 528, {
    route: "hv",
    alpha: g * (1 - ramp(t, c.replace - 0.15, 0.25)),
    flow: flowClock(t)
  });
  requestCard(ox, oy, { alpha: g * (1 - fade), ink: mix(1, 0.58, step), frame: g, dash: fade });
  nameText(L("原话", "Original words"), ox + cw / 2, oy + 54 + NAME_GAP, {
    valign: "top",
    alpha: g * named(t, c.original)
  });
  nameText(gone, ox + cw + 40, oy, { align: "left", alpha: g * named(t, c.noOne) });
  quoteCard(qx, qy, { alpha: g });
  termRow(t, summary, [c.first3c], takes, [c.replace], qx + qw + 40, qy - labelSize(LABEL) / 2, {
    alpha: g,
    inline: false
  });
  const fast = g * named(t, c.fast), quick = L("读得快", "Reading faster"), fx = qx + qw / 2 - (26 - 12.75 + measure(quick)) / 2, fy = qy + 32 + NAME_GAP + 16;
  check(fx, fy, 22, { color: P.ink, alpha: fast });
  nameText(quick, fx + 26, fy, { align: "left", alpha: fast });
}

// picture/film/drawing/models.js
function modelGrid(x, y, w, h, { alpha = 1, color = P.ink, cell = null, lit = 0, grow = 0 } = {}) {
  if (alpha < 0.01) return;
  const cols = 4, rows = 3, cw = w / cols, ch = h / rows;
  stroke(
    () => {
      for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++)
          ctx.roundRect(x + i * cw + 4, y + j * ch + 4, cw - 8, ch - 8, 6);
    },
    { color, alpha, width: 2.5 }
  );
  if (cell) {
    const [i, j] = cell, gx = cw * grow * 0.9, gy = ch * grow * 0.5;
    box(x + i * cw + 4, y + j * ch + 4 - gy, cw - 8 + gx, ch - 8 + gy * 2, {
      fill: P.row,
      stroke: P.authority,
      alpha: alpha * lit,
      radius: 6,
      width: 3.5
    });
  }
}

// picture/film/framing/rules.js
var KICK_Y = 196;
var RULE_Y = 218;
var RULE_WRAP = 600;
var GLYPH_GAP = 40;
function ruleHeadingLayout(number, statement, size, glyph, { cx = 960, dy = 0, wrap = RULE_WRAP } = {}) {
  const lines = wrapName(statement, wrap), tw = Math.max(measure(number, NOTE), ...lines.map((v) => measure(v))), top = KICK_Y - labelSize(NOTE) / 2 + dy, bottom = RULE_Y + labelSize(LABEL) * (1 + LEADING * (lines.length - 1)) + dy, e = size > 0 ? markExtent(size, glyph) : null, gw = e ? e.right - e.left + GLYPH_GAP : 0, left = cx - (gw + tw) / 2;
  return {
    lines,
    tx: left + gw,
    mx: e ? left - e.left : null,
    my: e ? (top + bottom) / 2 : null,
    top,
    bottom
  };
}
function ruleHeading(t, { number, numberAt, statement, statementAt, size = 0, glyph = {}, shares = glyph, alpha = 1, ...o }) {
  const h = ruleHeadingLayout(number, statement, size, glyph, o);
  if (size > 0) ethosMark(h.mx, h.my, size, { ...shares, alpha });
  nameText(number, h.tx, KICK_Y + (o.dy ?? 0), {
    align: "left",
    size: NOTE,
    color: P.muted,
    alpha: alpha * named(t, numberAt)
  });
  nameText(h.lines, h.tx, RULE_Y + (o.dy ?? 0), {
    align: "left",
    valign: "top",
    alpha: alpha * named(t, statementAt)
  });
  return h;
}

// picture/film/scenes/p04/rule-one.js
function ruleOneHeading(t, c, g) {
  const on = g * named(t, c.first4), h = ruleHeading(t, {
    number: L("第一条准则", "Rule one"),
    numberAt: c.first4,
    statement: L("用刚好够用的模型，留住原意", ["Preserve meaning with the smallest model"]),
    statementAt: c.statement,
    size: 560,
    glyph: { datum: 1, passages: 0, boundary: 0 },
    shares: { datum: on, hole: ramp(t, c.first4 - 0.05, 0.6), passages: 0, boundary: 0 },
    alpha: g
  });
  beats(t, h.mx, h.my, 26, [c.keep], { color: P.ink, alpha: g });
  if (!en) return h.bottom;
  const under = h.bottom + TERM_STACK;
  nameText("that is enough", h.tx, under, {
    align: "left",
    valign: "top",
    size: NOTE,
    color: P.muted,
    alpha: g * named(t, c.keep)
  });
  return under + labelSize(NOTE);
}
function enoughModel(t, x, y, a, flowing) {
  const cells = [
    [x - 78, y + 28],
    [x, y - 28],
    [x + 78, y + 28]
  ];
  const links = [
    [
      [cells[0][0] + 20, cells[0][1] - 20],
      [cells[1][0] - 20, cells[1][1] + 20]
    ],
    [
      [cells[1][0] + 20, cells[1][1] + 20],
      [cells[2][0] - 20, cells[2][1] - 20]
    ]
  ];
  stroke(
    () => links.forEach(([p, q]) => {
      ctx.moveTo(...p);
      ctx.lineTo(...q);
    }),
    { color: P.line, alpha: a, width: 2.5 }
  );
  stroke(() => cells.forEach(([cx, cy]) => ctx.roundRect(cx - 32, cy - 20, 64, 40, 6)), {
    color: P.ink,
    alpha: a,
    width: 2.5
  });
  dot(x, y - 28, 6, { color: P.ink, alpha: a });
  if (flowing > 0)
    flowAlong([links[0][0], links[0][1], links[1][0], links[1][1]], flowClock(t), 6, {
      color: P.ink,
      alpha: a * flowing
    });
}
var MODEL_PITCH = 450;
function modelStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const s2 = glideShare(t, c.big - 0.1, MODEL_PITCH / 2, 0.5), s3 = glideShare(t, c.small + 0.05, MODEL_PITCH / 2, 0.6), Y3 = 620, half = MODEL_PITCH / 2, under = rowNameTop([Y3 + 48, Y3 + 75, Y3 + 20]), xs = [960 - MODEL_PITCH, 960 - half * s2 + half * s3, 960 + half + half * s3], bigAt = c.big + 0.25, row = { alpha: g, align: "center" };
  const enough = g * named(t, c.enough);
  enoughModel(t, xs[1], Y3, enough, ramp(t, c.structure, 0.4));
  termRow(
    t,
    L(["刚好够用"], ["Just enough"]),
    [c.enough],
    L(["概念和结构"], ["concepts and structure"]),
    [c.concepts],
    xs[1],
    under,
    row
  );
  const big = g * named(t, bigAt);
  modelGrid(xs[2] - 130, Y3 - 75, 260, 150, { alpha: big, color: P.ink });
  termRow(
    t,
    L(["模型大了"], ["Bigger than it needs to be"]),
    [bigAt],
    L(["用不上的概念"], ["concepts they do not need"]),
    [c.unneeded],
    xs[2],
    under,
    row
  );
  const small = g * named(t, c.small), lost = glideShare(t, c.lost + 0.05, 70, 0.9);
  box(xs[0] - 32, Y3 - 20, 64, 40, { stroke: P.ink, alpha: small, radius: 6, width: 2.5 });
  dot(xs[0] + 44, mix(Y3 - 30, Y3 + 40, lost), 6, { color: P.ink, alpha: small * (1 - lost) });
  termRow(
    t,
    L(["小到装不下原意"], ["Too small"]),
    [c.small],
    L(["半路丢掉"], ["the meaning is lost"]),
    [c.lost],
    xs[0],
    under,
    row
  );
}
var rowHalf = (term, qual = []) => Math.max(measure(term.join("")), qual.length ? measure(qual.join(""), NOTE) : 0) / 2;
var CHANGE_W = 150;
var CHANGE_H = 240;
var fieldNames = () => L(["解决什么", "为什么", "怎样算解决"], ["What to solve", "Why", "What counts as solved"]);
var fieldY = (y, i) => y + CHANGE_H * (0.42 + i * 0.19);
function changeDocument(x, y, { alpha = 1, fields = [1, 1, 1], intent = 1 } = {}) {
  documentIcon(x, y, CHANGE_W, CHANGE_H, { alpha, rows: 0 });
  documentIcon(x + 52, y + 26, 46, 58, { alpha: alpha * intent, rows: 2, fold: false });
  fields.forEach((f, i) => {
    if (f > 0.01)
      stroke(
        () => {
          ctx.moveTo(x + 24, fieldY(y, i));
          ctx.lineTo(x + CHANGE_W - (i === 1 ? 52 : 28), fieldY(y, i));
        },
        { color: P.ink, alpha: alpha * f, width: 3 }
      );
  });
}
function changeStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const names2 = fieldNames(), term = L(["正式变更"], ["One official Change"]), qual = L(["只写在这一处"], ["only there"]), ats = [c.f1, c.f2, c.f3], over = Math.max(0, rowHalf(term, qual) - CHANGE_W / 2), alone = 960 - CHANGE_W / 2, reach = reachAt(
    t,
    CHANGE_W + over,
    names2.map((v, i) => [ats[i], CHANGE_W + 90 + measure(v)])
  ), DX = 960 - (reach - over) / 2, DY = 440, FX = DX + CHANGE_W + 90, into = glideShare(t, c.change - 0.1, Math.hypot(242 + Math.max(0, alone - DX), 124), 0.7), fields = ats.map((at) => ramp(t, at - 0.15, 0.4));
  changeDocument(DX, DY, { alpha: g * named(t, c.change), fields, intent: 0 });
  const ix = mix(alone - 190, DX + 52, into), iy = mix(DY + 150, DY + 26, into), meant = g * named(t, c.intent);
  documentIcon(ix, iy, 46, 58, { alpha: meant, rows: 2, fold: false });
  nameText(L("意图", "The intent"), ix + 23, iy + 58 + NAME_GAP, {
    valign: "top",
    alpha: meant * (1 - ramp(t, c.change - 0.05, 0.3))
  });
  termRow(t, term, [c.change], qual, [c.only], DX + CHANGE_W / 2, DY + CHANGE_H + NAME_GAP, {
    alpha: g,
    align: "center"
  });
  names2.forEach((v, i) => {
    link(DX + CHANGE_W, fieldY(DY, i), FX - 14, fieldY(DY, i), {
      alpha: g * fields[i],
      upto: soon(t, ats[i] + 0.05, 0.4)
    });
    nameText(v, FX, fieldY(DY, i), { align: "left", alpha: g * listIn(t, ats, i), set: "fields" });
  });
}
function readersStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const readers = L(["后面接手的人和 Agent"], ["Everyone"]), readersQual = L([], ["who picks up the work"]), same = L("同一份", "The same thing"), term = L(["正式变更"], ["The Change"]), qual = L(["只写在一处"], ["one copy"]), left = 250 + rowHalf(readers, readersQual), right = Math.max(CHANGE_W, CHANGE_W / 2 + rowHalf(term, qual)), read = CHANGE_W + NAME_GAP + 10 + measure(same), DX = 960 + mix(left - right, left - read, glideShare(t, c.same + 0.05, (read - right) / 2, 0.7)) / 2, DY = 440, RX = DX - 250, AY = 666, names2 = rowNameTop([AY + 22, DY + CHANGE_H]), who = g * named(t, c.readers), reading = g * named(t, c.same);
  changeDocument(DX, DY, { alpha: g });
  termRow(t, term, [c.first5], qual, [c.first5], DX + CHANGE_W / 2, names2, {
    alpha: g,
    align: "center"
  });
  person(RX, 540, { alpha: who, size: 1.1 });
  agent(RX, AY, { alpha: who });
  termRow(t, readers, [c.readers], readersQual, [c.readersWho], RX, names2, {
    alpha: g,
    align: "center"
  });
  for (const [x, y, to, k] of [
    [RX + 34, DY + 90, DY + 90, 0],
    [RX + 26, AY, DY + 160, 0.5]
  ])
    link(x, y, DX, to, {
      route: "hvh",
      alpha: reading,
      upto: soon(t, c.same + 0.05, 0.5),
      flow: flowClock(t, k)
    });
  nameText(same, DX + CHANGE_W + NAME_GAP + 10, DY + 120, { align: "left", alpha: reading });
}

// picture/film/scenes/p04/accounting.js
var EX_W = 260;
var EX_H = 104;
function exampleCard(x, y, corrected, a) {
  card(x - EX_W / 2, y, EX_W, EX_H, { alpha: a });
  const rx = x - EX_W / 2 + 34, rw = EX_W - 68;
  recordRows(rx, y + 36, rw, corrected ? [0] : [0, 1], { alpha: a });
  if (!corrected) return;
  recordRows(rx, y + 36, rw * 0.62, [1], { alpha: a });
  const [v0, v1] = valueCell(rx, rw);
  stroke(
    () => {
      ctx.moveTo(v0, y + 72);
      ctx.lineTo(v1, y + 72);
    },
    { color: P.ink, alpha: a, width: 4 }
  );
}
function examplesStage(s, t, c, g) {
  const bottom = ruleOneHeading(t, c, g), heading = termRow(
    t,
    L(["正例和反例"], ["Positive and negative examples"]),
    [c.examples],
    L(["考对它的理解"], ["test how it has been understood"]),
    [c.understood],
    960,
    bottom + 50,
    { alpha: g, align: "center" }
  ), em = labelSize(LABEL), Y3 = heading.bottom + 40 + em + NAME_GAP, goesName = L("要去掉", "Goes"), corrTerm = L(["同一天、同一只股票的更正"], ["A correction"]), corrQual = L([], ["same stock, same day"]), reachLeft = 280 + EX_W / 2 + NAME_GAP + measure(goesName) + 24 + 10, reachRight = 280 + Math.max(
    EX_W,
    measure(corrTerm.join("")) + (corrQual.length ? TERM_GAP + measure(corrQual.join(""), NOTE) : 0)
  ) / 2, joined = glideShare(t, c.correction + 0.05, 280, 0.9), lean = (reachLeft - reachRight) / 2 * joined * (1 - glideShare(t, c.stays + 0.05, Math.abs(reachLeft - reachRight) / 2, 0.7)), X1 = 960 + lean - 280 * joined, X2 = X1 + 560, vy = Y3 + 72, q = flowClock(t);
  const one = g * named(t, c.exact), goes = soon(t, c.goes + 0.05, 0.5), gone = g * named(t, c.goes);
  exampleCard(X1, Y3, false, one);
  stroke(
    () => {
      ctx.moveTo(X1 - EX_W / 2 + 26, vy);
      ctx.lineTo(mix(X1 - EX_W / 2 + 26, X1 + EX_W / 2 - 26, goes), vy);
    },
    { color: P.ink, alpha: g * ramp(t, c.goes - 0.15, 0.3), width: 3 }
  );
  nameText(L("一模一样的重复", "Exact repeat"), X1, Y3 - NAME_GAP, { valign: "bottom", alpha: one });
  const gx = X1 - EX_W / 2 - NAME_GAP;
  cross(gx - measure(goesName) - 24, vy, 20, { color: P.ink, alpha: gone, width: 3.5 });
  nameText(goesName, gx, vy, { align: "right", alpha: gone });
  const two = g * named(t, c.correction), stays = g * named(t, c.stays);
  exampleCard(X2, Y3, true, two);
  termRow(t, corrTerm, [c.correction], corrQual, [c.correction], X2, Y3 - NAME_GAP - em, {
    alpha: g,
    align: "center",
    inline: true
  });
  check(X2 + EX_W / 2 + NAME_GAP + 12, vy, 22, { color: P.ink, alpha: stays });
  nameText(L("要留下", "Stays"), X2 + EX_W / 2 + NAME_GAP + 36, vy, {
    align: "left",
    alpha: stays
  });
  const [v0, v1] = valueCell(X2 - EX_W / 2 + 34, EX_W - 68);
  beats(t, (v0 + v1) / 2, vy, 22, [c.saved], { alpha: g });
  const qy = Y3 + 280, qw = measure(QUOTE()) + 56, turn = Y3 + EX_H + 40, tried = g * named(t, c.quote2), draw = soon(t, c.quote2 + 0.05, 0.6);
  card(960 - qw / 2, qy - 32, qw, 64, { alpha: g, color: P.ink });
  nameText(QUOTE(), 960, qy, { alpha: g });
  linkSet(
    [
      [960 - qw / 2 + 40, qy - 32, X1, Y3 + EX_H, "vhv", turn],
      [960 + qw / 2 - 40, qy - 32, X2, Y3 + EX_H, "vhv", turn]
    ],
    { alpha: tried, upto: draw, flow: q }
  );
  const fails = g * named(t, c.fails), sx = 960 + qw / 2 - 40, fy = (turn + qy - 32) / 2;
  stopSign(sx, fy, 18, { color: P.ink, alpha: fails });
  nameText(L("过不了第二个例子", "Fails that second example"), sx + 18 + NAME_GAP, fy, {
    align: "left",
    alpha: fails
  });
}
function constraintsStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const names2 = L(
    ["留下", "经授权明确排除", "标明还没解决"],
    ["Kept", "Excluded by an authorized decision", "Marked unresolved"]
  ), kinds = ["pass", "cross", "unknown"], ats = [c.kept, c.excluded, c.unresolved], term = L(["相关的每一条约束"], ["Every relevant constraint"]), qual = L(["都要有个交代"], ["accounted for"]), CW = 280, CH = 190, nw = Math.max(...names2.map((v) => measure(v))), W = CW + 150 + 26 + NAME_GAP + nw, over = Math.max(0, rowHalf(term, qual) - CW / 2), CX = mix(960 - CW / 2, 960 - (W - over) / 2, glideShare(t, c.kept + 0.05, Math.abs(W - over - CW) / 2, 0.9)), CY = 470, rows = [0, 1, 2].map((i) => CY + 50 + i * 45);
  card(CX, CY, CW, CH, { alpha: g });
  recordRows(CX + 36, rows[0], CW - 72, [0, 1, 2], { step: 45, alpha: g, color: P.ink });
  nameText(L("原话", "The original words"), CX + CW / 2, CY - NAME_GAP, {
    valign: "bottom",
    alpha: g * named(t, c.originalAgain)
  });
  termRow(t, term, [c.constraint], qual, [c.accounted], CX + CW / 2, CY + CH + NAME_GAP, {
    alpha: g,
    align: "center"
  });
  const MX = CX + CW + 150;
  names2.forEach((v, i) => {
    const on = g * ramp(t, ats[i] - 0.15, 0.4);
    link(CX + CW - 20, rows[i], MX - 30, rows[i], { alpha: on, upto: soon(t, ats[i] + 0.05, 0.4) });
    if (kinds[i] === "cross") cross(MX, rows[i], 22, { color: P.ink, alpha: on, width: 3.5 });
    else verdictMark(kinds[i], MX, rows[i], 17, { alpha: on });
    nameText(v, MX + 26 + NAME_GAP, rows[i], {
      align: "left",
      alpha: g * listIn(t, ats, i),
      set: "dispositions"
    });
  });
}
var COMPILE_PITCH = 354;
function compileStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const Y3 = 580, come = [c.confirmed, c.compiled, c.checks].reduce(
    (v, at) => v + 1 - glideShare(t, at + 0.05, COMPILE_PITCH / 2, 0.7),
    0
  ), xs = [430, 784, 1138, 1492].map((x) => x + COMPILE_PITCH / 2 * come), mid = (xs[0] + xs[3]) / 2, under = Y3 + 64 + NAME_GAP, over = Y3 - 64 - NAME_GAP, q = flowClock(t);
  const meant = g * named(t, c.interpretation);
  documentIcon(xs[0] - 50, Y3 - 64, 100, 128, { alpha: meant, rows: 3 });
  verdictMark("unknown", xs[0] + 78, Y3 - 72, 20, { alpha: meant });
  const names2 = [
    termRow(
      t,
      L(["理解"], ["The interpretation"]),
      [c.interpretation],
      L(["可以被质疑"], ["open to challenge"]),
      [c.challenge],
      xs[0],
      under,
      { alpha: g, align: "center" }
    )
  ];
  const who = g * named(t, c.confirmed);
  person(xs[1], Y3 - 6, { alpha: who, size: 1.2 });
  seal(xs[1] + 32, Y3 - 46, 16, { color: P.ink, alpha: who, stamp: g * ramp(t, c.accepted, 0.4) });
  names2.push(
    termRow(
      t,
      [L("人", "A person")],
      [c.confirmed],
      [L("确认过、采纳了", "has confirmed and accepted")],
      [c.confirmedQual],
      xs[1],
      under,
      { alpha: g, align: "center" }
    )
  );
  link(xs[0] + 70, Y3, xs[1] - 44, Y3, { alpha: who });
  const rules = g * named(t, c.compiled);
  kernelIcon(xs[2], Y3, 50, {
    alpha: rules,
    color: P.ink,
    beat: ramp(t, c.compiled, 0.3) * (1 - ramp(t, c.compiled + 0.6, 0.4))
  });
  link(xs[1] + 44, Y3, xs[2] - 52, Y3, { alpha: rules, flow: q });
  names2.push(
    termRow(
      t,
      L(["按固定的规则编译"], ["Compiled"]),
      [c.compiled],
      L([], ["by fixed rules"]),
      [c.fixed],
      xs[2],
      under,
      { alpha: g, align: "center" }
    )
  );
  const made = g * named(t, c.checks);
  link(xs[2] + 52, Y3, xs[3] - 24, Y3, { alpha: made });
  stroke(
    () => {
      for (let k = 0; k < 3; k++) {
        const cy = Y3 - 44 + k * 44;
        ctx.moveTo(xs[3] - 14, cy);
        ctx.lineTo(xs[3] - 4, cy + 10);
        ctx.lineTo(xs[3] + 16, cy - 12);
      }
    },
    { color: P.ink, alpha: made, width: 3.5 }
  );
  beats(t, xs[3], Y3, 64, [c.sameChecks], { alpha: g });
  names2.push(nameText(L("检查", "Checks"), xs[3], under, { valign: "top", alpha: made }));
  nameText(L("同样的输入", "The same input"), mid, over, {
    valign: "bottom",
    alpha: g * named(t, c.sameInput)
  });
  nameText(L("同样的检查", "The same checks"), xs[3], over, {
    valign: "bottom",
    alpha: g * named(t, c.sameChecks)
  });
  const refused = g * named(t, c.cannot), ry = Math.max(...names2.map((v) => v.bottom)) + 47;
  link(xs[3], ry, xs[0], ry, {
    alpha: refused,
    dash: [8, 9],
    upto: soon(t, c.cannot + 0.05, 0.6),
    route: "straight"
  });
  cross(mid, ry, 20, { color: P.ink, alpha: refused, width: 3 });
  nameText(L("证明不了", "Cannot prove"), mid, ry + NAME_GAP + 6, {
    valign: "top",
    alpha: refused
  });
}
var LEADS_PITCH = 300;
function leadsStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const names2 = L(["对话", "记忆", "总结"], ["Conversations", "Memories", "Summaries"]), ats = [c.talk, c.memory, c.summaries], room = glideShare(t, c.memory + 0.05, LEADS_PITCH, c.summaries - c.memory + 0.7), xs = [-1, 0, 1].map((k) => 960 + LEADS_PITCH * (k + 1 - room)), Y3 = 620, back = mix(1, 0.58, soon(t, c.leads + 0.05, 0.5));
  ats.forEach((at, i) => {
    const on = g * ramp(t, at - 0.15, 0.4) * back;
    if (i === 0) bubble(xs[i], Y3, 40, { alpha: on, color: P.ink });
    else if (i === 1) layersIcon(xs[i], Y3, 110, 90, { alpha: on });
    else documentIcon(xs[i] - 40, Y3 - 52, 80, 104, { alpha: on, rows: 3 });
    nameText(names2[i], xs[i], Y3 + 52 + NAME_GAP, {
      valign: "top",
      alpha: g * listIn(t, ats, i) * back,
      set: "leads"
    });
  });
  nameText(L("只是线索", "Only leads"), 960, Y3 - 52 - NAME_GAP - 20, {
    valign: "bottom",
    alpha: g * named(t, c.leads)
  });
}

// picture/film/scenes/p04/scene.js
function cuesOf(s) {
  const c = {
    ethos: cue(s, "ETHOS", "So why is ETHOS"),
    contract: cue(s, "产品设计契约", "Product Design Contract"),
    rules: cue(s, "四条判断的准则", "four rules of judgment"),
    first1b: cue(s, "下面用一个例子", "and one example"),
    example: cue(s, "一个例子", "one example"),
    madeUp: cue(s, "例子是假设的", "The example is made up"),
    idea: cue(s, "只为说明道理", "to show the idea"),
    measured: cue(s, "实测", "a measured case"),
    first2: cue(s, "有一条行情", "There is a"),
    pipe: cue(s, "行情数据管线", "market-data pipeline"),
    runAgain: cue(s, "可以再跑一遍", "can be run again"),
    researcher: cue(s, "研究员", "A researcher"),
    dup: cue(s, "不能多出重复的记录", "must not add duplicate records"),
    corrected: cue(s, "厂商更正过", "any value the vendor"),
    first3: cue(s, "经过两次交接", "After two handoffs"),
    handoffs: cue(s, "两次交接", "two handoffs"),
    summary: cue(s, "一个 Agent 写的总结", "an Agent's summary"),
    summaryName: cue(s, "总结", "an Agent's summary"),
    single: cue(s, "只剩下一句", "a single line"),
    oneLine: cue(s, "一句", "a single line"),
    quote: cue(s, "按股票代码和日期去重", "Deduplicate by stock code and date"),
    follow: cue(s, "照这句话去做", "Followed to the letter"),
    corrections: cue(s, "最该留下的那些更正", "the corrections that had to stay"),
    deleted: cue(s, "恰好会被删掉", "would delete exactly"),
    deletedName: cue(s, "被删掉", "would delete exactly"),
    first3c: cue(s, "总结能让人读得快", "The summary made reading faster"),
    fast: cue(s, "读得快", "reading faster"),
    replace: cue(s, "顶替了原话", "takes the place"),
    original: cue(s, "顶替了原话", "the original words"),
    noOne: cue(s, "没人再回头看原话", "no one goes back"),
    first4: cue(s, "第一条准则", "Rule one"),
    statement: cue(s, "用刚好够用的模型", "preserve meaning"),
    keep: cue(s, "留住原意", "that is enough"),
    enough: cue(s, "刚好够用", "preserve meaning"),
    structure: cue(s, "这里说的模型", "smallest model"),
    concepts: cue(s, "概念和结构", "the concepts and structure"),
    big: cue(s, "模型大了", "bigger than it needs to be"),
    unneeded: cue(s, "用不上的概念", "concepts they do not need"),
    small: cue(s, "小到装不下原意", "too small"),
    lost: cue(s, "半路丢掉", "the meaning is lost"),
    first4b: cue(s, "做法是", "The intent goes into"),
    intent: cue(s, "意图", "The intent"),
    into: cue(s, "写进一份正式变更", "goes into"),
    change: cue(s, "正式变更", "one official Change"),
    only: cue(s, "只写在这一处", "only there"),
    f1: cue(s, "要解决什么", "what is to be solved"),
    first5: cue(s, "只写在一处", "With one copy"),
    readers: cue(s, "后面接手的人和 Agent", "everyone who picks up"),
    readersWho: cue(s, "后面接手的人和 Agent", "who picks up the work"),
    same: cue(s, "同一份", "the same thing"),
    first5b: cue(s, "还要拿正例和反例", "Then positive and negative"),
    examples: cue(s, "正例和反例", "positive and negative examples"),
    understood: cue(s, "来考一考对它的理解", "test how it has been understood"),
    exact: cue(s, "一模一样的重复", "An exact repeat"),
    correction: cue(s, "同一天", "A correction to the same stock"),
    fails: cue(s, "过不了第二个例子", "fails that second example"),
    saved: cue(s, "保住了", "saved"),
    first6: cue(s, "原话里相关的每一条约束", "Every relevant constraint"),
    constraint: cue(s, "相关的每一条约束", "Every relevant constraint"),
    accounted: cue(s, "都要有个交代", "accounted for"),
    kept: cue(s, "要么留下", "kept excluded"),
    excluded: cue(s, "经授权明确排除", "excluded by an authorized decision"),
    unresolved: cue(s, "标明还没解决", "marked as unresolved"),
    first6b: cue(s, "理解随时可以被质疑", "The interpretation always"),
    interpretation: cue(s, "理解随时", "The interpretation"),
    challenge: cue(s, "可以被质疑", "open to challenge"),
    confirmed: cue(s, "人确认过", "a person has confirmed"),
    confirmedQual: cue(s, "确认过", "has confirmed"),
    accepted: cue(s, "采纳了的", "and accepted"),
    compiled: cue(s, "按固定的规则编译", "compiled into"),
    fixed: cue(s, "按固定的规则编译", "by fixed rules"),
    checks: cue(s, "检查", "checks"),
    sameInput: cue(s, "同样的输入", "the same input"),
    sameChecks: cue(s, "同样的检查", "the same checks"),
    cannot: cue(s, "证明不了", "cannot prove"),
    first6c: cue(s, "所以对话", "That is why conversations"),
    talk: cue(s, "对话", "conversations"),
    memory: cue(s, "记忆", "memories"),
    leads: cue(s, "只是线索", "only leads")
  };
  c.goes = cueFrom(s, "要去掉", "goes", c.exact);
  c.stays = cueFrom(s, "要留下", "stays", c.correction);
  c.quote2 = cueFrom(s, "按股票代码和日期去重", "Deduplicate by stock code and date", c.correction);
  c.summaries = cueFrom(s, "总结", "summaries", c.memory);
  c.originalAgain = cueFrom(s, "原话", "the original words", c.first6);
  c.f2 = cueFrom(s, "为什么要解决", "why", c.f1);
  c.f3 = cue(s, "做到什么样才算解决", "what counts as solved");
  return c;
}
scenes["04"] = function(s, t) {
  const c = cuesOf(s);
  const A = stageOut(t, c.first1b), A2 = stageIn(t, c.first1b) * stageOut(t, c.first2), B = stageIn(t, c.first2) * stageOut(t, c.first3), C1 = stageIn(t, c.first3) * stageOut(t, c.follow), C2 = stageIn(t, c.follow) * stageOut(t, c.first3c), C3 = stageIn(t, c.first3c) * stageOut(t, c.first4), D1 = stageIn(t, c.first4) * stageOut(t, c.first4b), D2 = stageIn(t, c.first4b) * stageOut(t, c.first5), E1 = stageIn(t, c.first5) * stageOut(t, c.first5b), E2 = stageIn(t, c.first5b) * stageOut(t, c.first6), F1 = stageIn(t, c.first6) * stageOut(t, c.first6b), F2 = stageIn(t, c.first6b) * stageOut(t, c.first6c), F3 = stageIn(t, c.first6c);
  if (A > 0) contractStage(s, t, c, A);
  if (A2 > 0) exampleStage(s, t, c, A2);
  if (B > 0) requestStage(s, t, c, B);
  if (C1 > 0) handoffStage(s, t, c, C1);
  if (C2 > 0) deleteStage(s, t, c, C2);
  if (C3 > 0) replaceStage(s, t, c, C3);
  if (D1 > 0) modelStage(s, t, c, D1);
  if (D2 > 0) changeStage(s, t, c, D2);
  if (E1 > 0) readersStage(s, t, c, E1);
  if (E2 > 0) examplesStage(s, t, c, E2);
  if (F1 > 0) constraintsStage(s, t, c, F1);
  if (F2 > 0) compileStage(s, t, c, F2);
  if (F3 > 0) leadsStage(s, t, c, F3);
  const shown = A2 * ramp(t, c.madeUp - 0.15, 0.4) + B + C1 + C2 + C3 + E2;
  illustrative(shown);
};

// picture/film/scenes/p05/planes.js
var PLANE_W = 700;
var PLANE_H = 58;
var PLANE_STEP = 70;
var PLANES_TOP = 420;
var PLANE_STATES = ["pass", "unknown", "none", "none", "none"];
var planeNames = () => L(
  [["在本地做的完整核验"], ["GitLab 和 GitHub 上的检查"], ["发布"], ["使用"], ["实际效益"]],
  [
    ["The local proof"],
    ["Checks on GitLab and GitHub"],
    ["Release"],
    ["In use"],
    ["Actual benefit"]
  ]
);
var planeQualifier = () => L(["可以在本地接着往下走"], ["may move forward locally"]);
function planeState(kind, x, y, alpha) {
  if (kind === "none") ring(x, y, 15, { color: P.line, alpha, width: 2, dash: [5, 6] });
  else verdictMark(kind, x, y, 16, { alpha });
}
function plane(t, i, x, y, { alpha = 1, at, qualAt = at, stateAt = at, level = 1 }) {
  const on = alpha * ramp(t, at - 0.15, 0.4), cy = y + PLANE_H / 2;
  card(x, y, PLANE_W, PLANE_H, { alpha: on });
  const term = planeNames()[i];
  if (i === 0)
    termRow(t, term, [at], planeQualifier(), [qualAt], x + 24, cy - 15, {
      alpha: alpha * level,
      set: "planes",
      width: PLANE_W - 90
    });
  else nameText(term[0], x + 24, cy, { align: "left", alpha: on * level, set: "planes" });
  planeState(PLANE_STATES[i], x + PLANE_W - 36, cy, alpha * ramp(t, stateAt - 0.15, 0.4));
}
function planeStack(t, x, top, { alpha = 1 } = {}) {
  for (let i = 0; i < 5; i++) plane(t, i, x, top + i * PLANE_STEP, { alpha, at: -Infinity });
}
function claimRow(t, ax, ay, px, py, { alpha = 1, flow = null, nameTop = ay + 22 + NAME_GAP } = {}) {
  const edge = claimPanel(t, px, py, { alpha });
  agents([[ax, ay]], { alpha });
  nameText("Agent", ax, nameTop, { valign: "top", alpha });
  const up = clamp((ay - py) / 60);
  link(ax + 22 * (1 - up), ay - 22 * up, edge.left, py, { route: "vh", alpha, flow, flowEvery: FLOW_EVERY });
  return edge;
}
var CJK = /[\u4e00-\u9fff]/u;
var latinDrop = (name, neighbour) => CJK.test(neighbour) && !CJK.test(name) ? 0.1 * labelSize(LABEL) : 0;
function claimAt(t, c) {
  const w = claimWidth(), rise = glideShare(t, c.local + 0.05, Math.hypot(150, 386), 0.7), gap = mix(560, 260, rise), ax = 960 - (w + gap) / 2;
  return { ax, ay: mix(600, 214, rise), px: ax + gap + w / 2, py: mix(420, 214, rise), rise };
}
function apartStage(s, t, c, g) {
  const { ax, ay, px, py, rise } = claimAt(t, c), under = py + CLAIM_H / 2 + NAME_GAP, rule = L("按 ETHOS 的规则", "By ETHOS's rules");
  claimRow(t, ax, ay, px, py, {
    alpha: g,
    flow: flowClock(t),
    // The Agent's name keeps its gap under the Agent while it rises and joins the panel's line as the two come level,
    // on the baseline of the rule's name beside it.
    nameTop: Math.max(ay + 22, mix(ay + 22, py + CLAIM_H / 2, rise)) + NAME_GAP + rise * latinDrop("Agent", rule)
  });
  const ats = [c.local + 0.35, c.ci, c.release, c.use, c.benefit], stateAts = [c.passed, c.noResult, c.release, c.use, c.noObs], x = 960 - PLANE_W / 2, top = PLANES_TOP + building(t, ats, PLANE_STEP, 0.15);
  termRow(t, [rule], [c.first2], L(["拆开来看"], ["taken apart"]), [c.apart], px, under, {
    alpha: g,
    align: "center"
  });
  ats.forEach(
    (at, i) => plane(t, i, x, top + i * PLANE_STEP, {
      alpha: g,
      at,
      qualAt: c.forward,
      stateAt: stateAts[i],
      level: listLevel(t, ats, i)
    })
  );
}

// picture/film/scenes/p05/boundary.js
var FRAME_TOP = 340;
var PAD = 44;
var PLANE_TOP = FRAME_TOP + 30;
var PLANE_CY = PLANE_TOP + PLANE_H / 2;
var ROW_Y = 540;
var PROGRAM = [160, 84];
var IDENTITY_R = 34;
var FRAME_W = PLANE_W + 2 * PAD;
var RUN = 160;
var names = () => ({
  produces: L("产生证据的程序", ["What produces", "the evidence"]),
  checks: L("核对证据的程序", "What checks it"),
  identity: L("独立控制的身份", ["Independently", "controlled identity"]),
  whether: L("要不要做", "Whether one is needed"),
  decides: L("看风险和规定", "depends on risk and policy")
});
function columnHalf() {
  const n = names(), identity2 = [n.identity].flat().map((v) => measure(v));
  return Math.max(...identity2, measure(n.whether), measure(n.decides, NOTE)) / 2;
}
function planeAt(t, c) {
  const alone = 960 - PLANE_W / 2, whole = FRAME_W + RUN + IDENTITY_R + Math.max(IDENTITY_R, columnHalf()), together = 960 - whole / 2 + PAD;
  return mix(alone, together, glideShare(t, Math.min(c.independent, c.rerun) + 0.05, alone - together, 0.8));
}
function program(x, y, alpha) {
  if (alpha < 0.01) return;
  const [w, h] = PROGRAM;
  terminalIcon(x - w / 2, y - h / 2, w, h, { alpha });
  stroke(
    () => {
      ctx.moveTo(x - w * 0.34, y + 7);
      ctx.lineTo(x + w * 0.2, y + 7);
      ctx.moveTo(x - w * 0.34, y + 23);
      ctx.lineTo(x + w * 0.04, y + 23);
    },
    { color: P.muted, alpha: alpha * 0.8, width: 2.5 }
  );
}
function identity(x, y, alpha) {
  if (alpha < 0.01) return;
  ring(x, y, IDENTITY_R, { color: P.ink, alpha, width: 2.5 });
  person(x, y + 4, { alpha, size: 0.85 });
}
function boundaryStage(s, t, c, g) {
  if (g <= 0) return;
  const px = planeAt(t, c), flow = flowClock(t), n = names(), em = labelSize(LABEL), LX = px + PROGRAM[0] / 2, CX = px + PLANE_W / 2, RX = px + PLANE_W - PROGRAM[0] / 2, nameTop = rowNameTop([ROW_Y + PROGRAM[1] / 2, ROW_Y + IDENTITY_R]), rowLines = Math.max(...[n.produces, n.checks].map((v) => [v].flat().length)), frameBottom = nameTop + em * (1 + LEADING * (rowLines - 1)) + 32;
  plane(t, 0, px, PLANE_TOP, { alpha: g, at: -Infinity });
  beats(t, px + PLANE_W - 36, PLANE_CY, 24, [c.alone], { alpha: g });
  card(px - PAD, FRAME_TOP, FRAME_W, frameBottom - FRAME_TOP, {
    alpha: g * named(t, Math.max(c.edgeWord, c.account - 0.75))
  });
  nameText(L("还有一条边界", "One more boundary"), px - PAD, FRAME_TOP - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: g * named(t, c.edge)
  });
  const account = g * named(t, c.account), produces = g * named(t, c.produces), checks = g * named(t, c.checks), rise = PROGRAM[1] / 2 + 8;
  identity(CX, ROW_Y, account);
  nameText(L("同一个账户", "The same account"), CX, nameTop, { valign: "top", alpha: account });
  [
    [LX, produces, c.produces, n.produces, -1],
    [RX, checks, c.checks, n.checks, 1]
  ].forEach(([x, alpha, at, name, side], i) => {
    program(x, ROW_Y, alpha);
    nameText(name, x, nameTop, { valign: "top", alpha });
    link(CX + side * (IDENTITY_R + 10), ROW_Y, x - side * (PROGRAM[0] / 2 + 10), ROW_Y, {
      alpha,
      upto: soon(t, at + 0.05, 0.5),
      flow: flowClock(t, i / 2),
      flowEvery: FLOW_EVERY
    });
    link(x, ROW_Y - rise, x, PLANE_TOP + PLANE_H + 8, {
      alpha,
      upto: soon(t, at + 0.35, 0.4)
    });
  });
  rejectedName(L("能排除伪造", "Rule out forgery"), CX, frameBottom + NAME_GAP, {
    valign: "top",
    alpha: g * named(t, c.forgery),
    mark: ramp(t, c.forgery + 0.35, 0.35)
  });
  const frameRight = px - PAD + FRAME_W, OX = frameRight + RUN + IDENTITY_R, other = g * named(t, Math.min(c.independent, c.rerun)), rerun = g * named(t, c.rerun);
  identity(OX, PLANE_CY, other);
  const under = nameText(n.identity, OX, PLANE_CY + IDENTITY_R + NAME_GAP, {
    valign: "top",
    alpha: g * named(t, c.independent)
  });
  link(OX - IDENTITY_R - 10, PLANE_CY, px + PLANE_W + 8, PLANE_CY, {
    alpha: rerun,
    upto: soon(t, c.rerun + 0.05, 0.6),
    dash: [8, 9],
    flow
  });
  nameText(L("重跑一遍", "A re-run"), frameRight + RUN / 2, PLANE_CY - NAME_GAP, {
    valign: "bottom",
    alpha: rerun
  });
  link(OX, under.bottom + 12, OX, nameTop - 12, {
    alpha: g * named(t, c.whether),
    upto: soon(t, c.whether + 0.05, 0.4)
  });
  termRow(t, [n.whether], [c.whether], [n.decides], [c.risk], OX, nameTop, {
    alpha: g,
    align: "center",
    inline: false
  });
}

// picture/film/scenes/p08/rail.js
var RAIL_Y = 500;
function journeyRail(x0, x1, { alpha = 1, upto = 1, dash = null } = {}) {
  if (alpha < 0.01 || upto <= 0) return;
  line(x0, RAIL_Y, mix(x0, x1, clamp(upto)), RAIL_Y, { color: P.line, alpha, width: 4, dash });
}
function railFlow(t, x0, x1, { alpha = 1, longest = x1 - x0 } = {}) {
  flowAlong(
    [
      [x0, RAIL_Y],
      [x1, RAIL_Y]
    ],
    flowClock(t),
    6,
    { every: Math.max(FLOW_EVERY, Math.abs(longest) / FLOW_PACE), color: P.line, alpha }
  );
}
function work(x, y = RAIL_Y, alpha = 1) {
  if (alpha < 0.01) return;
  dot(x, y, 10, { color: P.ink, alpha });
  ring(x, y, 19, { color: P.ink, alpha: alpha * 0.6, width: 2 });
}
function ordinal(n, x, y, alpha = 1) {
  if (alpha < 0.01) return;
  text(String(n), x, y + 1, 26, { role: "mark", align: "center", color: P.muted, alpha });
}
function platforms(x, ys, { alpha = 1, w = 150, h = 80 } = {}) {
  if (alpha < 0.01) return;
  stroke(
    () => ys.forEach((y) => {
      ctx.roundRect(x - w / 2, y - h / 2, w, h, 14);
      ctx.moveTo(x - w / 2, y - h / 2 + 26);
      ctx.lineTo(x + w / 2, y - h / 2 + 26);
    }),
    { color: P.ink, alpha, width: 2.5 }
  );
}
function docMark(x, y, w, h, { alpha = 1, rows = 4 } = {}) {
  if (alpha < 0.01) return;
  documentIcon(x, y, w, h, { alpha, rows: 0 });
  if (rows > 0)
    stroke(
      () => {
        for (let i = 0; i < rows; i++) {
          const ry = y + h * (0.3 + i * 0.55 / Math.max(1, rows));
          ctx.moveTo(x + w * 0.14, ry);
          ctx.lineTo(x + w * (i % 2 ? 0.62 : 0.82), ry);
        }
      },
      { color: P.muted, alpha: alpha * 0.8, width: 2 }
    );
}

// picture/film/scenes/p05/rule-two.js
var TOP = PLANES_TOP;
var ASIDE = 400;
var rowOf = (top, i) => top + i * PLANE_STEP + PLANE_H / 2;
var STEPS = [80, 130, 180, 230, 280];
var STEP_R = 12;
var stepsName = () => L("下一步都不一样", "A different next step");
var stepsReach = () => Math.max(STEPS.at(-1) + STEP_R, STEPS[0] - STEP_R + measure(stepsName()));
var separateX = () => 960 - (PLANE_W + stepsReach()) / 2;
var outcomeNames = () => L(["通过", "拦下", "未知"], ["Pass", "Block", "Unknown"]);
var outcomeQuals = () => L(
  [["允许动手"], ["有冲突、明确失败或警告"], ["缺了，或者没法核实"]],
  [
    ["lets work go ahead"],
    ["a conflict, explicit failure or warning"],
    ["missing or unverifiable"]
  ]
);
function outcomesColumns() {
  const mark = PLANE_W + 80, names2 = mark + 18 + NAME_GAP, quals = names2 + Math.max(...outcomeNames().map((v) => measure(v, LABEL))) + TERM_GAP, natural = mark - 18 + measure(L("一次判断的结果", "A judgment")) + TERM_GAP;
  return { mark, names: names2, quals, natural, heading: Math.max(quals, natural) };
}
var columnAt = (c) => Math.min(c.ahead, c.conflict, c.missing);
function outcomesParts(c) {
  const col = outcomesColumns(), names2 = outcomeNames(), quals = outcomeQuals(), qualifier = measure(L("只分三种", "only three outcomes"), NOTE);
  return [
    [c.first4, col.natural + qualifier],
    [columnAt(c), col.heading + qualifier],
    ...[c.pass, c.block, c.unknown].map((at, i) => [at, col.names + measure(names2[i])]),
    ...[c.ahead, c.conflict, c.missing].map((at, i) => [
      at,
      col.quals + measure(quals[i].join(""), NOTE)
    ]),
    [c.never, col.quals + measure(L("不等于可以", "never permission"), NOTE)]
  ];
}
function buildingReach(t, parts2) {
  const [first, ...rest] = [...parts2].sort((a, b) => a[0] - b[0]);
  return reachAt(t, first[1], rest);
}
var outcomesAt = (c) => {
  const parts2 = outcomesParts(c), final = Math.max(...parts2.map(([, reach]) => reach)), first = Math.max(parts2[0][1], parts2[1][1]);
  return 960 - final / 2 + Math.min(50, (final - first) / 4);
};
function ruleTwoHeading(t, c, g) {
  ruleHeading(t, {
    number: L("第二条准则", "Rule two"),
    numberAt: c.first3,
    statement: L("只在影响行动的地方做区分", "Distinguish only what changes action"),
    statementAt: c.statement,
    size: 560,
    glyph: { datum: 1, passages: 1, boundary: 0 },
    shares: { datum: g, hole: 1, passages: soon(t, c.first3 + 0.2, 1.1), boundary: 0 },
    alpha: g
  });
}
function separateStage(s, t, c, g) {
  ruleTwoHeading(t, c, g);
  const x = mix(960 - PLANE_W / 2, separateX(), glideShare(t, c.nextStep + 0.05, stepsReach() / 2, 0.7)), nx = x + PLANE_W, reach = STEPS, steps = g * named(t, c.nextStep), q = flowClock(t);
  planeStack(t, x, TOP, { alpha: g });
  nameText(L("各自独立的证据", "Separate planes of evidence"), x, TOP - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: g * named(t, c.separate)
  });
  linkSet(
    reach.map((d, i) => [nx, rowOf(TOP, i), nx + d - STEP_R, rowOf(TOP, i), "hv"]),
    { alpha: steps, upto: soon(t, c.nextStep + 0.05, 0.6), flow: q, end: false }
  );
  stroke(
    () => reach.forEach((d, i) => {
      ctx.moveTo(nx + d + STEP_R, rowOf(TOP, i));
      ctx.arc(nx + d, rowOf(TOP, i), STEP_R, 0, Math.PI * 2);
    }),
    { color: P.ink, alpha: steps * ramp(t, c.nextStep + 0.3, 0.3), width: 2.5 }
  );
  dot(nx + reach[0], rowOf(TOP, 0), 6, {
    color: P.ink,
    alpha: steps * ramp(t, c.nextStep + 0.6, 0.3)
  });
  nameText(stepsName(), nx + reach[0] - STEP_R, TOP - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: steps
  });
}
function verifiedStage(s, t, c, g) {
  ruleTwoHeading(t, c, g);
  const x = mix(separateX(), ASIDE, glideShare(t, c.first3b + STAGE_CUT, separateX() - ASIDE, 0.7)), one = rowOf(TOP, 0);
  planeStack(t, x, TOP, { alpha: g });
  nameText(L("各自独立的证据", "Separate planes of evidence"), x, TOP - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: g
  });
  beats(t, x + PLANE_W - 36, one, 24, [c.first3b], { alpha: g });
  rejectedName(
    L("另一样也通过", "Another has passed"),
    x + PLANE_W / 2,
    TOP + 5 * PLANE_STEP + 18,
    {
      alpha: g * named(t, c.another),
      mark: ramp(t, c.another + 0.35, 0.35)
    }
  );
  const PX2 = x + PLANE_W + 70 + claimWidth() / 2, PY = rowOf(TOP, 2), edge = claimPanel(t, PX2, PY, { alpha: g }), verified = g * named(t, c.verified);
  beats(t, edge.right, PY, 20, [c.saysDone], { alpha: g });
  link(edge.left, PY, x + PLANE_W, one, {
    route: "hvh",
    alpha: g * named(t, c.tell),
    upto: soon(t, c.tell + 0.05, 0.6),
    flow: flowClock(t)
  });
  nameText(L("实际确认过的", "Verified this time"), PX2, edge.bottom + NAME_GAP, {
    valign: "top",
    alpha: verified
  });
}
function outcomesStage(s, t, c, g) {
  const top = 340, x = outcomesAt(c), col = outcomesColumns(), LX = x + col.mark, em = labelSize(LABEL), names2 = outcomeNames(), quals = outcomeQuals(), kinds = ["pass", "block", "unknown"], ats = [c.pass, c.block, c.unknown], qualAts = [c.ahead, c.conflict, c.missing], ys = [1, 2, 3].map((i) => rowOf(top, i)), qualLeft = x + col.quals;
  planeStack(t, x, top, { alpha: g });
  termRow(
    t,
    L(["一次判断的结果"], ["A judgment"]),
    [c.first4],
    L(["只分三种"], ["only three outcomes"]),
    [c.three],
    LX - 18,
    rowOf(top, 0) - em / 2,
    {
      alpha: g,
      width: 1824 - LX,
      // The qualifier stands in the conditions' column from its words, so it does not move as the column forms.
      qualLeft: x + col.heading
    }
  );
  const restated = [[c.onlyPass], [c.isBlock], [c.isUnknownToo]];
  ats.forEach((at, i) => {
    verdictMark(kinds[i], LX, ys[i], 18, { alpha: g * ramp(t, at - 0.15, 0.4) });
    beats(t, LX, ys[i], 26, restated[i], { alpha: g });
    termRow(t, [names2[i]], [at], quals[i], [qualAts[i]], LX + 18 + NAME_GAP, ys[i] - em / 2, {
      alpha: g * listLevel(t, ats, i),
      set: "outcomes",
      width: 1800 - LX,
      qualLeft
    });
  });
  nameText(L("不等于可以", "never permission"), qualLeft, ys[2] + labelSize(NOTE) * LEADING, {
    align: "left",
    size: NOTE,
    color: P.muted,
    alpha: g * named(t, c.never)
  });
  const two = rowOf(top, 1), example = g * named(t, c.isUnknown);
  beats(t, x + PLANE_W - 36, two, 22, [c.example, c.notYet], { alpha: g });
  link(x + PLANE_W, two, LX - 26, ys[2], {
    route: "hvh",
    alpha: example,
    upto: soon(t, c.isUnknown + 0.05, 0.5),
    flow: flowClock(t)
  });
  rejectedName(L("没有问题", "No problem"), x + PLANE_W / 2, top + 5 * PLANE_STEP + 18, {
    alpha: g * named(t, c.noProblem),
    mark: ramp(t, c.noProblem + 0.35, 0.35)
  });
}
function refusedStage(s, t, c, g) {
  const matterName = L("真正要紧的那几个", "The ones that matter"), top = 320, alone = 960 - PLANE_W / 2, bracketed = 960 - (PLANE_W + 24 + NAME_GAP + measure(matterName)) / 2, x = mix(alone, bracketed, glideShare(t, c.matter + 0.05, alone - bracketed, 0.7)), sy = top + 5 * PLANE_STEP, offered = g * named(t, c.distinction), refused = soon(t, c.never2 + 0.05, 0.5);
  planeStack(t, x, top, { alpha: g });
  card(x, sy, PLANE_W, PLANE_H, { alpha: offered * mix(1, 0.7, refused), dash: [8, 9] });
  termRow(
    t,
    L(["一个区分"], ["A distinction"]),
    [c.distinction],
    L(["改变不了任何行动"], ["would not change any action"]),
    [c.sixth],
    x + 24,
    sy + PLANE_H / 2 - 15,
    { alpha: g * mix(1, 0.62, refused), width: PLANE_W - 80 }
  );
  cross(x + PLANE_W - 36, sy + PLANE_H / 2, 22, { color: P.ink, alpha: g * refused, width: 3.5 });
  beats(t, x + PLANE_W - 36, sy + PLANE_H / 2, 22, [c.changesNone], { alpha: g });
  nameText(
    L("多一样要记着的东西", "One more thing to keep track of"),
    x + PLANE_W / 2,
    sy + PLANE_H + NAME_GAP,
    {
      valign: "top",
      alpha: g * named(t, c.oneMore)
    }
  );
  const matter = g * named(t, c.matter), bx = x + PLANE_W + 24;
  stroke(
    () => {
      ctx.moveTo(bx - 14, top);
      ctx.lineTo(bx, top);
      ctx.lineTo(bx, top + 5 * PLANE_STEP - 12);
      ctx.lineTo(bx - 14, top + 5 * PLANE_STEP - 12);
    },
    { color: P.ink, alpha: matter, width: 2.5 }
  );
  nameText(matterName, bx + NAME_GAP, rowOf(top, 2), {
    align: "left",
    alpha: matter
  });
}

// picture/film/scenes/p05/non-pass.js
var ROWS = [374, 458, 542, 626];
var THING_ROWS = [332, 416, 500, 584, 668];
var KINDS = ["pass", "block", "unknown"];
var MARK_R = 18;
var OVER = 24;
var TICK = 14;
var LEAD = 0.35;
var MID = (ROWS[2] + ROWS[3]) / 2;
var notPassName = () => L("只要不是通过", "Any result other than pass");
var thingNames = () => L(
  ["发生了什么", "为什么停下", "证据，或者缺什么事实", "下一步做什么才安全", "要不要人决定"],
  [
    "What happened",
    "Why that step stopped",
    "Its evidence, or the missing fact",
    "The one safe next action",
    "Whether a person has to decide"
  ]
);
function columns() {
  const list = outcomesColumns(), left = list.mark - MARK_R, right = Math.max(...outcomesParts({}).map(([, reach]) => reach)) - left, bracket = right + NAME_GAP + TICK, note = bracket + NAME_GAP, from = note + measure(notPassName()) + 14, trunk = from + 46, marks = trunk + 64, things = marks + 24 + NAME_GAP;
  return {
    names: list.names - left,
    quals: list.quals - left,
    right,
    bracket,
    note,
    from,
    trunk,
    marks,
    things
  };
}
function parts(c) {
  const col = columns();
  return [
    [c.nonPassFirst, col.right],
    [c.notPass, col.from - 14],
    ...[c.happened, c.why, c.evidence, c.nextSafe, c.person].map((at, i) => [
      at - LEAD,
      col.things + measure(thingNames()[i])
    ])
  ];
}
function thingMark(i, x, y, alpha) {
  if (alpha < 0.01) return;
  if (i === 0) {
    line(x - 20, y, x + 20, y, { color: P.ink, alpha, width: 2.5 });
    dot(x, y, 7, { color: P.ink, alpha });
  } else if (i === 1) askIcon(x, y - 1, 19, { alpha, color: P.ink });
  else if (i === 2) docMark(x - 17, y - 22, 34, 44, { alpha, rows: 3 });
  else if (i === 3) {
    ring(x, y, 17, { color: P.ink, alpha, width: 2.5 });
    dot(x, y, 7, { color: P.ink, alpha });
  } else person(x, y + 5, { alpha, size: 0.8 });
}
function nonPassStage(s, t, c, g) {
  if (g <= 0) return;
  const x = 960 - buildingReach(t, parts(c)) / 2, col = columns(), em = labelSize(LABEL), names2 = outcomeNames(), quals = outcomeQuals(), things = thingNames(), ats = [c.happened, c.why, c.evidence, c.nextSafe, c.person], other = g * named(t, c.notPass), aside = mix(1, 0.62, ramp(t, c.notPass + 0.2, 0.4));
  nameText(L("按 ETHOS 的设计", "By ETHOS's design"), x, ROWS[0], { align: "left", alpha: g });
  KINDS.forEach((kind, i) => {
    const y = ROWS[i + 1], alpha = g * (i ? 1 : aside);
    verdictMark(kind, x + MARK_R, y, MARK_R, { alpha });
    termRow(t, [names2[i]], [-Infinity], quals[i], [-Infinity], x + col.names, y - em / 2, {
      alpha,
      qualLeft: x + col.quals
    });
  });
  const bx = x + col.bracket;
  stroke(
    () => {
      ctx.moveTo(bx - TICK, ROWS[2] - OVER);
      ctx.lineTo(bx, ROWS[2] - OVER);
      ctx.lineTo(bx, ROWS[3] + OVER);
      ctx.lineTo(bx - TICK, ROWS[3] + OVER);
    },
    { color: P.ink, alpha: other, width: 2.5 }
  );
  nameText(notPassName(), x + col.note, MID, { align: "left", alpha: other });
  things.forEach((name, i) => {
    const on = g * named(t, ats[i]);
    link(x + col.from, MID, x + col.marks - 34, THING_ROWS[i], {
      route: "hvh",
      mid: x + col.trunk,
      alpha: on,
      upto: soon(t, ats[i] + 0.05, 0.5),
      flow: flowClock(t, i / 5),
      flowEvery: FLOW_EVERY
    });
    thingMark(i, x + col.marks, THING_ROWS[i], on);
    nameText(name, x + col.things, THING_ROWS[i], {
      align: "left",
      alpha: g * listIn(t, ats, i),
      set: "05.6:things"
    });
  });
}

// picture/film/scenes/p05/scene.js
function cuesOf2(s) {
  const c = {
    first2: cue(s, "按 ETHOS 的规则", "By ETHOS's rules"),
    apart: cue(s, "拆开来看", "taken apart"),
    local: cue(s, "在本地做的完整核验", "The local proof"),
    passed: cue(s, "通过了", "has passed"),
    forward: cue(s, "可以在本地接着往下走", "may move forward locally"),
    ci: cue(s, "GitLab 和 GitHub 上的自动检查", "The automated checks on GitLab"),
    noResult: cue(s, "还没出结果", "no result yet"),
    release: cue(s, "版本还没发布", "Nothing has been released"),
    use: cue(s, "还没有人在用", "No one is using it"),
    benefit: cue(s, "实际效益", "actual benefit"),
    noObs: cue(s, "一点都没观察过", "no observation at all"),
    first3: cue(s, "这就是第二条准则", "That is rule two"),
    statement: cue(s, "只在影响行动的地方做区分", "distinguish only what changes action"),
    separate: cue(s, "各自独立的证据", "separate planes of evidence"),
    nextStep: cue(s, "允许做的下一步都不一样", "permits a different next step"),
    first3b: cue(s, "其中一样通过了", "One of them passing"),
    another: cue(s, "推不出另一样也通过", "never means another has passed"),
    verified: cue(s, "实际确认过的", "were verified this time"),
    saysDone: cue(s, "所以说做完了", "says done"),
    tell: cue(s, "要讲明", "they need to say"),
    edgeFirst: cue(s, "本地核验还有一条边界", "Local proof has one more boundary"),
    edge: cue(s, "还有一条边界", "one more boundary"),
    edgeWord: cue(s, "边界", "boundary"),
    account: cue(s, "同一个账户", "the same account"),
    produces: cue(s, "产生证据的程序", "what produces the evidence"),
    checks: cue(s, "核对证据的程序", "what checks it"),
    alone: cue(s, "光靠本地核验", "local proof alone"),
    forgery: cue(s, "排除不了伪造", "cannot rule out forgery"),
    independent: cue(s, "另一个独立控制的身份", "an independently controlled identity"),
    rerun: cue(s, "重跑一遍", "a re-run"),
    whether: cue(s, "要不要做", "whether one is needed"),
    risk: cue(s, "看风险和规定", "depends on the risk and the policy"),
    first4: cue(s, "一次判断的结果", "A judgment too"),
    three: cue(s, "只分三种", "only three outcomes"),
    block: cue(s, "拦下", "block and unknown"),
    unknown: cue(s, "未知", "unknown"),
    missing: cue(s, "缺了", "Missing or unverifiable"),
    conflict: cue(s, "有冲突", "a conflict, an explicit failure"),
    isUnknownToo: cue(s, "结果是未知", "make it unknown"),
    isBlock: cue(s, "结果是拦下", "makes it block"),
    onlyPass: cue(s, "只有通过", "Only pass"),
    ahead: cue(s, "才允许动手", "lets the work go ahead"),
    never: cue(s, "从来不等于可以", "never permission"),
    example: cue(s, "比如 GitLab 和 GitHub 上的检查", "Take the checks on GitLab"),
    isUnknown: cue(s, "这一项就是未知", "their result is unknown"),
    noProblem: cue(s, "没有问题", "no problem"),
    nonPassFirst: cue(
      s,
      "按 ETHOS 的设计，只要不是通过",
      "ETHOS is designed so that any result other than pass"
    ),
    notPass: cue(s, "只要不是通过", "any result other than pass"),
    happened: cue(s, "发生了什么", "what happened"),
    why: cue(s, "为什么停下", "why that step stopped"),
    evidence: cue(s, "证据是什么", "its evidence"),
    nextSafe: cue(s, "下一步做什么才安全", "the one safe next action"),
    person: cue(s, "要不要人来决定", "whether a person has to decide"),
    first5: cue(s, "反过来", "And a distinction"),
    distinction: cue(s, "一个区分", "a distinction"),
    sixth: cue(s, "改变不了任何行动", "would not change any action"),
    never2: cue(s, "就不去加它", "is never added"),
    oneMore: cue(s, "多一样要记着的东西", "one more thing to keep track of"),
    changesNone: cue(s, "改变不了行动的区分", "one that changes no action"),
    matter: cue(s, "真正要紧的那几个", "the ones that matter")
  };
  c.pass = cueFrom(s, "通过", "pass", c.first4);
  c.notYet = cueFrom(s, "还没出结果", "have not reported yet", c.example);
  return c;
}
scenes["05"] = function(s, t) {
  const c = cuesOf2(s);
  const A = stageOut(t, c.first3), G1 = stageIn(t, c.first3) * stageOut(t, c.first3b), G2 = stageIn(t, c.first3b) * stageOut(t, c.edgeFirst), B = stageIn(t, c.edgeFirst) * stageOut(t, c.first4), H = stageIn(t, c.first4) * stageOut(t, c.nonPassFirst), N = stageIn(t, c.nonPassFirst) * stageOut(t, c.first5), I = stageIn(t, c.first5);
  if (A > 0) apartStage(s, t, c, A);
  if (G1 > 0) separateStage(s, t, c, G1);
  if (G2 > 0) verifiedStage(s, t, c, G2);
  if (B > 0) boundaryStage(s, t, c, B);
  if (H > 0) outcomesStage(s, t, c, H);
  if (N > 0) nonPassStage(s, t, c, N);
  if (I > 0) refusedStage(s, t, c, I);
  illustrative(A + G2);
};

// picture/film/scenes/p06/authority.js
var FULL = { datum: 1, passages: 1, boundary: 1 };
var RULE = () => ({
  number: L("第三条准则", "Rule three"),
  statement: L("把权威依据和视图分开", "Keep authority separate from views"),
  note: L("一次判断可以凭借的东西", "What a judgment may rest on")
});
function ruleThreeHeading(t, c, g) {
  const { number, statement, note } = RULE(), h = ruleHeading(t, {
    number,
    numberAt: c.number,
    statement,
    statementAt: c.statement - 0.2,
    alpha: g
  });
  nameText(note, h.tx, h.bottom + TERM_STACK, {
    align: "left",
    valign: "top",
    size: NOTE,
    color: P.muted,
    alpha: g * named(t, c.restOn)
  });
}
var AUTHORITY_SIZE = 840;
var VIEWS_SIZE = 980;
var VIEWS_Y = 510;
function authorityPlace() {
  const { number, statement } = RULE(), h = ruleHeadingLayout(number, statement, 0, {}), noteBottom = h.bottom + TERM_STACK + labelSize(NOTE), e = markExtent(AUTHORITY_SIZE, FULL);
  return {
    x: 960 - (e.left + e.right) / 2,
    y: noteBottom + labelSize(LABEL) * LEADING - e.top,
    size: AUTHORITY_SIZE
  };
}
var VIEW_RUN = 213;
var VIEW_TEXT = 48;
var VIEW_STEP = 90;
var panelLeft = () => L(-120, -32);
var VIEWS = () => L(
  ["摘要", "看板", "状态输出", "Agent 的汇报"],
  ["Summaries", "Dashboards", "Status output", "An Agent's report"]
);
var GREEN = () => L(["那片绿灯"], ["that green dashboard"]);
var VIEWS_NAME = () => L("给人看的视图", "Views");
var openingOf = (size) => 0.82 * 164 * (size / 512);
function viewsParts(c = {}) {
  const run = openingOf(VIEWS_SIZE) + VIEW_RUN, names2 = VIEWS();
  return [
    [c.views?.[0], run + VIEW_TEXT + Math.max(...names2.map((v) => measure(v)))],
    [c.areViews, run - 32 + measure(VIEWS_NAME())],
    [c.thatGreen, run + VIEW_TEXT + measure(names2[1]) + TERM_GAP + measure(GREEN()[0], NOTE)],
    [c.sentence, run + panelLeft() + claimWidth()]
  ];
}
function viewsReach(t, c) {
  const [first, ...rest] = viewsParts(c).sort((a, b) => a[0] - b[0]);
  return reachAt(t, first[1], rest, 0.8);
}
function viewsPlace(reach = Math.max(...viewsParts().map(([, right]) => right))) {
  const e = markExtent(VIEWS_SIZE, FULL);
  return { x: 960 - (e.left + reach) / 2, y: VIEWS_Y, size: VIEWS_SIZE };
}
function viewsOf({ x, y, size }) {
  const open = x + openingOf(size), vx = open + VIEW_RUN;
  return { open, vx, text: vx + VIEW_TEXT, ys: [-1, 0, 1, 2].map((k) => y + k * VIEW_STEP) };
}
var SOURCES = () => L(
  [
    "用户当下的指令",
    "仓库里的真实内容",
    "已经采纳的正式变更",
    "刚观察到的事实",
    "适用的规则",
    "仍然有效的存证"
  ],
  [
    "Current instruction",
    "Repository contents",
    "Accepted Change",
    "Fresh facts",
    "Applicable policy",
    "Valid attestations"
  ]
);
var SOURCE_ROWS = [-169, -135, -101, 101, 135, 169];
function sources(t, c, g, { x, y, size }) {
  const e = markExtent(size, FULL), axis = x + (e.left + e.right) / 2, k = size / AUTHORITY_SIZE;
  SOURCES().forEach(
    (v, i) => nameText(v, axis, y + SOURCE_ROWS[i] * k, {
      size: NOTE,
      alpha: g * listIn(t, c.sources, i),
      set: "sources"
    })
  );
}
function boundaryMark(t, c, g, { x, y, size }) {
  const k = size / 512;
  ethosMark(x, y, size, {
    datum: g,
    hole: 1,
    passages: 1,
    boundary: soon(t, c.markCut + STAGE_CUT, 1.2),
    alpha: g
  });
  beats(t, x, y, 21 * k, [c.inEthos], { alpha: g });
  nameText(L("权威依据", "Authority"), x - 14 * k - NAME_GAP, y, {
    align: "right",
    alpha: g * named(t, c.authority)
  });
}
function authorityStage(s, t, c, g) {
  const at = authorityPlace();
  boundaryMark(t, c, g, at);
  sources(t, c, g, at);
}
function viewIcon(i, x, y, a) {
  if (i === 0) documentIcon(x - 22, y - 28, 44, 56, { alpha: a, rows: 2, fold: false });
  else if (i === 1) {
    card(x - 30, y - 24, 60, 48, { alpha: a, color: P.ink });
    stroke(
      () => {
        for (let k = 0; k < 3; k++) {
          const cx = x - 16 + k * 16;
          ctx.moveTo(cx - 5, y);
          ctx.lineTo(cx - 1, y + 5);
          ctx.lineTo(cx + 6, y - 5);
        }
      },
      { color: P.ink, alpha: a, width: 2.5 }
    );
  } else if (i === 2) terminalIcon(x - 32, y - 26, 64, 52, { alpha: a });
  else bubble(x, y, 22, { alpha: a, color: P.ink });
}
function views(t, c, g, place, { only = null, flow = null, since = null, linked = true, back = null } = {}) {
  const ats = back === null ? c.views : c.views.map(() => back.at), names2 = VIEWS(), v = viewsOf(place), set = only === null ? "views" : "view";
  names2.forEach((name, i) => {
    if (only !== null && only !== i) return;
    const on = g * ramp(t, ats[i] - 0.15, 0.4);
    if (linked)
      link(v.open - 40, place.y, v.vx - 36, v.ys[i], {
        route: "hvh",
        mid: v.open + 60,
        alpha: back === null ? on : g,
        upto: back === null ? 1 : soon(t, back.cut, 0.4),
        flow: flow ? flowClock(t, i * 0.25) : null,
        flowSince: since === null ? -Infinity : flowClock(since, i * 0.25),
        flowEvery: FLOW_EVERY
      });
    viewIcon(i, v.vx, v.ys[i], on);
    if (i === 1)
      termRow(
        t,
        [name],
        [ats[i]],
        GREEN(),
        [back?.at ?? c.thatGreen],
        v.text,
        v.ys[i] - labelSize(LABEL) / 2,
        {
          alpha: g * (only === null ? listLevel(t, ats, i) : 1),
          set,
          width: 1800 - v.text
        }
      );
    else
      nameText(name, v.text, v.ys[i], {
        align: "left",
        alpha: g * listIn(t, ats, i),
        set
      });
  });
}
function viewsStage(s, t, c, g) {
  const place = viewsPlace(viewsReach(t, c)), v = viewsOf(place);
  boundaryMark(t, c, g, place);
  views(t, c, g, place, { flow: true, since: c.derived + 0.2 });
  nameText(VIEWS_NAME(), v.vx - 32, v.ys[0] - 40 - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: g * named(t, c.areViews)
  });
  const report = g * named(t, c.sentence), py = v.ys[3] + 95, panel = claimPanel(t, v.vx + panelLeft() + claimWidth() / 2, py, { alpha: report });
  link(v.vx, v.ys[3] + 26, v.vx, panel.top, { alpha: report });
  beats(t, v.vx, v.ys[3], 34, [c.suchReport], { alpha: g });
}
var BSTEP = 70;
function branchOf({ x, y }) {
  const bx = x - 180;
  return { bx, by: y - 126, end: bx + 4 * BSTEP, mid: bx + 2 * BSTEP };
}
function innerBranch(a, place, moved, says = null, landed = ramp(moved, 0.6, 0.4)) {
  const b = branchOf(place);
  commitRow(b.bx, BSTEP, b.by, 4, { alpha: a, single: true });
  stroke(
    () => {
      ctx.moveTo(b.bx + 3 * BSTEP + 9, b.by);
      ctx.lineTo(mix(b.bx + 3 * BSTEP + 9, b.end - 9, moved), b.by);
    },
    { color: P.ink, alpha: a * ramp(moved, 0, 0.1), width: 2.5 }
  );
  ring(b.end, b.by, 9, { color: P.ink, alpha: a * landed, width: 3 });
  if (says)
    nameText(says, b.mid, b.by - 22 - NAME_GAP + 8, {
      valign: "bottom",
      alpha: a
    });
}
function staleViewStage(s, t, c, g) {
  const place = viewsPlace(), v = viewsOf(place), cut = c.first5 + STAGE_CUT, back = { cut, at: Math.max(c.computed, cut + 0.25) };
  boundaryMark(t, c, g, place);
  views(t, c, g, place, { only: 1, flow: true, back });
  nameText(L("视图算出来以后", "Computed"), v.text, v.ys[1] - 46, {
    align: "left",
    alpha: g * named(t, L(cut + 0.15, back.at))
  });
  innerBranch(
    g * named(t, c.changes),
    place,
    soon(t, c.changes + 0.05, 0.7),
    L("又变了", "Things change"),
    ramp(t, c.changes + 0.35, 0.45)
  );
  beats(t, v.vx, v.ys[1], 36, [c.notShown, c.turnedGreen], { alpha: g });
  nameText(L("看不出来", "Not shown"), v.text, v.ys[1] + 46, {
    align: "left",
    alpha: g * named(t, c.notShown)
  });
}
function notAuthorityStage(s, t, c, g) {
  const place = viewsPlace(), v = viewsOf(place), b = branchOf(place);
  boundaryMark(t, c, g, place);
  views(t, c, g, place, { only: 1, linked: false });
  innerBranch(g, place, 1);
  nameText(L("帮人看清楚", "Helps people see"), v.text, v.ys[1] - 46, {
    align: "left",
    alpha: g * named(t, c.first5b)
  });
  const refused = g * named(t, c.never), reach = mix(0.45, 1, soon(t, c.act + 0.05, 0.9)) * soon(t, c.never + 0.05, 0.5), counts = L("不是权威依据", "Never counts as authority"), room = v.vx - 30 - 20 - (v.open - 16), mouth = v.open - 16 + room / 2;
  link(v.vx - 36, v.ys[1], b.end, b.by + 22, {
    route: "hv",
    alpha: refused,
    dash: [8, 9],
    upto: reach
  });
  cross(mouth, v.ys[1], 20, { color: P.ink, alpha: refused, width: 3 });
  nameText(counts, mouth, v.ys[1] + 44 - labelSize(LABEL) / 2, {
    valign: "top",
    width: room,
    color: P.muted,
    alpha: refused
  });
  const over = g * named(t, c.overwrite);
  cross(b.end, b.by, 14, { color: P.ink, alpha: over, width: 3 });
  const overwrite = L(["覆盖掉别人的工作"], ["Overwrite"]), whose = L([], ["someone else's work"]);
  termRow(
    t,
    overwrite,
    [c.overwrite],
    whose,
    [c.overwrite],
    b.mid,
    b.by - 22 - NAME_GAP + 8 - termRowLayout(overwrite, whose, Infinity, false).height,
    { alpha: g, align: "center", inline: false }
  );
  const stop = g * named(t, c.cannotPass);
  growName(
    t,
    // The comma comes with the words after it, so the first condition waits for them without a trailing mark.
    L(["不明确", "，或者已经过时"], ["Ambiguous", " or stale"]),
    [c.ambiguous, c.stale],
    v.text,
    318,
    {
      size: NOTE,
      color: P.muted,
      alpha: g,
      build: true
    }
  );
  stopSign(v.vx, 372, 18, { color: P.ink, alpha: stop });
  nameText(L("判断就不能通过", "The judgment cannot pass"), v.text, 372, {
    align: "left",
    alpha: stop
  });
}

// picture/film/scenes/p06/example.js
var AX = 440;
var Y = 530;
var PLAN_X = 860;
var GATE_X = 1080;
var BRANCH_X = 1200;
var STEP = 100;
var HEAD = BRANCH_X + 3 * STEP;
var NEW = HEAD + STEP;
var ROW_NAMES = rowNameTop([Y + 60, Y + 75, Y + 22]);
var COMMIT = 10.5;
var DROP = 60;
var agentName = () => L("另一个 Agent", "A second Agent");
var movedName = () => L("往前走了", "Moved on");
function exampleShift(t, c) {
  const left = AX - 22 - NAME_GAP - measure(agentName()), building2 = 960 - (left + HEAD + COMMIT) / 2, checked = 960 - (left + NEW + Math.max(18 + 1.25, measure(movedName()) / 2)) / 2;
  return mix(building2, checked, glideShare(t, c.changed + 0.05, building2 - checked, 0.8));
}
function exampleContext(t, c, g, { settle = 1, alone = 1110 } = {}) {
  const x = mix(mix(alone, 1110, glideShare(t, c.agent + 0.05, 1110 - alone, 0.8)), 1e3, settle), m = pipelineMark(x, mix(Y, 222, settle), mix(700, 400, settle), {
    alpha: g,
    flow: flowClock(t)
  });
  const name = L("例子", "The example"), w = measure(name);
  nameText(
    name,
    mix(m.runX, m.feedX - 34 - w / 2, settle),
    mix(m.top - NAME_GAP - 15, 222, settle),
    {
      alpha: g * named(t, c.example)
    }
  );
}
function secondAgent(t, c, g) {
  const a = g * ramp(t, c.agent - 0.3, 0.4);
  agents([[AX, Y]], { alpha: a });
  nameText(agentName(), AX - 22 - NAME_GAP, Y, {
    align: "right",
    alpha: a
  });
  return a;
}
function branch(t, g, { moved = 0, landed = moved, nameAlpha = g, nameTop = ROW_NAMES } = {}) {
  commitRow(BRANCH_X, STEP, Y, 4, { alpha: g, single: true });
  nameText(L("分支", "The branch"), BRANCH_X + 1.5 * STEP, nameTop, {
    valign: "top",
    alpha: nameAlpha
  });
  if (moved <= 0.01) return;
  stroke(
    () => {
      ctx.moveTo(HEAD + 9, Y);
      ctx.lineTo(mix(HEAD + 9, NEW - 9, clamp(moved * 1.6)), Y);
    },
    { color: P.ink, alpha: g, width: 2.5 }
  );
  commitDot(NEW, Y, { alpha: g * landed });
}
var plan = (a) => documentIcon(PLAN_X - 48, Y - 60, 96, 120, { alpha: a, rows: 3 });
function staleStage(s, t, c, g) {
  const shift = exampleShift(t, c), settle = glideShare(t, c.remembers + 0.05, 410, 0.8);
  ctx.save();
  ctx.translate(shift, DROP * settle);
  exampleContext(t, c, g, { settle, alone: 960 - shift });
  secondAgent(t, c, g);
  const mem = g * named(t, c.yesterday);
  const MY = Y - 118;
  card(560, MY - 32, 210, 64, { alpha: mem });
  commitRow(596, 70, MY, 3, { alpha: mem, single: true });
  ring(736, MY, 17, { color: P.ink, alpha: mem, width: 2.5 });
  nameText(L("昨天那次提交", "Yesterday's commit"), 665, MY - 32 - NAME_GAP + 6, {
    valign: "bottom",
    alpha: mem
  });
  link(AX, Y - 22, 560, MY, { route: "vh", alpha: mem });
  const board = g * named(t, c.dashboard);
  const DY = Y + 122;
  card(560, DY - 36, 210, 72, { alpha: board });
  stroke(
    () => {
      for (let k = 0; k < 3; k++) {
        const x = 610 + k * 55;
        ctx.moveTo(x - 12, DY);
        ctx.lineTo(x - 3, DY + 10);
        ctx.lineTo(x + 14, DY - 10);
      }
    },
    { color: P.ink, alpha: board, width: 3.5 }
  );
  link(AX, Y + 22, 560, DY, { route: "vh", alpha: g * named(t, c.green) });
  termRow(
    t,
    L(["看板"], ["Its dashboard"]),
    [c.dashboard],
    L(["一片绿灯"], ["all green"]),
    [c.green],
    665,
    DY + 36 + NAME_GAP,
    { alpha: g, align: "center" }
  );
  const planned = g * named(t, c.plan), write = g * named(t, c.write), real = g * named(t, c.branch), changed = g * named(t, c.changed);
  plan(planned);
  nameText(L("编好计划", "A plan"), PLAN_X, ROW_NAMES, { valign: "top", alpha: planned });
  writeGate(GATE_X, Y, 150, { alpha: write, color: P.ink, single: true });
  nameText(L("写入", "Writing"), GATE_X, ROW_NAMES, { valign: "top", alpha: write });
  link(PLAN_X + 48, Y, GATE_X - 30, Y, { alpha: write });
  link(GATE_X + 30, Y, BRANCH_X - 9, Y, { alpha: real });
  branch(t, real, {
    moved: soon(t, c.changed + 0.05, 0.8),
    // The new commit lands over 0.45 s as the line reaches it.
    landed: ramp(t, c.changed + 0.3, 0.45),
    nameTop: mix(Y + COMMIT + NAME_GAP, ROW_NAMES, glideShare(t, c.plan + 0.05, ROW_NAMES - Y - COMMIT - NAME_GAP, 0.6))
  });
  nameText(L("别人可能已经改过了", "May have changed"), NEW + 20, Y - 22 - NAME_GAP, {
    align: "right",
    valign: "bottom",
    alpha: changed
  });
  ctx.restore();
}
function checkStage(s, t, c, g) {
  ctx.save();
  ctx.translate(exampleShift(t, c), DROP);
  exampleContext(t, c, g);
  secondAgent(t, c, g);
  plan(g);
  beats(t, PLAN_X, Y, 70, [c.expected, c.again], { alpha: g });
  nameText(L("编好计划", "A plan"), PLAN_X, ROW_NAMES, {
    valign: "top",
    alpha: g * (1 - ramp(t, c.again - 0.4, 0.25))
  });
  nameText(L("重新编译", "Compiled again"), PLAN_X, ROW_NAMES, {
    valign: "top",
    alpha: g * named(t, c.again)
  });
  writeGate(GATE_X, Y, 150, { alpha: g, color: P.ink, single: true });
  nameText(L("写入", "Writing"), GATE_X, ROW_NAMES, { valign: "top", alpha: g });
  link(AX + 22, Y, PLAN_X - 48, Y, { alpha: g });
  link(PLAN_X + 48, Y, GATE_X - 30, Y, { alpha: g });
  link(GATE_X + 30, Y, BRANCH_X - 9, Y, { alpha: g });
  const p = glideShare(t, c.first1b + 0.1, GATE_X - 36 - PLAN_X - 48, 0.5);
  if (p > 0 && p < 1)
    dot(mix(PLAN_X + 48, GATE_X - 36, p), Y, 9 * ease(p / 0.2) * ease((1 - p) / 0.2), {
      color: P.ink,
      alpha: g
    });
  branch(t, g, { moved: 1 });
  const look = g * named(t, c.checks);
  link(GATE_X, Y - 75, HEAD, Y - 22, {
    route: "hv",
    alpha: look,
    dash: [8, 9],
    upto: soon(t, c.checks + 0.05, 0.6)
  });
  nameText(L("ETHOS 又核对了一遍", "ETHOS checks again"), (GATE_X + HEAD) / 2, Y - 75 - NAME_GAP, {
    valign: "bottom",
    alpha: look
  });
  const moving = glideShare(t, c.movedOn + 0.05, NEW - HEAD, 0.6);
  ring(mix(HEAD, NEW, moving), Y, 18, { color: P.ink, alpha: look, width: 2.5 });
  nameText(movedName(), NEW, ROW_NAMES, {
    valign: "top",
    alpha: g * named(t, cueFrom(s, "往前走了", "moved on", c.movedOn))
  });
  const stop = g * named(t, c.nothing);
  stopSign(GATE_X, Y - 6, 22, { color: P.ink, alpha: stop });
  nameText(L("什么都不写", "Nothing is written"), GATE_X, ROW_NAMES + 46, {
    valign: "top",
    alpha: stop
  });
  const fresh = g * named(t, c.fresh);
  link(NEW, Y - 22, PLAN_X, Y - 60, {
    route: "vhv",
    mid: 340,
    alpha: fresh,
    upto: soon(t, c.fresh + 0.05, 0.8),
    flow: flowClock(t)
  });
  nameText(L("刚观察到的事实", "Fresh facts"), (PLAN_X + NEW) / 2, 340 - NAME_GAP + 6, {
    valign: "bottom",
    alpha: fresh
  });
  ctx.restore();
}
var GX = 700;
var BX = 860;
var BSTEP2 = 110;
function oneStepStage(s, t, c, g) {
  const names2 = rowNameTop([Y + 100, Y + 22]), step = L(["核对和写入"], ["Checking and writing"]), end = BX + 5 * BSTEP2, left = Math.min(GX - 70 - 1.25, GX - measure(step[0]) / 2), unwritten = 960 - (left + BX + 4 * BSTEP2 + COMMIT) / 2, written = 960 - (left + end + 18 + 1.25) / 2;
  ctx.save();
  ctx.translate(mix(unwritten, written, glideShare(t, c.afterwards + 0.05, unwritten - written, 0.6)), 0);
  card(GX - 70, Y - 100, 140, 200, { alpha: g, color: P.ink });
  writeGate(GX, Y, 150, {
    alpha: g,
    color: P.ink,
    single: true,
    open: glideShare(t, c.afterwards + 0.05, 110, 0.6)
  });
  termRow(t, step, [c.first2], L(["一步完成"], ["as one step"]), [c.oneStep], GX, names2, {
    alpha: g,
    align: "center"
  });
  commitRow(BX, BSTEP2, Y, 5, { alpha: g, single: true });
  link(GX + 70, Y, BX - 9, Y, { alpha: g });
  nameText(L("分支", "The branch"), BX + 2 * BSTEP2, names2, { valign: "top", alpha: g });
  const wrote = soon(t, c.afterwards + 0.3, 0.6);
  stroke(
    () => {
      ctx.moveTo(BX + 4 * BSTEP2 + 9, Y);
      ctx.lineTo(mix(BX + 4 * BSTEP2 + 9, end - 9, wrote), Y);
    },
    { color: P.ink, alpha: g * ramp(wrote, 0, 0.1), width: 2.5 }
  );
  const landed = g * ramp(t, c.afterwards + 0.6, 0.45);
  commitDot(end, Y, { alpha: landed, picked: landed });
  const back = g * named(t, c.readBack);
  link(end, Y - 30, GX, Y - 100, {
    route: "vhv",
    mid: 330,
    alpha: back,
    upto: soon(t, c.readBack + 0.05, 0.8),
    flow: flowClock(t)
  });
  planeState("pass", GX, 330, back * ramp(t, c.confirm - 0.15, 0.4));
  nameText(L("读回来确认", "Read back to confirm"), (GX + end) / 2, 330 - NAME_GAP, {
    valign: "bottom",
    alpha: back
  });
  ctx.restore();
}
function platformsStage(s, t, c, g) {
  const VX = 540, LX = 1420, PW = 330, PX2 = (VX + LX) / 2 - PW / 2, ys = [Y - 130, Y, Y + 130], states = ["pass", "block", "none"], names2 = L(["成功", "失败", "还没推"], ["Succeeded", "Failed", "Still pending"]), ats = [c.succeeded, c.failed, c.pending], ends = rowNameTop([Y + 26, Y + 65]), versionName = L("一个版本", "A version"), recordName = L("照实记下", "All recorded"), left = Math.min(VX - 60 - 1.25, VX - measure(versionName) / 2), fanned = 960 - (left + PX2 + PW + 1.25) / 2, whole = 960 - (left + Math.max(LX + 50 + 1.25, LX + measure(recordName) / 2)) / 2, joined = glideShare(t, c.recorded - 0.15, fanned - whole, 0.8);
  ctx.save();
  ctx.translate(mix(fanned, whole, joined), 0);
  const version = g * named(t, c.version);
  tagIcon(VX - 60, Y, 120, 52, { alpha: version, color: P.ink });
  nameText(versionName, VX, mix(Y + 26 + NAME_GAP, ends, joined), {
    valign: "top",
    alpha: version
  });
  const several = g * named(t, c.several);
  nameText(L("几个平台", "Several platforms"), PX2 + PW / 2, ys[0] - 30 - NAME_GAP, {
    valign: "bottom",
    alpha: several
  });
  linkSet(
    ys.map((y) => [VX + 60, Y, PX2, y, "hvh"]),
    { alpha: several, upto: soon(t, c.several + 0.05, 0.5) }
  );
  stroke(() => ys.forEach((y) => ctx.roundRect(PX2, y - 30, PW, 60, 12)), {
    color: P.line,
    alpha: several,
    width: 2.5
  });
  ats.forEach((at, i) => {
    const on = g * ramp(t, at - 0.15, 0.4);
    if (states[i] === "block") stopSign(PX2 + PW - 36, ys[i], 15, { color: P.ink, alpha: on });
    else planeState(states[i], PX2 + PW - 36, ys[i], on);
    nameText(names2[i], PX2 + 24, ys[i], {
      align: "left",
      alpha: g * listIn(t, ats, i),
      set: "platforms"
    });
  });
  const kept = g * named(t, c.recorded);
  linkSet(
    ys.map((y) => [PX2 + PW, y, LX - 56, Y, "hvh"]),
    { alpha: kept, upto: soon(t, c.recorded + 0.05, 0.6), flow: flowClock(t) }
  );
  ledger(LX, Y, 100, 130, { alpha: kept });
  nameText(recordName, LX, ends, { valign: "top", alpha: kept });
  rejectedName(
    L("要么都成功，要么都失败", "All succeed or fail together"),
    PX2 + PW / 2,
    ys[2] + 30 + 70,
    {
      alpha: g * named(t, c.together),
      mark: ramp(t, c.together + 0.35, 0.35)
    }
  );
  ctx.restore();
}

// picture/film/scenes/p06/scene.js
function cuesOf3(s) {
  const c = {
    example: cue(s, "回到例子", "Back to the example"),
    agent: cue(s, "另一个 Agent", "A second Agent"),
    remembers: cue(s, "它记得", "It remembers"),
    branch: cue(s, "分支", "the branch"),
    yesterday: cue(s, "昨天那次提交", "yesterday's commit"),
    dashboard: cue(s, "看板", "its dashboard"),
    green: cue(s, "一片绿灯", "all green"),
    plan: cue(s, "编好计划", "compiling a plan"),
    write: cue(s, "真正写入", "and writing"),
    changed: cue(s, "别人可能已经改过了", "may have changed things"),
    first1b: cue(s, "就在它要写入的那一刻", "At the very moment"),
    checks: cue(s, "ETHOS 又核对了一遍", "ETHOS checks again"),
    movedOn: cue(s, "分支已经往前走了", "the branch has moved on"),
    expected: cue(s, "跟计划里预想的不一样", "what the plan expected"),
    nothing: cue(s, "什么都不写", "nothing is written"),
    fresh: cue(s, "刚观察到的事实", "from fresh facts"),
    again: cue(s, "重新编译计划", "compiled again"),
    first2: cue(s, "核对和写入", "Checking and writing"),
    oneStep: cue(s, "一步完成", "as one step"),
    afterwards: cue(s, "写完以后", "afterwards"),
    readBack: cue(s, "把结果读回来", "the result is read back"),
    confirm: cue(s, "确认", "to confirm"),
    first2b: cue(s, "一个版本推到几个平台", "When a version is pushed"),
    version: cue(s, "一个版本", "a version"),
    several: cue(s, "几个平台", "several platforms"),
    succeeded: cue(s, "成功", "succeeded"),
    failed: cue(s, "失败", "failed"),
    pending: cue(s, "还没推", "still pending"),
    recorded: cue(s, "都照实记下来", "are all recorded"),
    together: cue(s, "要么都成功", "succeed or fail together"),
    first3: cue(s, "这就是第三条准则", "That is rule three"),
    number: cue(s, "第三条准则", "rule three"),
    statement: cue(s, "把权威依据和视图分开", "keep authority separate from views"),
    inEthos: cue(s, "在 ETHOS 里", "In ETHOS"),
    authority: cue(s, "权威依据指的是", "authority means"),
    restOn: cue(s, "一次判断可以凭借的东西", "what a judgment may rest on"),
    first4: cue(s, "摘要", "Summaries"),
    derived: cue(s, "派生", "derived"),
    areViews: cue(s, "给人看的视图", "are views"),
    thatGreen: cue(s, "那片绿灯", "like that green dashboard"),
    sentence: cue(s, "开头那句", "The sentence we began with"),
    suchReport: cue(s, "就是这样一份汇报", "just such a report"),
    first5: cue(s, "视图算出来以后", "Once a view has been computed"),
    computed: cue(s, "算出来", "has been computed"),
    change: cue(s, "情况可能又变了", "things can change"),
    notShown: cue(s, "视图上却看不出来", "without the view showing it"),
    turnedGreen: cue(s, "那片绿灯亮起来的时候", "that dashboard turned green"),
    first5b: cue(s, "视图帮人看清楚", "A view helps people see"),
    never: cue(s, "可它不是权威依据", "but it never counts as authority"),
    act: cue(s, "照着视图去改东西", "Acting on what a view shows"),
    overwrite: cue(s, "覆盖掉别人的工作", "overwrite someone else's work"),
    ambiguous: cue(s, "权威依据不明确", "When authority is ambiguous"),
    stale: cue(s, "或者条件已经过时", "or a condition has gone stale"),
    cannotPass: cue(s, "判断就不能通过", "the judgment cannot pass")
  };
  c.changes = cueFrom(s, "又变了", "change", c.change);
  c.markCut = cueFrom(s, "则", "three", c.number);
  c.sources = cues(s, [
    ["用户当下的指令", "current instruction"],
    ["仓库里的真实内容", "what the repository actually contains"],
    ["已经采纳的正式变更", "the accepted Change"],
    ["刚观察到的事实", "fresh facts"],
    ["适用的规则", "the applicable policy"],
    ["仍然有效的存证", "the attestations"]
  ]);
  c.sources[3] = cueFrom(s, "刚观察到的事实", "fresh facts", c.sources[2]);
  c.views = [
    c.first4,
    cueFrom(s, "看板", "dashboards", c.first4),
    cueFrom(s, "状态输出", "status output", c.first4),
    cueFrom(s, "Agent 的汇报", "an Agent's report", c.first4)
  ];
  return c;
}
scenes["06"] = function(s, t) {
  const c = cuesOf3(s);
  const J1 = stageOut(t, c.first1b), J2 = stageIn(t, c.first1b) * stageOut(t, c.first2), K1 = stageIn(t, c.first2) * stageOut(t, c.first2b), K2 = stageIn(t, c.first2b) * stageOut(t, c.markCut), H3 = stageIn(t, c.first3) * stageOut(t, c.first4), L3 = stageIn(t, c.markCut) * stageOut(t, c.first4), M4 = stageIn(t, c.first4) * stageOut(t, c.first5), N1 = stageIn(t, c.first5) * stageOut(t, c.first5b), N2 = stageIn(t, c.first5b);
  if (J1 > 0) staleStage(s, t, c, J1);
  if (J2 > 0) checkStage(s, t, c, J2);
  if (K1 > 0) oneStepStage(s, t, c, K1);
  if (K2 > 0) platformsStage(s, t, c, K2);
  if (H3 > 0) ruleThreeHeading(t, c, H3);
  if (L3 > 0) authorityStage(s, t, c, L3);
  if (M4 > 0) viewsStage(s, t, c, M4);
  if (N1 > 0) staleViewStage(s, t, c, N1);
  if (N2 > 0) notAuthorityStage(s, t, c, N2);
  illustrative(J1 + J2 + K1 + K2 + M4 + N1 + N2);
};

// picture/film/scenes/p07/example.js
var R1 = 370;
var R2 = 620;
var SCRIPT = [200, 120];
var SHEET = [120, 160];
var OWNER = [170, 120];
var LIST = [140, 170];
var listRows = (y, h, rows = 4, first = 0.3, span = 0.55) => Array.from({ length: rows }, (_, i) => y - h / 2 + h * (first + span * i / (rows - 1)));
function taskList(x, y, w, h, {
  alpha = 1,
  rows = 4,
  done = 0,
  tick = 1,
  last = tick,
  first = 0.3,
  span = 0.55,
  reach = 0.3
} = {}) {
  if (alpha < 0.01) return;
  documentIcon(x - w / 2, y - h / 2, w, h, { alpha, rows: 0 });
  const ys = listRows(y, h, rows, first, span);
  stroke(
    () => ys.forEach((ry) => {
      ctx.roundRect(x - w * 0.32, ry - 7, 14, 14, 3);
      ctx.moveTo(x - w * 0.32 + 26, ry);
      ctx.lineTo(x + w * reach, ry);
    }),
    { color: P.muted, alpha, width: 2 }
  );
  ys.slice(0, done).forEach(
    (ry, i) => check(x - w * 0.32 + 7, ry, 18, { alpha: alpha * (i === done - 1 ? last : tick), width: 3 })
  );
}
function resultCard(x, y, rows, { alpha = 1, w = 170, h = 120 } = {}) {
  if (alpha < 0.01) return;
  box(x - w / 2, y - h / 2, w, h, { fill: P.row, stroke: P.ink, alpha, radius: 8, width: 2.5 });
  stroke(
    () => {
      for (let i = 0; i < rows; i++) {
        const ry = y - h / 2 + h * (i + 1) / (rows + 1);
        ctx.moveTo(x - w * 0.34, ry);
        ctx.lineTo(x + w * (i % 2 ? 0.16 : 0.32), ry);
      }
    },
    { color: P.muted, alpha, width: 2.5 }
  );
}
function declaredCheck(x, y, alpha) {
  repoIcon(x, y, OWNER[0], OWNER[1], { alpha });
  check(x + 24, y + 10, 46, { alpha, width: 4 });
}
var CHECK_NAME = () => L("仓库自己声明的检查", "Declared check");
var NAME_WRAP = 420;
var CONTEXT_W = 400;
var CONTEXT_Y = 250;
function exampleContext2(alpha, flow) {
  const name = L("例子", "The example"), x = 960 + (NAME_GAP + measure(name)) / 2;
  pipelineMark(x, CONTEXT_Y, CONTEXT_W, { alpha, flow });
  nameText(name, x - CONTEXT_W / 2 - NAME_GAP, CONTEXT_Y, { align: "right", alpha });
}
function makings(s, t, a) {
  if (a <= 0) return;
  const [
    moveAt,
    exampleAt,
    agentAt,
    scriptAt,
    sheetAt,
    checkAt,
    dedupAt,
    listAt,
    progressAt,
    retireAt,
    caseAt
  ] = cues(s, [
    ["仓库自己", "the repository's own"],
    ["在例子里", "In the example"],
    ["最早那个 Agent", "the first Agent"],
    ["临时的去重脚本", "temporary deduplication script"],
    ["进度表", "progress sheet"],
    ["仓库自己声明的检查", "declared check"],
    ["去重这项义务", "the obligation to deduplicate"],
    ["正式变更里的任务清单", "the official Change's task list"],
    ["接住了进度", "carries the progress"],
    ["撤掉", "are retired"],
    ["以防万一", "just in case"]
  ]);
  const gone = a * (1 - ramp(t, retireAt + 0.05, 0.4));
  const agentHalf = Math.max(53, measure(L("最早那个 Agent", "The first Agent")) / 2), makingHalf = Math.max(
    SCRIPT[0] / 2,
    nameWidth(L("临时的去重脚本", "Temporary deduplication script"), NAME_WRAP) / 2,
    measure(L("进度表", "Progress sheet")) / 2
  ), ownerHalf = Math.max(
    OWNER[0] / 2,
    nameWidth(CHECK_NAME(), 300) / 2,
    nameWidth(L("正式变更里的任务清单", "The official Change's task list"), NAME_WRAP) / 2
  ), first = 960 - (640 - agentHalf + 1040 + makingHalf) / 2, owned = 960 - (400 - agentHalf + 1330 + ownerHalf) / 2, alone = 960 - 640, start = mix(alone, first, glideShare(t, scriptAt + 0.05, first - alone, 0.9)), lift = glideShare(t, moveAt + 0.05, 1040 + first - 760 - owned, 0.9), settle = glideShare(t, retireAt + 0.05, 1330 + owned - 1150, 0.9);
  const AX2 = mix(640 + start, 400 + owned, lift), MX = mix(1040 + start, 760 + owned, lift), OX = mix(1330 + owned, 1150, settle), AY = 495, flow = flowClock(t);
  exampleContext2(a * named(t, exampleAt) * (1 - ramp(t, checkAt + 0.05, 0.4)), flow);
  agent(AX2, AY, { size: 1.5, alpha: gone });
  ring(AX2, AY, 52, { color: P.line, alpha: gone, width: 2 });
  nameText(L("最早那个 Agent", "The first Agent"), AX2, AY + 52 + NAME_GAP, {
    valign: "top",
    alpha: gone * ramp(t, agentAt - 0.35, 0.4),
    set: "07.1:makings"
  });
  const sIn = gone * named(t, scriptAt), hIn = gone * named(t, sheetAt), mid = AX2 + 125;
  link(AX2 + 52, AY, MX - SCRIPT[0] / 2 - 10, R1, {
    route: "hvh",
    mid,
    alpha: sIn,
    upto: soon(t, scriptAt + 0.05, 0.5),
    flow,
    flowEvery: FLOW_EVERY
  });
  link(AX2 + 52, AY, MX - SHEET[0] / 2 - 10, R2, {
    route: "hvh",
    mid,
    alpha: hIn,
    upto: soon(t, sheetAt + 0.05, 0.5),
    flow: flowClock(t, 0.5),
    flowEvery: FLOW_EVERY
  });
  const top1 = rowNameTop([R1 + SCRIPT[1] / 2, R1 + OWNER[1] / 2]), top2 = rowNameTop([R2 + SHEET[1] / 2, R2 + LIST[1] / 2]);
  terminalIcon(MX - SCRIPT[0] / 2, R1 - SCRIPT[1] / 2, SCRIPT[0], SCRIPT[1], { alpha: sIn });
  nameText(L("临时的去重脚本", "Temporary deduplication script"), MX, top1, {
    valign: "top",
    width: NAME_WRAP,
    alpha: sIn,
    set: "07.1:makings"
  });
  ledger(MX, R2, SHEET[0], SHEET[1], { alpha: hIn });
  nameText(L("进度表", "Progress sheet"), MX, top2, {
    valign: "top",
    alpha: hIn,
    set: "07.1:makings"
  });
  const cIn = a * named(t, checkAt), lIn = a * named(t, listAt);
  declaredCheck(OX, R1, cIn);
  nameText(CHECK_NAME(), OX, top1, {
    valign: "top",
    width: 300,
    alpha: cIn,
    set: "07.1:owners"
  });
  const held = voiceTime(t) - voiceTime(progressAt) - 0.4, ticks = Math.min(4, Math.max(0, Math.floor(held / 1.2) + 1));
  taskList(OX, R2, LIST[0], LIST[1], {
    alpha: lIn,
    done: ticks,
    last: ticks < 4 || held < 4.4 ? Math.min(1, (held - 1.2 * (ticks - 1)) / 0.4) : 1
  });
  nameText(L("正式变更里的任务清单", "The official Change's task list"), OX, top2, {
    valign: "top",
    width: NAME_WRAP,
    alpha: lIn,
    set: "07.1:owners"
  });
  const rows = [
    [
      R1,
      MX + SCRIPT[0] / 2,
      OX - OWNER[0] / 2,
      dedupAt,
      L(["去重这项义务"], ["Obligation"]),
      L([], ["to deduplicate"])
    ],
    [R2, MX + SHEET[0] / 2, OX - LIST[0] / 2, progressAt, L(["进度"], ["Progress"]), []]
  ];
  const lead = Math.min(...rows.map(([, , to]) => to)) - 150, spans = rows.map(([, from, to]) => [mix(from + 12, lead, settle), to - 12]);
  const axis = Math.min(
    (spans[0][0] + spans[0][1] + spans[1][0] + spans[1][1]) / 4,
    ...rows.map(
      ([, , to, , term, qual]) => to - 20 - Math.max(measure(term[0]), ...qual.map((v) => measure(v, NOTE))) / 2
    )
  );
  rows.forEach(([y, , , at, term, qual], i) => {
    const shown = a * named(t, at);
    link(spans[i][0], y, spans[i][1], y, {
      alpha: shown,
      upto: soon(t, at + 0.05, 0.6),
      flow: flowClock(t, 0.5 * i),
      flowEvery: FLOW_EVERY
    });
    termRow(
      t,
      term,
      [at],
      qual,
      [at],
      axis,
      y - 26 - termRowLayout(term, qual, Infinity, false).height,
      {
        alpha: a,
        align: "center",
        inline: false,
        set: "07.1:duties"
      }
    );
  });
  rejectedName(L("以防万一", "Just in case"), 700, AY, {
    alpha: a * named(t, caseAt),
    mark: ramp(t, caseAt + 0.3, 0.4)
  });
}
function ghostScript(x, y, alpha) {
  const [w, h] = SCRIPT;
  box(x - w / 2, y - h / 2, w, h, {
    stroke: P.muted,
    alpha,
    radius: 10,
    width: 2.5,
    dash: [10, 8]
  });
  line(x - w / 2, y - h / 2 + 30, x + w / 2, y - h / 2 + 30, {
    color: P.line,
    alpha,
    dash: [10, 8]
  });
  [0, 1, 2].forEach(
    (i) => dot(x - w / 2 + 20 + i * 18, y - h / 2 + 15, 4, { color: P.muted, alpha })
  );
}
var nameWidth = (v, width = Infinity, size = LABEL) => Math.max(...wrapName(v, width, size).map((line2) => measure(line2, size)));
function ghost(s, t, a) {
  if (a <= 0) return;
  const [backAt, monthsAt, foundAt, resultAt, differAt, trustAt] = cues(s, [
    ["这个脚本要是留着", "If the script stays"],
    ["过几个月", "months later"],
    ["又被人翻出来用", "someone may find it"],
    ["它算出的结果", "its results"],
    ["不一样", "differ"],
    ["该信哪一个", "which to trust"]
  ]);
  const FOUND = L("又被人翻出来用", "Someone"), left = Math.min(390 - 30, 390 - nameWidth(FOUND, 220) / 2), right = Math.max(1310 + OWNER[0] / 2, 1310 + nameWidth(CHECK_NAME(), 300) / 2), DX = 960 - (left + right) / 2, ALONE = 960 - (640 - SCRIPT[0] / 2 + right) / 2;
  const rise = glideShare(t, backAt + 0.2, Math.hypot(1310 + ALONE - 1150, 380 - R1), 0.9), off = mix(ALONE, DX, glideShare(t, foundAt + 0.05, DX - ALONE, 0.9)), CX = mix(1150, 1310 + off, rise), CY = mix(R1, 380, rise), GX2 = 640 + off, FX = 390 + off, QX = 975 + off, Y3 = 380, RY = 625;
  declaredCheck(CX, CY, a);
  nameText(CHECK_NAME(), CX, CY + OWNER[1] / 2 + NAME_GAP, { valign: "top", width: 300, alpha: a });
  const g = a * named(t, backAt), m = a * named(t, monthsAt);
  ghostScript(GX2, Y3, g);
  clock(GX2 + SCRIPT[0] / 2, Y3 - SCRIPT[1] / 2, 22, {
    hand: (voiceTime(t) - voiceTime(monthsAt)) * 0.45 % 1,
    alpha: m
  });
  nameText(L("这个脚本", "The script"), GX2, Y3 + SCRIPT[1] / 2 + NAME_GAP, {
    valign: "top",
    alpha: g
  });
  nameText(L("过几个月", "Months later"), GX2 + SCRIPT[0] / 2 + 38, Y3 - SCRIPT[1] / 2, {
    align: "left",
    alpha: m
  });
  const f = a * named(t, foundAt);
  person(FX, Y3 + 8, { size: 1.3, alpha: f });
  link(FX + 40, Y3, GX2 - SCRIPT[0] / 2 - 10, Y3, { alpha: f, upto: soon(t, foundAt + 0.05, 0.5) });
  nameText(FOUND, FX, Y3 + 60 + NAME_GAP, {
    valign: "top",
    width: 220,
    alpha: f
  });
  const r1 = a * named(t, resultAt), r2 = a * named(t, differAt), q = a * named(t, trustAt);
  resultCard(GX2, RY, 3, { alpha: r1 });
  nameText(L("它算出的结果", "Its results"), GX2, RY + 60 + NAME_GAP, { valign: "top", alpha: r1 });
  resultCard(CX, RY, 4, { alpha: r2 });
  nameText(L("不一样", "The check's results"), CX, RY + 60 + NAME_GAP, {
    valign: "top",
    alpha: r2
  });
  askIcon(QX, RY - 6, 30, { alpha: q, color: P.ink });
  nameText(L("该信哪一个", "Which to trust?"), QX, RY + 60 + NAME_GAP, { valign: "top", alpha: q });
}

// picture/film/scenes/p07/owners.js
function repoGroup(xs, y, w, h, { alpha = 1, checks = 0 } = {}) {
  if (alpha < 0.01) return;
  fill(() => xs.forEach((x) => ctx.roundRect(x - w / 2, y - h / 2, w, h, 12)), {
    color: P.row,
    alpha
  });
  stroke(
    () => xs.forEach((x) => {
      ctx.roundRect(x - w / 2, y - h / 2, w, h, 12);
      const gx = x - w / 2 + 22, gy = y - h / 2 + 18;
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx, gy + 26);
      ctx.moveTo(gx, gy + 18);
      ctx.quadraticCurveTo(gx, gy + 8, gx + 14, gy + 6);
    }),
    { color: P.ink, alpha, width: 2.5 }
  );
  if (checks > 0.01)
    stroke(
      () => xs.forEach((x) => {
        const cx = x + w * 0.16, cy = y + 4, k = 26;
        ctx.moveTo(cx - k * 0.5, cy);
        ctx.lineTo(cx - k * 0.12, cy + k * 0.38);
        ctx.lineTo(cx + k * 0.55, cy - k * 0.42);
      }),
      { color: P.ink, alpha: alpha * checks, width: 3.5 }
    );
}
var GLYPH = 240;
var OPENING = 500;
var FULL2 = { datum: 1, passages: 1, boundary: 1 };
function ruleHeading2(t, { kick, kickAt, rule, ruleAt, settleAt, alpha }) {
  const rest = ruleHeadingLayout(kick, rule, GLYPH, FULL2), lift = 500 - (rest.top + rest.bottom) / 2, wider = Math.max(0, Math.max(...rest.lines.map((v) => measure(v))) - measure(kick, NOTE)), aside = wider / 2 * (1 - glideShare(t, ruleAt + 0.05, wider / 2, 0.7)), open = ruleHeadingLayout(kick, rule, OPENING, FULL2, { dy: lift, cx: 960 + aside }), drift = 0.12 * clamp((voiceTime(t) - voiceTime(kickAt)) / 4), way = Math.hypot(open.mx - rest.mx, open.my - rest.my), q = drift + (1 - drift) * glideShare(t, settleAt + 0.05, way, 0.9), dy = mix(lift, 0, q), TX = mix(open.tx, rest.tx, q), below = labelSize(LABEL) * (LEADING * rest.lines.length + 0.5);
  ethosMark(mix(open.mx, rest.mx, q), mix(open.my, rest.my, q), mix(OPENING, GLYPH, q), { alpha });
  nameText(kick, TX, KICK_Y + dy, {
    align: "left",
    size: NOTE,
    color: P.muted,
    alpha: alpha * named(t, kickAt)
  });
  nameText(rest.lines, TX, RULE_Y + dy, {
    align: "left",
    valign: "top",
    alpha: alpha * named(t, ruleAt)
  });
  return { under: [mix(open.tx, rest.tx, drift), RULE_Y + mix(lift, 0, drift) + below] };
}
function ruleFour(s, t, a) {
  if (a <= 0) return;
  const [kickAt, ruleAt, everyAt, oneAt, sharedAt, ethosAt, eachAt, ownAt] = cues(s, [
    ["第四条准则", "rule four"],
    ["义务没了", "retire a mechanism"],
    ["每一项义务", "Every obligation"],
    ["只有一个归属", "exactly one owner"],
    ["对所有仓库都一样的义务", "the same for every repository"],
    ["归 ETHOS", "belongs to ETHOS"],
    ["每个仓库", "each repository"],
    ["只声明自己特有的检查", "declares only the checks"]
  ]);
  const settleAt = oneAt + 0.25, h = ruleHeading2(t, {
    kick: L("第四条准则", "Rule four"),
    kickAt,
    rule: L("义务没了，机制就退场", ["Retire a mechanism when its obligation disappears"]),
    ruleAt,
    settleAt,
    alpha: a
  });
  const heads = [everyAt, oneAt], duties = [sharedAt, ownAt], owners = [ethosAt, eachAt], flow = flowClock(t), LEG = 770, DUTY = 410, OWN = 580, shift = mix(960 - 690, 0, glideShare(t, eachAt + 0.05, 960 - 690, 0.9)), C1 = 690 + shift, C2 = 1230 + shift, G = [C2 - 110, C2, C2 + 110], KERNEL2 = 34, REPO = [96, 76], ownerTop = rowNameTop([OWN + KERNEL2, OWN + REPO[1] / 2]), e = a * named(t, ethosAt), r = a * named(t, eachAt), o = a * named(t, ownAt);
  const every = L("义务", "Obligation"), one = L("一个归属", "One owner"), KEY_GAP = 12, KEY_RUN = 96, keyWidth = measure(every) + 2 * KEY_GAP + KEY_RUN + measure(one), footX = 960 - keyWidth / 2, [nx, ny] = h.under, keyGo = glideShare(t, settleAt + 0.05, Math.hypot(footX - nx, LEG - ny), 0.9), kx = mix(nx, footX, keyGo), ky = mix(ny, LEG, keyGo);
  nameText(every, kx, ky, {
    align: "left",
    alpha: a * named(t, heads[0]),
    set: "07.3:heads"
  });
  link(kx + measure(every) + KEY_GAP, ky, kx + measure(every) + KEY_GAP + KEY_RUN, ky, {
    alpha: a * named(t, heads[1]),
    upto: soon(t, heads[1] + 0.05, 0.4)
  });
  nameText(one, kx + keyWidth - measure(one), ky, {
    align: "left",
    alpha: a * named(t, heads[1]),
    set: "07.3:heads"
  });
  const d1 = nameText(L("对所有仓库都一样的义务", "The same for every repository"), C1, DUTY, {
    width: 400,
    alpha: a * listIn(t, duties, 0),
    set: "07.3:duties"
  });
  link(C1, d1.bottom + 12, C1, OWN - KERNEL2 - 12, {
    alpha: e,
    upto: soon(t, ethosAt + 0.05, 0.5),
    flow
  });
  kernelIcon(C1, OWN, KERNEL2, { alpha: e, color: P.ink });
  nameText("ETHOS", C1, ownerTop, {
    valign: "top",
    alpha: a * listIn(t, owners, 0),
    set: "07.3:owners"
  });
  const d2 = nameText(L("自己特有的检查", "Its own checks"), C2, DUTY, {
    width: 330,
    alpha: a * listIn(t, duties, 1),
    set: "07.3:duties"
  });
  link(C2, d2.bottom + 12, C2, OWN - REPO[1] / 2 - 12, {
    alpha: o,
    upto: soon(t, ownAt + 0.05, 0.5),
    flow: flowClock(t, 0.5)
  });
  repoGroup(G, OWN, REPO[0], REPO[1], { alpha: r, checks: o });
  nameText(L("每个仓库", "Each repository"), C2, ownerTop, {
    valign: "top",
    alpha: a * listIn(t, owners, 1),
    set: "07.3:owners"
  });
}
function ownRepo(x, y, alpha, ticked) {
  repoIcon(x, y, 180, 110, { alpha });
  check(x + 30, y + 10, 40, { alpha: alpha * ticked, width: 4 });
}
function ownRepository(s, t, a) {
  if (a <= 0) return;
  const [ethosAt, ownAt, allAt, sameAt] = cues(s, [
    ["ETHOS 判断", "ETHOS judges"],
    ["自己的仓库", "its own repository"],
    ["交给所有仓库", "every other one"],
    ["同一套义务", "the same obligations"]
  ]);
  const DX = 960 - (620 - 52 + 1450 + 50) / 2, KX = 620 + DX, LX = 960 + DX, MID2 = 1124 + DX, G = [1210, 1330, 1450].map((x) => x + DX), OWNX = G[1], flow = flowClock(t), o = a * named(t, ownAt), g = a * named(t, allAt), l = a * named(t, sameAt), top = rowNameTop([500 + 60, 500 + 65]);
  kernelIcon(KX, 500, 60, { alpha: a, color: P.ink });
  nameText("ETHOS", KX, top, { valign: "top", alpha: a * named(t, ethosAt) });
  link(KX + 72, 500, OWNX - 102, 330, {
    route: "hvh",
    mid: MID2,
    alpha: o,
    upto: soon(t, ownAt + 0.05, 0.8),
    flow
  });
  link(LX + 50, 500, G[0] - 62, 690, {
    route: "hvh",
    mid: MID2,
    alpha: l,
    upto: soon(t, sameAt + 0.05, 0.6),
    flow: flowClock(t, 0.5)
  });
  ownRepo(OWNX, 330, o, named(t, sameAt + 0.4));
  nameText(L("自己的仓库", "Its own repository"), OWNX, 385 + NAME_GAP, {
    valign: "top",
    alpha: o
  });
  repoGroup(G, 690, 100, 76, { alpha: g, checks: named(t, sameAt + 0.4) });
  nameText(L("所有仓库", "Every other repository"), G[1], 728 + NAME_GAP, {
    valign: "top",
    alpha: g
  });
  ledger(LX, 500, 100, 130, { alpha: l });
  nameText(L("同一套义务", "The same obligations"), LX, top, {
    valign: "top",
    width: 300,
    alpha: l
  });
}
function wayBox(x, y, rows, { alpha = 1, more = 1, extra = 0 } = {}) {
  if (alpha < 0.01) return;
  const w = 230, h = 150, ys = Array.from({ length: rows }, (_, i) => y - h / 2 + h * (i + 1) / (rows + 1));
  box(x - w / 2, y - h / 2, w, h, { fill: P.row, stroke: P.ink, alpha, radius: 12, width: 2.5 });
  ys.forEach((ry, i) => {
    const k = i < rows - extra ? alpha : alpha * more;
    check(x - w * 0.3, ry, 20, { alpha: k, width: 3 });
    line(x - w * 0.16, ry, x + w * 0.34, ry, { color: P.muted, alpha: k });
  });
}
function replacement(s, t, a) {
  if (a <= 0) return;
  const [newAt, weakAt, oldAt] = cues(s, [
    ["拿新做法", "A replacement"],
    ["新的不能比旧的弱", "may never be weaker"],
    ["换掉旧做法", "what it replaces"]
  ]);
  const n = a * named(t, newAt), w = a * named(t, weakAt), o = a * named(t, oldAt), S = mix(L(0, 960 - 1220), 0, glideShare(t, oldAt + 0.05, L(0, 1220 - 960), 0.8));
  wayBox(700 + S, 430, 3, { alpha: o });
  nameText(L("旧做法", "What it replaces"), 700 + S, 505 + NAME_GAP, { valign: "top", alpha: o });
  wayBox(1220 + S, 430, 4, { alpha: n, more: w, extra: 1 });
  link(827 + S, 430, 1093 + S, 430, {
    alpha: Math.min(n, o),
    upto: soon(t, Math.max(newAt, oldAt) + L(0.05, 0.35), 0.6),
    flow: flowClock(t)
  });
  if (en)
    termRow(t, ["A replacement"], [newAt], ["never weaker"], [weakAt], 1220 + S, 505 + NAME_GAP, {
      alpha: a,
      align: "center",
      inline: false
    });
  else {
    nameText("新做法", 1220 + S, 505 + NAME_GAP, { valign: "top", alpha: n });
    nameText("不能比旧的弱", 960, 650, { alpha: w });
  }
}
function closing(s, t, a) {
  if (a <= 0) return;
  const [changeAt, deliveredAt, recordAt, passAt] = cues(s, [
    ["一项正式变更", "And an official Change"],
    ["做到哪儿", "actually delivered"],
    ["没做完的留下记录", "unfinished work stays on the record"],
    ["冒充做完了", "passing for done"]
  ]);
  const DELIVERED = L("做到哪儿", "Delivered"), RECORD = L("没做完的", "Unfinished work"), DY = 440, W = 250, H = 340, ROWS3 = { first: 0.24, span: 0.62, reach: 0.36 }, rowsY = listRows(DY, H, 4, ROWS3.first, ROWS3.span), BX2 = W / 2 + 18, left = Math.min(700 - W / 2, 700 - nameWidth(L("一项正式变更", "An official Change")) / 2), DELIVERED_WIDTH = L(330, 300), delivered = 700 + BX2 + 14 + 2 + NAME_GAP + nameWidth(DELIVERED, DELIVERED_WIDTH), RECORD_DX = Math.max(540, delivered - 700 + 2 * NAME_GAP + 55), right = Math.max(700 + RECORD_DX + 55, 700 + RECORD_DX + nameWidth(RECORD, 300) / 2, delivered), centred = 960 - (left + delivered) / 2, alone = 960 - (left + Math.max(700 + W / 2, 1400 - left)) / 2, first = mix(L(centred, alone), centred, glideShare(t, deliveredAt + 0.05, L(0, centred - alone), 0.7)), whole = 960 - (left + right) / 2, S = mix(first, whole, glideShare(t, recordAt + 0.05, whole - centred, 0.9)), LX = 700 + S, RX = 700 + RECORD_DX + S, RY = (rowsY[2] + rowsY[3]) / 2, top = rowNameTop([DY + H / 2, RY + 70]);
  const c = a * named(t, changeAt), d = a * named(t, deliveredAt), r = a * named(t, recordAt), p = a * named(t, passAt);
  taskList(LX, DY, W, H, { alpha: c, done: 2, tick: d, ...ROWS3 });
  nameText(L("一项正式变更", "An official Change"), LX, top, {
    valign: "top",
    alpha: c
  });
  stroke(
    () => {
      ctx.moveTo(LX + BX2, rowsY[0] - 21);
      ctx.lineTo(LX + BX2 + 14, rowsY[0] - 21);
      ctx.lineTo(LX + BX2 + 14, rowsY[1] + 21);
      ctx.lineTo(LX + BX2, rowsY[1] + 21);
    },
    { color: P.ink, alpha: d, width: 2.5 }
  );
  nameText(DELIVERED, LX + BX2 + 16 + NAME_GAP, (rowsY[0] + rowsY[1]) / 2, {
    align: "left",
    width: DELIVERED_WIDTH,
    alpha: d
  });
  link(LX + BX2 + 4, RY, RX - 62, RY, {
    alpha: r,
    upto: soon(t, recordAt + 0.05, 0.7),
    flow: flowClock(t)
  });
  ledger(RX, RY, 110, 140, { alpha: r });
  nameText(RECORD, RX, top, {
    valign: "top",
    width: 300,
    alpha: r
  });
  rejectedName(L("冒充做完了", "Passing for done"), 960, top + 100, {
    alpha: p,
    mark: ramp(t, passAt + 0.3, 0.4)
  });
}

// picture/film/scenes/p07/retire.js
function gearPath(x, y, r, turn = 0) {
  const teeth = 8, step = Math.PI * 2 / teeth;
  for (let i = 0; i < teeth; i++) {
    const c = turn + i * step;
    [
      [0.78, -0.5],
      [0.78, -0.22],
      [1, -0.16],
      [1, 0.16],
      [0.78, 0.22]
    ].forEach(([k, d], j) => {
      const px = x + r * k * Math.cos(c + d * step), py = y + r * k * Math.sin(c + d * step);
      if (!i && !j) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
  }
  ctx.closePath();
}
var personBottom = (y, size) => y + 22.7 * size;
function upkeep(s, t, a) {
  if (a <= 0) return;
  const [mechAt, maintainAt, explainAt, staleAt] = cues(s, [
    ["每个机制", "Every mechanism"],
    ["有人维护", "someone to maintain"],
    ["有人解释", "explain it"],
    ["过期", "stale"]
  ]);
  const GX2 = 960, GY = 455, R = 100, PY = GY + 10, top = rowNameTop([GY + R, personBottom(PY, 1.3)]), stale = ramp(t, staleAt - 0.15, 0.4), turn = 0.3 * voiceTime(Math.min(t, staleAt + 0.2)), flow = flowClock(t), m = a * named(t, maintainAt), e = a * named(t, explainAt);
  stroke(() => gearPath(GX2, GY, R, turn), { color: P.ink, alpha: a * (1 - stale), width: 3 });
  ring(GX2, GY, R * 0.3, { color: P.ink, alpha: a * (1 - 0.4 * stale), width: 3 });
  stroke(() => gearPath(GX2, GY, R, turn), {
    color: P.line,
    alpha: a * stale,
    width: 3,
    dash: [9, 7]
  });
  nameText(L("每个机制", "Every mechanism"), GX2, top, {
    valign: "top",
    alpha: a * named(t, mechAt)
  });
  nameText(L("过期", "Stale"), GX2, GY - R - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, staleAt)
  });
  person(640, PY, { size: 1.3, alpha: m });
  link(678, GY, GX2 - R - 12, GY, { alpha: m, upto: soon(t, maintainAt + 0.05, 0.5), flow });
  nameText(L("有人维护", "Someone to maintain it"), 640, top, { valign: "top", alpha: m });
  person(1280, PY, { size: 1.3, alpha: e });
  link(1242, GY, GX2 + R + 12, GY, {
    alpha: e,
    upto: soon(t, explainAt + 0.05, 0.5),
    flow: flowClock(t, 0.5)
  });
  nameText(L("有人解释", "Someone to explain it"), 1280, top, { valign: "top", alpha: e });
}
var PILE = [
  [840, 550, 50, 0.1],
  [940, 550, 50, 0.5],
  [1040, 550, 50, 0.2],
  [1140, 550, 50, 0.7],
  [890, 460, 50, 0.35],
  [990, 460, 50, 0.6],
  [1090, 460, 50, 0.15],
  [940, 370, 50, 0.45],
  [1040, 370, 50, 0.25]
];
var PILE_WRAP = 460;
function burden(s, t, a) {
  if (a <= 0) return;
  const [goneAt, govAt, burdenAt] = cues(s, [
    ["已经没有义务的机制", "the ones whose obligation is gone"],
    ["治理本身", "governance itself"],
    ["治理本身就成了负担", "becomes the burden"]
  ]);
  const PILE_NAME = L("没有义务的机制", "Mechanisms without an obligation"), [mx, my, mr] = PILE[4], NX = mx - mr - 30, SHELF = [700, 1280], MIDX = (SHELF[0] + SHELF[1]) / 2, S = 960 - (NX - nameWidth(PILE_NAME, PILE_WRAP) + SHELF[1] + 2) / 2;
  const kept = 1 + Math.floor((PILE.length - 1) * clamp((t - goneAt - 0.05) / 0.6)), sag = 34 * glideShare(t, burdenAt + 0.05, 68, 1.2), depth = (x) => sag * (1 - ((x - MIDX) / (MIDX - SHELF[0])) ** 2), g = a * named(t, goneAt), b = a * named(t, govAt);
  ctx.save();
  ctx.translate(S, 0);
  stroke(
    () => PILE.slice(0, kept).forEach(([x, y, r, turn]) => {
      const cy = y + depth(x);
      gearPath(x, cy, r, turn);
      ctx.moveTo(x + r * 0.3, cy);
      ctx.arc(x, cy, r * 0.3, 0, Math.PI * 2);
    }),
    { color: P.line, alpha: g, width: 3, dash: [9, 7] }
  );
  stroke(
    () => {
      ctx.moveTo(SHELF[0], 602);
      ctx.quadraticCurveTo(MIDX, 602 + 2 * sag, SHELF[1], 602);
    },
    { color: P.ink, alpha: g, width: 4 }
  );
  nameText(PILE_NAME, NX, my + depth(mx), {
    align: "right",
    width: PILE_WRAP,
    alpha: g
  });
  nameText(L("治理本身", "Governance itself"), MIDX, 602 + sag + NAME_GAP + 8, {
    valign: "top",
    alpha: b
  });
  ctx.restore();
}
scenes["07"] = function(s, t) {
  const [ghostAt, ruleAt, ownAt, replAt, changeAt, mechAt, goneAt] = cues(s, [
    ["这个脚本要是留着", "If the script stays"],
    ["这就是第四条准则", "That is rule four"],
    ["ETHOS 判断", "ETHOS judges"],
    ["拿新做法", "A replacement"],
    ["一项正式变更", "And an official Change"],
    ["每个机制", "Every mechanism"],
    ["已经没有义务的机制", "Keep the ones"]
  ]);
  const a1 = stageOut(t, ghostAt), a2 = stageIn(t, ghostAt) * stageOut(t, ruleAt), b = stageIn(t, ruleAt) * stageOut(t, ownAt), c1 = stageIn(t, ownAt) * stageOut(t, replAt), c2 = stageIn(t, replAt) * stageOut(t, changeAt), c3 = stageIn(t, changeAt) * stageOut(t, mechAt), d1 = stageIn(t, mechAt) * stageOut(t, goneAt), d2 = stageIn(t, goneAt);
  illustrative(a1 + a2);
  makings(s, t, a1);
  ghost(s, t, a2);
  ruleFour(s, t, b);
  ownRepository(s, t, c1);
  replacement(s, t, c2);
  closing(s, t, c3);
  upkeep(s, t, d1);
  burden(s, t, d2);
};

// picture/film/scenes/p08/dropped-push.js
var X0 = 240;
var PLATFORM = [140, 76];
var PX = 1680 - PLATFORM[0] / 2;
var CUT = 910;
var CUT_GAP = 34;
var FROM = 620;
var STOP = CUT - 70;
var ASK = [1240, 350];
var ASK_R = 28;
var ROW_Y2 = 700;
var DOC = [44, 56];
var NOTE_X = 420;
var REPORT_X = 1140;
var NEXT_X = 1510;
var STEP_R2 = 17;
function droppedPush(s, t, a) {
  if (a <= 0) return;
  const [nameAt, dropAt, againAt, landedAt, writeAt, noteAt, afterAt, writtenAt, nextAt] = cues(s, [
    ["要是推到一半断了线", "the connection drops"],
    ["断了线", "drops"],
    ["顺手再推一遍", "Just push again"],
    ["也许已经成了", "may already have landed"],
    ["耗时的写入", "a long write"],
    ["先记下要做什么", "first notes"],
    ["事后说清楚", "afterwards reports"],
    ["写进去没有", "whether anything was written"],
    ["下一步做什么才安全", "the one safe next action"]
  ]);
  const whatAt = cueFrom(s, "要做什么", "what it is about to do", noteAt), firstAt = cueFrom(s, "上一次", "The first push", againAt);
  const dropped = ramp(t, dropAt - 0.1, 0.4), wx = mix(FROM, STOP, glideShare(t, nameAt, STOP - FROM, 0.9)), below = rowNameTop([RAIL_Y + PLATFORM[1] / 2, RAIL_Y + 19]), rowTop = rowNameTop([ROW_Y2 + DOC[1] / 2, ROW_Y2 + STEP_R2]);
  const end = mix(PX + PLATFORM[0] / 2, PX - PLATFORM[0] / 2 - 8, soon(t, firstAt - 0.25, 0.35));
  journeyRail(X0, CUT - CUT_GAP, { alpha: a });
  journeyRail(CUT - CUT_GAP, CUT + CUT_GAP, { alpha: a * (1 - dropped) });
  journeyRail(CUT + CUT_GAP, end, { alpha: a * (1 - dropped) });
  journeyRail(CUT + CUT_GAP, end, { alpha: a * dropped, dash: [12, 10] });
  railFlow(t, X0, STOP, { alpha: a * (1 - dropped) });
  cross(CUT, RAIL_Y, 22, { color: P.ink, alpha: a * dropped, width: 3.5 });
  work(wx, RAIL_Y, a);
  nameText(L("推到一半，断了线", "The connection drops"), CUT, below, {
    valign: "top",
    alpha: a * named(t, nameAt)
  });
  const first = a * named(t, firstAt);
  platforms(PX, [RAIL_Y], { alpha: first, w: PLATFORM[0], h: PLATFORM[1] });
  nameText(L("上一次", "The first push"), PX, below, { valign: "top", alpha: first });
  verdictMark("unknown", PX, RAIL_Y + 13, 15, { alpha: a * named(t, landedAt) });
  const again = a * named(t, againAt);
  link(STOP, RAIL_Y - 26, ASK[0] - ASK_R - 8, ASK[1], {
    route: "vh",
    alpha: again,
    upto: soon(t, againAt + 0.05, 0.7),
    dash: [8, 9],
    end: false
  });
  askIcon(ASK[0], ASK[1], ASK_R, { alpha: a * named(t, againAt + 0.35), color: P.ink });
  nameText(L("再推一遍？", "Push again?"), ASK[0], ASK[1] - ASK_R - NAME_GAP, {
    valign: "bottom",
    alpha: again
  });
  nameText(L("耗时的写入", "A long write"), (X0 + STOP) / 2, RAIL_Y - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, writeAt)
  });
  const note = a * named(t, noteAt);
  link(NOTE_X, ROW_Y2 - DOC[1] / 2 - 10, NOTE_X, RAIL_Y + 6, {
    alpha: note,
    upto: soon(t, noteAt + 0.05, 0.5)
  });
  docMark(NOTE_X - DOC[0] / 2, ROW_Y2 - DOC[1] / 2, DOC[0], DOC[1], { alpha: note, rows: 3 });
  termRow(
    t,
    [L("先记下", "First notes")],
    [noteAt],
    [L("要做什么", "what it is about to do")],
    [whatAt],
    NOTE_X,
    rowTop,
    { alpha: a, align: "center", inline: false }
  );
  const report = a * named(t, afterAt);
  link(REPORT_X, ROW_Y2 - DOC[1] / 2 - 10, REPORT_X, RAIL_Y + 6, {
    alpha: report,
    upto: soon(t, afterAt + 0.05, 0.5)
  });
  docMark(REPORT_X - DOC[0] / 2, ROW_Y2 - DOC[1] / 2, DOC[0], DOC[1], { alpha: report, rows: 3 });
  termRow(
    t,
    [L("事后说清楚", "Afterwards reports")],
    [afterAt],
    [L("写进去没有", "whether anything was written")],
    [writtenAt],
    REPORT_X,
    rowTop,
    { alpha: a, align: "center", inline: false }
  );
  const next = a * named(t, nextAt);
  link(REPORT_X + DOC[0] / 2 + 10, ROW_Y2, NEXT_X - STEP_R2 - 10, ROW_Y2, {
    alpha: next,
    upto: soon(t, nextAt + 0.05, 0.5),
    flow: flowClock(t)
  });
  ring(NEXT_X, ROW_Y2, STEP_R2, { color: P.ink, alpha: next, width: 2.5 });
  dot(NEXT_X, ROW_Y2, 7, { color: P.ink, alpha: next });
  nameText(L("下一步做什么才安全", "The one safe next action"), NEXT_X, rowTop, {
    valign: "top",
    alpha: next
  });
}

// picture/film/scenes/p08/lane.js
var REQ = [120, 150];
var REQ_X = 250;
var requirement = (alpha) => docMark(REQ_X - REQ[0] / 2, RAIL_Y - REQ[1] / 2, REQ[0], REQ[1], { alpha, rows: 4 });
var PITCH = (1556 - REQ_X) / 4;
var XS = () => [0, 1, 2, 3, 4].map((k) => REQ_X + k * PITCH);
var STATION_WRAP = () => L(240, 340);
var STATIONS = () => [
  L("研究员的要求", "Researcher's request"),
  L("正式变更", "Official Change"),
  L("工作通道", "Work Lane"),
  L("再查一次", "One more check"),
  L("受版本管理的文件", ["File under version control"])
];
function stationsShift() {
  const names2 = STATIONS(), xs = XS(), width = Math.min(STATION_WRAP(), PITCH - 30), left = Math.min(REQ_X - REQ[0] / 2, xs[0] - nameWidth(names2[0], width) / 2), right = Math.max(1680 + 2, xs[4] + nameWidth(names2[4], width) / 2);
  return 960 - (left + right) / 2;
}
var LEASE_Y = 405;
function lane(s, t, a) {
  if (a <= 0) return;
  const [reqAt, changeAt, laneAt, holdAt, untilAt, fileAt, checkAt, writeAt] = cues(s, [
    ["研究员的要求", "The researcher's request"],
    ["正式变更", "official Change"],
    ["工作通道", "Work Lane"],
    ["由谁持有", "who holds that lane"],
    ["持有到什么时候", "until when"],
    ["受版本管理的文件", "file under version control"],
    ["再查一次", "checks once more"],
    ["能不能写", "whether the write may go ahead"]
  ]);
  const ats = [reqAt, changeAt, laneAt, checkAt, fileAt], lists = [
    [reqAt, changeAt],
    [laneAt, fileAt, checkAt]
  ].map((v) => v.sort((p, q) => p - q)), level = (i) => {
    const list = lists.find((v) => v.includes(ats[i]));
    return a * listIn(t, list, list.indexOf(ats[i]));
  }, shown = (i) => a * named(t, ats[i]), xs = XS(), [x0, x1, x2, x3, x4] = xs;
  ctx.save();
  ctx.translate(stationsShift(), 0);
  journeyRail(REQ_X + REQ[0] / 2 + 8, 1680, { alpha: a * clearOfTitle(s, t, RAIL_Y) });
  railFlow(t, REQ_X + 70, 1680, { alpha: a * soon(t, reqAt + 0.05, 0.4) });
  requirement(a * clearOfTitle(s, t, RAIL_Y - REQ[1] / 2));
  docMark(x1 - 75, RAIL_Y - 85, 150, 170, { alpha: shown(1), rows: 5 });
  folderIcon(x2 - 36, RAIL_Y - 29, 72, 58, { alpha: shown(2) });
  link(x2 + 44, RAIL_Y, x3 - 40, RAIL_Y, {
    color: P.ink,
    width: 3,
    alpha: shown(2),
    upto: soon(t, laneAt + 0.05, 0.8),
    end: false
  });
  writeGate(x3, RAIL_Y, 110, { alpha: shown(3), open: glideShare(t, writeAt + 0.05, 70, 0.6) });
  docMark(x4 - 45, RAIL_Y - 57, 90, 115, { alpha: shown(4), rows: 3 });
  railNames(STATIONS(), xs, RAIL_Y + 85, {
    alpha: level,
    set: "08.2:stations",
    wrap: STATION_WRAP()
  });
  const lease = [holdAt, untilAt], hx = mix(x2, x3, 0.2), ux = mix(x2, x3, 0.8), leaseWrap = L(230, Math.min(230, ux - hx - 30)), h = a * named(t, holdAt), u = a * named(t, untilAt);
  agent(hx, LEASE_Y, { size: 0.9, alpha: h });
  clock(ux, LEASE_Y, 20, { hand: 0.62, alpha: u });
  link(hx, RAIL_Y - 6, hx, LEASE_Y + 30, {
    alpha: h,
    upto: soon(t, holdAt + 0.05, 0.5),
    end: false
  });
  link(ux, RAIL_Y - 6, ux, LEASE_Y + 30, {
    alpha: u,
    upto: soon(t, untilAt + 0.05, 0.5),
    end: false
  });
  nameText(L("由谁持有", "Who holds that lane"), hx, LEASE_Y - 34, {
    valign: "bottom",
    width: leaseWrap,
    alpha: a * listIn(t, lease, 0),
    set: "08.2:lease"
  });
  nameText(L("持有到什么时候", "Until when"), ux, LEASE_Y - 34, {
    valign: "bottom",
    width: leaseWrap,
    alpha: a * listIn(t, lease, 1),
    set: "08.2:lease"
  });
  const wx = glideSteps(
    t,
    x0 + REQ[0] / 2 + 22,
    [
      [changeAt, x1 + 75 + 22],
      [laneAt, x2 + 36 + 26],
      [fileAt, x3 - 30 - 24],
      [writeAt, x3 + 30 + 26]
    ],
    0.9
  );
  work(wx, RAIL_Y, a * clearOfTitle(s, t, RAIL_Y));
  ctx.restore();
}
var SOURCES2 = () => [
  [L("刚观察到的事实", "Fresh facts"), L("现在是什么样子", "as it is now")],
  [L("正式变更", "The Change"), L("做到什么样才算完", "what counts as done")],
  [L("已有的存证", "Attestations"), L("哪些核验已经通过", "which proofs have passed")]
];
var ROWS2 = [360, 500, 640];
var ORDER_X = 1140;
var ICON_X = 1195;
var TEXT_X = 1235;
function sourceMark(i, x, y, alpha) {
  if (i === 0) {
    ring(x, y, 18, { color: P.ink, alpha, width: 2.5 });
    dot(x, y, 6, { color: P.ink, alpha });
  } else if (i === 1) docMark(x - 18, y - 24, 36, 48, { alpha, rows: 2 });
  else seal(x, y, 20, { alpha, color: P.ink });
}
function handoff(s, t, a) {
  if (a <= 0) return;
  const [halfAt, endsAt, overAt, memoryAt, factsAt, nowAt, changeAt, doneAt, attestAt, passedAt] = cues(s, [
    ["做到一半", "Halfway through"],
    ["会话结束了", "session ends"],
    ["接手的 Agent", "the Agent that takes over"],
    ["前一个的记忆", "the last one's memory"],
    ["刚观察到的事实", "fresh facts"],
    ["现在是什么样子", "as it is now"],
    ["再读正式变更", "reads the Change"],
    ["做到什么样才算完", "what counts as done"],
    ["已有的存证", "attestations already"],
    ["哪些核验已经通过", "which proofs have passed"]
  ]);
  const sources2 = SOURCES2(), terms = [factsAt, changeAt, attestAt], tells = [nowAt, doneAt, passedAt], reach = Math.max(...sources2.flatMap(([term, tell]) => [measure(term), measure(tell, NOTE)]));
  const S = 960 - (560 - 320 - 2 + TEXT_X + reach) / 2, alone = 960 - (560 + 820) / 2, reading = glideShare(t, factsAt - 0.4, alone - S, 0.8), off = mix(alone, S, reading), AX2 = 560 + off, BX2 = 820 + off, AY = 410, railEnd2 = BX2 + 60 + 280 * (1 - glideShare(t, factsAt - 0.4, 280, 1.2)), ended = ramp(t, endsAt - 0.15, 1.2), passed = glideShare(t, overAt + 0.05, 820 - 560, 0.9), b = a * named(t, overAt), m = a * named(t, memoryAt), WX = mix(AX2, BX2, passed), flow = flowClock(t);
  journeyRail(AX2 - 320, BX2 + 60, { alpha: a });
  journeyRail(BX2 + 60, railEnd2, { alpha: a });
  railFlow(t, AX2 - 320, railEnd2, { alpha: a, longest: BX2 + 340 - (AX2 - 320) });
  work(WX, RAIL_Y, a);
  nameText(L("做到一半", "Halfway through"), WX, RAIL_Y + 30, {
    valign: "top",
    alpha: a * named(t, halfAt)
  });
  agent(AX2, AY, { size: 1.1, alpha: a * (1 - 0.5 * ended) });
  ring(AX2, AY, 34, { color: P.line, alpha: a * ended, width: 2, dash: [6, 6] });
  link(AX2, AY + 28, AX2, RAIL_Y - 20, { alpha: a * (1 - passed) });
  nameText(L("会话结束了", "Session ends"), AX2, AY - 40, {
    valign: "bottom",
    alpha: a * named(t, endsAt)
  });
  agent(BX2, AY, { size: 1.1, alpha: b });
  link(BX2, AY + 28, BX2, RAIL_Y - 20, { alpha: b * passed, upto: passed });
  const taker = L(["接手的 Agent"], ["The Agent"]), takes = L([], ["that takes over"]);
  termRow(
    t,
    taker,
    [overAt],
    takes,
    [overAt],
    BX2,
    AY - 40 - termRowLayout(taker, takes, Infinity, false).height,
    { alpha: a, align: "center", inline: false }
  );
  bubble((AX2 + BX2) / 2, RAIL_Y + 80, 18, { alpha: m, color: P.muted });
  rejectedName(L("前一个的记忆", "The last one's memory"), (AX2 + BX2) / 2, RAIL_Y + 130, {
    alpha: m,
    mark: ramp(t, memoryAt + 0.3, 0.4)
  });
  sources2.forEach(([term, tell], i) => {
    const y = ROWS2[i], r = a * named(t, terms[i]);
    link(BX2 + 30, AY, ORDER_X + S - 20, y, {
      route: "hvh",
      mid: ORDER_X + S - 60,
      alpha: r,
      upto: soon(t, Math.max(terms[i], factsAt + 0.45) + 0.05, 0.6),
      flow: flowClock(t, i / 3),
      flowEvery: FLOW_EVERY
    });
    ordinal(i + 1, ORDER_X + S + 4, y, r);
    sourceMark(i, ICON_X + S, y, r);
    nameText(term, TEXT_X + S, y, {
      align: "left",
      alpha: a * listIn(t, terms, i),
      set: "08.3:order"
    });
    nameText(tell, TEXT_X + S, y + labelSize(LABEL) / 2 + 8, {
      align: "left",
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: a * listIn(t, tells, i),
      set: "08.3:tells"
    });
  });
}

// picture/film/scenes/p08/release.js
function proofMark(x, y, alpha) {
  ring(x, y, 26, { color: P.ink, alpha, width: 2.5 });
  check(x, y + 1, 26, { alpha, width: 3.5 });
}
function release(s, t, a) {
  if (a <= 0) return;
  const [doneAt, commitAt, proofAt, attestAt, reviewAt, branchAt, publishAt, eachAt, ownAt] = cues(
    s,
    [
      ["改完以后", "When the work is committed"],
      ["这次提交", "that exact commit"],
      ["完整的核验", "a full local proof"],
      ["留下存证", "leaves an attestation"],
      ["维护者审阅", "A maintainer reviews"],
      ["受保护的开发分支", "the protected development branch"],
      ["分别发布", "published to each platform"],
      ["每一个平台", "each platform"],
      ["单独确认", "confirmed on its own"]
    ]
  );
  const DONE = L("改完以后", "The work"), OWN = L("单独确认", "Confirmed on its own"), EACH = L("每一个平台", "Each platform"), left = Math.min(220 - 2, 260 - nameWidth(DONE, 300) / 2), right = 1680 + Math.max(70, nameWidth(OWN) / 2, nameWidth(EACH) / 2), S = 960 - (left + right) / 2;
  const WX = 260 + S, CX = 570 + S, AX2 = 820 + S, MX = 1070 + S, BX2 = 1270 + S, PX2 = 1680 + S, UP = 410, PY = [345, 655], above = Math.min(UP - 26, UP - 22, UP + 4 - 2.15 * 15 * 1.15) - NAME_GAP, below = rowNameTop([RAIL_Y + 23, RAIL_Y + 19]), c = a * named(t, commitAt), p = a * named(t, proofAt), at = a * named(t, attestAt), m = a * named(t, reviewAt), br = a * named(t, branchAt), each = a * named(t, eachAt);
  const back = 1760 + S - BX2 - 90, end = mix(1760 + S, BX2 + 90, glideShare(t, eachAt - 0.3 - glideTime(back, 0.5), back, 0.5));
  journeyRail(220 + S, end, { alpha: a });
  railFlow(t, 220 + S, end, { alpha: a, longest: 1540 });
  const finisher = a * (1 - ramp(t, proofAt + 0.3, 0.5));
  agent(WX, UP, { size: 1.45, alpha: finisher });
  link(WX, UP + 36, WX, RAIL_Y - 22, { alpha: finisher, end: false });
  nameText(DONE, WX, below, {
    valign: "top",
    width: 300,
    alpha: finisher * named(t, doneAt)
  });
  commitDot(CX, RAIL_Y, { alpha: c, r: 14, picked: c });
  nameText(L("这次提交", "That exact commit"), CX, below, { valign: "top", alpha: c });
  proofMark(CX, UP, p);
  link(CX, UP + 30, CX, RAIL_Y - 24, { alpha: p, upto: soon(t, proofAt + 0.05, 0.4) });
  nameText(L("本地的完整核验", "A full local proof"), CX, above, { valign: "bottom", alpha: p });
  link(CX + 30, UP, AX2 - 34, UP, { alpha: at, upto: soon(t, attestAt + 0.05, 0.5) });
  seal(AX2, UP, 22, { alpha: at, color: P.ink });
  nameText(L("存证", "Attestation"), AX2, above, { valign: "bottom", alpha: at });
  person(MX, UP + 4, { size: 1.15, alpha: m });
  link(MX, UP + 40, MX, RAIL_Y - 12, { alpha: m, upto: soon(t, reviewAt + 0.05, 0.5) });
  if (en) {
    const term = ["A maintainer"], qual = ["reviews and authorizes"], { height } = termRowLayout(term, qual, 300, false);
    termRow(t, term, [reviewAt], qual, [reviewAt], MX, above - height, {
      width: 300,
      alpha: a,
      align: "center",
      inline: false
    });
  } else nameText("维护者审阅、授权", MX, above, { valign: "bottom", width: 300, alpha: m });
  commitRow(BX2 - 60, 40, RAIL_Y, 4, { alpha: br, single: true });
  lock(BX2, RAIL_Y - 52, { alpha: br, color: P.ink, size: 0.9 });
  nameText(L("受保护的开发分支", "The protected development branch"), BX2, below, {
    valign: "top",
    width: 480,
    alpha: br
  });
  PY.forEach(
    (y, i) => link(BX2 + 102, RAIL_Y, PX2 - 82, y, {
      route: "hvh",
      mid: BX2 + 250,
      alpha: each,
      upto: soon(t, eachAt + 0.05 + 0.25 * i, 0.6),
      flow: flowClock(t, 0.5 * i),
      flowEvery: FLOW_EVERY
    })
  );
  platforms(PX2, PY, { alpha: each, w: 140, h: 76 });
  nameText(EACH, PX2, RAIL_Y, { alpha: each });
  PY.forEach(
    (y, i) => check(PX2 + 34, y + 12, 26, { alpha: a * named(t, ownAt + 0.7 * i), width: 3.5 })
  );
  nameText(OWN, PX2, PY[1] + 38 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, ownAt)
  });
  const wx = glideSteps(
    t,
    WX,
    [
      [proofAt, CX + 36],
      [reviewAt, MX + 30],
      [branchAt, BX2 + 90],
      [publishAt, BX2 + 70]
    ],
    0.9
  );
  work(wx, RAIL_Y, a * (1 - ramp(t, Math.max(publishAt + 0.6, eachAt), 0.4)));
}
function needMark(i, x, y, alpha) {
  if (i === 0) tagIcon(x - 26, y, 56, 30, { alpha, color: P.ink });
  else if (i === 1) {
    box(x - 28, y - 22, 56, 44, { stroke: P.ink, alpha, radius: 6, width: 2.5 });
    line(x - 28, y - 8, x + 28, y - 8, { color: P.ink, alpha, width: 2 });
  } else if (i === 2) {
    line(x - 24, y + 10, x + 6, y + 10, { color: P.ink, alpha, width: 5, cap: "butt" });
    line(x - 24, y - 6, x + 24, y - 6, { color: P.ink, alpha, width: 5, cap: "butt" });
  } else clock(x, y, 20, { hand: 0.3, alpha });
}
var NEEDS = () => [
  L("上线的那个版本", "That version"),
  L("真实运行的环境", "The environment"),
  L("原来的做法", "The old way"),
  L("约定的一段时间", "A set period")
];
var NEED_Y = [350, 450, 550, 650];
var NEED_X = 1340;
function liveUse(s, t, a) {
  if (a <= 0) return;
  const [liveAt, worksAt, benefitAt, useAt, versionAt, envAt, baseAt, periodAt] = cues(s, [
    ["版本上线", "the version is live"],
    ["管不管用", "whether it works"],
    ["实际效益", "actual benefit"],
    ["实际使用", "real use"],
    ["上线的那个版本", "the version that went live"],
    ["真实运行的环境", "the environment"],
    ["原来的做法", "how things were done before"],
    ["约定的一段时间", "a set period"]
  ]);
  const needs = NEEDS(), NEEDS_END = NEED_X + 50 + Math.max(...needs.map((v2) => nameWidth(v2, 360))), S = 960 - (220 - 2 + NEEDS_END) / 2;
  const QX = 1100, QY = RAIL_Y - 11, TX = 380, UX = 740, NAMES = NEED_Y[2], ats = [versionAt, envAt, baseAt, periodAt], back = soon(t, versionAt - 0.2, 0.7), v = a * named(t, liveAt), q = a * named(t, worksAt), u = a * named(t, useAt);
  ctx.save();
  ctx.translate(S, 0);
  journeyRail(220, QX - 40, { alpha: a });
  journeyRail(QX + 40, mix(NEEDS_END - 20, QX + 40, back), { alpha: a });
  railFlow(t, 220, QX - 40, { alpha: a });
  tagIcon(TX - 30, RAIL_Y, 64, 34, { alpha: v, color: P.ink });
  nameText(L("版本上线", "The version"), TX, NAMES, { alpha: v });
  person(UX, RAIL_Y - 66, { size: 1.15, alpha: u });
  link(UX, RAIL_Y - 30, UX, RAIL_Y - 10, { alpha: u, upto: soon(t, useAt + 0.05, 0.4) });
  nameText(L("实际使用", "Real use"), UX, NAMES, { alpha: u });
  askIcon(QX, QY, 30, { alpha: q, color: P.ink });
  nameText(L("管不管用", "Whether it works"), QX, QY - 30 - NAME_GAP, {
    valign: "bottom",
    alpha: q
  });
  nameText(L("实际效益", "Actual benefit"), QX, NAMES, { alpha: a * named(t, benefitAt) });
  needs.forEach((v2, i) => {
    const y = NEED_Y[i], n = a * named(t, ats[i]);
    link(QX + 34, RAIL_Y, NEED_X - 44, y, {
      route: "hvh",
      mid: QX + 150,
      alpha: n,
      upto: soon(t, ats[i] + 0.05, 0.6),
      flow: flowClock(t, i / 4),
      flowEvery: FLOW_EVERY
    });
    needMark(i, NEED_X, y, n);
    nameText(v2, NEED_X + 50, y, {
      align: "left",
      width: 360,
      alpha: a * listIn(t, ats, i),
      set: "08.6:needs"
    });
  });
  ctx.restore();
}
var STRETCHES = [
  [240, 410],
  [450, 630],
  [670, 840],
  [880, 1040],
  [1080, 1680]
];
function overview(s, t, a) {
  if (a <= 0) return;
  const [hereAt, pathAt, docsAt, handoverAt, droppedAt, acceptAt] = cues(s, [
    ["从这里往后", "From here on"],
    ["设计要走通的一段路", "ETHOS is designed for"],
    ["它的文档也写明", "its own documents"],
    ["换 Agent 接手", "the handover to another Agent"],
    ["断线再推", "the dropped push"],
    ["都还没有完成验收", "has not yet completed acceptance"]
  ]);
  const h = a * named(t, handoverAt), dp = a * named(t, droppedAt), acc = a * named(t, acceptAt), [A, B, C, E, D] = STRETCHES;
  const solid = [A, C, ...t < handoverAt - 0.15 ? [B] : [], ...t < droppedAt - 0.15 ? [E] : []];
  stroke(
    () => solid.forEach(([x0, x1]) => {
      ctx.moveTo(x0, RAIL_Y);
      ctx.lineTo(x1, RAIL_Y);
    }),
    { color: P.line, alpha: a, width: 4 }
  );
  journeyRail(B[0], B[1], { alpha: h, dash: [12, 10] });
  journeyRail(E[0], E[1], { alpha: dp, dash: [12, 10] });
  journeyRail(D[0], D[1], { alpha: a, dash: [12, 10] });
  railFlow(t, D[0], D[1], { alpha: a });
  const HERE = D[0] + 40;
  work(HERE, RAIL_Y, a);
  nameText(L("从这里往后", "From here on"), HERE, RAIL_Y - 30, {
    valign: "bottom",
    alpha: a * named(t, hereAt)
  });
  const db = nameText(
    L("设计要走通的一段路", "The path ETHOS is designed for"),
    (D[0] + D[1]) / 2,
    RAIL_Y + 30,
    {
      valign: "top",
      alpha: a * ramp(t, pathAt - (en ? 1.35 : 0.15), 0.4)
    }
  );
  const hb = nameText(
    L("换 Agent 接手那一段", "The handover to another Agent"),
    (B[0] + B[1]) / 2,
    RAIL_Y + 30,
    {
      valign: "top",
      alpha: h
    }
  );
  const eb = nameText(L("断线再推那一段", "The dropped push"), (E[0] + E[1]) / 2, RAIL_Y + 30, {
    valign: "top",
    alpha: dp
  });
  const NY = 700, BX2 = (B[0] + B[1]) / 2, DX = (D[0] + D[1]) / 2, AXIS = (E[0] + E[1]) / 2, DOC2 = [40, 52], docs = a * named(t, docsAt);
  docMark(AXIS - DOC2[0] / 2, NY - DOC2[1] / 2, DOC2[0], DOC2[1], { alpha: docs, rows: 3 });
  link(AXIS + DOC2[0] / 2 + 10, NY, DX, db.bottom + 12, {
    route: "hv",
    alpha: docs,
    upto: soon(t, docsAt + 0.05, 0.6)
  });
  link(AXIS - DOC2[0] / 2 - 10, NY, BX2, hb.bottom + 12, {
    route: "hv",
    alpha: h,
    upto: soon(t, handoverAt + 0.05, 0.6)
  });
  link(AXIS, NY - DOC2[1] / 2 - 10, AXIS, eb.bottom + 12, {
    alpha: dp,
    upto: soon(t, droppedAt + 0.05, 0.4)
  });
  nameText(L("还没有完成验收", "Not yet accepted"), AXIS, NY + DOC2[1] / 2 + NAME_GAP, {
    valign: "top",
    alpha: acc
  });
}

// picture/film/scenes/p08/feedback.js
var Y2 = 530;
var FEED = 470;
var RUN2 = 800;
var STORE = [1220, Y2, 400, 148];
var SLOTS = [Y2 - 37, Y2 + 37];
function pipelineParts(alpha, store, slots) {
  if (alpha < 0.01) return;
  const [sx, sy, sw, sh] = STORE;
  ring(FEED, Y2, 38, { color: P.ink, alpha, width: 2.5 });
  dot(FEED, Y2, 12, { color: P.ink, alpha });
  box(RUN2 - 110, Y2 - 48, 220, 96, { fill: P.row, stroke: P.ink, alpha, radius: 10, width: 2.5 });
  stroke(
    () => {
      for (let i = -1; i <= 1; i++) {
        const cx = RUN2 + i * 50;
        ctx.moveTo(cx - 8, Y2 - 16);
        ctx.lineTo(cx + 8, Y2);
        ctx.lineTo(cx - 8, Y2 + 16);
      }
    },
    { color: P.ink, alpha, width: 2.5 }
  );
  link(FEED + 40, Y2, RUN2 - 110, Y2, { alpha, end: false });
  link(RUN2 + 110, Y2, sx - sw / 2 - 2, Y2, { alpha: Math.min(alpha, store), end: false });
  box(sx - sw / 2, sy - sh / 2, sw, sh, {
    stroke: P.ink,
    alpha: Math.min(alpha, store),
    radius: 12,
    width: 2.5
  });
  SLOTS.forEach(
    (y, i) => box(sx - 185, y - 27, 370, 54, {
      stroke: P.line,
      alpha: Math.min(alpha, slots[i]),
      radius: 8,
      width: 2
    })
  );
}
var INTO_RUN = [
  [FEED + 44, Y2],
  [RUN2, Y2]
];
var INTO_SLOT = [
  [RUN2, Y2],
  [STORE[0] + 150, Y2],
  [STORE[0] + 165, SLOTS[1]]
];
var WAY = [...INTO_RUN, ...INTO_SLOT.slice(1)];
var wayTo = (points) => points.slice(1).reduce((v, p, i) => v + Math.hypot(p[0] - points[i][0], p[1] - points[i][1]), 0);
var RUN_WAY = wayTo(INTO_RUN);
var SLOT_WAY = wayTo(INTO_SLOT);
var travel = (toRun, toSlot) => along(WAY, mix(toRun * RUN_WAY, RUN_WAY + SLOT_WAY, toSlot) / (RUN_WAY + SLOT_WAY)).point;
function corrections(s, t, a) {
  if (a <= 0) return;
  const [laterAt, vendorAt, twoAt, pipeAt, origAt, singleAt, secondAt, overAt] = cues(s, [
    ["几天后", "A few days later"],
    ["厂商在同一天", "the vendor"],
    ["两次更正", "two corrections"],
    ["管线只认得", "The pipeline"],
    ["原值", "an original value"],
    ["一次更正", "a single correction"],
    ["第二次更正", "the second correction"],
    ["覆盖掉了", "overwrites the first"]
  ]);
  const LATER = L("几天后", "Days later"), VENDOR = L("厂商", "The vendor"), TWO = L("两次更正", "Two corrections"), OVER2 = L("覆盖掉了", "Overwritten"), left = Math.min(FEED - 38, FEED - measure(TWO) / 2, FEED - measure(VENDOR) / 2), before = Math.max(RUN2 + 110, FEED + 40 + measure(LATER)), after = Math.max(before, STORE[0] + STORE[2] / 2, STORE[0] + measure(OVER2) / 2), ABOVE = Y2 - 48 - NAME_GAP;
  const v = a * named(t, vendorAt), over = ramp(t, overAt - 0.15, 0.4), alone = 960 - (left + before) / 2, done = 960 - (left + after) / 2, off = mix(alone, done, glideShare(t, origAt - 0.45, alone - done, 0.8));
  ctx.save();
  ctx.translate(off, 0);
  clock(FEED, 330, 24, { hand: voiceTime(t) * 0.5 % 1, alpha: a });
  nameText(LATER, FEED + 40, 330, {
    align: "left",
    alpha: a * named(t, laterAt)
  });
  pipelineParts(v, a * named(t, origAt), [a * named(t, origAt), a * named(t, singleAt)]);
  nameText(VENDOR, FEED, Y2 + 38 + NAME_GAP, { valign: "top", alpha: v });
  nameText(L("管线", "The pipeline"), RUN2, ABOVE, {
    valign: "bottom",
    alpha: a * named(t, pipeAt)
  });
  nameText(L("原值", "Original value"), STORE[0] - 170, SLOTS[0], {
    align: "left",
    alpha: a * named(t, origAt)
  });
  nameText(L("一次更正", "Single correction"), STORE[0] - 170, SLOTS[1], {
    align: "left",
    alpha: a * named(t, singleAt)
  });
  const c = a * named(t, twoAt);
  nameText(TWO, FEED, ABOVE, { valign: "bottom", alpha: c });
  if (c > 0.01) {
    const into = (at, until, way) => glideShare(t, Math.min(at + 0.2, until - glideTime(way, 0.8)), way, 0.8);
    const [x1, y1] = travel(
      glideShare(t, twoAt + 0.1, RUN_WAY, 1),
      into(singleAt, secondAt, SLOT_WAY)
    ), [x2, y2] = travel(
      0.8 * glideShare(t, twoAt + 0.3, 0.8 * RUN_WAY, 1),
      into(secondAt - 0.15, overAt + 0.3, 0.2 * RUN_WAY + SLOT_WAY)
    );
    dot(x1, y1, 7, { color: P.ink, alpha: c * (1 - over) });
    dot(x2, y2, 16, { color: P.ink, alpha: c });
  }
  nameText(OVER2, STORE[0], STORE[1] + STORE[3] / 2 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, overAt)
  });
  ctx.restore();
}
var JUDGED = () => [
  [L("观察到的", "Observation"), L("第一次更正不见了", "the first correction has disappeared")],
  [L("推断的原因", "Inference"), L("多次更正", "the vendor can correct a value more than once")],
  [
    L("提出的补救办法", "Proposed remedy"),
    // Authored as its lines in English, the narration's words, so its first line does not end on "by".
    L("按修订编号区分记录", ["to tell records apart", "by the revision number"])
  ]
];
var PANEL_W = 400;
var PANEL_H = 140;
var PANEL_Y = 560;
var PANEL_X = [480, 960, 1440];
function verdictMark2(i, x, y, alpha) {
  if (i === 0) check(x, y, 28, { alpha, width: 4 });
  else if (i === 1) askIcon(x, y, 18, { alpha, color: P.ink });
  else stopSign(x, y, 17, { alpha, color: P.ink });
}
function judgement(s, t, a) {
  if (a <= 0) return;
  const [peopleAt, backAt, threeAt, obsAt, obsSays, infAt, infSays, remAt, remSays] = cues(s, [
    ["负责观察的人", "The people watching the pipeline"],
    ["把情况报了回来", "report this back"],
    ["分开判断", "judged separately"],
    ["观察到的，是", "The observation is"],
    ["第一次更正不见了", "the first correction has disappeared"],
    ["推断的原因", "The inference"],
    ["多次更正", "the vendor can correct"],
    ["提出的补救办法", "the proposed remedy"],
    ["按厂商给的修订编号", "to tell records apart"]
  ]);
  const [wrongAt, standsAt, rejectAt, problemAt] = cues(s, [
    ["可能错", "can be wrong"],
    ["照样成立", "still stands"],
    ["被否掉", "rejecting"],
    ["问题不存在", "the problem go away"]
  ]);
  const apartAt = cueFrom(s, "要分开", "They stay apart", remSays);
  const p = a * named(t, peopleAt), b = a * named(t, backAt), TOP2 = mix(450, 300, glideShare(t, obsAt - 0.5, 150, 0.8)), [PX2, , DX] = PANEL_X, DOC2 = [84, 108], PY = TOP2 + DOC2[1] / 2 - 22.7 * 1.5, names2 = rowNameTop([PY + 22.7 * 1.5, TOP2 + DOC2[1] / 2]);
  person(PX2, PY, { size: 1.5, alpha: p });
  termRow(
    t,
    L(["负责观察的人"], ["The people"]),
    [peopleAt],
    L([], ["watching the pipeline"]),
    [peopleAt],
    PX2,
    names2,
    { alpha: a, align: "center", inline: false }
  );
  link(PX2 + 40, TOP2, DX - DOC2[0] / 2 - 12, TOP2, {
    alpha: b,
    upto: soon(t, backAt + 0.05, Math.max(0.8, (DX - DOC2[0] / 2 - 52 - PX2) / 760)),
    flow: flowClock(t)
  });
  documentIcon(DX - DOC2[0] / 2, TOP2 - DOC2[1] / 2, DOC2[0], DOC2[1], { alpha: b, rows: 0 });
  nameText(L("报告", "The report"), DX, names2, {
    valign: "top",
    alpha: b
  });
  nameText(L("分开判断", "Judged separately"), PANEL_X[1], names2, {
    valign: "top",
    alpha: a * named(t, threeAt)
  });
  const terms = [obsAt, infAt, remAt], says = [obsSays, infSays, remSays], verdicts = [standsAt, wrongAt, rejectAt], shift = building(t, terms, PANEL_W / 2 + 40, 0.35);
  JUDGED().forEach(([term, said], i) => {
    const x = PANEL_X[i] + shift, k = a * named(t, terms[i]), left = x - PANEL_W / 2 + 24;
    box(x - PANEL_W / 2, PANEL_Y - PANEL_H / 2, PANEL_W, PANEL_H, {
      stroke: P.ink,
      alpha: k,
      radius: 12,
      width: 2.5
    });
    nameText(term, left, PANEL_Y - 32, {
      align: "left",
      alpha: a * listIn(t, terms, i),
      set: "08.7:three"
    });
    nameText(said, left, PANEL_Y - 8, {
      align: "left",
      valign: "top",
      width: PANEL_W - 90,
      size: NOTE,
      color: P.muted,
      alpha: a * listIn(t, says, i),
      set: "08.7:says"
    });
    const v = a * named(t, verdicts[i]);
    verdictMark2(i, x + PANEL_W / 2 - 40, PANEL_Y - 32, v);
    if (i === 0) beats(t, x + PANEL_W / 2 - 40, PANEL_Y - 32, 30, [problemAt], { alpha: a });
  });
  const apart = a * ramp(t, apartAt - 0.15, 0.4);
  stroke(
    () => [0, 1].forEach((i) => {
      const x = (PANEL_X[i] + PANEL_X[i + 1]) / 2 + shift;
      ctx.moveTo(x, PANEL_Y - PANEL_H / 2 + 12);
      ctx.lineTo(x, PANEL_Y + PANEL_H / 2 - 12);
    }),
    { alpha: apart, width: 4 }
  );
  const verdictNames = [
    [L("照样成立", "Still stands")],
    [L("可能错", "Can be wrong")],
    L(["被否掉"], ["If rejected", ", the problem stays"])
  ];
  verdictNames.forEach(
    (parts2, i) => growName(
      t,
      parts2,
      i === 2 ? [rejectAt, problemAt] : [verdicts[i]],
      PANEL_X[i] + shift,
      PANEL_Y + PANEL_H / 2 + NAME_GAP,
      { align: "center", alpha: a, build: true, set: "08.7:verdicts" }
    )
  );
}

// picture/film/scenes/p08/model.js
function faultApart(s, t, a) {
  if (a <= 0) return;
  const [codeAt, modelAt, apartAt, faultAt] = cues(s, [
    ["代码出错", "A failed implementation"],
    ["模型", "the model"],
    ["要先分清", "told apart first"],
    ["问题出在模型上", "the fault is in the model"]
  ]);
  const W = 280, H = 160, Y0 = 390, GAP = 170, CX = 960 - GAP - W / 2, MX = 960 + GAP + W / 2, shown = modelAt - L(0, 0.35), alone = (960 - CX) * (1 - glideShare(t, shown - 0.4, 960 - CX, 0.8)), m = a * named(t, shown), d = a * named(t, apartAt), f = ramp(t, faultAt - 0.15, 0.6);
  terminalIcon(CX + alone - W / 2, Y0, W, H, { alpha: a * mix(1, 0.55, f) });
  nameText(L("代码出错", "A failed implementation"), CX + alone, Y0 + H + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, codeAt)
  });
  modelGrid(MX - W / 2, Y0, W, H, { alpha: m, cell: [3, 1], lit: f });
  nameText(L("模型", "The model"), MX, Y0 + H + NAME_GAP, {
    valign: "top",
    alpha: m
  });
  line(960, Y0, 960, Y0 + H, { color: P.line, alpha: d });
  nameText(L("要先分清", "Told apart first"), 960, Y0 - 20, { valign: "bottom", alpha: d });
  nameText(L("问题所在", "The fault"), MX, Y0 - 20, {
    valign: "bottom",
    width: 280,
    alpha: a * named(t, faultAt)
  });
}
function checkGroup(t, x, ys, { alpha = 1, at = Infinity } = {}) {
  if (alpha < 0.01) return;
  stroke(() => ys.forEach((y) => ctx.roundRect(x - 26, y - 22, 52, 44, 8)), {
    color: P.ink,
    alpha,
    width: 2.5
  });
  stroke(
    () => ys.forEach((y) => {
      ctx.moveTo(x - 13, y + 1);
      ctx.lineTo(x - 3, y + 11);
      ctx.lineTo(x + 14, y - 10);
    }),
    { color: P.ink, alpha, width: 3.5 }
  );
  ys.forEach((y, i) => beats(t, x, y, 34, [at + 0.45 * i], { alpha }));
}
function modelRevision(s, t, a) {
  if (a <= 0) return;
  const [recordAt, dimAt, changeAt, boundAt, revisesAt, checksAt, compileAt] = cues(s, [
    ["同一条记录", "the same record"],
    ["少了一个维度", "missing a dimension"],
    ["新的正式变更", "a new official Change"],
    ["受影响的最小范围", "the smallest boundary"],
    ["修订模型", "revises the model"],
    ["依赖它的检查", "every check that depends on it"],
    ["重新编译", "compiled again"]
  ]);
  const GY = 390, GW = 400, GH = 225, DOC2 = [150, GH], DOC_X = 730, CHK = 1015, CELL0 = 3.5 * (GW / 4), CELL = CELL0 + 0.45 * (GW / 4), MID2 = GY + GH / 2, RECORD = L("同一条记录", "The same record"), DIM = L("少了一个维度", "Missing a dimension"), BOUND = L("最小范围", "The smallest boundary"), CHANGE = L("新的正式变更", "A new official Change"), REVISES = L("修订模型", "Revising the model"), DEP = L("依赖它的检查", "Dependent checks"), COMPILE = L("重新编译", "Compiled again");
  const left = -22 - nameWidth(DIM, 280), right1 = Math.max(GW + 0.9 * (GW / 4) + 6, CELL + nameWidth(RECORD) / 2), right2 = Math.max(
    right1,
    CELL + nameWidth(BOUND) / 2,
    DOC_X + DOC2[0] / 2,
    DOC_X + nameWidth(CHANGE) / 2,
    DOC_X + nameWidth(REVISES) / 2
  ), right3 = Math.max(right2, CHK + 46 + nameWidth(DEP, 280), CHK + nameWidth(COMPILE) / 2), at = (right) => 960 - (left + right) / 2, GX2 = at(right3) + (at(right2) - at(right3)) * (1 - glideShare(t, checksAt - 0.65, at(right2) - at(right3), 0.8)) + (at(right1) - at(right2)) * (1 - glideShare(t, changeAt - 0.65, at(right1) - at(right2), 0.8));
  ctx.save();
  ctx.translate(GX2, 0);
  const grow = soon(t, dimAt + 0.05, 0.8), c = a * named(t, changeAt), bd = a * named(t, boundAt), k = a * named(t, checksAt), flow = flowClock(t), above = GY - NAME_GAP, ys = [GY + 22, MID2, GY + GH - 22], below = rowNameTop([GY + GH, ys.at(-1) + 22]);
  modelGrid(0, GY, GW, GH, { alpha: a, cell: [3, 1], lit: 1, grow });
  nameText(RECORD, mix(CELL0, CELL, grow), above, {
    valign: "bottom",
    alpha: a * named(t, recordAt)
  });
  nameText(DIM, -22, MID2, {
    align: "right",
    width: 280,
    alpha: a * named(t, dimAt)
  });
  const RX = CELL0 - 0.5 * (GW / 4) + 14, RW = 110, revisions = a * ramp(t, dimAt + 0.3, 0.4), numbered = a * ramp(t, dimAt + 0.5, 0.4);
  recordRows(RX, MID2 - 24, RW, [0, 1], { step: 48, alpha: revisions });
  const [v0, v1] = valueCell(RX, RW);
  line(v0, MID2 + 24, v1, MID2 + 24, { color: P.ink, alpha: revisions, width: 4 });
  [1, 2].forEach((n, i) => ordinal(n, CELL0 + 0.5 * (GW / 4) + 34, MID2 - 24 + 48 * i, numbered));
  const cx0 = 3 * (GW / 4) - 6, cx1 = GW + 0.9 * (GW / 4) * grow + 6, cy0 = GY + GH / 3 - GH / 3 * 0.5 * grow - 6, cy1 = GY + 2 * GH / 3 + GH / 3 * 0.5 * grow + 6;
  box(cx0, cy0, cx1 - cx0, cy1 - cy0, { stroke: P.line, alpha: bd, radius: 10, width: 2 });
  nameText(BOUND, CELL, below, {
    valign: "top",
    alpha: bd
  });
  docMark(DOC_X - DOC2[0] / 2, GY, DOC2[0], DOC2[1], { alpha: c, rows: 4 });
  link(DOC_X - DOC2[0] / 2 - 12, MID2, cx1 + 10, MID2, {
    alpha: a * named(t, revisesAt),
    upto: soon(t, revisesAt + 0.05, 0.6),
    flow
  });
  nameText(CHANGE, DOC_X, below, {
    valign: "top",
    alpha: c
  });
  nameText(REVISES, DOC_X, above, {
    valign: "bottom",
    alpha: a * named(t, revisesAt)
  });
  ys.forEach(
    (y, i) => link(DOC_X + DOC2[0] / 2 + 12, MID2, CHK - 38, y, {
      route: "hvh",
      mid: (DOC_X + DOC2[0] / 2 + CHK) / 2,
      alpha: k,
      upto: soon(t, checksAt + 0.05 + 0.15 * i, 0.6),
      flow: flowClock(t, i / 3),
      flowEvery: FLOW_EVERY
    })
  );
  checkGroup(t, CHK, ys, { alpha: k, at: compileAt });
  nameText(DEP, CHK + 46, MID2, {
    align: "left",
    width: 280,
    alpha: k
  });
  nameText(COMPILE, CHK, below, {
    valign: "top",
    alpha: a * named(t, compileAt)
  });
  ctx.restore();
}
function noWayAround(s, t, a) {
  if (a <= 0) return;
  const ats = cues(s, [
    ["不加例外", "No exception"],
    ["旁路", "side path"],
    ["第二个真相来源", "second source of truth"]
  ]);
  const refused = [
    L("例外", "Exception"),
    L("旁路", "Side path"),
    L("第二个真相来源", "Second source of truth")
  ];
  const NX = 1130, widest = Math.max(...refused.map((v) => measure(v))), S = 960 - (540 + NX + widest + 16 + 26) / 2, MX = 540, MY = 375, MW = 420, MH = 250, rows = [MY + 40, MY + MH / 2, MY + MH - 40], edge = [MX + MW + 8, MX + MW + 0.9 * (MW / 4) + 14, MX + MW + 8];
  ctx.save();
  ctx.translate(S, 0);
  modelGrid(MX, MY, MW, MH, { alpha: a, cell: [3, 1], lit: 1, grow: 1 });
  refused.forEach(
    (v, i) => rejectedName(v, NX, rows[i], {
      align: "left",
      alpha: a * named(t, ats[i]),
      mark: ramp(t, ats[i] + 0.3, 0.4),
      markLeft: NX + widest + 16,
      set: "08.8:refused"
    })
  );
  rows.forEach(
    (y, i) => link(edge[i], y, NX - 16, y, {
      alpha: a * named(t, ats[i]) * 0.9,
      upto: soon(t, ats[i] + 0.05, 0.5),
      dash: [6, 6],
      end: false
    })
  );
  ctx.restore();
}
function workLane(x0, x1, y, { alpha = 1, flow = null, since = -Infinity, held = null, gate = null } = {}) {
  if (alpha < 0.01) return;
  folderIcon(x0, y - 26, 62, 52, { alpha });
  link(x0 + 70, y, x1, y, { alpha, end: false });
  if (gate !== null) writeGate(gate, y, 92, { alpha, open: 0, single: true });
  if (held !== null) dot(held, y, 10, { color: P.ink, alpha });
  if (flow !== null)
    flowAlong(
      [
        [x0 + 80, y],
        [x1, y]
      ],
      flow,
      10,
      { every: (x1 - x0 - 80) / FLOW_PACE / 3, since, color: P.ink, alpha }
    );
}
function meanwhile(s, t, a) {
  if (a <= 0) return;
  const [dependAt, waitAt, otherAt, onAt] = cues(s, [
    ["依赖这个概念的改动", "changes that depend on that idea"],
    ["先停下", "wait"],
    ["和它无关的工作", "work unrelated to it"],
    ["照常进行", "goes on as usual"]
  ]);
  const DEPEND = L("依赖它的改动", "Dependent changes"), WAIT = L("先停下", "Wait"), OTHER = L("不相关的工作", "Unrelated work"), ON = L("照常进行", "Goes on as usual"), Y1 = 520, Y22 = 670, GATE = 1200, END1 = 1260, END2 = 1420, OUT = 20, first = Math.max(GATE + 70, END1 + OUT + measure(WAIT), 600 + nameWidth(DEPEND, 420)), right = Math.max(first, END2 + OUT + measure(ON), 600 + measure(OTHER)), S = mix(960 - (520 + first) / 2, 960 - (520 + right) / 2, glideShare(t, otherAt + 0.05, (right - first) / 2, 0.7)), d = a * named(t, dependAt), o = a * named(t, otherAt);
  ctx.save();
  ctx.translate(S, 0);
  workLane(520, END1, Y1, {
    alpha: d,
    gate: GATE,
    held: mix(700, 1140, glideShare(t, dependAt + 0.1, 1140 - 700, 1.4))
  });
  modelGrid(GATE - 130, 300, 200, 112, { alpha: d, cell: [3, 1], lit: 1, grow: 1 });
  link(GATE - 30, 418, GATE - 30, Y1 - 50, {
    alpha: d,
    upto: soon(t, dependAt + 0.05, 0.6),
    end: false
  });
  nameText(DEPEND, 600, Y1 - 40, {
    align: "left",
    valign: "bottom",
    width: 420,
    alpha: d
  });
  nameText(WAIT, END1 + OUT, Y1, {
    align: "left",
    alpha: a * named(t, waitAt)
  });
  workLane(520, END2, Y22, { alpha: o, flow: flowClock(t), since: flowClock(otherAt - 0.15) });
  nameText(OTHER, 600, Y22 + 40, {
    align: "left",
    valign: "top",
    alpha: o
  });
  nameText(ON, END2 + OUT, Y22, {
    align: "left",
    alpha: a * named(t, onAt)
  });
  ctx.restore();
}
function goalKept(s, t, a) {
  if (a <= 0) return;
  const [goalAt, keptAt, notAt, alignAt, quietAt] = cues(s, [
    ["不能多出重复记录", "no duplicate records"],
    ["这个目标", "The goal"],
    ["一个字也没有放宽", "not relaxed in the slightest"],
    ["经授权重新对齐意图", "authorized intent alignment"],
    ["悄悄放宽", "silently loosened"]
  ]);
  const LY = 380, x0 = 560, x1 = 1372, LOCK = x1 + 20, AXIS = (x0 + LOCK + 17) / 2, PX2 = 1322, PY = 624, al = a * named(t, alignAt), q = a * named(t, quietAt), sink = glideShare(t, quietAt + 0.05, 60, 1), flow = flowClock(t);
  line(x0, LY, x1, LY, { color: P.ink, alpha: a, width: 5 });
  lock(LOCK, LY, { alpha: a, color: P.ink });
  nameText(L("不能多出重复记录", "No duplicate records"), AXIS, LY - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, goalAt)
  });
  nameText(L("目标", "The goal"), x0 - 24, LY, { align: "right", alpha: a * named(t, keptAt) });
  link(AXIS, 482, AXIS, LY + 12, { alpha: a, flow });
  resultCard(AXIS, 545, 4, { alpha: a, w: 170, h: 120 });
  nameText(L("没有放宽", "Not relaxed"), (AXIS + LOCK) / 2, LY + 28, {
    valign: "top",
    width: 300,
    alpha: a * named(t, notAt)
  });
  person(PX2, PY, { size: 1.2, alpha: al });
  seal(LOCK, 620, 22, { alpha: al, color: P.ink });
  link(LOCK, 594, LOCK, LY + 22, { alpha: al, upto: soon(t, alignAt + 0.05, 0.6), flow });
  nameText(
    L("经授权重新对齐意图", "Authorized intent alignment"),
    (PX2 - 28 + LOCK + 22) / 2,
    rowNameTop([PY + 22.7 * 1.2, 620 + 22]),
    {
      valign: "top",
      width: 380,
      alpha: al
    }
  );
  const low = LY + mix(50, 110, sink);
  line(x0 + 20, low, 800, low, { color: P.line, alpha: q, width: 4, dash: [10, 9] });
  rejectedName(L("悄悄放宽", "Silently loosened"), (x0 + 20 + 800) / 2, low + 36, {
    alpha: q,
    mark: ramp(t, quietAt + 0.5, 0.4)
  });
}

// picture/film/scenes/p08/life.js
scenes["08"] = function(s, t) {
  const [halfAt, proofAt, dropAt, liveAt, hereAt, daysAt] = cues(s, [
    ["做到一半", "Halfway through"],
    ["改完以后", "When the work is committed"],
    ["要是推到一半断了线", "Say the connection drops"],
    ["版本上线以后", "Once the version is live"],
    ["从这里往后", "From here on"],
    ["几天后", "A few days later"]
  ]);
  const [peopleAt, failAt, recordAt, noneAt, meanAt, goalAt] = cues(s, [
    ["负责观察的人", "The people watching"],
    ["代码出错", "A failed implementation"],
    ["同一条记录", "the idea of"],
    ["不加例外", "No exception"],
    ["依赖这个概念的改动", "changes that depend on that idea"],
    ["不能多出重复记录", "The goal"]
  ]);
  const s2 = stageOut(t, halfAt), s3 = stageIn(t, halfAt) * stageOut(t, proofAt), s4 = stageIn(t, proofAt) * stageOut(t, dropAt), s4b = stageIn(t, dropAt) * stageOut(t, liveAt), s5 = stageIn(t, liveAt) * stageOut(t, hereAt), s5b = stageIn(t, hereAt) * stageOut(t, daysAt), s6 = stageIn(t, daysAt) * stageOut(t, peopleAt), s7 = stageIn(t, peopleAt) * stageOut(t, failAt), s8 = stageIn(t, failAt) * stageOut(t, recordAt), s8b = stageIn(t, recordAt) * stageOut(t, noneAt), s8c = stageIn(t, noneAt) * stageOut(t, meanAt), s8d = stageIn(t, meanAt) * stageOut(t, goalAt), s9 = stageIn(t, goalAt);
  illustrative(1);
  lane(s, t, s2);
  handoff(s, t, s3);
  release(s, t, s4);
  droppedPush(s, t, s4b);
  liveUse(s, t, s5);
  overview(s, t, s5b);
  corrections(s, t, s6);
  judgement(s, t, s7);
  faultApart(s, t, s8);
  modelRevision(s, t, s8b);
  noWayAround(s, t, s8c);
  meanwhile(s, t, s8d);
  goalKept(s, t, s9);
};

// picture/film/scenes/p09/close.js
var BOUND_X = 700;
var BOUND_RUN = 440;
var AGENT_DX = 70;
var AGENT_DY = 220;
var FAN = () => L(210, 190);
var BOUND_ROWS = [385, 470, 555];
var SEAL_NAME = () => L("存证", "Attestations");
var ATTESTED = () => [
  L("哪一次提交", "The commit"),
  L("核验了什么", "What the proof checked"),
  L("哪里还没有结果", "What still has no result")
];
var boundLeft = () => -claimWidth() / 2 - AGENT_DX - Math.max(40, measure("Agent") / 2);
var boundShift = () => 960 - (2 * BOUND_X + boundLeft() + BOUND_RUN + FAN() + 30 + Math.max(...ATTESTED().map((v) => measure(v)))) / 2;
function bound(s, t, a) {
  if (a <= 0) return;
  const [beganAt, doneAt, wayAt, sealAt, commitAt, provedAt, openAt, lookAt, trustAt] = cues(s, [
    ["回到开头那句", "back to where we began"],
    ["做完了", "Done"],
    ["按 ETHOS 的做法", "In ETHOS"],
    ["存证", "attestations"],
    ["哪一次提交", "which commit it means"],
    ["核验了什么", "what the proof checked"],
    ["哪里还没有结果", "what still has no result"],
    ["都找得到", "can all be looked up"],
    ["这句话能不能信", "can be trusted"]
  ]);
  const W = claimWidth(), alone = 960 - BOUND_X - (boundLeft() + W / 2 + CLAIM_DATUM) / 2, chain = 960 - BOUND_X - (boundLeft() + BOUND_RUN + 36 + Math.max(26, measure(SEAL_NAME()) / 2)) / 2, off = mix(
    mix(alone, chain, glideShare(t, wayAt + 0.05, chain - alone, 0.9)),
    boundShift(),
    glideShare(t, commitAt + 0.05, boundShift() - chain, 0.9)
  ), PX2 = BOUND_X + off, Y3 = 470, aside = glideShare(
    t,
    beganAt + 0.05,
    Math.hypot(960 - (BOUND_X + alone - W / 2 - AGENT_DX), 560 - Y3 - AGENT_DY),
    0.6
  ), AX2 = mix(960, PX2 - W / 2 - AGENT_DX, aside), AY = mix(560, Y3 + AGENT_DY, aside), under = Y3 + CLAIM_H / 2 + 18, clear = a * clearOfTitle(s, t, Y3 - 60), seen = clear * ramp(t, s.voice_start - 0.3, 0.4), back = clear * ramp(t, beganAt + 0.35, 0.4), way = a * ramp(t, wayAt - 0.15, 0.5), at = a * named(t, sealAt), end = PX2 + BOUND_RUN, rows = BOUND_ROWS, ats = [commitAt, provedAt, openAt], flow = flowClock(t);
  agent(AX2, AY, { size: 1.5, alpha: seen });
  nameText("Agent", AX2, AY + 33 + NAME_GAP, { valign: "top", alpha: seen });
  link(AX2, AY - 33, PX2 - W / 2 - 6, Y3, {
    route: "vh",
    alpha: seen,
    upto: aside,
    flow,
    flowEvery: FLOW_EVERY
  });
  const {
    datum: [dx, dy]
  } = claimPanel(t, PX2, Y3, { alpha: back, words: clear * named(t, doneAt) });
  nameText(L("开头的那句话", "Where we began"), PX2, Y3 - CLAIM_H / 2 - 44, {
    valign: "bottom",
    size: NOTE,
    color: P.muted,
    alpha: back
  });
  nameText(L("能不能信", "Can it be trusted?"), PX2, under, {
    valign: "top",
    size: NOTE,
    color: P.muted,
    alpha: clear * named(t, trustAt)
  });
  const drawn = soon(t, wayAt + 0.05, Math.max(0.9, sealAt - wayAt));
  link(dx + 16, dy, end, dy, { alpha: way, upto: drawn, flow });
  nameText(L("ETHOS 的做法", "In ETHOS"), (dx + end) / 2, dy - 22, {
    valign: "bottom",
    size: NOTE,
    color: P.muted,
    alpha: way
  });
  const x = end + FAN();
  seal(end + 36, dy, 26, { alpha: at, color: P.ink });
  nameText(SEAL_NAME(), end + 36, under - L(0.88, 0.78) * (labelSize(LABEL) - labelSize(NOTE)), {
    valign: "top",
    alpha: at
  });
  rows.forEach((y, i) => {
    const r = a * named(t, ats[i]);
    link(end + 66, dy, x - 24, y, {
      route: "hvh",
      mid: x - 30,
      alpha: r,
      upto: soon(t, ats[i] + 0.05, 0.5)
    });
    if (i === 0) commitDot(x, y, { alpha: r, r: 11 });
    else if (i === 1) check(x, y + 2, 26, { alpha: r, width: 3.5 });
    else askIcon(x, y - 2, 16, { alpha: r, color: P.ink });
  });
  ATTESTED().forEach(
    (v, i) => nameText(v, x + 30, rows[i], {
      align: "left",
      alpha: a * listIn(t, ats, i),
      set: "09.2:attested"
    })
  );
  const pitch = rows[1] - rows[0], look = a * named(t, lookAt), ruleY = rows[2] + 0.75 * pitch;
  line(x - 16, ruleY, x + 30 + Math.max(...ATTESTED().map((v) => measure(v))), ruleY, {
    alpha: look
  });
  nameText(L("找得到", "All on record"), x - 16, rows[2] + 1.5 * pitch, {
    align: "left",
    alpha: look
  });
}
var REFUSED = () => [L("谁说的", "Who said it"), L("走了多少流程", "How much process")];
var CONDITIONS = () => [
  L("原意有一处可查", "Meaning found in one place"),
  L("结论不超出证据", "Claim within its evidence"),
  L("出了错能退回去", "A way back after a mistake")
];
function judged(s, t, a, cutAt2) {
  if (a <= 0) return;
  const [trustAt, whoAt, processAt, alsoAt, meaningAt, withinAt, backAt] = cues(s, [
    ["这句话能不能信", "can be trusted"],
    ["谁说的", "who said it"],
    ["走了多少流程", "how much process"],
    ["也不看走了多少流程", "how much process"],
    ["原意是不是有一处可查", "the meaning can be found in one place"],
    ["结论有没有超出证据", "stays within its evidence"],
    ["能不能退回去", "you can get back after a mistake"]
  ]);
  const refused = REFUSED(), conditions = CONDITIONS(), A = Math.max(...refused.map((v) => measure(v))) + 16 + 26, B = 36 + 20 + Math.max(...conditions.map((v) => measure(v))), GUTTER = 200, left = 960 - (A + GUTTER + B) / 2, axis = left + A + GUTTER / 2, alone = 960 - (left + axis + claimWidth() / 2 + CLAIM_DATUM) / 2, shift = mix(alone, 0, glideShare(t, meaningAt + 0.05, alone, 0.9)), RX = left + A - 42 + shift, BX2 = left + A + GUTTER + shift;
  const q = glideShare(
    t,
    Math.max(trustAt + 0.05, cutAt2),
    Math.hypot(BOUND_X + boundShift() - axis - alone, 470 - 380),
    1
  ), PX2 = mix(BOUND_X + boundShift(), axis + shift, q), PY = mix(470, 380, q), conds = [meaningAt, withinAt, backAt], rows = [545, 630, 715];
  claimPanel(t, PX2, PY, { alpha: a });
  line(axis + shift, rows[0] - 30, axis + shift, rows[2] + 30, { alpha: a });
  nameText(L("能不能信", "Can it be trusted?"), PX2, PY + CLAIM_H / 2 + 18, {
    valign: "top",
    size: NOTE,
    color: P.muted,
    alpha: a * named(t, trustAt)
  });
  refused.forEach(
    (v, i) => rejectedName(v, RX, (rows[i] + rows[i + 1]) / 2, {
      align: "right",
      // Each may lead its words within its clause: English says both in one clause with the question; Chinese opens
      // a clause for each, so the second comes in on its own clause's first word.
      alpha: a * (en || i === 0 ? ramp(t, [whoAt, processAt][i] - 0.6, 0.4) : ramp(t, alsoAt + 0.05, 0.4)),
      mark: ramp(t, [whoAt, processAt][i] + 0.3, 0.4),
      set: "09.3:refused"
    })
  );
  conditions.forEach((v, i) => {
    const k = a * named(t, conds[i]);
    box(BX2, rows[i] - 18, 36, 36, { stroke: P.ink, alpha: k, radius: 6, width: 2.5 });
    check(BX2 + 18, rows[i] + 1, 22, { alpha: a * named(t, conds[i] + 0.5), width: 3.5 });
    nameText(v, BX2 + 56, rows[i], {
      align: "left",
      width: 520,
      alpha: a * listIn(t, conds, i),
      set: "09.3:conditions"
    });
  });
}
var MARK = [960, 470, 900];
var PART_NOTE = 220;
var MOUTH = [120, 1];
function close(s, t, a) {
  if (a <= 0) return;
  const [cutAt2, markAt, originAt, beforeAt, twoAt, whereAt, boundaryAt, scopeAt, pointAt, boundAt] = cues(s, [
    ["ETHOS 的标志", "The ETHOS mark"],
    ["ETHOS 的标志", "the ETHOS mark"],
    ["一个起点", "One origin"],
    ["先划清边界", "bounded before it becomes a change"],
    ["两条路径", "Two passages"],
    ["只在影响行动的地方分开", "only where they decide action"],
    ["一道边界", "One boundary"],
    ["守在自己的范围里", "each keeping to their scope"],
    ["那一点朱红", "cinnabarred point"],
    ["必须落到证据上", "bound to its evidence"]
  ]);
  const [X, Y3, S] = MARK, k = S / 512, r = 164 * k, point = 14 * k, lit = ramp(t, boundaryAt - 0.15, 0.5), o = a * named(t, originAt), datum = named(t, pointAt), passages = soon(t, twoAt + 0.05, 1);
  ethosMark(X, Y3, S, {
    datum: 0,
    passages: 0,
    boundary: soon(t, cutAt2, 1.6),
    alpha: a * mix(0.58, 1, lit)
  });
  ethosMark(X, Y3, S, { datum: 0, boundary: 0, passages, alpha: a });
  ring(X, Y3, point, { color: P.ink, alpha: o * (1 - datum), width: 3 });
  ethosMark(X, Y3, S, { datum, hole: 1, passages: 0, boundary: 0, alpha: a });
  flowAlong(
    Array.from({ length: 65 }, (_, i) => {
      const ang = -0.7 - i / 64 * (2 * Math.PI - 1.4);
      return [X + r * Math.cos(ang), Y3 + r * Math.sin(ang)];
    }),
    flowClock(t),
    7,
    { single: true, color: P.line, alpha: a * (1 - lit) }
  );
  nameText(L("ETHOS 的标志", "The ETHOS mark"), X, Y3 + r + 16 * k + NAME_GAP, {
    valign: "top",
    alpha: a * ramp(t, markAt - (en ? 0.75 : 0.15), 0.4)
  });
  const pair = (term, termAt, said, saidAt, x, y, align, width = 380) => {
    nameText(term, x, y, {
      align,
      valign: "bottom",
      alpha: a * named(t, termAt),
      set: "09.4:parts"
    });
    nameText(said, x, y + 8, {
      align,
      valign: "top",
      size: NOTE,
      color: P.muted,
      width,
      alpha: a * named(t, saidAt),
      set: "09.4:said"
    });
  };
  const centred = (said, width) => Y3 + MOUTH[1] - (labelSize(LABEL) + 8 + labelSize(NOTE) * (1 + LEADING * (wrapName(said, width, NOTE).length - 1))) / 2 + labelSize(LABEL), under = Y3 + point + 2 * NAME_GAP + labelSize(LABEL), originSaid = L("先划清边界", "bounded first");
  pair(
    L("一个起点", "One origin"),
    originAt,
    originSaid,
    beforeAt,
    X - point - NAME_GAP,
    centred(originSaid, 380),
    "right"
  );
  const passagesName = L("两条路径", "Two passages"), passagesSaid = L("影响行动的地方", "only where they decide action");
  pair(
    passagesName,
    twoAt,
    passagesSaid,
    whereAt - (en ? 0.45 : 0),
    X + MOUTH[0],
    centred(passagesSaid, PART_NOTE),
    "left",
    PART_NOTE
  );
  const boundary = L("一道边界", "One boundary"), inner = r - 12.5 * k, corner = Math.sqrt(inner ** 2 - (measure(boundary) / 2) ** 2);
  pair(
    boundary,
    boundaryAt,
    L("守在自己的范围里", "each keeping to their scope"),
    scopeAt,
    X,
    Y3 - corner + NAME_GAP + labelSize(LABEL),
    "center",
    PART_NOTE
  );
  pair(
    L("那一点朱红", "Cinnabar-red point"),
    pointAt,
    L("必须落到证据上", "bound to its evidence"),
    boundAt,
    X + point,
    under,
    "right"
  );
}
scenes["09"] = function(s, t) {
  const [judgeAt, markAt] = cues(s, [
    ["不看是谁说的", "does not depend on"],
    ["ETHOS 的标志", "The ETHOS mark"]
  ]);
  const a1 = stageOut(t, judgeAt), a2 = stageIn(t, judgeAt) * stageOut(t, markAt), a3 = stageIn(t, markAt);
  illustrative(a1 + a2);
  bound(s, t, a1);
  judged(s, t, a2, judgeAt + STAGE_CUT);
  close(s, t, a3);
};

// picture/film/playback.js
var CUT_LAG = 0.6;
var continues = (i) => i > 0 && film.segments[i - 1].chapter === film.segments[i].chapter;
var firstTexts = /* @__PURE__ */ new Map();
function firstTextOf(s) {
  if (firstTexts.has(s.id)) return firstTexts.get(s.id);
  const saved = { ctx, layout, sceneFade, wordFade, measuring }, scene = window.__sceneId;
  const meter = measuringContext();
  let found = Infinity;
  setDrawing({ measuring: true, ctx: meter });
  try {
    for (let t = s.voice_start - 0.3; t <= s.voice_start + CUT_LAG + 0.2; t += 1 / 60) {
      setDrawing({ layout: { texts: [], scene: s.id }, sceneFade: 1, wordFade: 1 });
      meter.setTransform(1, 0, 0, 1, 0, 0);
      meter.save();
      push(s, t);
      scenes[s.id](s, t);
      meter.restore();
      if (layout.texts.some((v) => contrastOf(v.color, v.alpha) >= 4.5)) {
        found = t;
        break;
      }
    }
  } finally {
    setDrawing(saved);
    window.__sceneId = scene;
  }
  firstTexts.set(s.id, found);
  return found;
}
var cutAt = (v) => {
  const voice = Math.max(v.start, v.voice_start, v.words?.[0]?.start ?? -Infinity);
  return scenes[v.id]?.carries ? voice : Math.min(voice + CUT_LAG, Math.max(voice, firstTextOf(v)));
};
var visualStart = (i) => continues(i) ? cutAt(film.segments[i]) : film.segments[i].start;
function drawScene(s, t, fade, words = fade) {
  const scene = scenes[s.id];
  if (!scene) throw Error(`Unimplemented scene ${s.id}`);
  layout.scene = s.id;
  setDrawing({ sceneFade: fade, wordFade: words });
  window.__sceneId = s.id;
  ctx.save();
  push(s, t);
  scene(s, t);
  ctx.restore();
  layout.scene = null;
  setDrawing({ sceneFade: 1, wordFade: 1 });
  window.__sceneId = null;
}
function drawAt(t) {
  setDrawing({ layout: { texts: [], scene: null, time: t } });
  ctx.setTransform(resolution, 0, 0, resolution, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = P.ground;
  ctx.fillRect(0, 0, 1920, 1080);
  const creditStart = film.duration - film.credits_duration;
  if (t >= creditStart) {
    credits(t);
    publish(t);
    return;
  }
  const index = Math.max(
    0,
    film.segments.findLastIndex((v2) => v2.start <= t)
  );
  const s = film.segments[index];
  const next = film.segments[index + 1], prev = film.segments[index - 1];
  let shown = index;
  while (shown > 0 && continues(shown) && t < visualStart(shown)) shown--;
  if (next && continues(index + 1) && t >= visualStart(index + 1)) shown = index + 1;
  const fadeIn = index === 0 || prev && prev.chapter === s.chapter ? 1 : ramp(t, s.start, 0.6);
  const fadeOut = next && next.chapter === s.chapter ? 1 : 1 - ramp(t, s.end - 0.5, 0.5);
  const keep = Math.min(fadeIn, fadeOut);
  const v = film.segments[shown];
  drawScene(v, t, keep);
  chapterCard(next && opensChapter(next) && t >= next.start - 0.15 ? next : s, t);
  runningHead(s, t);
  caption(t);
  publish(t);
}
function publish(t) {
  window.__filmLayout = { time: t, texts: layout.texts };
}
window.renderFrame = (t) => drawAt(t + (film.render_offset || 0));
window.renderCover = () => {
  setDrawing({ layout: { texts: [] } });
  ctx.setTransform(resolution, 0, 0, resolution, 0, 0);
  ctx.fillStyle = P.ground;
  ctx.fillRect(0, 0, 1920, 1080);
  titleSignature(1);
};
window.__filmScenes = scenes;
window.renderFrame(0);
