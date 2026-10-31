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
var P = {
  ground: "#0F1519",
  row: "#1E2932",
  line: "#63758B",
  ink: "#ECE8DF",
  muted: "#9BA8B1",
  evidence: "#7DB7D8",
  authority: "#E0BF78",
  unknown: "#C9785C"
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
var pass = (q, edge = 0.12) => clamp(q / edge) * clamp((1 - q) / edge);

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
  let cursor = 0, first = null, close = null, said = null;
  for (const w of s.words) {
    const n = units(w.text).length;
    if (first === null && cursor + n > index) first = w.start;
    if (close === null && cursor + n >= index + target.length) close = w.end;
    if (cursor + n >= clause) {
      said = w.end;
      break;
    }
    cursor += n;
  }
  if (first === null || close === null) throw Error(`Unresolved spoken cue ${key}`);
  phraseEnd.set(
    first,
    Math.max(phraseEnd.get(first) ?? 0, Math.min(said ?? close, first + 4.5), close)
  );
  const value = end ? close : first;
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
var quietBefore = thoughtJoins.reduce(
  (sums, [end, next]) => [...sums, sums.at(-1) + Math.max(0, next - end)],
  [0]
);
var voiceTime = (t) => {
  let lo = 0, hi = thoughtJoins.length;
  while (lo < hi) {
    const mid = lo + hi >> 1;
    if (thoughtJoins[mid][0] < t) lo = mid + 1;
    else hi = mid;
  }
  if (!lo) return t;
  const [end, next] = thoughtJoins[lo - 1];
  return t - quietBefore[lo - 1] - Math.max(0, Math.min(t, next) - end);
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
  const record = {
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
  layout.texts.push(record);
  return record;
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
var flowDot = (x, y, r, q, o) => dot(x, y, r * pass(q), o);

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
  const c = cameraOf(s, t);
  return clamp((c.oy + c.k * (y - c.ay) - 45 - titleY(s, t)) / 60);
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
function link(x1, y1, x2, y2, {
  route = null,
  mid = null,
  r = 14,
  color = P.line,
  alpha = 1,
  upto = 1,
  width = 2,
  dash = null,
  flow = null,
  end = true
} = {}) {
  if (alpha < 0.01 || upto <= 0 || Math.hypot(x2 - x1, y2 - y1) < 1) return;
  const kind = route ?? (Math.abs(x1 - x2) < 0.5 || Math.abs(y1 - y2) < 0.5 ? "straight" : "vhv");
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
  if (end) dot(x2, y2, width + 2.5, { color, alpha: alpha * clamp((upto - 0.9) / 0.1) });
  if (flow !== null && flow < upto) {
    const [px, py] = along(points, flow).point;
    flowDot(px, py, width + 2, flow, { color, alpha });
  }
}

// picture/film/drawing/two-lines.js
var TWO_LINES = { x0: 360, x1: 1560, y1: 400, y2: 600, split: 1280, part: 80 };
function driftingLines(t, { alpha = 1, upto = 1, drift = 0, bump = 0 } = {}) {
  if (alpha < 0.01 || upto <= 0) return;
  const { x0, x1, y1, y2, split, part } = TWO_LINES, reach = mix(x0, x1, clamp(upto));
  const yUp = (x) => y1 - (x > 700 && x < 820 ? 26 * bump * Math.sin(Math.PI * (x - 700) / 120) : 0) - (x > split ? part * drift * ease((x - split) / (x1 - split)) : 0);
  const yLow = (x) => y2 + (x > split ? part * drift * ease((x - split) / (x1 - split)) : 0);
  const sample = (fn) => {
    const p = [];
    for (let x = x0; x <= reach; x += 8) p.push([x, fn(x)]);
    if (p.at(-1)[0] < reach) p.push([reach, fn(reach)]);
    return p;
  };
  path(sample(yUp), { color: P.authority, alpha, width: 4 });
  path(sample(yLow), { color: P.evidence, alpha, width: 4 });
  dot(reach, yUp(reach), 7, { color: P.authority, alpha });
  dot(reach, yLow(reach), 7, { color: P.evidence, alpha });
  return { yUp, yLow };
}
function answerStation(x, y, kind, { alpha = 1, lit = 0, swap = 0 } = {}) {
  if (alpha < 0.01) return;
  const tone = blend(P.ink, P.evidence, lit);
  dot(x, y, 26, { color: P.ground, alpha });
  ring(x, y, 26, { color: tone, alpha, width: 2.5 + lit });
  if (kind === "code") {
    const old = alpha * (1 - clamp(swap)), fresh = alpha * clamp(swap);
    path(
      [
        [x - 6, y - 10],
        [x - 14, y],
        [x - 6, y + 10]
      ],
      { color: tone, alpha: old, width: 2.5 }
    );
    path(
      [
        [x + 6, y - 10],
        [x + 14, y],
        [x + 6, y + 10]
      ],
      { color: tone, alpha: old, width: 2.5 }
    );
    diamond(x, y, 10, { color: tone, alpha: fresh });
  }
  if (kind === "data")
    [-8, 0, 8].forEach(
      (dy) => line(x - 12, y + dy, x + 12, y + dy, { color: tone, alpha, width: 2.5 })
    );
  if (kind === "use") person(x, y + 5, { alpha, color: tone, size: 0.55 });
}
function twoLines(upto, { alpha = 1, split = false, upColor = P.ink, lowColor = P.ink } = {}) {
  if (alpha < 0.01 || upto <= 0) return;
  const { x0, x1, y1, y2 } = TWO_LINES, reach = mix(x0, x1, clamp(upto));
  if (split) {
    line(x0, y1, reach, y1, { color: upColor, alpha, width: 4 });
    line(x0, y2, reach, y2, { color: lowColor, alpha, width: 4 });
  } else
    stroke(
      () => {
        ctx.moveTo(x0, y1);
        ctx.lineTo(reach, y1);
        ctx.moveTo(x0, y2);
        ctx.lineTo(reach, y2);
      },
      { color: upColor, alpha, width: 4 }
    );
  dot(reach, y1, 7, { color: upColor, alpha });
  dot(reach, y2, 7, { color: lowColor, alpha });
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
function kernelIcon(x, y, r, { alpha = 1, color = P.authority, beat = 0 } = {}) {
  if (alpha < 0.01) return;
  const build = () => {
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + i * Math.PI / 3, px = x + r * Math.cos(a), py = y + r * Math.sin(a);
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
  if (upto > 0.9) dot(x + r * Math.cos(a), y + r * Math.sin(a), 5, { color, alpha });
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
var listLevel = (t, ats, i, until = Infinity) => {
  const last = ats.at(-1), said = pauseHold(Math.max(last + 1.5, (phraseEnd.get(last) ?? last) + 0.3), 0.4);
  const cut = Math.min(
    ...[...stageCuts.get(layout.scene) ?? []].filter((c) => c > last && c < thoughtEnd(last))
  );
  const end = Math.min(thoughtEnd(last), cut);
  const done = Math.min(said, Math.max(last - 0.1, end - 0.45)), back = Math.min(0.4, Math.max(0.15, end - 0.05 - done));
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
var building = (t, ats, step = 48, lead = 0.1) => step * ats.slice(1).reduce((v, at) => v + 1 - soon(t, at - lead, 0.4), 0);

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
function nameText(v, x, y, { width = Infinity, size = LABEL, valign = "middle", align = "center", ...o } = {}) {
  const lines = Array.isArray(v) ? v : wrapName(v, width, size), em = labelSize(size), step = em * LEADING;
  const top = valign === "top" ? y + em / 2 : valign === "bottom" ? y - em / 2 - step * (lines.length - 1) : y - step * (lines.length - 1) / 2;
  lines.forEach(
    (line2, k) => text(line2, x, top + k * step, size, { align, ...o, whole: lines.join(" ") })
  );
  return { lines, top: top - em / 2, bottom: top + step * (lines.length - 1) + em / 2 };
}
var lineCaches = /* @__PURE__ */ new WeakMap();
function growLines(parts, width = Infinity, size = LABEL) {
  const cache = lineCaches.get(ctx) ?? /* @__PURE__ */ new Map(), key = JSON.stringify([String(width), size, parts]);
  lineCaches.set(ctx, cache);
  if (cache.has(key)) return cache.get(key);
  const greedy = [[]];
  parts.forEach((part, k) => {
    const line2 = greedy.at(-1);
    if (line2.length && measure([...line2.map((j) => parts[j]), part].join(""), size) > width)
      greedy.push([k]);
    else line2.push(k);
  });
  let lines = greedy;
  const n = greedy.length, span = (a, b) => measure(parts.slice(a, b).join(""), size);
  const widths = greedy.map((line2) => span(line2[0], line2.at(-1) + 1));
  if (n > 1 && parts.length <= 16 && widths.at(-1) < 0.4 * Math.max(...widths)) {
    let best = null;
    const search = (left, cuts) => {
      const from = cuts.at(-1) ?? 0;
      if (left === 1) {
        const ends = [...cuts, parts.length], starts = [0, ...cuts], widths2 = ends.map((end, i) => span(starts[i], end));
        if (!widths2.every((w, i) => w <= width || ends[i] - starts[i] === 1)) return;
        const worst = Math.max(...widths2), spread = widths2.reduce((sum, v) => sum + v * v, 0);
        if (!best || worst < best.worst - 0.5 || Math.abs(worst - best.worst) <= 0.5 && spread < best.spread)
          best = { starts, ends, worst, spread };
        return;
      }
      for (let cut = from + 1; cut <= parts.length - left + 1; cut++)
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
function growTexts(parts, width = Infinity, size = LABEL) {
  const lines = growLines(parts, width, size).map((line2) => line2.map((k) => [k, parts[k]]));
  lines.forEach((line2, r) => {
    const [k, v] = line2[0], lead = r ? v.match(/^[、，,;；\s]+/u)?.[0] ?? "" : "";
    if (!lead) return;
    line2[0] = [k, v.slice(lead.length)];
    const mark = lead.replace(/\s+/gu, "");
    if (mark) lines[r - 1].push([k, mark]);
  });
  return lines;
}
function growName(t, parts, ats, x, y, { width = Infinity, size = LABEL, valign = "top", alpha = 1, build = false, ...o } = {}) {
  const em = labelSize(size), step = em * LEADING, lines = growTexts(parts, width, size);
  const top = valign === "top" ? y + em / 2 : valign === "bottom" ? y - em / 2 - step * (lines.length - 1) : y - step * (lines.length - 1) / 2;
  lines.forEach((line2, r) => {
    let left = x;
    line2.forEach(([k, v]) => {
      const at = build ? ats[k] ?? ats[0] : ats[0];
      text(v, left, top + r * step, size, {
        align: "left",
        ...o,
        alpha: alpha * ramp(t, at - 0.15, 0.4),
        whole: o.whole ?? parts.join("")
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
function termRowLayout(term, qual, width = Infinity) {
  const one = !qual.length || measure(term.join(""), LABEL) + TERM_GAP + measure(qual.join(""), NOTE) <= width;
  const head = blockHeight(growLines(term, width).length);
  return {
    one,
    height: one ? head : head + 4 + blockHeight(growLines(qual, width, NOTE).length, NOTE)
  };
}
function termRow(t, term, termAts, qual, qualAts, x, y, { width = Infinity, alpha = 1, color = P.ink, set = null, build = false } = {}) {
  const whole = [...term, ...qual].join(" "), head = growName(t, term, termAts, x, y, { width, alpha, color, whole, set });
  if (!qual.length) return head;
  const { one } = termRowLayout(term, qual, width), after = x + measure(term.join(""), LABEL) + TERM_GAP;
  const tail = growName(
    t,
    qual,
    qualAts,
    one ? after : x,
    one ? head.top + (labelSize(LABEL) - labelSize(NOTE)) / 2 : head.bottom + 4,
    { size: NOTE, alpha, color: P.muted, width: one ? Infinity : width, whole, set, build }
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
  set = null
} = {}) {
  const block = nameText(v, x, y, {
    align,
    valign,
    width,
    size,
    color: P.muted,
    alpha: alpha * mix(1, 0.7, clamp(mark)),
    set
  });
  const w = Math.max(...block.lines.map((line2) => measure(line2, size))), left = align === "left" ? x : align === "right" ? x - w : x - w / 2;
  const s = Math.min(26, labelSize(size) * 0.9);
  cross(left + w + 16 + s / 2, (block.top + block.bottom) / 2, s, {
    alpha: alpha * mark,
    width: 3
  });
  return { ...block, left, right: left + w + 16 + s };
}

// picture/film/naming/placement.js
var CONTENT_CY = 500;
function railNames(names, xs, y, {
  side = 1,
  gap = NAME_GAP + 18,
  size = LABEL,
  alpha = () => 1,
  color = () => P.ink,
  wrap = RAIL_WRAP,
  set = `rail:${names[0]}`
} = {}) {
  const room = (i) => Math.min(i ? xs[i] - xs[i - 1] : Infinity, i + 1 < xs.length ? xs[i + 1] - xs[i] : Infinity) - 30;
  names.forEach((v, i) => {
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
function railStations(names, first, last, { size = LABEL, gap = 34, wrap = RAIL_WRAP } = {}) {
  const widths = names.map(
    (v) => Math.max(...wrapName(v, wrap, size).map((line2) => measure(line2, size)))
  );
  const need = widths.slice(1).map((w, i) => (widths[i] + w) / 2 + gap);
  const slack = Math.max(0, last - first - need.reduce((a, b) => a + b, 0)) / Math.max(1, need.length);
  return need.reduce((xs, d) => [...xs, xs.at(-1) + d + slack], [first]);
}
function radialName(v, cx, cy, r, a, { gap = NAME_GAP, ry = r, width = 260, ...o } = {}) {
  const c = Math.cos(a), sn = Math.sin(a), x = cx + c * (r + gap), y = cy + sn * (ry + gap);
  const align = c > 0.3 ? "left" : c < -0.3 ? "right" : "center", valign = align === "center" ? sn > 0 ? "top" : "bottom" : "middle";
  return nameText(v, x, y, { align, valign, width, ...o });
}

// picture/film/scenes/two-lines/drift.js
scenes["01"] = function(s, t) {
  const [lines, mine, solve, other, answer, code, data, use] = cues(s, [
    ["两条线", "two lines"],
    ["对问题的理解", "our understanding"],
    ["要解决什么", "what we are trying to solve"],
    ["另一条", "The other"],
    ["答案", "answer"],
    ["代码", "code"],
    ["数据", "data"],
    ["实际使用", "real use"]
  ]);
  const [change, tools, turns, apart, guess, nextOne] = cues(s, [
    ["理解会变", "Understanding changes"],
    ["工具会换", "tools are replaced"],
    ["轮流接手", "take turns"],
    ["对不上", "drift apart"],
    ["从头去猜", "start by guessing"],
    ["后来接手的人", "whoever picks"]
  ]);
  const [ethos, design, share, repo, nameAt] = cues(s, [
    ["ETHOS 就是", "ETHOS is designed"],
    ["针对这种情况设计", "designed for this situation"],
    ["人和 Agent 在", "people and agents share"],
    ["同一个仓库", "on a repository"],
    ["这个名字", "The name stands"]
  ]);
  const initials = en ? cues(s, [
    ["", "Evidence-grounded"],
    ["", "Trust"],
    ["", "Human-Agent"],
    ["", "Operational"],
    ["", "Stewardship"]
  ]) : Array(5).fill(cue(s, "英文词的首字母", ""));
  const meaning = en ? null : cue(s, "信任要建立在证据上", "");
  const lights = en ? null : [
    cue(s, "证据", ""),
    meaning,
    cueFrom(s, "人和 Agent", "", nameAt),
    cue(s, "一项工作", ""),
    cue(s, "打理", "")
  ];
  const [promiseAt, refused, three, intent, unsure, actOn, recover, aims, docAt, notAt, notYet] = cues(s, [
    ["它不是要", "It promises"],
    ["多加一层治理", "more governance"],
    ["三件事", "three things"],
    ["已经采纳的意图", "accepted intent"],
    ["不确定的地方", "uncertainty is stated"],
    ["好让人", "so that someone"],
    ["出了错", "results can be recovered"],
    ["ETHOS 要达到", "what ETHOS aims"],
    ["自己的文档", "its own documents"],
    ["还不能说", "cannot yet"],
    ["全部兑现", "counted as delivered"]
  ]);
  const result = en ? null : cue(s, "结果恢复", "");
  const drawOn = en ? cue(s, "", "moves along") : lines;
  const first = Math.min(lines, s.voice_start);
  const title = stageOut(t, first - 0.45);
  if (title > 0) titleSignature(title);
  const stageA = stageIn(t, first - 0.45) * stageOut(t, change), stageA2 = stageIn(t, change) * stageOut(t, ethos);
  const stageB1 = stageIn(t, ethos) * stageOut(t, nameAt), stageB2 = stageIn(t, nameAt) * stageOut(t, promiseAt), stageC = stageIn(t, promiseAt);
  const { x0, y1, y2 } = TWO_LINES;
  if (stageA > 0) {
    const opened = stageA * ramp(t, s.voice_start - 0.15, 0.4);
    repoIcon(268, 500, 96, 120, { alpha: opened });
    line(x0, y1, x0, y2, { color: P.line, alpha: opened });
    nameText(L("一个项目", "A project"), 268, 560 + NAME_GAP, {
      valign: "top",
      alpha: stageA * named(t, s.voice_start)
    });
    twoLines(soon(t, drawOn - 0.15, 1), {
      alpha: stageA,
      split: t >= mine - 0.15,
      upColor: blend(P.ink, P.authority, ramp(t, mine - 0.15, 0.4)),
      lowColor: blend(P.ink, P.evidence, ramp(t, other - 0.15, 0.4))
    });
    nameText(L("两条线", "Two lines"), x0 + 28, (y1 + y2) / 2, {
      align: "left",
      alpha: stageA * named(t, drawOn)
    });
    const term = [L("对问题的理解", "Our understanding of the problem")], qual = en ? ["what to solve, ", "what counts as solved"] : ["要解决什么，", "做到什么程度算解决"];
    const qualAts = en ? [solve, cue(s, "what would count", "what would count")] : [solve, cue(s, "做到什么程度", "")];
    const { height } = termRowLayout(term, qual, 1100);
    termRow(t, term, [mine], qual, qualAts, x0, y1 - NAME_GAP - height, {
      width: 1100,
      alpha: stageA,
      color: P.authority,
      build: true
    });
    const xs = [1e3, 1200, 1400], ats = [code, data, use], kinds = ["code", "data", "use"];
    nameText(L("答案", "Answers"), x0, y2 + 26 + NAME_GAP, {
      align: "left",
      valign: "top",
      color: P.evidence,
      alpha: stageA * named(t, answer)
    });
    xs.forEach(
      (x, i) => answerStation(x, y2, kinds[i], {
        alpha: stageA * ramp(t, ats[i] - 0.15, 0.4),
        lit: speaking(t, ats, i)
      })
    );
    railNames(en ? ["Code", "Data", "Real use"] : ["代码", "数据", "实际使用"], xs, y2 + 26, {
      gap: NAME_GAP,
      alpha: (i) => stageA * listIn(t, ats, i),
      set: "sources"
    });
    const q = voiceTime(t) * 0.35 % 1;
    flowDot(mix(1500, 420, q), y2, 7, q, {
      color: P.evidence,
      alpha: stageA * ramp(t, use + 0.3, 0.4)
    });
  }
  if (stageA2 > 0) {
    const turnsOn = ramp(t, turns - 0.15, 0.4) * stageA2;
    driftingLines(t, {
      alpha: stageA2,
      bump: soon(t, change + 0.05, 0.5),
      drift: soon(t, apart + 0.05, 1.2)
    });
    nameText(L("理解", "Understanding"), x0 - NAME_GAP, y1, {
      align: "right",
      color: P.authority,
      alpha: stageA2
    });
    nameText(L("答案", "Answers"), x0 - NAME_GAP, y2, {
      align: "right",
      color: P.evidence,
      alpha: stageA2
    });
    nameText(L("理解会变", "Understanding changes"), 760, y1 - 26 - NAME_GAP, {
      valign: "bottom",
      alpha: stageA2 * named(t, change)
    });
    answerStation(900, y2, "code", {
      alpha: stageA2 * ramp(t, tools - 0.15, 0.4),
      swap: soon(t, tools + 0.3, 0.5),
      lit: speaking(t, [tools, turns], 0)
    });
    nameText(L("工具会换", "Tools are replaced"), 900, y2 + 26 + NAME_GAP, {
      valign: "top",
      alpha: stageA2 * named(t, tools)
    });
    person(1060, 490, { alpha: turnsOn, size: 0.8 });
    agent(1200, 478, { alpha: ramp(t, turns + 0.3, 0.4) * stageA2, size: 0.8 });
    link(1084, 478, 1176, 478, { alpha: turnsOn, upto: soon(t, turns + 0.2, 0.5) });
    nameText(L("人和 Agent 轮流接手", "People and agents take turns"), 1130, 512 + NAME_GAP, {
      valign: "top",
      alpha: stageA2 * named(t, turns)
    });
    const who = stageA2 * named(t, nextOne), GX = 1700, GY = (y1 + y2) / 2;
    person(GX, GY + 10, { alpha: who, size: 1 });
    text("?", GX, GY - 58, 44, {
      role: "mark",
      align: "center",
      color: P.unknown,
      alpha: stageA2 * ramp(t, guess - 0.1, 0.4)
    });
    nameText(L("后来接手的人", "Whoever picks it up"), GX, GY + 48 + NAME_GAP, {
      valign: "top",
      width: 220,
      alpha: who
    });
  }
  const designName = L("针对这种情况设计", "For this situation");
  if (stageB1 > 0) {
    const grow = soon(t, share - 0.65, 0.5), W = mix(Math.max(420, measure(designName) + 64), 720, grow), H = mix(200, 400, grow);
    const RX = 960, RY = mix(470, 530, grow), top = RY - H / 2, PY = 610, on = named(t, share) * stageB1;
    repoIcon(RX, RY, W, H, { alpha: stageB1 });
    text("ETHOS", RX, top + 70, 84, {
      role: "mark",
      bold: true,
      align: "center",
      color: P.authority,
      alpha: stageB1
    });
    nameText(designName, RX, top + 128, { valign: "top", alpha: stageB1 * named(t, design) });
    person(RX - 150, PY, { alpha: on, size: 1.1 });
    agent(RX + 150, PY - 16, { alpha: on, size: 1.1 });
    documentIcon(RX - 26, PY - 90, 52, 66, { alpha: on, rows: 3 });
    link(RX - 104, PY - 57, RX - 34, PY - 57, { alpha: on, upto: soon(t, share + 0.2, 0.5) });
    link(RX + 112, PY - 57, RX + 34, PY - 57, { alpha: on, upto: soon(t, share + 0.4, 0.5) });
    railNames([L("人", "People"), "Agent"], [RX - 150, RX + 150], PY + 40, {
      gap: NAME_GAP,
      alpha: () => on,
      set: "share"
    });
    nameText(L("同一个仓库", "One repository"), RX, RY + H / 2 + NAME_GAP, {
      valign: "top",
      alpha: stageB1 * named(t, repo)
    });
  }
  if (stageB2 > 0) {
    const words = ["Evidence-grounded", "Trust", "Human-Agent", "Operational", "Stewardship"], xs = railStations(words, 260, 1660);
    const LY = meaning === null ? CONTENT_CY - 40 : CONTENT_CY - 70, W = measure("ETHOS", 84, true, "mark");
    const spread = soon(t, nameAt + STAGE_CUT, en ? 0.5 : 0.8);
    words.forEach((v, i) => {
      const from = 960 - W / 2 + measure("ETHOS".slice(0, i), 84, true, "mark") + measure(v[0], 84, true, "mark") / 2;
      const lit = en ? speaking(t, initials, i) : ramp(t, lights[i] - 0.1, 0.4), c = blend(P.authority, P.ink, lit);
      ring(xs[i], LY, 66, {
        color: c,
        alpha: stageB2 * ramp(t, initials[i] - 0.15, 0.4),
        width: 3
      });
      text(v[0], mix(from, xs[i], spread), mix(400, LY + 2, spread), 84, {
        role: "mark",
        bold: true,
        align: "center",
        color: c,
        alpha: stageB2
      });
    });
    railNames(words, xs, LY + 66, {
      gap: NAME_GAP - 4,
      alpha: (i) => stageB2 * (en ? listIn(t, initials, i) : named(t, initials[0])),
      set: "initials"
    });
    if (meaning !== null) {
      [
        [2, "人和 Agent"],
        [3, "一项工作"],
        [4, "打理"]
      ].forEach(
        ([i, v]) => nameText(v, xs[i], LY + 128, {
          valign: "top",
          color: P.authority,
          alpha: stageB2 * named(t, lights[i])
        })
      );
      nameText("信任要建立在证据上", 960, LY + 186, {
        valign: "top",
        color: P.authority,
        alpha: stageB2 * named(t, meaning)
      });
    }
  }
  if (stageC > 0) {
    const rows = en ? [
      ["Intent is not lost"],
      ["Uncertainty is stated", ", so someone can act on it"],
      ["Results can be recovered"]
    ] : [
      ["采纳的意图不会丢"],
      ["不确定的地方会说出来", "，好让人接着处理"],
      ["出了错，", "结果能恢复"]
    ];
    const partAts = en ? [[intent], [unsure, actOn], [recover]] : [[intent], [unsure, actOn], [recover, result]], ats = partAts.map((v) => v[0]);
    const come = (at) => soon(t, at - 0.45, 0.5), widths = rows.map((r) => r.map((v) => measure(v)));
    const widest = Math.max(...widths.map((w) => w.reduce((a, b) => a + b, 0)));
    const aimName = L("ETHOS 的目标", "What ETHOS aims for"), aimW = Math.max(...wrapName(aimName, 260).map((v) => measure(v)));
    const header = L("三件事", "Three promises"), docName = L("自己的文档", "Its own documents"), note = L("还不能说已经全部兑现", "Not yet all delivered");
    const stackW = 360, gapStack = 80, ys = [400, 500, 600], SY = CONTENT_CY - 34, DY = 690;
    const IXr = stackW + gapStack + 30, BXr = IXr + 30 + NAME_GAP + widest + 40, listOn = come(three);
    let R = Math.max(
      stackW,
      mix(stackW, IXr + 30, listOn),
      mix(stackW, IXr - 30 + measure(header, NOTE), listOn)
    );
    rows.forEach((r, i) => {
      const w = r.reduce((v, part, k) => v + widths[i][k] * come(partAts[i][k]), 0);
      R = Math.max(R, mix(stackW, IXr + 30 + NAME_GAP + w, come(ats[i])));
    });
    R = Math.max(R, mix(stackW, BXr + NAME_GAP + aimW, come(aims)));
    const docW = 40 + NAME_GAP + measure(docName), noteW = TERM_GAP + measure(note, NOTE);
    R = Math.max(
      R,
      mix(stackW, IXr - 30 + docW, come(docAt)),
      mix(stackW, IXr - 30 + docW + noteW, come(notAt))
    );
    const X0 = 960 - R / 2, IX = X0 + IXr, BX = X0 + BXr, SX = X0 + stackW / 2;
    layersIcon(SX, SY, stackW, 200, { color: P.muted, alpha: stageC });
    const refusedName = en ? Math.max(promiseAt + STAGE_CUT + 0.25, refused - 1.35) : refused;
    rejectedName(L("多加一层治理", "More governance"), SX, SY + 100 + NAME_GAP, {
      valign: "top",
      alpha: stageC * named(t, refusedName),
      mark: ramp(t, refused + 0.3, 0.4)
    });
    const waiting = ys.filter((y, i) => t < ats[i] + 0.3);
    if (waiting.length)
      stroke(
        () => waiting.forEach((y) => {
          ctx.moveTo(IX + 30, y);
          ctx.arc(IX, y, 30, 0, Math.PI * 2);
        }),
        { color: P.muted, alpha: stageC * ramp(t, three - 0.15, 0.4), width: 3, dash: [6, 6] }
      );
    nameText(header, IX - 30, ys[0] - 30 - NAME_GAP, {
      align: "left",
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: stageC * named(t, three)
    });
    const open = ramp(t, notYet + 0.05, 0.5);
    rows.forEach((r, i) => {
      const on = ramp(t, ats[i] - 0.15, 0.4) * stageC, y = ys[i], c = [P.authority, P.evidence, P.evidence][i];
      ring(IX, y, 30, { color: c, alpha: on * (1 - open), width: 2.5 });
      ring(IX, y, 30, { color: c, alpha: on * open, width: 2.5, dash: [6, 6] });
      if (i === 0) check(IX, y + 2, 26, { color: c, alpha: on });
      if (i === 1) text("?", IX, y + 1, 26, { role: "mark", align: "center", color: c, alpha: on });
      if (i === 2) recoverIcon(IX, y, 14, { color: c, alpha: on });
      growName(t, r, partAts[i], IX + 30 + NAME_GAP, y, {
        valign: "middle",
        alpha: stageC * listLevel(t, ats, i),
        build: true,
        set: "promises"
      });
    });
    const aim = stageC * named(t, aims);
    link(BX, ys[0] - 30, BX, ys[2] + 30, {
      alpha: aim,
      upto: soon(t, aims + 0.05, 0.5),
      end: false
    });
    nameText(aimName, BX + NAME_GAP, (ys[0] + ys[2]) / 2, {
      align: "left",
      color: P.authority,
      alpha: aim,
      width: 260
    });
    documentIcon(IX - 30, DY - 26, 40, 52, { alpha: stageC * ramp(t, docAt - 0.15, 0.4), rows: 2 });
    termRow(
      t,
      [docName],
      [docAt],
      [note],
      [notAt],
      IX - 30 + 40 + NAME_GAP,
      DY - labelSize(LABEL) / 2,
      { alpha: stageC }
    );
  }
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
  if (flow !== null) {
    const q = flow, px = mix(feedX + r, storeX - storeW / 2, q);
    flowDot(px, y, 8 * Math.max(k, 0.6), q, { color: P.evidence, alpha });
  }
  return place;
}
var SIGNAL_CURVE = [0.3, 0.46, 0.38, 0.58, 0.5, 0.66, 0.56, 0.74, 0.62, 0.82, 0.7, 0.92];
function signalMark(x, y, w, h, { alpha = 1, at = 0.62, seen = 0, marker = 1, color = P.ink } = {}) {
  const x0 = x - w / 2, x1 = x + w / 2, bottom = y + h / 2, top = y - h / 2;
  const point = (i) => [
    mix(x0, x1, i / (SIGNAL_CURVE.length - 1)),
    mix(bottom, top, SIGNAL_CURVE[i])
  ];
  const place = { x0, x1, top, bottom, markerX: mix(x0, x1, at), point };
  if (alpha < 0.01) return place;
  line(x0, bottom, x1, bottom, { color: P.line, alpha });
  path(
    SIGNAL_CURVE.map((_, i) => point(i)),
    { color, alpha, width: 3 }
  );
  const n = Math.round(SIGNAL_CURVE.length * clamp(seen));
  SIGNAL_CURVE.forEach((_, i) => {
    if (i >= n) return;
    const [px, py] = point(i), late = px > place.markerX;
    dot(px, py, 8, { color: late ? P.unknown : P.evidence, alpha });
  });
  if (marker > 0.01)
    dashed(place.markerX, top - 16, place.markerX, bottom, {
      color: P.authority,
      alpha: alpha * marker,
      width: 2.5
    });
  return place;
}

// picture/film/scenes/two-lines/examples.js
scenes["02"] = function(s, t) {
  const [open, pipe, whole, rerun, dup] = cues(s, [
    ["先看两件", "Take two"],
    ["行情数据管线", "market-data pipeline"],
    ["数据完整", "the data must be complete"],
    ["重新跑一遍", "running the same batch"],
    ["重复的记录", "duplicate records"]
  ]);
  const [other, ask, backtest, moment, avail, period] = cues(s, [
    ["另一件", "The other"],
    ["要追问的是", "was every piece"],
    ["回测", "the backtest"],
    ["做决策的时候", "the moment of each decision"],
    ["拿得到吗", "actually available"],
    ["换一段时间", "a different period"]
  ]);
  const holds = en ? period : cue(s, "结论还站得住", "");
  const [both, tools, differ, owner] = cues(s, [
    ["这两件事", "Both can"],
    ["同一套工具", "the same tools"],
    ["标准却完全不同", "entirely different standards"],
    ["由项目自己来定", "belong to the project"]
  ]);
  const [askAt, good, valid, tie, aAt, bAt, cAt, dAt, own] = cues(s, [
    ["什么是好的数据", "ETHOS does not decide"],
    ["好的数据", "good data"],
    ["有效的信号", "a valid signal"],
    ["理顺几件事", "ties together"],
    ["意图怎么定", "intent is set"],
    ["怎么协作", "collaborate"],
    ["怎么检验", "results are verified"],
    ["要改的时候", "things change"],
    ["按自己的标准", "by its own standards"]
  ]);
  const [after, only, notMeasured] = cues(s, [
    ["后面就拿", "These two examples"],
    ["只是举例", "only illustrate"],
    ["不是实测", "not measured"]
  ]);
  const stageA = stageOut(t, other), stageB = stageIn(t, other) * stageOut(t, both), stageC = stageIn(t, both) * stageOut(t, askAt);
  const stageD = stageIn(t, askAt) * stageOut(t, after), stageE = stageIn(t, after);
  const q = voiceTime(t) * 0.4 % 1;
  if (stageA > 0) {
    const Y = 480, m = pipelineMark(960, Y, 1200, {
      alpha: stageA,
      flow: q,
      back: soon(t, rerun + 0.05, 0.9),
      lit: ramp(t, dup - 0.1, 0.4)
    });
    const tag = L("例一", "Example one"), titleX = 360 + measure(tag, NOTE) + TERM_GAP;
    nameText(tag, 360, 272, {
      align: "left",
      size: NOTE,
      color: P.muted,
      alpha: stageA * named(t, open)
    });
    nameText(L("改进行情数据管线", "Improving a market-data pipeline"), titleX, 272, {
      align: "left",
      color: P.authority,
      alpha: stageA * named(t, pipe)
    });
    [
      [L("行情数据", "Market data"), m.feedX, pipe],
      [L("管线", "Pipeline"), m.runX, pipe],
      [L("记录", "Records"), m.storeX, dup]
    ].forEach(
      ([v, x, at]) => nameText(v, x, m.top - NAME_GAP, { valign: "bottom", alpha: stageA * named(t, at) })
    );
    const left = L("数据完整", "Complete data"), right = L("重跑不多出记录", "No duplicates after a rerun");
    const W = 44 + measure(left) + 80 + 44 + measure(right), X = 960 - W / 2, RY = m.loop + 64;
    check(X + 14, RY, 24, { alpha: stageA * ramp(t, whole - 0.15, 0.4) });
    nameText(left, X + 44, RY, { align: "left", alpha: stageA * named(t, whole) });
    const X2 = X + 44 + measure(left) + 80;
    check(X2 + 14, RY, 24, { alpha: stageA * ramp(t, dup - 0.15, 0.4) });
    nameText(right, X2 + 44, RY, { align: "left", alpha: stageA * named(t, dup) });
    illustrative(stageA);
  }
  if (stageB > 0) {
    const Y = 520, H = 260, band = stageB * ramp(t, period - 0.15, 0.4);
    const m = signalMark(960, Y, 1200, H, {
      alpha: stageB,
      seen: soon(t, ask - 0.1, 2.4),
      marker: ramp(t, moment - 0.15, 0.4)
    });
    const tag = L("例二", "Example two"), titleX = m.x0 + measure(tag, NOTE) + TERM_GAP;
    nameText(tag, m.x0, m.top - 28, {
      align: "left",
      size: NOTE,
      color: P.muted,
      alpha: stageB * named(t, other)
    });
    nameText(L("研究选股信号", "Studying a stock-selection signal"), titleX, m.top - 28, {
      align: "left",
      color: P.authority,
      alpha: stageB * named(t, other)
    });
    nameText(L("时间轴", "Time"), m.x1 + NAME_GAP, m.bottom, {
      align: "left",
      color: P.muted,
      alpha: stageB * named(t, other)
    });
    nameText(L("回测", "The backtest"), m.x1, m.bottom + NAME_GAP, {
      align: "right",
      valign: "top",
      alpha: stageB * named(t, backtest)
    });
    nameText(L("做决策的时候", "The moment of decision"), m.markerX + 14, m.top - 16, {
      align: "left",
      color: P.authority,
      alpha: stageB * named(t, moment)
    });
    const [fx, fy] = m.point(10);
    text("?", fx, fy - 40, 40, {
      role: "mark",
      align: "center",
      color: P.unknown,
      alpha: stageB * ramp(t, avail - 0.1, 0.4)
    });
    const bx0 = m.x0 + 40, bx1 = m.x0 + 500;
    path(
      [
        [bx0, m.bottom - 26],
        [bx0, m.bottom],
        [bx1, m.bottom],
        [bx1, m.bottom - 26]
      ],
      { color: P.evidence, alpha: band, width: 4 }
    );
    text("?", (bx0 + bx1) / 2, m.bottom - 56, 40, {
      role: "mark",
      align: "center",
      color: P.unknown,
      alpha: stageB * ramp(t, holds - 0.1, 0.4)
    });
    nameText(L("换一段时间", "A different period"), (bx0 + bx1) / 2, m.bottom + NAME_GAP, {
      valign: "top",
      alpha: stageB * named(t, period)
    });
    illustrative(stageB);
  }
  if (stageC > 0) {
    const LX = 540, RX = 1380, Y = 370, SY = 500;
    const p = pipelineMark(LX, Y, 620, { alpha: stageC, flow: q });
    signalMark(RX, Y + 6, 620, 130, { alpha: stageC, seen: 1, marker: 1 });
    nameText(L("改进行情数据管线", "Improving a market-data pipeline"), LX, p.top - 48, {
      valign: "bottom",
      alpha: stageC
    });
    nameText(L("研究选股信号", "Studying a stock-selection signal"), RX, p.top - 48, {
      valign: "bottom",
      alpha: stageC
    });
    const std = stageC * named(t, differ);
    const a = L("数据完整、重跑不重复", "Complete, no duplicates"), b = L("当时拿得到、换段时间站得住", "Available then, holds up later");
    seal(LX - measure(a) / 2 - 34, SY, 20, { alpha: std });
    nameText(a, LX + 0, SY, { color: P.authority, alpha: std });
    seal(RX - measure(b) / 2 - 34, SY, 20, { alpha: std });
    nameText(b, RX + 0, SY, { color: P.authority, alpha: std });
    const who = stageC * named(t, owner);
    person(960, SY - 8, { alpha: who, size: 1 });
    link(936, SY - 8, LX + measure(a) / 2 + 16, SY - 8, {
      alpha: who,
      upto: soon(t, owner + 0.1, 0.5)
    });
    link(984, SY - 8, RX - measure(b) / 2 - 62, SY - 8, {
      alpha: who,
      upto: soon(t, owner + 0.1, 0.5)
    });
    nameText(L("项目自己定", "The project decides"), 960, SY + 36 + NAME_GAP - 8, {
      valign: "top",
      color: P.authority,
      alpha: who
    });
    const tool = stageC * ramp(t, tools - 0.15, 0.4), BY = 660, BH = 66;
    box(260, BY - BH / 2, 1400, BH, { fill: P.row, stroke: P.line, alpha: tool, radius: 12 });
    terminalIcon(960 - 480 - 26, BY - 20, 52, 40, { color: P.muted, alpha: tool });
    folderIcon(960 + 480 - 26, BY - 19, 52, 38, { color: P.muted, alpha: tool });
    nameText(L("同一套工具", "The same tools"), 960, BY, { alpha: stageC * named(t, tools) });
    illustrative(stageC);
  }
  if (stageD > 0) {
    const KX = 960, KR = 58, KY = mix(CONTENT_CY - 20, 350, soon(t, tie - 0.2, 0.6)), RY = 590, R = 40;
    kernelIcon(KX, KY, KR, { alpha: stageD });
    text("ETHOS", KX, KY - KR - NAME_GAP - 18, 40, {
      role: "mark",
      bold: true,
      align: "center",
      color: P.authority,
      alpha: stageD
    });
    rejectedName(L("什么是好的数据", "What good data is"), KX - KR - 70, KY, {
      align: "right",
      alpha: stageD * named(t, en ? askAt + STAGE_CUT + 0.1 : good),
      mark: ramp(t, good + 0.3, 0.4)
    });
    rejectedName(L("什么是有效的信号", "What a valid signal is"), KX + KR + 70, KY, {
      align: "left",
      alpha: stageD * named(t, valid),
      mark: ramp(t, valid + 0.3, 0.4)
    });
    const names = en ? ["How intent is set", "How we collaborate", "How results are verified", "How things change"] : ["意图怎么定", "大家怎么协作", "结果怎么检验", "要改的时候怎么改"];
    const xs = railStations(names, 420, 1500), ats = [aAt, bAt, cAt, dAt];
    xs.forEach((x, i) => {
      const on = stageD * ramp(t, ats[i] - 0.15, 0.4), lit = speaking(t, ats, i), c = blend(P.ink, P.evidence, lit);
      link(KX, KY + KR, x, RY - R, {
        route: "vhv",
        mid: 490,
        alpha: stageD * ramp(t, tie - 0.15, 0.4),
        upto: soon(t, tie + i * 0.12, 0.6),
        color: P.line
      });
      dot(x, RY, R, { color: P.ground, alpha: on });
      ring(x, RY, R, { color: c, alpha: on, width: 2.5 });
      if (i === 0) documentIcon(x - 13, RY - 17, 26, 34, { alpha: on, rows: 2, stroke: c });
      if (i === 1) {
        person(x - 13, RY + 2, { alpha: on, color: c, size: 0.55 });
        agent(x + 15, RY - 2, { alpha: on, size: 0.55, color: c });
      }
      if (i === 2) check(x, RY + 2, 30, { color: c, alpha: on });
      if (i === 3) recoverIcon(x, RY, 17, { color: c, alpha: on });
    });
    railNames(names, xs, RY + R, {
      gap: NAME_GAP,
      alpha: (i) => stageD * listIn(t, ats, i),
      set: "ties",
      wrap: 260
    });
    nameText(L("项目按自己的标准判断", "The project judges by its own standards"), KX, 730, {
      valign: "top",
      color: P.authority,
      alpha: stageD * named(t, own)
    });
  }
  if (stageE > 0) {
    const LX = 560, RX = 1360, Y = 400;
    pipelineMark(LX, Y, 640, { alpha: stageE, flow: q });
    signalMark(RX, Y + 6, 640, 130, { alpha: stageE, seen: 1, marker: 1 });
    nameText(L("改进行情数据管线", "Improving a market-data pipeline"), LX, Y + 71 + NAME_GAP, {
      valign: "top",
      alpha: stageE
    });
    nameText(L("研究选股信号", "Studying a stock-selection signal"), RX, Y + 71 + NAME_GAP, {
      valign: "top",
      alpha: stageE
    });
    nameText(L("只是举例", "Only illustrations"), 960, 610, {
      color: P.evidence,
      alpha: stageE * named(t, only)
    });
    rejectedName(L("实测的结果", "Measured results"), 960, 668, {
      alpha: stageE * named(t, notMeasured),
      mark: ramp(t, notMeasured + 0.3, 0.4)
    });
    illustrative(stageE);
  }
};

// picture/film/scenes/intent/change.js
scenes["03"] = function(s, t) {
  const [what, how] = cues(s, [
    ["打算改什么", "what will change"],
    ["怎么判断", "how we will know"]
  ]);
  const [forPipe, reliable, same, alike, verify] = cues(s, [
    ["比如要求", "For a pipeline"],
    ["更可靠", "more reliable"],
    ["哪些记录算同一条", "which records count"],
    ["看着像重复", "look-alike"],
    ["用什么办法检验", "how we will verify"]
  ]);
  const [study, hypo, refute] = cues(s, [
    ["研究信号", "A signal study"],
    ["写下假设", "its hypothesis"],
    ["出现什么结果", "the result that would refute"]
  ]);
  const [goes, into, openspec, proposal, specs, design, tasks] = cues(s, [
    ["这些内容", "All of this"],
    ["写进仓库", "goes into"],
    ["OpenSpec", "OpenSpec"],
    ["提案讲", "A proposal"],
    ["规格写清", "specs state"],
    ["设计记下", "a design"],
    ["任务清单", "a task list"]
  ]);
  const [reads, compile, only, elsewhere] = cues(s, [
    ["ETHOS 会读取", "ETHOS reads"],
    ["编译成验收条件", "compiles it"],
    ["只记在正式变更里", "is kept in the Change"],
    ["不在别的地方", "nowhere else"]
  ]);
  const [found, revised, authority, again] = cues(s, [
    ["研究有了新发现", "Research may push"],
    ["改过的要求", "a revised requirement"],
    ["有权决定的人", "whoever has the authority"],
    ["重新采纳", "accepted again"]
  ]);
  const stageA = stageOut(t, forPipe), stageB = stageIn(t, forPipe) * stageOut(t, study), stageC = stageIn(t, study) * stageOut(t, goes);
  const stageD = stageIn(t, goes) * stageOut(t, proposal), stageD2 = stageIn(t, proposal) * stageOut(t, reads), stageE = stageIn(t, reads) * stageOut(t, found), stageF = stageIn(t, found);
  const q = voiceTime(t) * 0.4 % 1;
  if (stageA > 0) {
    const nameW = Math.max(
      measure(L("打算改什么", "What will change")),
      measure(L("怎么判断改得有效", "How we will know it worked"))
    );
    const dx = Math.round(960 - (400 + 1010 + 36 + NAME_GAP + nameW) / 2);
    const g = stageA * clearOfTitle(s, t, 350), PX = 440 + dx, YA = 400, YB = 600, DX = 700 + dx, DW = 130, DH = 170, IX = 1010 + dx;
    person(PX, YA - 6, { alpha: g, size: 1.3 });
    agent(PX, YB - 8, { alpha: g, size: 1.3 });
    nameText(L("人", "People"), PX, YA + 40 + NAME_GAP - 14, { valign: "top", alpha: g });
    nameText("Agent", PX, YB + 20 + NAME_GAP, { valign: "top", alpha: g });
    documentIcon(DX, CONTENT_CY - DH / 2, DW, DH, { alpha: g, rows: 4 });
    link(PX + 40, YA - 6, DX, CONTENT_CY - 40, { route: "hvh", mid: 600 + dx, alpha: g });
    link(PX + 40, YB - 8, DX, CONTENT_CY + 40, { route: "hvh", mid: 600 + dx, alpha: g });
    const ats = [what, how], ys = [YA, YB];
    ats.forEach((at, i) => {
      const on = g * ramp(t, at - 0.15, 0.4), lit = speaking(t, ats, i), c = blend(P.ink, P.authority, lit);
      link(DX + DW, CONTENT_CY + (i ? 40 : -40), IX - 36, ys[i], {
        route: "hvh",
        mid: 915 + dx,
        alpha: on,
        upto: soon(t, at, 0.4)
      });
      ring(IX, ys[i], 36, { color: c, alpha: on, width: 2.5 });
      if (i === 0) {
        documentIcon(IX - 13, ys[i] - 17, 26, 34, { alpha: on, rows: 2, stroke: c, fold: false });
      } else check(IX, ys[i] + 2, 30, { color: c, alpha: on });
    });
    nameText(L("打算改什么", "What will change"), IX + 36 + NAME_GAP, YA, {
      align: "left",
      alpha: g * listIn(t, ats, 0),
      set: "questions"
    });
    nameText(L("怎么判断改得有效", "How we will know it worked"), IX + 36 + NAME_GAP, YB, {
      align: "left",
      alpha: g * listIn(t, ats, 1),
      set: "questions"
    });
  }
  if (stageB > 0) {
    const PY = mix(430, 340, soon(t, same - 0.35, 0.5));
    const m = pipelineMark(960, PY, 780, { alpha: stageB, flow: q, back: 1 });
    nameText(L("经得起重新运行", "Must tolerate reruns"), 960, m.top - NAME_GAP, {
      valign: "bottom",
      alpha: stageB
    });
    rejectedName(L("更可靠", "More reliable"), 960, PY + 128, {
      alpha: stageB * named(t, reliable),
      mark: ramp(t, reliable + 0.4, 0.4)
    });
    const rows = en ? [
      "Which records count as the same",
      "Which look-alike records must stay",
      "How we verify nothing is duplicated"
    ] : ["哪些记录算同一条", "哪些看着像重复、其实要留下", "用什么办法检验没有重复"];
    const ats = [same, alike, verify], ys = [535, 620, 705], widest = Math.max(...rows.map((v) => measure(v))), GX = Math.round(960 - (56 + NAME_GAP + widest) / 2 + 28);
    ats.forEach((at, i) => {
      const on = stageB * ramp(t, at - 0.15, 0.4), lit = speaking(t, ats, i), c = blend(P.ink, P.evidence, lit), y = ys[i];
      ring(GX, y, 28, { color: c, alpha: on, width: 2.5 });
      if (i < 2) {
        stroke(
          () => {
            ctx.moveTo(GX - 12, y - 6);
            ctx.lineTo(GX + 12, y - 6);
            ctx.moveTo(GX - 12, y + 6);
            ctx.lineTo(GX + 12, y + 6);
            if (i === 1) {
              ctx.moveTo(GX + 8, y - 14);
              ctx.lineTo(GX - 8, y + 14);
            }
          },
          { color: c, alpha: on, width: 2.5 }
        );
      } else check(GX, y + 2, 24, { color: c, alpha: on });
      nameText(rows[i], GX + 28 + NAME_GAP, y, {
        align: "left",
        alpha: stageB * listIn(t, ats, i),
        set: "statements"
      });
    });
    illustrative(stageB);
  }
  if (stageC > 0) {
    const SX = 690, SW = 680, Y = 500;
    const m = signalMark(SX, Y, SW, 260, { alpha: stageC, seen: 1, marker: 1 });
    nameText(L("选股信号", "Stock-selection signal"), SX, m.bottom + NAME_GAP, {
      valign: "top",
      alpha: stageC
    });
    const IX = 1190, ys = [410, 590], ats = [hypo, refute];
    ats.forEach((at, i) => {
      const on = stageC * ramp(t, at - 0.15, 0.4), lit = speaking(t, ats, i), c = blend(P.ink, i ? P.unknown : P.authority, lit);
      documentIcon(IX - 32, ys[i] - 42, 64, 84, { alpha: on, rows: 3, stroke: c });
      if (i) cross(IX + 40, ys[i] - 34, 22, { alpha: on });
    });
    nameText(L("假设", "The hypothesis"), IX + 40 + NAME_GAP, ys[0], {
      align: "left",
      color: P.authority,
      alpha: stageC * listIn(t, ats, 0),
      set: "written"
    });
    nameText(
      L("什么结果说明它不成立", "The result that refutes it"),
      IX + 40 + NAME_GAP + 10,
      ys[1],
      { align: "left", width: 340, alpha: stageC * listIn(t, ats, 1), set: "written" }
    );
    illustrative(stageC);
  }
  if (stageD > 0) {
    const Y = 480, FW = 300, FH = 190, FX = 960 - FW / 2, on = stageD, written = stageD * ramp(t, into - 0.15, 0.4), flow = soon(t, into + 0.1, 0.7);
    const p = pipelineMark(380, Y, 460, { alpha: on, flow: q });
    const m = signalMark(1540, Y, 460, 130, { alpha: on, seen: 1, marker: 1 });
    nameText(L("管线的要求", "The pipeline's statements"), 380, p.bottom + NAME_GAP, {
      valign: "top",
      alpha: on
    });
    nameText(L("信号的假设", "The signal's hypothesis"), 1540, m.bottom + NAME_GAP, {
      valign: "top",
      alpha: on
    });
    folderIcon(FX, Y - FH / 2, FW, FH, { alpha: written, color: P.authority });
    nameText(L("正式变更", "Change"), 960, Y + 8, {
      color: P.authority,
      alpha: written,
      bold: true
    });
    link(p.storeX + 46, Y, FX, Y, { alpha: on, upto: flow, color: P.line });
    link(1310, Y, FX + FW, Y, { alpha: on, upto: flow, color: P.line });
    nameText(L("写进仓库", "In the repository"), 960, Y + FH / 2 + NAME_GAP, {
      valign: "top",
      alpha: written
    });
    nameText("OpenSpec", 960, Y - FH / 2 - NAME_GAP, {
      valign: "bottom",
      color: P.evidence,
      alpha: on * named(t, openspec)
    });
  }
  if (stageD2 > 0) {
    const names = en ? ["Proposal", "Specs", "Design", "Task list"] : ["提案", "规格", "设计", "任务清单"];
    const notes = en ? ["Why", ["Required behavior,", "acceptance scenarios"], "The trade-offs", "Progress"] : ["为什么要改", "要满足的行为和验收场景", "做了哪些取舍", "进度"];
    const ats = [proposal, specs, design, tasks], PAD = 26, GAP = 56, FH = 270, FY = 345, DW = 80, DH = 90, DY = FY + 28;
    const half = names.map(
      (v, i) => Math.max(DW, measure(v), ...[notes[i]].flat().map((line2) => measure(line2, NOTE))) / 2
    );
    const xs = half.reduce(
      (list, h, i) => [...list, i ? list[i - 1] + half[i - 1] + GAP + h : PAD + h],
      []
    );
    const reach = (n2) => xs[n2] + half[n2] + PAD;
    const growth = ats.map((at) => soon(t, at - 0.5, 0.4)), n = growth.filter((v) => v >= 1).length;
    const W = n === 0 ? mix(240, reach(0), growth[0]) : n >= ats.length ? reach(ats.length - 1) : mix(reach(n - 1), reach(n), growth[n]), FX = 960 - W / 2;
    folderIcon(FX, FY, W, FH, { alpha: stageD2, color: P.authority });
    nameText(L("正式变更", "Change"), 960, FY - NAME_GAP + 4, {
      valign: "bottom",
      color: P.authority,
      alpha: stageD2,
      bold: true
    });
    nameText("OpenSpec", 960, FY + FH + NAME_GAP, {
      valign: "top",
      color: P.evidence,
      alpha: stageD2
    });
    ats.forEach((at, i) => {
      const x = FX + xs[i], on = stageD2 * ramp(t, at - 0.15, 0.4), lit = speaking(t, ats, i);
      documentIcon(x - DW / 2, DY, DW, DH, {
        alpha: on,
        rows: 3,
        stroke: blend(P.ink, P.evidence, lit)
      });
      nameText(names[i], x, DY + DH + NAME_GAP - 6, {
        valign: "top",
        alpha: stageD2 * listIn(t, ats, i),
        set: "parts"
      });
      nameText(notes[i], x, DY + DH + NAME_GAP + 36, {
        valign: "top",
        size: NOTE,
        color: P.muted,
        alpha: stageD2 * listIn(t, ats, i),
        set: "parts"
      });
    });
  }
  if (stageE > 0) {
    const shift = 270 * (1 - soon(t, compile, 0.5)), Y = 420, FX = 420 + shift, KX = 960 + shift, CX = 1500 + shift, on = stageE, read = soon(t, reads + 0.1, 0.6), made = stageE * ramp(t, compile + 0.25, 0.4);
    folderIcon(FX - 130, Y - 85, 260, 170, { alpha: on, color: P.authority });
    documentIcon(FX - 34, Y - 52, 68, 88, { alpha: on, rows: 3 });
    nameText(L("正式变更", "The Change"), FX, Y + 85 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: on
    });
    kernelIcon(KX, Y, 66, { alpha: on, beat: read });
    nameText("ETHOS", KX, Y + 66 + NAME_GAP, { valign: "top", alpha: on });
    link(FX + 130, Y, KX - 60, Y, { alpha: on, upto: read });
    const fl = voiceTime(t) * 0.5 % 1;
    link(KX + 60, Y, CX - 90, Y, {
      alpha: made,
      upto: soon(t, compile + 0.15, 0.6),
      flow: fl,
      color: P.evidence
    });
    documentIcon(CX - 90, Y - 80, 180, 160, { alpha: made, rows: 0 });
    [0, 1, 2].forEach(
      (i) => check(CX - 54, Y - 42 + i * 42, 20, { alpha: made, color: P.evidence })
    );
    stroke(
      () => [0, 1, 2].forEach((i) => {
        ctx.moveTo(CX - 28, Y - 42 + i * 42);
        ctx.lineTo(CX + 58, Y - 42 + i * 42);
      }),
      { color: P.muted, alpha: made, width: 2 }
    );
    nameText(L("验收条件", "Acceptance criteria"), CX, Y + 80 + NAME_GAP, {
      valign: "top",
      color: P.evidence,
      alpha: stageE * named(t, compile + 0.25)
    });
    const keep = stageE * named(t, only), no = stageE * named(t, elsewhere);
    nameText(L("采纳的意图只记在这里", "Accepted intent is kept here"), FX, 650, {
      color: P.authority,
      alpha: keep
    });
    documentIcon(1010, 610, 62, 80, { alpha: no, rows: 3, stroke: P.muted });
    rejectedName(L("另记一份", "A copy anywhere else"), 1090, 650, {
      align: "left",
      alpha: no,
      mark: ramp(t, elsewhere + 0.3, 0.4)
    });
  }
  if (stageF > 0) {
    const Y = 470, names = en ? [
      "A new finding",
      "The revised requirement",
      "Whoever has the authority",
      "Accepted again"
    ] : ["新发现", "改过的要求", "有权决定的人", "重新采纳"];
    const xs = railStations(names, 400, 1540, { wrap: 280 });
    const order = en ? [found, revised, again, again] : [found, revised, authority, again];
    const on = (i) => stageF * ramp(t, order[i] - 0.15, 0.4), bx = building(t, order, 190, 0.55);
    ctx.save();
    ctx.translate(bx, 0);
    signalMark(xs[0], Y, 380, 200, { alpha: on(0), seen: 1, marker: 1 });
    documentIcon(xs[1] - 44, Y - 58, 88, 116, { alpha: on(1), rows: 3, stroke: P.evidence });
    person(xs[2], Y - 4, { alpha: on(2), size: 1.3, color: P.authority });
    seal(xs[2] + 62, Y - 30, 22, { alpha: on(2) });
    folderIcon(xs[3] - 90, Y - 62, 180, 124, { alpha: on(3), color: P.authority });
    check(xs[3], Y + 4, 34, { alpha: on(3), color: P.authority });
    [0, 1, 2].forEach(
      (i) => link(xs[i] + [200, 52, 92][i], Y, xs[i + 1] - [52, 44, 98][i], Y, {
        alpha: on(i + 1),
        upto: soon(t, order[i + 1] - 0.1, 0.5)
      })
    );
    names.forEach(
      (v, i) => nameText(v, xs[i], Y + 120, {
        valign: "top",
        width: 280,
        alpha: stageF * named(t, order[i]),
        color: i > 1 ? P.authority : P.ink,
        set: "revised"
      })
    );
    ctx.restore();
  }
};

// picture/film/scenes/intent/compile.js
var S04_LEAD = 200;
function s04SortShift() {
  const rows = en ? ["Kept", "Excluded by an authorized decision", "Marked as unresolved"] : ["留下", "经过授权排除", "明确标成还没解决"];
  return {
    rows,
    dx: Math.round(
      960 - (330 + 900 + 34 + NAME_GAP + Math.max(...rows.map((v) => measure(v)))) / 2
    )
  };
}
scenes["04"] = function(s, t) {
  const [checksAt, different] = cues(s, [
    ["变成检查", "turning it into checks"],
    ["两回事", "two different jobs"]
  ]);
  const [judge, judgeName, sortAt, constraint, keptAt, excludedAt, openAt] = cues(s, [
    ["读懂要靠判断", "Understanding takes"],
    ["要靠判断", "takes judgment"],
    ["在指定范围的资料", "Every relevant constraint"],
    ["每一条相关的约束", "Every relevant constraint"],
    ["要么留下", "is kept"],
    ["经过授权排除", "excluded by"],
    ["还没解决", "marked as unresolved"]
  ]);
  const [testAt, posAt, negAt, thatAt, scopeAt, excAt] = cues(s, [
    ["再用正例", "Examples and"],
    ["正例", "Examples"],
    ["反例", "counterexamples"],
    ["这个理解", "that understanding"],
    ["哪些不做", "what is out of scope"],
    ["例外在哪里", "where the exceptions"]
  ]);
  const [onlyAt, ethosAt, rulesAt, intentAt, criteriaAt] = cues(s, [
    ["这之后", "Only then"],
    ["ETHOS 才", "ETHOS deterministically"],
    ["固定的规则", "deterministically"],
    ["采纳的意图", "accepted intent"],
    ["编译成验收条件", "acceptance criteria and checks"]
  ]);
  const [sameAt, sameOut, cannot] = cues(s, [
    ["同样的输入", "The same inputs"],
    ["同样的验收条件", "the same acceptance"],
    ["保证不了", "cannot certify"]
  ]);
  const [leads, trans, memory, summ, noAuth, repeat] = cues(s, [
    ["对话记录", "Transcripts"],
    ["对话记录", "Transcripts"],
    ["Agent 的记忆", "an agent's memory"],
    ["各种总结", "summaries"],
    ["没有决定权", "not authority"],
    ["说上很多遍", "repeating a request"]
  ]);
  const [each, mustAt, givenAt, oneWay, superseded, laterAt, newAt, pending, rejected] = cues(s, [
    ["每一项责任", "Each obligation"],
    ["需要有个交代", "must be accounted"],
    ["都要有一个明确的去向", "is given"],
    ["只能有一个", "exactly one disposition"],
    ["被取代", "superseded"],
    ["有权决定的人", "by a later governing"],
    ["另有指示", "instruction on"],
    ["等待检验", "pending verification"],
    ["拒绝并写明理由", "rejected"]
  ]);
  const accepted = cueFrom(s, "采纳", "accepted", each);
  const stageA = stageOut(t, sortAt), stageB = stageIn(t, sortAt) * stageOut(t, testAt), stageC = stageIn(t, testAt) * stageOut(t, onlyAt);
  const stageD = stageIn(t, onlyAt) * stageOut(t, sameAt), stageE = stageIn(t, sameAt) * stageOut(t, leads), stageF = stageIn(t, leads) * stageOut(t, each), stageG = stageIn(t, each);
  if (stageA > 0) {
    const Y = 470, RX = 1340, focus = soon(t, judge + 0.05, 0.9), gone = ramp(t, judge, 0.25), { dx } = s04SortShift();
    const LX = mix(716, 760 + dx + S04_LEAD - 60, focus), PY = mix(Y - 6, 404, focus), size = mix(2, 1.1, focus);
    const DX = mix(534, 430 + dx + S04_LEAD - 34, focus), DY = mix(Y - 60, 444, focus), DW = mix(92, 112, focus), DH = mix(120, 148, focus);
    documentIcon(DX, DY, DW, DH, { alpha: stageA, rows: 4 });
    nameText(L("读懂需求", "Understanding a requirement"), DX + DW / 2, DY + DH + NAME_GAP, {
      valign: "top",
      alpha: stageA,
      color: P.authority
    });
    person(LX, PY, { alpha: stageA, size, color: blend(P.ink, P.authority, focus) });
    nameText(L("要靠判断", "Takes judgment"), LX, PY - Math.max(54, 32.25 * size + 16), {
      valign: "bottom",
      color: P.authority,
      alpha: stageA * named(t, judgeName)
    });
    const on = stageA * ramp(t, checksAt - 0.15, 0.4) * (1 - gone);
    kernelIcon(RX - 70, Y, 70, { alpha: on });
    documentIcon(RX + 30, Y - 60, 92, 120, { alpha: on, rows: 0 });
    [0, 1, 2].forEach((i) => check(RX + 76, Y - 30 + i * 30, 20, { alpha: on, color: P.evidence }));
    nameText(L("变成检查", "Turning it into checks"), RX - 10, Y + 90, {
      valign: "top",
      alpha: on,
      color: P.evidence
    });
    stroke(
      () => {
        ctx.moveTo(934, Y - 12);
        ctx.lineTo(986, Y - 12);
        ctx.moveTo(934, Y + 12);
        ctx.lineTo(986, Y + 12);
        ctx.moveTo(974, Y - 34);
        ctx.lineTo(946, Y + 34);
      },
      { color: P.muted, alpha: stageA * ramp(t, different - 0.15, 0.4) * (1 - gone), width: 4 }
    );
  }
  if (stageB > 0) {
    const { rows, dx: shift } = s04SortShift(), lead = S04_LEAD * (1 - soon(t, keptAt - 0.3, 0.6)), dx = shift + lead;
    const Y = 500, DX = 430 + dx, BUS = 760 + dx, IX = 900 + dx, ys = [370, 500, 630], ats = [keptAt, excludedAt, openAt], q = voiceTime(t) * 0.45 % 1;
    const docs = stageB;
    [
      [-22, -18],
      [0, 0],
      [22, 18]
    ].forEach(
      ([dx2, dy]) => documentIcon(DX - 56 + dx2, Y - 74 + dy, 112, 148, { alpha: docs, rows: 4 })
    );
    nameText(L("指定范围的资料", "Declared sources"), DX, Y + 92 + NAME_GAP, {
      valign: "top",
      alpha: stageB
    });
    nameText(L("要靠判断", "Takes judgment"), BUS - 60, Y - 150, {
      valign: "bottom",
      color: P.authority,
      alpha: stageB
    });
    person(BUS - 60, Y - 96, { alpha: stageB, size: 1.1, color: P.authority });
    link(DX + 96, Y, BUS, Y, { alpha: docs, upto: soon(t, constraint, 0.5), flow: q, end: false });
    ats.forEach((at, i) => {
      const on = stageB * ramp(t, at - 0.15, 0.4), lit = speaking(t, ats, i), c = blend(P.ink, [P.evidence, P.authority, P.unknown][i], lit), y = ys[i];
      const q2 = clamp((t - at) / 0.8);
      link(BUS, Y, IX - 34, y, {
        route: "hvh",
        mid: BUS + 40,
        alpha: on,
        upto: soon(t, at, 0.4),
        flow: q2 < 1 ? q2 : null,
        color: P.line
      });
      ring(IX, y, 34, { color: c, alpha: on, width: 2.5 });
      if (i === 0) check(IX, y + 2, 28, { color: c, alpha: on });
      if (i === 1) cross(IX, y, 24, { color: c, alpha: on });
      if (i === 2) text("?", IX, y + 1, 30, { role: "mark", align: "center", color: c, alpha: on });
      nameText(rows[i], IX + 34 + NAME_GAP, y, {
        align: "left",
        alpha: stageB * listIn(t, ats, i),
        set: "sorted"
      });
    });
  }
  if (stageC > 0) {
    const CX = 960, CY = 440, R = 104, LX = 460, RX = 1460, q = voiceTime(t) * 0.45 % 1, mid = stageC * ramp(t, thatAt - 0.15, 0.4);
    ring(CX, CY, R, { color: P.authority, alpha: mid, width: 3 });
    person(CX, CY - 6, { alpha: mid, size: 1.5, color: P.authority });
    nameText(L("这个理解", "That understanding"), CX, CY + R + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageC * named(t, thatAt)
    });
    const pos = stageC, neg = stageC * ramp(t, negAt - 0.15, 0.4);
    [-50, 0, 50].forEach((dy) => {
      dot(LX, CY + dy, 14, { color: P.ground, alpha: pos });
      ring(LX, CY + dy, 14, { color: P.evidence, alpha: pos, width: 2.5 });
      check(LX, CY + dy + 1, 13, { color: P.evidence, alpha: pos, width: 2.5 });
      dot(RX, CY + dy, 14, { color: P.ground, alpha: neg });
      ring(RX, CY + dy, 14, { color: P.unknown, alpha: neg, width: 2.5 });
      cross(RX, CY + dy, 11, { alpha: neg, width: 2.5 });
    });
    link(LX + 30, CY, CX - R, CY, {
      alpha: Math.min(pos, mid),
      upto: soon(t, Math.max(posAt, thatAt) + 0.1, 0.5),
      flow: q,
      color: P.evidence
    });
    link(RX - 30, CY, CX + R, CY, {
      alpha: Math.min(neg, mid),
      upto: soon(t, Math.max(negAt, thatAt) + 0.1, 0.5),
      flow: q,
      color: P.unknown
    });
    nameText(L("正例", "Examples"), LX, CY + 64 + NAME_GAP, {
      valign: "top",
      alpha: stageC,
      set: "tests"
    });
    nameText(L("反例", "Counterexamples"), RX, CY + 64 + NAME_GAP, {
      valign: "top",
      alpha: stageC * named(t, negAt),
      set: "tests"
    });
    const ats = [scopeAt, excAt], names = en ? ["What is out of scope", "Where the exceptions lie"] : ["哪些不做", "例外在哪里"];
    railNames(names, [CX - 230, CX + 230], CY + R + 92, {
      gap: 0,
      alpha: (i) => stageC * listIn(t, ats, i),
      set: "reach",
      wrap: 400
    });
    ats.forEach(
      (at, i) => link(CX + (i ? 120 : -120), CY + R * 0.7, CX + (i ? 230 : -230), CY + R + 88, {
        route: "hv",
        alpha: stageC * ramp(t, at - 0.15, 0.4),
        upto: soon(t, at, 0.4),
        color: P.line
      })
    );
  }
  if (stageD > 0) {
    const Y = 440, KR = 130, KX = 960, FX = 380, CX = 1540, q = voiceTime(t) * 0.45 % 1;
    const enter = stageD * ramp(t, intentAt - 0.15, 0.4), made = stageD * ramp(t, criteriaAt - 0.15, 0.4);
    kernelIcon(KX, Y, KR, { alpha: stageD, beat: soon(t, rulesAt, 0.5) });
    nameText("ETHOS", KX, Y - KR - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: stageD * named(t, ethosAt)
    });
    nameText(L("按固定的规则", "Deterministic rules"), KX, Y + KR + NAME_GAP, {
      valign: "top",
      alpha: stageD * named(t, rulesAt)
    });
    folderIcon(FX - 130, Y - 85, 260, 170, { alpha: enter, color: P.authority });
    documentIcon(FX - 34, Y - 52, 68, 88, { alpha: enter, rows: 3 });
    nameText(L("采纳的意图", "Accepted intent"), FX, Y + 85 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageD * named(t, intentAt)
    });
    link(FX + 130, Y, KX - KR * 0.86, Y, {
      alpha: enter,
      upto: soon(t, intentAt + 0.1, 0.5),
      flow: q
    });
    link(KX + KR * 0.86, Y, CX - 100, Y, {
      alpha: made,
      upto: soon(t, criteriaAt, 0.5),
      flow: q,
      color: P.evidence
    });
    documentIcon(CX - 100, Y - 90, 200, 180, { alpha: made, rows: 0 });
    [0, 1, 2].forEach(
      (i) => check(CX - 60, Y - 46 + i * 46, 22, { alpha: made, color: P.evidence })
    );
    stroke(
      () => [0, 1, 2].forEach((i) => {
        ctx.moveTo(CX - 32, Y - 46 + i * 46);
        ctx.lineTo(CX + 66, Y - 46 + i * 46);
      }),
      { color: P.muted, alpha: made, width: 2 }
    );
    nameText(L("验收条件和检查", "Acceptance criteria and checks"), CX, Y + 90 + NAME_GAP, {
      valign: "top",
      width: 320,
      color: P.evidence,
      alpha: stageD * named(t, criteriaAt)
    });
  }
  if (stageE > 0) {
    const ys = [360, 520], DX = 560, KX = 960, CX = 1360, q = voiceTime(t) * 0.45 % 1, out = stageE * ramp(t, sameOut - 0.15, 0.4);
    ys.forEach((y) => {
      documentIcon(DX - 40, y - 52, 80, 104, { alpha: stageE, rows: 3 });
      kernelIcon(KX, y, 54, { alpha: stageE });
      link(DX + 40, y, KX - 48, y, { alpha: stageE, flow: q });
      link(KX + 48, y, CX - 40, y, {
        alpha: out,
        flow: q,
        color: P.evidence,
        upto: soon(t, sameOut - 0.1, 0.5)
      });
      documentIcon(CX - 40, y - 52, 80, 104, { alpha: out, rows: 0 });
      [0, 1, 2].forEach(
        (i) => check(CX - 18, y - 26 + i * 26, 15, { alpha: out, color: P.evidence, width: 2.5 })
      );
    });
    nameText(L("同样的输入", "The same inputs"), DX - 40 - NAME_GAP, (ys[0] + ys[1]) / 2, {
      align: "right",
      alpha: stageE * named(t, sameAt)
    });
    link(DX - 40 - 10, ys[0] + 52, DX - 40 - 10, ys[1] - 52, { alpha: stageE, end: false });
    nameText(L("同样的验收条件", "The same criteria"), CX + 40 + NAME_GAP, (ys[0] + ys[1]) / 2, {
      align: "left",
      color: P.evidence,
      alpha: stageE * named(t, sameOut)
    });
    link(CX + 40 + 10, ys[0] + 52, CX + 40 + 10, ys[1] - 52, {
      alpha: out,
      end: false,
      color: P.evidence
    });
    const no = stageE * named(t, cannot);
    person(780, 672, { alpha: no, color: P.muted, size: 0.9 });
    rejectedName(L("保证理解是对的", "Proof that anyone understood"), 824, 684, {
      align: "left",
      alpha: no,
      mark: ramp(t, cannot + 0.3, 0.4)
    });
  }
  if (stageF > 0) {
    const lead = 220 * (1 - soon(t, repeat - 0.1, 0.5)), Y = 440, names = en ? ["Transcripts", "An agent's memory", "Summaries"] : ["对话记录", "Agent 的记忆", "各种总结"], xs = railStations(names, 330 + lead, 980 + lead), ats = [trans, memory, summ];
    const onAt = (i) => stageF * ramp(t, ats[i] - 0.15, 0.4), left = xs[0] - 80, right = xs[2] + 80;
    bubble(xs[0], Y, 44, { alpha: onAt(0) });
    agent(xs[1] - 30, Y, { alpha: onAt(1), color: P.muted, size: 1.3 });
    box(xs[1] + 6, Y - 34, 62, 68, { stroke: P.muted, alpha: onAt(1), radius: 10, dash: [6, 6] });
    documentIcon(xs[2] - 38, Y - 50, 76, 100, { alpha: onAt(2), rows: 3, stroke: P.muted });
    railNames(names, xs, Y + 60, {
      gap: NAME_GAP,
      alpha: (i) => stageF * listIn(t, ats, i),
      set: "traces"
    });
    const no = stageF * named(t, noAuth), BY = Y + 150;
    path(
      [
        [left, BY - 22],
        [left, BY],
        [right, BY],
        [right, BY - 22]
      ],
      { color: P.line, alpha: no, width: 2 }
    );
    rejectedName(
      L("只是线索，没有决定权", "Leads, not authority"),
      (left + right) / 2,
      BY + NAME_GAP,
      { valign: "top", alpha: no, mark: ramp(t, noAuth + 0.3, 0.4) }
    );
    const r = stageF * ramp(t, repeat - 0.15, 0.4), RX = 1440;
    [
      [-32, -44],
      [-10, -14],
      [14, 18],
      [38, 50]
    ].forEach(
      ([dx, dy], i) => bubble(RX + dx, Y + dy, 40, { alpha: r * ramp(t, repeat - 0.1 + i * 0.22, 0.3) })
    );
    rejectedName(L("说上很多遍", "Repeating a request"), RX, Y + 110, {
      valign: "top",
      alpha: stageF * named(t, repeat),
      mark: ramp(t, repeat + 0.9, 0.4)
    });
  }
  if (stageG > 0) {
    const Y = 490, IX = 1e3, HUB = 800, STEP = 100, ys = [340, 440, 540, 640], ats = [accepted, superseded, pending, rejected];
    const names = en ? ["Accepted", null, "Pending verification", "Rejected with its reason"] : ["采纳", null, "等检验", "拒绝，写明理由"];
    const DW = 240, DH = 300, LX = mix(960, 520, soon(t, givenAt - 0.1, 0.9)), TX = LX + DW / 2;
    ledger(LX, Y, DW, DH, { alpha: stageG });
    token(TX, Y, { color: P.authority, r: 20, alpha: stageG });
    beats(t, TX, Y, 34, [mustAt], { color: P.authority, alpha: stageG });
    nameText(L("每一项责任", "Each obligation"), LX, Y + DH / 2 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageG
    });
    nameText(L("只能有一个去向", "Exactly one disposition"), LX, Y + DH / 2 + NAME_GAP + 44, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: stageG * named(t, oneWay)
    });
    const moved = ats.slice(1).reduce((v, at) => v + soon(t, at - 0.1, 0.4), 0), yNow = ys[0] + moved * STEP;
    const length = HUB - TX - 20 + Math.abs(yNow - Y) + (IX - 30 - HUB), stub = (HUB - TX - 20 - 14) / length;
    link(TX + 20, Y, IX - 30, yNow, {
      route: "hvh",
      mid: HUB,
      alpha: stageG * ramp(t, givenAt - 0.1, 0.3),
      upto: stub * soon(t, givenAt + 0.6, 0.5) + (1 - stub) * soon(t, accepted - 0.1, 0.4),
      color: P.authority,
      width: 2.5
    });
    ats.forEach((at, i) => {
      const on = stageG * ramp(t, at - 0.15, 0.4), lit = speaking(t, ats, i), c = blend(P.ink, P.evidence, lit), y = ys[i];
      ring(IX, y, 30, { color: c, alpha: on, width: 2.5 });
      if (i === 0) check(IX, y + 2, 26, { color: c, alpha: on });
      if (i === 1) {
        documentIcon(IX - 16, y - 16, 22, 30, { alpha: on, rows: 0, stroke: P.muted, fold: false });
        documentIcon(IX - 6, y - 12, 22, 30, {
          alpha: on * ramp(t, newAt - 0.15, 0.4),
          rows: 0,
          stroke: c,
          fold: false
        });
      }
      if (i === 2) clock(IX, y, 15, { color: c, alpha: on, hand: 0.15 });
      if (i === 3) cross(IX, y, 22, { color: c, alpha: on });
      if (names[i] !== null)
        nameText(names[i], IX + 30 + NAME_GAP, y, {
          align: "left",
          width: 520,
          alpha: stageG * listIn(t, ats, i),
          set: "dispositions"
        });
      else
        termRow(
          t,
          [L("被取代", "Superseded")],
          [at],
          [L("有权决定的人另有指示", "by a later governing instruction")],
          [laterAt],
          IX + 30 + NAME_GAP,
          y - labelSize(LABEL) / 2,
          { width: 520, alpha: stageG * listLevel(t, ats, i), set: "dispositions" }
        );
    });
  }
};

// picture/film/scenes/one-owner/definition.js
scenes["05"] = function(s, t) {
  const [reqAt, mean, sameAt, module, onlyBy, oneModule, iface, tests, docs, own, ownerAt] = cues(
    s,
    [
      ["要求明确", "a requirement"],
      ["还要保证", "it has to mean"],
      ["同一个意思", "the same thing"],
      ["重复记录", "How a duplicate"],
      ["只该由", "should be defined"],
      ["那一个模块", "the one module"],
      ["接口", "the interfaces"],
      ["测试", "tests"],
      ["文档", "documentation"],
      ["不各写一套", "instead of each"],
      ["ETHOS 管这叫", "ETHOS calls this"]
    ]
  );
  const [toolsAt, support, official, platform, mature] = cues(s, [
    ["用工具也是", "The same principle"],
    ["辅助的工作", "Supporting work"],
    ["官方的规范和工具", "official standards"],
    ["平台自带的功能", "the platform's own"],
    ["成熟的工具", "mature tools"]
  ]);
  const [customAt, gap, bounded, benefit] = cues(s, [
    ["才自己写辅助代码", "Custom supporting code"],
    ["只有证明", "a real gap"],
    ["边界清楚", "its job is bounded"],
    ["净收益", "its net benefit"]
  ]);
  const [replaceAt, oldAt, both] = cues(s, [
    ["选定了新办法", "When a replacement"],
    ["旧做法", "the path it replaces"],
    ["不让两套", "rather than both"]
  ]);
  const [codeAt, intentAt, factsAt, changeAt] = cues(s, [
    ["ETHOS 自己的代码", "ETHOS focuses"],
    ["采纳了的意图", "accepted intent"],
    ["刚观察到的事实", "freshly observed facts"],
    ["可以检验的仓库改动", "verifiable changes"]
  ]);
  const stage0 = stageOut(t, module), stageA = stageIn(t, module) * stageOut(t, toolsAt), stageB = stageIn(t, toolsAt) * stageOut(t, replaceAt), stageC = stageIn(t, replaceAt) * stageOut(t, codeAt), stageD = stageIn(t, codeAt);
  if (stage0 > 0) {
    const g = stage0 * clearOfTitle(s, t, 340), DX = 600, DY = CONTENT_CY - 20, DW = 200, DH = 280, EX = 840, RX0 = EX + 60, RW = 520, same = g * ramp(t, mean - 0.15, 0.4);
    documentIcon(DX - DW / 2, DY - DH / 2, DW, DH, { alpha: g, rows: 5, stroke: P.authority });
    nameText(L("一项要求", "A requirement"), DX, DY + DH / 2 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: g * named(t, reqAt)
    });
    stroke(
      () => {
        ctx.moveTo(EX - 24, DY - 10);
        ctx.lineTo(EX + 24, DY - 10);
        ctx.moveTo(EX - 24, DY + 10);
        ctx.lineTo(EX + 24, DY + 10);
      },
      { color: P.ink, alpha: g * ramp(t, sameAt - 0.15, 0.4), width: 4 }
    );
    line(RX0, DY + 40, RX0 + RW, DY + 40, { color: P.muted, alpha: same, width: 3 });
    [0, 0.5, 1].forEach((q) => dot(RX0 + RW * q, DY + 40, 9, { color: P.authority, alpha: same }));
    nameText(L("在哪里都是同一个意思", "The same meaning everywhere"), RX0 + RW / 2, DY - 6, {
      alpha: g * named(t, mean)
    });
  }
  if (stageA > 0) {
    const lead = 240 * (1 - soon(t, iface - 0.4, 0.6)) + 100 * (1 - soon(t, own - 0.3, 0.5)), MX = 560 + lead, MY = 460, MW = 300, MH = 190, IX = 1120 + lead, ys = [320, 460, 600], ats = [iface, tests, docs], q = voiceTime(t) * 0.45 % 1;
    box(MX - MW / 2, MY - MH / 2, MW, MH, {
      fill: P.row,
      stroke: P.authority,
      alpha: stageA,
      radius: 14,
      width: 3
    });
    documentIcon(MX - 36, MY - 76, 72, 92, { alpha: stageA, rows: 2, stroke: P.authority });
    nameText(L("一个模块", "One module"), MX, MY + 54, {
      color: P.authority,
      alpha: stageA * named(t, oneModule)
    });
    nameText(L("“重复记录”的定义", "What a duplicate record is"), MX, MY + MH / 2 + NAME_GAP, {
      valign: "top",
      alpha: stageA
    });
    nameText(L("只由它来定义", "Defined only here"), MX, MY + MH / 2 + NAME_GAP + 42, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: stageA * named(t, onlyBy)
    });
    const names = en ? ["Interfaces", "Tests", "Documentation"] : ["接口", "测试", "文档"];
    ats.forEach((at, i) => {
      const on = stageA * ramp(t, at - 0.15, 0.4), lit = speaking(t, ats, i), c = blend(P.ink, P.evidence, lit), y = ys[i];
      link(MX + MW / 2, MY, IX - 40, y, {
        route: "hvh",
        mid: MX + MW / 2 + 110,
        alpha: on,
        upto: soon(t, at, 0.4),
        flow: q,
        color: P.line
      });
      documentIcon(IX - 30, y - 38, 60, 76, { alpha: on, rows: 3, stroke: c });
      nameText(names[i], IX + 30 + NAME_GAP, y, {
        align: "left",
        alpha: stageA * listIn(t, ats, i),
        set: "followers"
      });
    });
    const no = stageA * named(t, own), RX = 1540;
    ys.forEach((y) => {
      documentIcon(RX - 22, y - 28, 44, 56, { alpha: no, rows: 2, stroke: P.muted });
      cross(RX + 42, y, 20, { alpha: no * ramp(t, own + 0.3, 0.4), width: 3 });
    });
    nameText(L("不各写一套", "No copies of their own"), RX + 10, ys[2] + 28 + NAME_GAP, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: no
    });
    nameText(
      L("每一项责任，一处负责", "Every obligation, exactly one owner"),
      960,
      MY + MH / 2 + NAME_GAP + 120,
      { valign: "top", color: P.authority, alpha: stageA * named(t, ownerAt) }
    );
  }
  if (stageB > 0) {
    const conds = [gap, bounded, benefit], lead = 200 * (1 - soon(t, Math.min(customAt, gap) - 0.1, 0.6)), LX = 300 + lead, W = 760, ys = [330, 430, 530, 650], H = 76, ats = [official, platform, mature], custom = stageB * ramp(t, customAt - 0.15, 0.4);
    const opened = soon(t, Math.max(benefit, customAt) + 0.6, 0.5);
    const names = en ? ["Official standards and tools", "The platform's own capabilities", "Mature tools"] : ["官方的规范和工具", "平台自带的功能", "成熟的工具"];
    const notes = ["OpenSpec, Git", "", ""];
    nameText(
      L("辅助的工作先交给现成的", "Supporting work goes first to what exists"),
      LX,
      ys[0] - H / 2 - NAME_GAP,
      { align: "left", valign: "bottom", alpha: stageB * named(t, support) }
    );
    const ladder = () => ys.forEach((y2) => ctx.roundRect(LX, y2 - H / 2, W, H, 10));
    stroke(ladder, { color: P.muted, alpha: stageB, width: 3, dash: [8, 8] });
    line(LX - 28, ys[0], LX - 28, ys[3], { color: P.line, alpha: stageB, width: 2.5 });
    nameText(L("工具", "Tools"), LX - 28 - NAME_GAP, (ys[0] + ys[3]) / 2, {
      align: "right",
      color: P.muted,
      alpha: stageB
    });
    const down = voiceTime(t) * 0.3 % 1;
    flowDot(LX - 28, mix(ys[0], ys[3], down), 9, down, { color: P.evidence, alpha: stageB });
    ats.forEach((at, i) => {
      const on = stageB * ramp(t, at - 0.15, 0.4), lit = speaking(t, ats, i), c = blend(P.line, P.evidence, lit), y2 = ys[i];
      box(LX, y2 - H / 2, W, H, { fill: P.row, stroke: c, alpha: on, radius: 10 });
      check(LX + 40, y2 + 1, 24, { alpha: on, color: P.evidence });
      termRow(
        t,
        [names[i]],
        [at],
        notes[i] ? [notes[i]] : [],
        [at],
        LX + 76,
        y2 - labelSize(LABEL) / 2,
        { alpha: stageB, set: "rungs" }
      );
    });
    const y = ys[3];
    box(LX, y - H / 2, W, H, {
      stroke: blend(P.line, P.authority, opened),
      alpha: custom * opened,
      radius: 10
    });
    lock(LX + 40, y + 2, { alpha: custom, closed: 1 - opened, color: P.authority });
    nameText(L("自己写辅助代码", "Custom supporting code"), LX + 76, y, {
      align: "left",
      alpha: custom
    });
    const CX = LX + 890, cn = en ? ["A real gap shown", "A bounded job", "A clear net benefit"] : ["证明确实缺了什么", "边界清楚", "净收益说得清"], cy = [y - 110, y - 20, y + 70];
    conds.forEach((at, i) => {
      const on = stageB * ramp(t, at - 0.15, 0.4);
      ring(CX, cy[i], 26, { color: P.authority, alpha: on, width: 2.5 });
      check(CX, cy[i] + 2, 22, { color: P.authority, alpha: on });
      nameText(cn[i], CX + 26 + NAME_GAP, cy[i], {
        align: "left",
        alpha: stageB * listIn(t, conds, i),
        set: "conditions"
      });
    });
    link(LX + W, y, CX - 26, cy[1], {
      route: "hvh",
      mid: LX + W + 60,
      alpha: custom * ramp(t, bounded - 0.15, 0.4),
      color: P.authority
    });
  }
  if (stageC > 0) {
    const X0 = 360, X1 = 1560, Y1 = 420, Y2 = 590, q = voiceTime(t) * 0.4 % 1, gone = soon(t, oldAt + 0.6, 0.9);
    ring(X0, (Y1 + Y2) / 2, 34, { color: P.ink, alpha: stageC, width: 2.5 });
    ring(X1, (Y1 + Y2) / 2, 34, { color: P.ink, alpha: stageC, width: 2.5 });
    check(X1, (Y1 + Y2) / 2 + 2, 28, { alpha: stageC, color: P.evidence });
    link(X0 + 34, (Y1 + Y2) / 2, X1 - 34, (Y1 + Y2) / 2, { route: "vhv", mid: Y1, alpha: 0 });
    const up = rounded(
      [
        [X0 + 34, (Y1 + Y2) / 2],
        [X0 + 110, (Y1 + Y2) / 2],
        [X0 + 110, Y1],
        [X1 - 110, Y1],
        [X1 - 110, (Y1 + Y2) / 2],
        [X1 - 34, (Y1 + Y2) / 2]
      ],
      14
    );
    const low = rounded(
      [
        [X0 + 34, (Y1 + Y2) / 2],
        [X0 + 110, (Y1 + Y2) / 2],
        [X0 + 110, Y2],
        [X1 - 110, Y2],
        [X1 - 110, (Y1 + Y2) / 2],
        [X1 - 34, (Y1 + Y2) / 2]
      ],
      14
    );
    path(up, { color: P.evidence, alpha: stageC, width: 4 });
    const [fx, fy] = along(up, q).point;
    flowDot(fx, fy, 9, q, { color: P.evidence, alpha: stageC });
    const lowDrawn = along(low, 1 - gone * 0.999).kept;
    if (lowDrawn.length > 1)
      path(lowDrawn, {
        color: P.muted,
        alpha: stageC * ramp(t, oldAt - 0.15, 0.4),
        width: 3,
        dash: [8, 9]
      });
    nameText(L("新办法", "The replacement"), 960, Y1 - NAME_GAP, {
      valign: "bottom",
      color: P.evidence,
      alpha: stageC
    });
    rejectedName(L("旧做法", "The path it replaces"), 960, Y2 + NAME_GAP, {
      valign: "top",
      alpha: stageC * named(t, oldAt),
      mark: ramp(t, oldAt + 0.4, 0.4)
    });
    nameText(L("两套不长期并存", "Not both living on"), 960, Y2 + NAME_GAP + 58, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: stageC * named(t, both)
    });
  }
  if (stageD > 0) {
    const lead = 200 * (1 - soon(t, changeAt - 0.2, 0.5)), Y = 470, KX = 960 + lead, KR = 120, RX = 1500 + lead, IX = 520 + lead, q = voiceTime(t) * 0.45 % 1, inA = stageD * ramp(t, intentAt - 0.15, 0.4), inF = stageD * ramp(t, factsAt - 0.15, 0.4), out = stageD * ramp(t, changeAt - 0.15, 0.4);
    kernelIcon(KX, Y, KR, { alpha: stageD, beat: out });
    nameText(L("ETHOS 自己的代码", "ETHOS's own code"), KX, Y + KR + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageD
    });
    nameText(L("集中做一件事", "One job"), KX, Y + KR + NAME_GAP + 42, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: stageD
    });
    documentIcon(IX - 48, Y - 150, 96, 124, { alpha: inA, rows: 3, stroke: P.authority });
    nameText(L("采纳的意图", "Accepted intent"), IX - 48 - NAME_GAP, Y - 88, {
      align: "right",
      color: P.authority,
      alpha: stageD * named(t, intentAt)
    });
    link(IX + 48, Y - 88, KX - KR * 0.86, Y - 40, {
      route: "hvh",
      mid: 690 + lead,
      alpha: inA,
      upto: soon(t, intentAt + 0.1, 0.5),
      flow: q
    });
    [
      [0, 0],
      [24, 16],
      [-14, 28],
      [34, 40]
    ].forEach(([dx, dy]) => dot(IX + dx, Y + 76 + dy, 8, { color: P.evidence, alpha: inF }));
    nameText(L("刚观察到的事实", "Freshly observed facts"), IX - 48 - NAME_GAP, Y + 96, {
      align: "right",
      color: P.evidence,
      alpha: stageD * named(t, factsAt)
    });
    link(IX + 48, Y + 96, KX - KR * 0.86, Y + 40, {
      route: "hvh",
      mid: 690 + lead,
      alpha: inF,
      upto: soon(t, factsAt + 0.1, 0.5),
      flow: q,
      color: P.evidence
    });
    link(KX + KR * 0.9, Y, RX - 110, Y, {
      alpha: out,
      upto: soon(t, changeAt, 0.5),
      flow: q,
      color: P.evidence
    });
    repoIcon(RX, Y, 220, 170, { alpha: out });
    check(RX + 10, Y + 8, 54, { alpha: out, color: P.evidence });
    nameText(L("能检验的仓库改动", "A verifiable repository change"), RX, Y + 85 + NAME_GAP, {
      valign: "top",
      width: 300,
      alpha: stageD * named(t, changeAt)
    });
  }
};

// picture/film/drawing/lanes.js
function laneTrack(x0, x1, y, { alpha = 1, color = P.line, flow = null, tone = P.evidence, upto = 1 } = {}) {
  if (alpha < 0.01) return;
  folderIcon(x0, y - 26, 62, 52, { alpha, color: P.ink });
  link(x0 + 62, y, x1, y, { alpha, color, upto, width: 2.5, end: false });
  if (flow !== null) flowDot(mix(x0 + 70, x1, flow), y, 9, flow, { color: tone, alpha });
}
function laneGroup(x0, x1, ys, { alpha = 1, q = 0, tones = [], size = 1 } = {}) {
  if (alpha < 0.01) return;
  const W = 62 * size, H = 52 * size, tab = Math.min(46, W * 0.4);
  const folders = () => ys.forEach((y) => {
    const top = y - H / 2;
    ctx.moveTo(x0, top + 8);
    ctx.lineTo(x0, top + H);
    ctx.lineTo(x0 + W, top + H);
    ctx.lineTo(x0 + W, top + 14);
    ctx.lineTo(x0 + tab + 10, top + 14);
    ctx.lineTo(x0 + tab, top);
    ctx.lineTo(x0 + 8, top);
    ctx.closePath();
  });
  fill(folders, { color: P.row, alpha });
  stroke(folders, { color: P.ink, alpha, width: 2.5 });
  stroke(
    () => ys.forEach((y) => {
      ctx.moveTo(x0 + W, y);
      ctx.lineTo(x1, y);
    }),
    { color: P.line, alpha, width: 2.5 }
  );
  ys.forEach((y, i) => {
    const flow = (q + i * 0.31) % 1;
    flowDot(mix(x0 + 70, x1, flow), y, 9, flow, { color: tones[i] ?? P.evidence, alpha });
  });
}
function writeGate(x, y, h, { alpha = 1, open = 0, color = P.authority, single = false } = {}) {
  if (alpha < 0.01) return;
  const top = y - h / 2, bottom = y + h / 2, lift = ease(open) * (h - 40);
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

// picture/film/scenes/lanes/leases.js
scenes["06"] = function(s, t) {
  const [changeAt, carried, several, agentsAt, who, tryAt, hand] = cues(s, [
    ["一项正式变更", "A Change"],
    ["常常有", "several people"],
    ["好几个人", "several people"],
    ["Agent", "agents"],
    ["谁负责哪一块", "who owns which part"],
    ["哪些还只是尝试", "what is still an experiment"],
    ["工作怎么交接", "how the work is handed over"]
  ]);
  const [lanes, worktree, reviewAt, combine] = cues(s, [
    ["ETHOS 的办法", "ETHOS organizes"],
    ["Git 工作区", "Git worktree"],
    ["审阅", "review the changes"],
    ["集成", "combine them"]
  ]);
  const [lease, leaseWord, leaseName, fourAt, laneF, holder, expiry, gen, fresh] = cues(s, [
    ["一条通道此刻归谁", "Who holds a lane"],
    ["一份会到期的租约", "an expiring Lease"],
    ["Lease", "Lease"],
    ["只记四样", "only four things"],
    ["哪条通道", "the lane"],
    ["谁持有", "its holder"],
    ["什么时候到期", "its expiry time"],
    ["一个编号", "a generation number"],
    ["别的情况", "Everything else"]
  ]);
  const [mode, coop, compete, none] = cues(s, [
    ["几条通道可以合作", "Lanes can cooperate"],
    ["合作", "cooperate"],
    ["也可以竞争", "they can compete"],
    ["一个都不选", "or none"]
  ]);
  const [neg, negative, evid, deleted] = cues(s, [
    ["就算一次探索", "Even when"],
    ["只留下", "ends with only"],
    ["有用的证据", "the useful evidence"],
    ["跟着通道", "deleted"]
  ]);
  const stageA = stageOut(t, lanes), stageB = stageIn(t, lanes) * stageOut(t, lease), stageC0 = stageIn(t, lease) * stageOut(t, laneF), stageC = stageIn(t, laneF) * stageOut(t, mode), stageD = stageIn(t, mode) * stageOut(t, neg), stageE = stageIn(t, neg);
  if (stageA > 0) {
    const lead = 240 * (1 - soon(t, who - 0.4, 0.7)), g = stageA * clearOfTitle(s, t, 300), CX = 620 + lead, CY = 490;
    folderIcon(CX - 120, CY - 90, 240, 170, { alpha: g, color: P.authority });
    nameText(L("正式变更", "A Change"), CX, CY + 2, {
      color: P.authority,
      alpha: g * named(t, changeAt),
      bold: true
    });
    [
      [-250, -110],
      [-280, 110],
      [250, -130],
      [262, 100]
    ].forEach(([dx, dy], i) => {
      const x = CX + dx, y = CY + dy, on = g * ramp(t, (i % 2 ? agentsAt : carried) - 0.15, 0.4);
      if (i % 2) agent(x, y, { alpha: on, size: 1.1 });
      else person(x, y, { alpha: on, size: 1.1 });
      link(x + (dx > 0 ? -34 : 34), y, CX + (dx > 0 ? 120 : -120), y > CY ? CY + 40 : CY - 30, {
        route: "hv",
        alpha: on,
        end: false
      });
    });
    nameText(L("好几个人和 Agent", "Several people and agents"), CX, CY + 200, {
      valign: "top",
      alpha: g * named(t, several)
    });
    const IX = 1130 + lead, ats = [who, tryAt, hand], ys = [360, 490, 620], names = en ? ["Who owns which part", "What is still an experiment", "How the work is handed over"] : ["谁负责哪一块", "哪些还只是尝试", "工作怎么交接"];
    ats.forEach((at, i) => {
      const on = g * ramp(t, at - 0.15, 0.4), c = blend(P.ink, P.unknown, speaking(t, ats, i));
      ring(IX, ys[i], 32, { color: c, alpha: on, width: 2.5 });
      text("?", IX, ys[i] + 1, 30, { role: "mark", align: "center", color: c, alpha: on });
      nameText(names[i], IX + 32 + NAME_GAP, ys[i], {
        align: "left",
        alpha: g * listIn(t, ats, i),
        set: "questions"
      });
    });
  }
  if (stageB > 0) {
    const X0 = 240, X1 = mix(1680, 1120, soon(t, reviewAt - 0.45, 0.6)), ys = [370, 500, 630], RX = 1270, MX = 1600, q = voiceTime(t) * 0.4;
    laneGroup(X0, X1, ys, { alpha: stageB, q, tones: [P.evidence, P.authority, P.evidence] });
    termRow(
      t,
      [L("工作通道", "Work Lanes")],
      [lanes],
      [L("每条一份工作区", "Each with its own worktree")],
      [worktree],
      X0,
      ys[0] - 26 - NAME_GAP - labelSize(LABEL),
      { width: 1200, alpha: stageB, color: P.authority }
    );
    const rev = stageB * ramp(t, reviewAt - 0.15, 0.4), com = stageB * ramp(t, combine - 0.15, 0.4);
    ys.forEach(
      (y) => link(X1, y, RX - 40, 500, {
        route: "hvh",
        mid: X1 + 70,
        alpha: rev,
        upto: soon(t, reviewAt, 0.5)
      })
    );
    ring(RX, 500, 40, { color: P.ink, alpha: rev, width: 2.5 });
    check(RX, 502, 34, { alpha: rev, color: P.evidence });
    nameText(L("审阅", "Review"), RX, 500 - 40 - NAME_GAP, {
      valign: "bottom",
      alpha: stageB * named(t, reviewAt),
      set: "after"
    });
    link(RX + 40, 500, MX - 30, 500, {
      alpha: com,
      upto: soon(t, combine, 0.5),
      width: 3,
      color: P.authority
    });
    commitDot(MX, 500, { alpha: com, color: P.authority, r: 24 });
    nameText(L("集成", "Combine"), MX, 500 + 24 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageB * named(t, combine),
      set: "after"
    });
  }
  if (stageC0 > 0) {
    const Y = 480, X0 = 400, X1 = 1520, HX = 960, q = voiceTime(t) * 0.35 % 1;
    laneTrack(X0, X1, Y, { alpha: stageC0, flow: q });
    person(HX, Y - 56, { alpha: stageC0, size: 1.3, color: P.authority });
    nameText(L("此刻归谁", "Who holds it now"), HX, Y - 124, {
      valign: "bottom",
      color: P.authority,
      alpha: stageC0
    });
    box(HX - 120, Y + 26, 240, 110, {
      fill: P.row,
      stroke: P.authority,
      alpha: stageC0 * named(t, leaseWord),
      radius: 12,
      width: 2.5
    });
    clock(HX - 72, Y + 81, 26, {
      alpha: stageC0 * named(t, leaseWord),
      color: P.authority,
      hand: soon(t, leaseWord, 4) * 0.6
    });
    nameText("Lease", HX + 26, Y + 81, {
      color: P.authority,
      alpha: stageC0 * named(t, leaseName),
      bold: true
    });
    nameText(L("一条通道", "A lane"), X0, Y + 26 + NAME_GAP, {
      align: "left",
      valign: "top",
      alpha: stageC0
    });
    nameText(L("会到期的租约", "An expiring Lease"), HX, Y + 136 + NAME_GAP, {
      valign: "top",
      alpha: stageC0 * named(t, leaseWord)
    });
    nameText(L("只记四样", "Only four things"), HX, Y + 136 + NAME_GAP + 44, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: stageC0 * named(t, fourAt)
    });
  }
  if (stageC > 0) {
    const lead = 340 * (1 - soon(t, fresh - 0.5, 0.9)), CX = 620 + lead, TOP = 320, STEP = 80, ats = [laneF, holder, expiry, gen], names = en ? ["The lane", "Its holder", "Its expiry time", "A generation number"] : ["哪条通道", "谁持有", "什么时候到期", "第几次持有的编号"], W = 102 + Math.max(...names.map((v) => measure(v))) + 40;
    const left = CX - W / 2, grown = ats.reduce((v, at) => v + soon(t, at - 0.5, 0.4), 0), H = 26 + Math.max(1, grown) * STEP;
    box(left, TOP, W, H, { fill: P.row, stroke: P.authority, alpha: stageC, radius: 14, width: 3 });
    nameText("Lease", left, TOP - NAME_GAP, {
      align: "left",
      valign: "bottom",
      color: P.authority,
      alpha: stageC,
      bold: true
    });
    nameText(L("只记四样", "Only four things"), left + W, TOP - NAME_GAP, {
      align: "right",
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: stageC
    });
    ats.forEach((at, i) => {
      const on2 = stageC * ramp(t, at - 0.15, 0.4), c = blend(P.ink, P.evidence, speaking(t, ats, i)), x = left + 58, y = TOP + 53 + i * STEP;
      if (i === 0) folderIcon(x - 24, y - 18, 46, 36, { alpha: on2, color: c });
      if (i === 1) person(x, y - 2, { alpha: on2, size: 0.7, color: c });
      if (i === 2) clock(x, y, 18, { alpha: on2, color: c, hand: 0.3 });
      if (i === 3) text("#", x, y + 1, 30, { role: "mark", align: "center", color: c, alpha: on2 });
      nameText(names[i], x + 44, y, {
        align: "left",
        alpha: stageC * listIn(t, ats, i),
        set: "fields"
      });
    });
    const on = stageC * ramp(t, fresh - 0.15, 0.4), RX = 1340, CY = TOP + 180, q = voiceTime(t) * 0.5 % 1;
    link(CX + W / 2, CY, RX - 96, CY, {
      alpha: on,
      upto: soon(t, fresh, 0.5),
      dash: [8, 9],
      flow: q
    });
    ring(RX, CY, 96, { color: P.evidence, alpha: on, width: 3 });
    line(RX + 68, CY + 68, RX + 122, CY + 122, { color: P.evidence, alpha: on, width: 6 });
    [
      [-36, -26],
      [18, -38],
      [-14, 18],
      [34, 24]
    ].forEach(([dx, dy]) => dot(RX + dx, CY + dy, 8, { color: P.evidence, alpha: on }));
    nameText(L("别的情况每次重新查", "Observed afresh each time"), RX + 20, CY + 122 + NAME_GAP, {
      valign: "top",
      width: 380,
      alpha: on
    });
  }
  if (stageD > 0) {
    const shift = 400 * (1 - soon(t, compete - 0.6, 1)), LX = 330 + shift, LW = 460, RX = 1130 + shift, RW = 380, ys = [370, 520], q = voiceTime(t) * 0.4, co = stageD, cm = stageD * ramp(t, compete - 0.15, 0.4), noneOff = ramp(t, none - 0.15, 0.15), noneOn = ramp(t, none, 0.2);
    laneGroup(LX, LX + LW, ys, { alpha: co, q: q % 1 });
    ys.forEach(
      (y) => link(LX + LW, y, LX + LW + 90, 445, {
        route: "hvh",
        mid: LX + LW + 40,
        alpha: co,
        upto: soon(t, coop + 0.2, 0.5)
      })
    );
    commitDot(LX + LW + 112, 445, { alpha: co, color: P.authority, r: 22 });
    nameText(L("合作：合到一起", "Cooperate: combined"), LX + LW / 2 + 50, 590, {
      valign: "top",
      alpha: stageD * named(t, Math.min(coop, mode + 0.3)),
      color: P.authority
    });
    const pick = ys[0];
    laneGroup(RX, RX + RW, ys, { alpha: cm, q: (q + 0.5) % 1, size: 0.82 });
    ys.forEach((y, i) => {
      ring(RX + RW + 40, y, 24, {
        color: i ? P.muted : blend(P.evidence, P.muted, noneOn),
        alpha: cm,
        width: 2.5
      });
      if (!i) check(RX + RW + 40, y + 2, 22, { color: P.evidence, alpha: cm * (1 - noneOff) });
    });
    cross(RX + RW + 40, ys[1], 18, { alpha: cm, width: 3 });
    if (noneOn > 0) cross(RX + RW + 40, pick, 18, { alpha: cm * noneOn, width: 3 });
    nameText(
      L("竞争：选一个，或一个都不选", "Compete: one chosen, or none"),
      RX + RW / 2 + 40,
      590,
      { valign: "top", alpha: stageD * named(t, compete) }
    );
  }
  if (stageE > 0) {
    const Y = 470, X0 = 360, X1 = 1080, off = ramp(t, deleted, 0.2), gone = soon(t, deleted + 0.2, 0.9), RX = mix(1420, 960, gone), on = stageE * (1 - off), end = on * ramp(t, negative - 0.15, 0.4);
    laneTrack(X0, X1, Y, { alpha: on, flow: voiceTime(t) * 0.4 % 1 });
    cross(X1 + 44, Y, 30, { alpha: end, width: 3.5 });
    nameText(L("否定的结论", "A negative result"), X1 + 44, Y - 28 - NAME_GAP, {
      valign: "bottom",
      alpha: on * named(t, negative)
    });
    nameText(L("一次探索", "An exploration"), X0, Y + 26 + NAME_GAP, {
      align: "left",
      valign: "top",
      alpha: on
    });
    const kept = stageE * ramp(t, evid - 0.15, 0.4), q = soon(t, evid, 0.9);
    repoIcon(RX, Y, 230, 170, { alpha: kept });
    documentIcon(mix(X1 - 40, RX - 28, q), Y - 22, 56, 72, {
      alpha: kept,
      rows: 3,
      stroke: P.evidence
    });
    nameText(L("有用的证据保留", "Useful evidence stays"), RX, Y + 85 + NAME_GAP, {
      valign: "top",
      color: P.evidence,
      alpha: stageE * named(t, evid)
    });
  }
};

// picture/film/scenes/lanes/prewrite.js
scenes["07"] = function(s, t) {
  const notEdit = cue(s, "不等于", "is not permission");
  const [each, wtAt, filesAt] = en ? cues(s, [
    ["", "Each change"],
    ["", "the lane's worktree"],
    ["", "exactly the files"]
  ]) : cues(s, [
    ["每次修改", ""],
    ["这个工作区", ""],
    ["这几个文件", ""]
  ]);
  const [carryAt, againAt] = cues(s, [
    ["受版本管理", "a tracked file"],
    ["再核对", "looks again"]
  ]);
  const [ifAt, dirty, foreign, state, readOnly, freshAt] = cues(s, [
    ["如果那里有", "If there is"],
    ["还没提交的改动", "uncommitted work"],
    ["文件是别人的", "the files belong"],
    ["状态跟预期对不上", "the state is not"],
    ["只能看", "can be read"],
    ["重新检查放行", "a fresh check"]
  ]);
  const [ago, nowAt, onlyAt, unrelated] = cues(s, [
    ["几分钟前", "A check that passed"],
    ["现在再查一次", "for one now"],
    ["只有写这几个文件要等", "Only writes"],
    ["无关的工作", "unrelated work"]
  ]);
  const [limit, mechanism, willing, notOs, cannot] = cues(s, [
    ["还有一个局限", "There is one limit"],
    ["这套机制", "lanes and checks"],
    ["愿意遵守约定", "participants who follow"],
    ["操作系统那种隔离", "isolation of the kind"],
    ["拦不住", "cannot stop"]
  ]);
  const stageA = stageOut(t, each), stageB = stageIn(t, each) * stageOut(t, ifAt), stageC = stageIn(t, ifAt) * stageOut(t, ago), stageD = stageIn(t, ago) * stageOut(t, limit), stageE = stageIn(t, limit);
  if (stageA > 0) {
    const Y = 480, X0 = 300, X1 = 840, DX = 1360, q = voiceTime(t) * 0.35 % 1;
    laneTrack(X0, X1, Y, { alpha: stageA, flow: q });
    person(mix(X0, X1, 0.5) + 30, Y - 50, { alpha: stageA, size: 1.2, color: P.authority });
    nameText(L("持有一条通道", "Holding a lane"), mix(X0, X1, 0.5) + 30, Y + NAME_GAP + 6, {
      valign: "top",
      color: P.authority,
      alpha: stageA
    });
    stroke(
      () => {
        ctx.moveTo(1010, Y - 12);
        ctx.lineTo(1060, Y - 12);
        ctx.moveTo(1010, Y + 12);
        ctx.lineTo(1060, Y + 12);
        ctx.moveTo(1048, Y - 34);
        ctx.lineTo(1022, Y + 34);
      },
      { color: P.muted, alpha: stageA * ramp(t, notEdit - 0.15, 0.4), width: 4 }
    );
    const on = stageA * ramp(t, notEdit - 0.15, 0.4);
    documentIcon(DX - 70, Y - 92, 140, 184, { alpha: on, rows: 5 });
    lock(DX + 70, Y + 80, { alpha: on, size: 1.3 });
    nameText(L("此刻改这个文件", "Editing this file now"), DX, Y + 92 + NAME_GAP, {
      valign: "top",
      alpha: on
    });
  }
  if (stageB > 0) {
    const lead = 200 * (1 - soon(t, wtAt - 0.3, 0.5)), Y = 490, AX = 330 + lead, GX = 800 + lead, FX = 1090 + lead, FW = 480, FH = 250, q = voiceTime(t) * 0.4 % 1;
    agent(AX, Y, { alpha: stageB, size: 1.5 });
    nameText("Agent", AX, Y + 40 + NAME_GAP, { valign: "top", alpha: stageB });
    link(AX + 126, Y, GX - 36, Y, { alpha: stageB, flow: q });
    documentIcon(mix(AX + 70, GX - 98, soon(t, carryAt - 0.1, 1.3)), Y - 34, 52, 68, {
      alpha: stageB,
      rows: 3,
      stroke: P.evidence
    });
    writeGate(GX, Y, 280, { alpha: stageB, single: true });
    beats(t, GX, Y + 129, 40, [againAt], { color: P.authority, alpha: stageB });
    nameText(L("写入前的检查", "A check just before writing"), GX, Y - 140 - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: stageB
    });
    const wt = stageB * ramp(t, wtAt - 0.15, 0.4), files = stageB * ramp(t, filesAt - 0.4, 0.4);
    folderIcon(FX, Y - FH / 2, FW, FH, { alpha: wt });
    nameText(L("这个工作区", "The lane's worktree"), FX + FW / 2, Y + FH / 2 + NAME_GAP, {
      valign: "top",
      alpha: stageB * named(t, wtAt)
    });
    const xs = [FX + 100, FX + 240, FX + 380];
    xs.forEach(
      (x, i) => documentIcon(x - 52, Y - 72, 104, 136, {
        alpha: files,
        rows: 3,
        stroke: i === 1 ? P.authority : P.muted
      })
    );
    nameText(L("这几个文件", "Exactly these files"), FX + FW / 2, Y + 94, {
      alpha: stageB * named(t, filesAt),
      color: P.authority
    });
    const scan = voiceTime(t) * 0.3 % 1;
    line(mix(FX + 30, FX + FW - 30, scan), Y - 100, mix(FX + 30, FX + FW - 30, scan), Y + 74, {
      color: P.evidence,
      alpha: wt * pass(scan, 0.1),
      width: 2.5
    });
    link(GX + 36, Y, FX, Y, { alpha: wt, upto: soon(t, wtAt, 0.5), dash: [8, 9] });
  }
  if (stageC > 0) {
    const ats = [dirty, foreign, state], ys = [350, 490, 630], IX = 300, GX = 1010, Y = 490, names = en ? ["Uncommitted work", "Someone else's, or unclear", "Not the state expected"] : ["还没提交的改动", "别人的，或归属说不清", "状态跟预期对不上"];
    ats.forEach((at, i) => {
      const on = stageC * ramp(t, at - 0.15, 0.4), c = blend(P.ink, P.unknown, speaking(t, ats, i)), y = ys[i];
      if (i === 0) {
        documentIcon(IX - 28, y - 36, 56, 72, { alpha: on, rows: 3, stroke: c });
        dot(IX + 24, y - 30, 8, { color: P.unknown, alpha: on });
      }
      if (i === 1) {
        person(IX, y, { alpha: on, size: 0.9, color: c });
        text("?", IX + 34, y - 22, 30, { role: "mark", color: P.unknown, alpha: on });
      }
      if (i === 2) {
        ring(IX, y, 30, { color: c, alpha: on, width: 2.5 });
        stroke(
          () => {
            ctx.moveTo(IX - 13, y - 6);
            ctx.lineTo(IX + 13, y - 6);
            ctx.moveTo(IX - 13, y + 6);
            ctx.lineTo(IX + 13, y + 6);
            ctx.moveTo(IX + 8, y - 15);
            ctx.lineTo(IX - 8, y + 15);
          },
          { color: c, alpha: on, width: 2.5 }
        );
      }
      nameText(names[i], IX + 50 + NAME_GAP, y, {
        align: "left",
        alpha: stageC * listIn(t, ats, i),
        set: "blockers"
      });
      link(IX + 50 + NAME_GAP + measure(names[i]) + 14, y, GX - 36, Y, {
        route: "hvh",
        mid: GX - 90,
        alpha: on,
        upto: soon(t, at + 0.1, 0.5)
      });
    });
    const open = soon(t, freshAt + 0.4, 0.7), DX = 1340, ro = stageC * ramp(t, readOnly - 0.15, 0.4), fr = stageC * ramp(t, freshAt - 0.15, 0.4);
    writeGate(GX, Y, 280, { alpha: stageC, open, single: true });
    nameText(L("写入前的检查", "A check just before writing"), GX, Y - 140 - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: stageC
    });
    documentIcon(DX - 80, Y - 104, 160, 208, { alpha: stageC, rows: 2 });
    nameText(L("要写的文件", "The files to change"), DX, Y - 104 - NAME_GAP, {
      valign: "bottom",
      alpha: stageC
    });
    lock(DX + 80, Y + 90, { alpha: ro, closed: 1 - open, size: 1.3 });
    nameText(L("只能看，不能写", "Read, not written"), DX, Y + 104 + NAME_GAP, {
      valign: "top",
      alpha: stageC * named(t, readOnly)
    });
    nameText(L("重新检查才放行", "Until a fresh check clears it"), GX, Y + 140 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: fr,
      width: 320
    });
  }
  if (stageD > 0) {
    const move = soon(t, nowAt + 0.05, 0.5), k = mix(2.15, 1, move), AX = mix(1020, 560, move), Y = mix(470, 340, move), BX = 1360, q = voiceTime(t) * 0.4 % 1, now = stageD * ramp(t, nowAt - 0.15, 0.4);
    clock(AX - 110 * k, Y, 36 * k, { alpha: stageD, color: P.muted, hand: 0.1 });
    seal(AX, Y, 40 * k, { alpha: stageD, color: P.muted });
    cross(AX + 66 * k, Y, 26, { alpha: stageD * ramp(t, nowAt + 0.2, 0.4), width: 3 });
    nameText(L("几分钟前通过的", "Passed minutes ago"), AX - 30 * k, Y + 40 * k + NAME_GAP, {
      valign: "top",
      color: P.muted,
      alpha: stageD
    });
    clock(BX - 110, 340, 36, { alpha: now, color: P.evidence, hand: 0.9 });
    seal(BX, 340, 40, { alpha: now, color: P.evidence });
    nameText(L("现在再查一次", "Checked now"), BX - 30, 340 + 40 + NAME_GAP, {
      valign: "top",
      color: P.evidence,
      alpha: stageD * named(t, nowAt)
    });
    link(AX + 110, 340, BX - 160, 340, {
      alpha: now * move,
      upto: soon(t, nowAt, 0.6),
      dash: [8, 9]
    });
    const w = stageD * ramp(t, onlyAt - 0.15, 0.4), u = stageD * ramp(t, unrelated - 0.15, 0.4), Y1 = 560, Y2 = 680;
    laneTrack(300, 1e3, Y1, { alpha: w, flow: null });
    writeGate(1040, Y1, 90, { alpha: w });
    dot(960, Y1, 9, { color: P.authority, alpha: w });
    nameText(L("只有写这几个文件要等", "Only writes to those files wait"), 1100, Y1, {
      align: "left",
      alpha: stageD * named(t, onlyAt)
    });
    laneTrack(300, 1e3, Y2, { alpha: u, flow: q });
    nameText(L("无关的工作照常进行", "Unrelated work carries on"), 1100, Y2, {
      align: "left",
      alpha: stageD * named(t, unrelated)
    });
  }
  if (stageE > 0) {
    const grow = soon(t, willing - 0.5, 0.5), CX = mix(960, 720, soon(t, notOs - 0.3, 0.5)), W = mix(460, 780, grow), H = mix(160, 300, grow), top = mix(420, 340, grow), left = CX - W / 2, right = CX + W / 2;
    const q = voiceTime(t) * 0.35 % 1, MY = top + 72, PY = top + 192, on = stageE * ramp(t, willing - 0.15, 0.4), bad = stageE * ramp(t, cannot - 0.15, 0.4), OX = 1440;
    box(left, top, W, H, {
      stroke: P.muted,
      alpha: stageE,
      radius: 18,
      dash: [10, 10],
      width: 2.5
    });
    line(right, top + 18, right, top + H - 18, { color: P.unknown, alpha: stageE, width: 3 });
    nameText(L("这套机制", "Lanes and checks"), left, top - NAME_GAP + 4, {
      align: "left",
      valign: "bottom",
      alpha: stageE * named(t, mechanism)
    });
    nameText(L("一个局限", "One limit"), right, top - NAME_GAP + 4, {
      align: "right",
      valign: "bottom",
      color: P.unknown,
      alpha: stageE
    });
    laneTrack(CX - 190, CX + 130, MY, { alpha: stageE, flow: q });
    writeGate(CX + 168, MY, 90, { alpha: stageE, single: true });
    person(CX - 280, PY, { alpha: on, size: 1.2, color: P.ink });
    agent(CX - 95, PY + 2, { alpha: on, size: 1.2 });
    person(CX + 95, PY, { alpha: on, size: 1.2, color: P.ink });
    agent(CX + 280, PY + 2, { alpha: on, size: 1.2 });
    nameText(L("愿意遵守约定的参与者", "Participants keeping the protocol"), CX, PY + 46, {
      valign: "top",
      alpha: stageE * named(t, willing)
    });
    rejectedName(L("操作系统那种隔离", "Operating-system isolation"), OX, 330, {
      alpha: stageE * named(t, notOs),
      mark: ramp(t, notOs + 0.3, 0.4),
      width: 340
    });
    agent(
      mix(OX + 80, 1040, soon(t, cannot + 0.2, 1.6)),
      mix(480, 440, soon(t, cannot + 1.2, 0.6)),
      { alpha: bad, size: 1.5, color: P.unknown }
    );
    nameText(L("不守约定的程序拦不住", "An uncooperative program walks through"), OX, 550, {
      valign: "top",
      width: 400,
      color: P.unknown,
      alpha: stageE * named(t, cannot)
    });
  }
};

// picture/film/scenes/kernel/transition-plan.js
function transientCard(x, y, w, h, name, note, { alpha = 1, inkAlpha = alpha, gone = 0, color = P.evidence, set = null } = {}) {
  if (alpha < 0.01) return;
  box(x - w / 2, y - h / 2, w, h, {
    fill: P.row,
    stroke: color,
    alpha: alpha * (1 - gone * 0.7),
    radius: 12,
    dash: [8, 8],
    width: 2.5
  });
  nameText(name, x, y - 22, { color, alpha: inkAlpha * (1 - gone * 0.3), bold: true, set });
  nameText(note, x, y + 24, {
    size: NOTE,
    color: P.muted,
    alpha: inkAlpha * (1 - gone * 0.3),
    width: w - 30,
    set
  });
}
function s08Values(xs, end, y, { alpha = 1, gone = 0, w = 150, h = 92 } = {}) {
  if (alpha < 0.01) return;
  const temporary = alpha * (1 - clamp(gone)), colours = [P.authority, P.evidence, P.evidence];
  line(xs[0] - w / 2 - 30, y + h / 2, end, y + h / 2, { color: P.muted, alpha, width: 3 });
  if (temporary < 0.01) return;
  fill(() => xs.forEach((x) => ctx.roundRect(x - w / 2, y - h / 2, w, h, 12)), {
    color: P.row,
    alpha: temporary
  });
  xs.forEach(
    (x, i) => stroke(() => ctx.roundRect(x - w / 2, y - h / 2, w, h, 12), {
      color: colours[i],
      alpha: temporary,
      width: 2.5,
      dash: [8, 8]
    })
  );
}
scenes["08"] = function(s, t) {
  const [small] = cues(s, [["很小的信任内核", "a small trust kernel"]]);
  const [what, inA, inB, inC, plan, carry, newRec] = cues(s, [
    ["内核做的事", "What it does"],
    ["已经采纳的意图", "accepted intent"],
    ["刚观察到的事实", "freshly observed facts"],
    ["以前留下的核验记录", "earlier verification records"],
    ["编译出一份计划", "compiles one plan"],
    ["执行这份计划", "carries it out"],
    ["写下新的核验记录", "writes new verification"]
  ]);
  const [fromChange, criteriaAt, compileAt, comm] = cues(s, [
    ["采纳的意图来自", "Accepted intent comes"],
    ["验收条件", "acceptance criteria"],
    ["编译成一个临时", "compiles its"],
    ["Commitment", "the Commitment"]
  ]);
  const [temp, discard] = cues(s, [
    ["这三样都是临时的", "All three are temporary"],
    ["用完就丢", "then discarded"]
  ]);
  const [persist, remain, verifier, limits] = cues(s, [
    ["内核用到的这些值里", "Of the kernel's values"],
    ["真正留下来的", "the only one that persists"],
    ["哪个检验程序", "which verifier"],
    ["在什么范围内成立", "within which limits"]
  ]);
  const record = en ? cue(s, "", "the Attestation") : cueFrom(s, "核验记录", "", remain), attest = cue(s, "Attestation", "the Attestation");
  const doneAts = en ? cues(s, [
    ["", "what was observed"],
    ["", "judged"],
    ["", "proved"],
    ["", "or done"]
  ]) : cues(s, [
    ["一次观察", ""],
    ["一项判断", ""],
    ["一次证明", ""],
    ["一次改动", ""]
  ]);
  const factsCard = en ? cue(s, "", "The fresh observations") : cue(s, "刚观察到的事实叫", ""), planCard = en ? cue(s, "", "the compiled plan") : cue(s, "的计划叫", "");
  const stageA = stageOut(t, what), stageB = stageIn(t, what) * stageOut(t, fromChange), stageC = stageIn(t, fromChange) * stageOut(t, persist), stageD = stageIn(t, persist);
  if (stageA > 0) {
    const g = stageA * clearOfTitle(s, t, 340), KX = 960, KY = 600, KR = 72, TOP = 380, k = g * ramp(t, small - 0.15, 0.4);
    box(600, TOP + 108, 720, 14, { fill: P.line, alpha: g, radius: 7 });
    folderIcon(660, TOP + 24, 110, 84, { alpha: g, color: P.ink });
    laneTrack(840, 1080, TOP + 82, { alpha: g, flow: voiceTime(t) * 0.4 % 1 });
    writeGate(1230, TOP + 54, 108, { alpha: g, color: P.ink, single: true });
    nameText(L("这套做法", "All of this"), 960, TOP - NAME_GAP, {
      valign: "bottom",
      alpha: stageA * named(t, s.voice_start)
    });
    kernelIcon(KX, KY, KR, { alpha: k });
    nameText(L("很小的信任内核", "A small trust kernel"), KX, KY + KR + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageA * named(t, small)
    });
  }
  if (stageB > 0) {
    const ats = [inA, inB, inC], ys = [320, 480, 640], IX = 360, KX = 800, KR = 84, PX = 1130, EX = 1370, RX = 1600, Y = 480, q = voiceTime(t) * 0.45 % 1;
    const names = en ? ["Accepted intent", "Freshly observed facts", "Earlier verification records"] : ["已经采纳的意图", "刚观察到的事实", "以前留下的核验记录"];
    line(IX + 44, Y, RX - 30, Y, { color: P.muted, alpha: stageB, width: 3 });
    kernelIcon(KX, Y, KR, { alpha: stageB, beat: speaking(t, [plan], 0) });
    nameText(L("内核", "The trust kernel"), KX, Y + KR + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageB
    });
    ats.forEach((at, i) => {
      const on = stageB * ramp(t, at - 0.15, 0.4), y = ys[i], c = [P.authority, P.evidence, P.ink][i];
      if (i === 0) documentIcon(IX - 32, y - 40, 64, 80, { alpha: on, rows: 3, stroke: c });
      if (i === 1)
        [
          [-16, -12],
          [14, -18],
          [-8, 12],
          [18, 14]
        ].forEach(([dx, dy]) => dot(IX + dx, y + dy, 8, { color: c, alpha: on }));
      if (i === 2) {
        seal(IX - 8, y - 6, 26, { alpha: on, color: c });
        seal(IX + 8, y + 8, 26, { alpha: on, color: c });
      }
      nameText(names[i], IX, y + 40 + 10, {
        valign: "top",
        width: 360,
        alpha: stageB * listIn(t, ats, i),
        color: c,
        set: "inputs"
      });
      link(IX + 44, y, KX - KR * 0.86, Y + (i - 1) * 34, {
        route: "hvh",
        mid: KX - KR - 70,
        alpha: on,
        upto: soon(t, at + 0.05, 0.5),
        flow: q,
        color: c === P.ink ? P.line : c
      });
    });
    const pl = stageB * ramp(t, plan - 0.15, 0.4), ca = stageB * ramp(t, carry - 0.15, 0.4), ne = stageB * ramp(t, newRec - 0.15, 0.4);
    link(KX + KR * 0.9, Y, PX - 44, Y, { alpha: pl, upto: soon(t, plan, 0.4), flow: q });
    documentIcon(PX - 44, Y - 58, 88, 116, { alpha: pl, rows: 3, stroke: P.evidence });
    nameText(L("一份计划", "One plan"), PX, Y + 58 + NAME_GAP, {
      valign: "top",
      alpha: stageB * named(t, plan)
    });
    link(PX + 44, Y, EX - 34, Y, { alpha: ca, upto: soon(t, carry, 0.4), flow: q });
    ring(EX, Y, 34, { color: P.ink, alpha: ca, width: 2.5 });
    stroke(
      () => {
        ctx.moveTo(EX - 10, Y - 15);
        ctx.lineTo(EX + 15, Y);
        ctx.lineTo(EX - 10, Y + 15);
        ctx.closePath();
      },
      { color: P.ink, alpha: ca, width: 2.5 }
    );
    nameText(L("执行", "Carried out"), EX, Y + 34 + NAME_GAP + 24, {
      valign: "top",
      alpha: stageB * named(t, carry)
    });
    link(EX + 34, Y, RX - 30, Y, { alpha: ne, upto: soon(t, newRec, 0.4), flow: q });
    seal(RX, Y, 30, { alpha: ne });
    nameText(L("新的核验记录", "New records"), RX, Y + 34 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      width: 200,
      alpha: stageB * named(t, newRec)
    });
    const back = rounded(
      [
        [RX + 30, Y],
        [RX + 110, Y],
        [RX + 110, 770],
        [IX - 200, 770],
        [IX - 200, ys[2]],
        [IX - 34, ys[2]]
      ],
      18
    );
    path(along(back, soon(t, newRec + 0.5, 1.2)).kept, { color: P.line, alpha: ne, width: 2 });
  }
  if (stageC > 0) {
    const ats = [comm, factsCard, planCard], xs = [420, 960, 1500], Y = 590, W = 400, H = 140, gone = soon(t, discard, 0.6), KX = 960, KY = mix(420, 310, soon(t, comm - 0.3, 0.5)), KR = 62, q = voiceTime(t) * 0.45 % 1;
    const names = ["Commitment", "Facts", "TransitionPlan"], notes = en ? [
      "The acceptance criteria, compiled",
      "The fresh observations",
      "The plan compiled from them"
    ] : ["验收条件编译成的值", "刚观察到的事实", "编译出来的计划"];
    kernelIcon(KX, KY, KR, { alpha: stageC, beat: speaking(t, [compileAt], 0) });
    folderIcon(xs[0] - 55, KY - 42, 110, 84, { alpha: stageC, color: P.authority });
    nameText(L("正式变更", "The official Change"), xs[0], KY + 42 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageC
    });
    link(xs[0] + 55, KY, KX - KR, KY, { alpha: stageC, flow: q, color: P.authority });
    documentIcon(mix(xs[0] + 70, KX - KR - 50, soon(t, criteriaAt - 0.1, 1.2)), KY - 26, 40, 52, {
      alpha: stageC * ramp(t, criteriaAt - 0.15, 0.3) * (1 - soon(t, criteriaAt + 1, 0.3)),
      rows: 3,
      stroke: P.authority
    });
    [
      [-30, -22],
      [24, -30],
      [-12, 16],
      [34, 18]
    ].forEach(([dx, dy]) => dot(xs[2] + dx, KY + dy, 9, { color: P.evidence, alpha: stageC }));
    link(xs[2] - 56, KY, KX + KR, KY, { alpha: stageC, flow: q, color: P.evidence });
    ats.forEach((at, i) => {
      const on = stageC * ramp(t, at - 0.15, 0.4);
      transientCard(xs[i], Y, W, H, names[i], notes[i], {
        alpha: on,
        inkAlpha: on * listLevel(t, ats, i),
        gone,
        color: i ? P.evidence : P.authority,
        set: "values"
      });
      link(KX, KY + KR, xs[i], Y - H / 2, {
        route: "vhv",
        mid: Y - H / 2 - 44,
        alpha: on,
        upto: soon(t, at, 0.5),
        color: P.line
      });
    });
    const tm = stageC * ramp(t, temp - 0.15, 0.4);
    clock(960 - 260, Y + H / 2 + 56, 30, { alpha: tm, color: P.muted, hand: gone * 0.9 });
    nameText(L("临时的，只用这一次", "Temporary: one decision only"), 960 - 210, Y + H / 2 + 56, {
      align: "left",
      alpha: tm
    });
    nameText(L("用完就丢", "Then discarded"), 960 + 240, Y + H / 2 + 56, {
      align: "left",
      size: NOTE,
      color: P.muted,
      alpha: stageC * named(t, discard)
    });
  }
  if (stageD > 0) {
    const xs = [600, 800, 1e3], RX = 1240, SY = 470, grow = soon(t, record + 0.05, 0.6), shelf = stageD * (1 - ramp(t, record + 0.05, 0.4));
    s08Values(xs, RX + 105, SY, { alpha: shelf, gone: ramp(t, remain + 0.05, 0.6) });
    nameText(L("这些值", "The kernel's values"), 920, SY + 46 + NAME_GAP + 4, {
      valign: "top",
      alpha: shelf
    });
    const parts = en ? ["What was observed", ", judged", ", proved", " or done"] : ["记下观察", "、判断", "、证明", "或改动"];
    const rows = [
      parts.join(""),
      ...en ? ["Which verifier produced it", "Within which limits it holds"] : ["出自哪个检验程序", "结论在什么范围内成立"]
    ];
    const ats = [doneAts[0], verifier, limits], W = Math.max(780, 104 + Math.max(...rows.map((v) => measure(v))) + 60);
    const left = mix(RX - 75, 960 - W / 2, grow), top = mix(SY - 46, 350, grow), width = mix(150, W, grow);
    const H = mix(92, 150 + ats.reduce((v, at) => v + soon(t, at - 0.5, 0.4), 0) * 58, grow);
    box(left, top, width, H, {
      fill: P.row,
      stroke: P.authority,
      alpha: stageD,
      radius: mix(12, 16, grow),
      width: 3.5
    });
    seal(left + width - mix(75, 74, grow), top + mix(46, 74, grow), mix(26, 44, grow), {
      alpha: stageD
    });
    const full = clamp((grow - 0.75) / 0.25);
    nameText(L("核验记录", "Attestation"), left + 54, top + 64, {
      align: "left",
      color: P.authority,
      alpha: stageD * named(t, record) * full,
      bold: true
    });
    if (!en)
      nameText("Attestation", left + 54 + measure("核验记录", LABEL, true) + 18, top + 64, {
        align: "left",
        size: NOTE,
        color: P.muted,
        alpha: stageD * named(t, attest) * full
      });
    ats.forEach((at, i) => {
      const y = top + 142 + i * 58, on = stageD * ramp(t, at - 0.15, 0.4);
      check(left + 72, y + 1, 22, { alpha: on, color: P.evidence });
      if (i === 0)
        growName(t, parts, doneAts, left + 104, y, {
          valign: "middle",
          build: true,
          alpha: stageD * listLevel(t, ats, i),
          set: "record"
        });
      else
        nameText(rows[i], left + 104, y, {
          align: "left",
          alpha: stageD * listIn(t, ats, i),
          set: "record"
        });
    });
  }
};

// picture/film/drawing/history.js
function refMark(x, y, name, { alpha = 1, color = P.authority, width = 110, h = 40, drop = 60 } = {}) {
  if (alpha < 0.01) return;
  line(x, y - drop, x, y - 12, { color, alpha, width: 2.5 });
  box(x - width / 2, y - drop - h, width, h, {
    fill: P.row,
    stroke: color,
    alpha,
    radius: 8,
    width: 2.5
  });
  text(name, x, y - drop - h / 2 + 1, 24, { role: "mark", align: "center", color, alpha });
}
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

// picture/film/scenes/kernel/compare-and-swap.js
function s09Plan(x, y, w, h, { alpha = 1, color = P.evidence } = {}) {
  if (alpha < 0.01) return;
  const c = Math.min(22, w * 0.2);
  documentIcon(x - w / 2, y - h / 2, w, h, { alpha, rows: 4, stroke: color });
  stroke(
    () => {
      ctx.moveTo(x - w / 2, y - h / 2);
      ctx.lineTo(x + w / 2 - c, y - h / 2);
      ctx.lineTo(x + w / 2, y - h / 2 + c);
      ctx.lineTo(x + w / 2, y + h / 2);
      ctx.lineTo(x - w / 2, y + h / 2);
      ctx.closePath();
    },
    { color, alpha, width: 3 }
  );
}
scenes["09"] = function(s, t) {
  const [git, versions, refAt] = en ? cues(s, [
    ["", "Git points"],
    ["", "versions"],
    ["", "names called references"]
  ]) : cues(s, [
    ["Git 用", ""],
    ["各个版本", ""],
    ["这些名字叫引用", ""]
  ]);
  const [updateAt, kernelAt, oldAt, writeAt, oneAt, casAt] = cues(s, [
    ["计划真要改动", "When a plan updates"],
    ["内核会再核对", "the kernel checks"],
    ["再核对一次旧值", "checks once more"],
    ["才写入新值", "writes the new value"],
    ["核对和写入是一步完成的", "Checking and writing"],
    ["compare-and-swap", "compare-and-swap"]
  ]);
  const [changedAt, turnAt, voidAt, freshAt] = cues(s, [
    ["旧值要是已经变了", "If the old value"],
    ["已经变了", "has changed"],
    ["原来的计划就作废", "the plan is discarded"],
    ["按新的事实", "compiled from fresh facts"]
  ]);
  const [backAt, readAt, confirmAt] = cues(s, [
    ["写完以后", "After the write"],
    ["把结果读回来", "the result is read back"],
    ["确认实际发生了什么", "confirm what actually"]
  ]);
  const [stops, unknownAt, whoAt, staleAt, clashAt] = cues(s, [
    ["有几种情况", "The kernel stops"],
    ["必需的事实还不知道", "a required fact"],
    ["谁有权决定说不清", "who has the authority"],
    ["已经过时", "out of date"],
    ["互相矛盾", "contradict each other"]
  ]);
  const [report, happened, why, evid, next, person2] = cues(s, [
    ["停下来的时候", "When it stops"],
    ["出了什么事", "what happened"],
    ["为什么停", "why it stopped"],
    ["证据是什么", "the evidence"],
    ["唯一安全的下一步", "the one safe next"],
    ["要不要人来决定", "whether a person"]
  ]);
  const [daily, runAt, statusAt, seeAt, doAt, againAt] = cues(s, [
    ["平时用的时候", "In daily use"],
    ["先运行", "you start"],
    ["状态命令", "status command"],
    ["看清现状", "see where things stand"],
    ["只做这一步", "take only"],
    ["做完再看一次", "look again"]
  ]);
  const stageA = stageOut(t, updateAt), stageB = stageIn(t, updateAt) * stageOut(t, changedAt), stageC = stageIn(t, changedAt) * stageOut(t, backAt), stageD = stageIn(t, backAt) * stageOut(t, stops);
  const stageE = stageIn(t, stops) * stageOut(t, report), stageF = stageIn(t, report) * stageOut(t, daily), stageG = stageIn(t, daily);
  const X0 = 620, STEP = 180, Y = 520;
  if (stageA > 0) {
    const mv = soon(t, git + 0.05, 0.5), k = mix(1.7, 1, mv), PX = mix(960, 400, mv), PY = mix(370, 390, mv), PW = 120 * k, PH = 156 * k, YA = 580;
    s09Plan(PX, PY, PW, PH, { alpha: stageA });
    nameText(L("计划还没生效", "A plan alone changes nothing"), PX, PY + PH / 2 + NAME_GAP, {
      valign: "top",
      width: 560,
      alpha: stageA
    });
    const drawn = soon(t, git, 0.7), reach = mix(X0, X0 + STEP * 5, drawn), v = stageA * ramp(t, versions - 0.15, 0.4);
    if (drawn > 0) line(X0, YA, reach, YA, { color: P.ink, alpha: stageA, width: 2.5 });
    nameText("Git", X0 - 30, YA, { align: "right", alpha: stageA * named(t, git) });
    commitRow(X0, STEP, YA, 6, { alpha: v, single: true });
    nameText(L("各个版本", "Versions"), X0 + STEP * 2.5, YA + 40, {
      valign: "top",
      alpha: stageA * named(t, versions)
    });
    const r = stageA * ramp(t, refAt - 0.15, 0.4);
    refMark(X0 + STEP * 4, YA, "dev", { alpha: r });
    nameText(L("引用", "Reference"), X0 + STEP * 4 + 80, YA - 80, {
      align: "left",
      color: P.authority,
      alpha: stageA * named(t, refAt)
    });
  }
  if (stageB > 0) {
    const swing = soon(t, writeAt + 0.2, 0.6), rx = mix(X0 + STEP * 3, X0 + STEP * 4, swing), one = stageB * ramp(t, oneAt - 0.15, 0.4);
    const checked = stageB * ramp(t, oldAt - 0.15, 0.4), kern = stageB * ramp(t, kernelAt - 0.15, 0.4), wrote = stageB * ramp(t, writeAt - 0.15, 0.4), KX = 450;
    documentIcon(190, Y - 65, 100, 130, { alpha: stageB, rows: 3, stroke: P.evidence });
    nameText(L("计划", "A plan"), 240, Y + 65 + NAME_GAP, { valign: "top", alpha: stageB });
    commitRow(X0, STEP, Y, 4, { alpha: stageB, single: true });
    dashed(X0 + STEP * 3 + 12, Y, X0 + STEP * 4 - 12, Y, {
      color: P.muted,
      alpha: stageB,
      width: 2.5
    });
    ring(X0 + STEP * 4, Y, 12, { color: P.muted, alpha: stageB, width: 2.5, dash: [5, 5] });
    line(X0 + STEP * 3, Y, X0 + STEP * 4, Y, { color: P.ink, alpha: wrote, width: 2.5 });
    commitDot(X0 + STEP * 4, Y, { alpha: wrote, color: P.evidence, picked: 1, r: 12 });
    refMark(rx, Y, "dev", { alpha: stageB });
    nameText(L("引用", "Reference"), rx + 80, Y - 80, {
      align: "left",
      color: P.authority,
      alpha: stageB
    });
    ring(X0 + STEP * 3, Y, 24, { color: P.evidence, alpha: checked * (1 - swing * 0.6), width: 3 });
    nameText(L("预期的旧值", "The expected old value"), X0 + STEP * 3, Y + 24 + NAME_GAP + 8, {
      valign: "top",
      width: 240,
      alpha: stageB * named(t, oldAt)
    });
    nameText(L("新值", "The new value"), X0 + STEP * 4 + 10, Y + 24 + NAME_GAP + 8, {
      valign: "top",
      align: "left",
      color: P.evidence,
      alpha: stageB * named(t, writeAt)
    });
    kernelIcon(KX, Y, 80, { alpha: kern, beat: checked });
    nameText(L("内核", "The kernel"), KX, Y + 80 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageB * named(t, kernelAt)
    });
    link(290, Y, KX - 72, Y, { alpha: kern, upto: soon(t, kernelAt, 0.4) });
    const bx0 = X0 + STEP * 3 - 40, bx1 = X0 + STEP * 4 + 100, by = 300;
    path(
      [
        [bx0, by + 24],
        [bx0, by],
        [bx1, by],
        [bx1, by + 24]
      ],
      { color: P.authority, alpha: one, width: 3 }
    );
    nameText(
      L("核对和写入，一步完成", "Check and write: one step"),
      (bx0 + bx1) / 2,
      by - NAME_GAP,
      { valign: "bottom", alpha: stageB * named(t, oneAt) }
    );
    nameText("compare-and-swap", 960 - 300, by, {
      color: P.authority,
      alpha: stageB * named(t, casAt),
      bold: true
    });
    link(KX + 72, Y, X0 - 24, Y, {
      alpha: checked,
      upto: soon(t, oldAt, 0.4),
      flow: voiceTime(t) * 0.5 % 1
    });
  }
  if (stageC > 0) {
    const other = X0 + STEP * 4, turn = soon(t, turnAt + 0.05, 0.6), v = stageC * ramp(t, voidAt - 0.15, 0.4), fr = stageC * ramp(t, freshAt - 0.15, 0.4), c = blend(P.authority, P.unknown, turn), rx = mix(X0 + STEP * 3, other, turn), late = stageC * ramp(t, turnAt - 0.15, 0.4);
    commitRow(X0, STEP, Y, 4, { alpha: stageC, single: true });
    line(X0 + STEP * 3, Y, other, Y, { color: P.unknown, alpha: late, width: 2.5 });
    commitDot(other, Y, { alpha: late, color: P.unknown, r: 12 });
    refMark(rx, Y, "dev", { alpha: stageC, color: c });
    nameText(L("旧值已经变了", "The old value has changed"), rx + 80, Y - 80, {
      align: "left",
      width: 300,
      color: P.unknown,
      alpha: stageC * named(t, turnAt)
    });
    ring(X0 + STEP * 3, Y, 24, { color: P.muted, alpha: stageC, width: 2.5, dash: [5, 5] });
    nameText(L("预期的旧值", "The expected old value"), X0 + STEP * 3, Y + 24 + NAME_GAP + 8, {
      valign: "top",
      width: 240,
      alpha: stageC
    });
    documentIcon(340, Y - 170, 120, 156, { alpha: v, rows: 4, stroke: P.muted });
    cross(400, Y - 92, 60, { alpha: v * ramp(t, voidAt + 0.15, 0.4), width: 5 });
    nameText(L("原来的计划作废", "The plan is discarded"), 400, Y - 14 + NAME_GAP, {
      valign: "top",
      width: 300,
      alpha: stageC * named(t, voidAt)
    });
    const FY = 340;
    kernelIcon(790, FY, 62, { alpha: fr, beat: fr });
    documentIcon(950, FY - 60, 92, 120, { alpha: fr, rows: 3, stroke: P.evidence });
    [
      [-30, -14],
      [24, -22],
      [-12, 18]
    ].forEach(([dx, dy]) => dot(610 + dx, FY + dy, 8, { color: P.evidence, alpha: fr }));
    link(646, FY, 728, FY, { alpha: fr, upto: soon(t, freshAt, 0.4) });
    link(852, FY, 950, FY, { alpha: fr, upto: soon(t, freshAt + 0.2, 0.4), color: P.evidence });
    nameText(L("用新事实重新编译", "Compiled again from fresh facts"), 1070, FY, {
      align: "left",
      width: 400,
      alpha: stageC * named(t, freshAt)
    });
  }
  if (stageD > 0) {
    const on = stageD, rb = stageD * ramp(t, confirmAt - 0.15, 0.4), rx = X0 + STEP * 5;
    commitRow(X0, STEP, Y, 6, { alpha: on, single: true });
    refMark(rx, Y, "dev", { alpha: on, color: P.evidence });
    nameText(L("新值", "The new value"), rx - 80, Y - 80, {
      align: "right",
      color: P.evidence,
      alpha: on
    });
    kernelIcon(380, Y, 80, { alpha: on });
    nameText(L("内核", "The kernel"), 380, Y + 80 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: on
    });
    const back = rounded(
      [
        [rx, Y - 100],
        [rx, 300],
        [380, 300],
        [380, Y - 80]
      ],
      16
    );
    path(along(back, soon(t, readAt, 1.1)).kept, {
      color: P.evidence,
      alpha: on * ramp(t, readAt - 0.15, 0.3),
      width: 2.5
    });
    nameText(L("把结果读回来", "The result is read back"), (rx + 380) / 2, 300 - NAME_GAP, {
      valign: "bottom",
      alpha: stageD * named(t, readAt)
    });
    ring(rx, Y, 44, { color: P.evidence, alpha: rb, width: 3 });
    line(rx + 32, Y + 32, rx + 62, Y + 62, { color: P.evidence, alpha: rb, width: 5 });
    nameText(L("实际发生了什么", "What actually happened"), rx, Y + 64 + NAME_GAP, {
      valign: "top",
      color: P.evidence,
      alpha: stageD * named(t, confirmAt)
    });
  }
  if (stageE > 0) {
    const names = en ? [
      "A required fact is unknown",
      "Authority is unclear",
      "Something relied on is out of date",
      "Contradicting inputs"
    ] : ["必需的事实还不知道", "谁有权决定说不清", "依赖的条件已经过时", "输入互相矛盾"];
    const SR = 118, GAP = 150, whole = SR * 2 + GAP + 68 + NAME_GAP + Math.max(...names.map((v) => measure(v))), left = 960 - whole / 2, SX = left + SR;
    const CY = 480, ats = [unknownAt, whoAt, staleAt, clashAt], ys = [330, 430, 530, 630], IX = SX + SR + GAP + 34;
    stopSign(SX, CY, SR, { alpha: stageE });
    nameText(L("内核停下来", "The kernel stops"), SX, CY + SR + NAME_GAP, {
      valign: "top",
      color: P.unknown,
      alpha: stageE
    });
    stroke(
      () => ys.forEach((y) => {
        ctx.moveTo(IX + 34, y);
        ctx.arc(IX, y, 34, 0, Math.PI * 2);
      }),
      { color: P.muted, alpha: stageE, width: 2, dash: [6, 7] }
    );
    nameText(L("有四种情况", "In four situations"), IX - 34, ys[0] - 34 - NAME_GAP, {
      align: "left",
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: stageE
    });
    ats.forEach((at, i) => {
      const on = stageE * ramp(t, at - 0.15, 0.4), c = blend(P.ink, P.unknown, speaking(t, ats, i)), y = ys[i];
      link(IX - 34, y, SX + SR, CY, {
        route: "hvh",
        mid: IX - 90,
        alpha: on,
        upto: soon(t, at, 0.4)
      });
      ring(IX, y, 34, { color: c, alpha: on, width: 2.5 });
      if (i === 0) text("?", IX, y + 1, 30, { role: "mark", align: "center", color: c, alpha: on });
      if (i === 1) {
        person(IX, y - 1, { alpha: on, size: 0.7, color: c });
      }
      if (i === 2) clock(IX, y, 18, { alpha: on, color: c, hand: 0.6 });
      if (i === 3)
        stroke(
          () => {
            ctx.moveTo(IX - 14, y - 12);
            ctx.lineTo(IX + 14, y + 12);
            ctx.moveTo(IX + 14, y - 12);
            ctx.lineTo(IX - 14, y + 12);
          },
          { color: c, alpha: on, width: 3 }
        );
      nameText(names[i], IX + 34 + NAME_GAP, y, {
        align: "left",
        alpha: stageE * listIn(t, ats, i),
        set: "stops"
      });
    });
  }
  if (stageF > 0) {
    const ats = [happened, why, evid, next, person2], rows = en ? [
      "What happened",
      "Why it stopped",
      "The evidence, or the missing fact",
      "The one safe next action",
      "Whether a person has to decide"
    ] : [
      "出了什么事",
      "为什么停",
      "证据是什么，或者还缺哪个事实",
      "唯一安全的下一步",
      "要不要人来决定"
    ];
    const W = 104 + Math.max(...rows.map((v) => measure(v))) + 60, CX = 1120, left = CX - W / 2, top = 280, STEP2 = 74, grown = ats.reduce((v, at) => v + soon(t, at - 0.5, 0.4), 0), H = 20 + Math.max(1, grown) * STEP2;
    stopSign(440, 500, 90, { alpha: stageF });
    nameText(L("停下来以后", "When it stops"), 440, 500 + 90 + NAME_GAP, {
      valign: "top",
      color: P.unknown,
      alpha: stageF
    });
    link(530, 500, left, top + 52, { route: "hvh", mid: left - 60, alpha: stageF });
    box(left, top, W, H, { fill: P.row, stroke: P.ink, alpha: stageF, radius: 14, width: 2.5 });
    ats.forEach((at, i) => {
      const on = stageF * ramp(t, at - 0.15, 0.4), y = top + 52 + i * STEP2, c = i === 3 ? P.authority : P.evidence;
      if (i === 3) {
        ring(left + 54, y, 16, { color: c, alpha: on, width: 2.5 });
        dot(left + 54, y, 6, { color: c, alpha: on });
      } else check(left + 54, y + 1, 22, { color: c, alpha: on });
      nameText(rows[i], left + 88, y, {
        align: "left",
        color: i === 3 ? P.authority : P.ink,
        alpha: stageF * listIn(t, ats, i),
        set: "report"
      });
    });
  }
  if (stageG > 0) {
    const lead = 340 * (1 - soon(t, seeAt - 0.3, 0.5)), CX = 1200 + lead, CY = 500, R = 180, ats = [seeAt, doAt, againAt], q = voiceTime(t) * 0.25 % 1, on = (i) => stageG * ramp(t, ats[i] - 0.15, 0.4);
    const W = 420, H = 130, TX = 330 + lead, TY = CY - H / 2;
    terminalIcon(TX, TY, W, H, { alpha: stageG, command: "ethos status", color: P.ink });
    nameText(L("状态命令", "The status command"), TX + W / 2, TY + H + NAME_GAP, {
      valign: "top",
      alpha: stageG * (en ? 1 : ramp(t, runAt - 0.3, 0.3))
    });
    link(TX + W, CY, CX - R, CY, {
      alpha: stageG * ramp(t, statusAt - 0.15, 0.4),
      upto: soon(t, statusAt, 0.4)
    });
    ring(CX, CY, R, { color: P.muted, alpha: on(0), width: 3, upto: saidShare(t, ats) });
    const dotA = -Math.PI / 2 + q * Math.PI * 2;
    flowDot(CX + R * Math.cos(dotA), CY + R * Math.sin(dotA), 9, q, {
      color: P.evidence,
      alpha: on(2)
    });
    const marks = [
      [-Math.PI, L("看清现状和下一步", "See where things stand")],
      [-Math.PI / 2, L("只做这一步", "Take only that action")],
      [0, L("再看一次", "Look again")]
    ];
    marks.forEach(([a], i) => {
      const x = CX + R * Math.cos(a), y = CY + R * Math.sin(a);
      dot(x, y, 12, { color: i === 1 ? P.authority : P.evidence, alpha: on(i) });
    });
    nameText(marks[0][1], CX - R + 28, CY, {
      align: "left",
      width: 270,
      alpha: stageG * listIn(t, ats, 0),
      set: "loop"
    });
    nameText(marks[1][1], CX, CY - R - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: stageG * listIn(t, ats, 1),
      set: "loop"
    });
    nameText(marks[2][1], CX + R + NAME_GAP, CY, {
      align: "left",
      width: 180,
      alpha: stageG * listIn(t, ats, 2),
      set: "loop"
    });
  }
};

// picture/film/scenes/proof/evidence.js
scenes["10"] = function(s, t) {
  const [state, askAt, commitAt, codeAt, reqAt, verAt, whereAt] = en ? cues(s, [
    ["", "Verification has"],
    ["", "what was checked"],
    ["", "which commit"],
    ["", "exactly what code"],
    ["", "which requirement"],
    ["", "which verifier"],
    ["", "where and under"]
  ]) : cues(s, [
    ["检验的时候", ""],
    ["查的是什么", ""],
    ["哪一次提交", ""],
    ["哪一份代码", ""],
    ["哪一项要求", ""],
    ["哪个检验程序", ""],
    ["在哪里", ""]
  ]);
  const [locAt, proofAt, labAt, hubAt, threeAt] = cues(s, [
    ["ETHOS 在本地", "ETHOS runs"],
    ["这叫本地证明", "That local proof"],
    ["GitLab", "GitLab"],
    ["GitHub", "GitHub"],
    ["三份来源不同", "three separate sources"]
  ]);
  const [more, idAt, sigAt, relAt, instAt, alsoAt, oneAt, neverAt, otherAt] = cues(s, [
    ["作者身份", "So are"],
    ["作者身份", "the author's identity"],
    ["提交签名", "the commit's signature"],
    ["发布出去的文件", "the released files"],
    ["装好的程序", "the installed program"],
    ["也各是一份独立的证据", "So are"],
    ["一份通过了", "A pass on one"],
    ["推不出", "never implies"],
    ["另一份也通过", "a pass on another"]
  ]);
  const [sayAt, nameAt, verifiedAt] = cues(s, [
    ["说一件事做完了", "That is why"],
    ["这一次实际检验了", "name exactly which"],
    ["检验了哪几样", "were verified"]
  ]);
  const [exAt, notYetAt, honestAt] = cues(s, [
    ["比如本地证明通过了", "If the local proof"],
    ["还没看", "have not been read"],
    ["如实的说法", "the honest statement"]
  ]);
  const stageA = stageOut(t, locAt), stageB = stageIn(t, locAt) * stageOut(t, more), stageC = stageIn(t, more) * stageOut(t, sayAt), stageD = stageIn(t, sayAt) * stageOut(t, exAt), stageE = stageIn(t, exAt);
  if (stageA > 0) {
    const g = stageA * clearOfTitle(s, t, 300), CX = 960, CY = 510, R = 110;
    const names = en ? [
      "Which commit",
      "Exactly what code",
      "Which requirement",
      "Which verifier",
      "Where, under which rules"
    ] : ["哪一次提交", "哪一份代码", "哪一项要求", "哪个检验程序", "在哪里、按什么规则"];
    const ats = [commitAt, codeAt, reqAt, verAt, whereAt], angles = [-Math.PI / 2 - 0.9, -Math.PI / 2 + 0.9, 0.55, Math.PI / 2, Math.PI - 0.55], RR = 200;
    seal(CX, CY, R, { alpha: g, color: P.authority });
    nameText(L("检验", "Verification"), CX, CY - R - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: g * named(t, state)
    });
    ats.forEach((at, i) => {
      const a = angles[i], on = g * ramp(t, at - 0.15, 0.4), lit = speaking(t, ats, i), x = CX + RR * Math.cos(a) * 1.45, y = CY + RR * Math.sin(a) * 0.9, c = blend(P.ink, P.evidence, lit);
      link(CX + R * Math.cos(a), CY + R * Math.sin(a), x, y, {
        route: Math.abs(Math.cos(a)) > 0.4 ? "vh" : "straight",
        alpha: on,
        upto: soon(t, at, 0.4),
        end: false
      });
      ring(x, y, 22, { color: c, alpha: on, width: 2.5 });
      dot(x, y, 7, { color: c, alpha: on });
      radialName(names[i], x, y, 22, a, {
        alpha: g * listIn(t, ats, i),
        set: "stated",
        width: 320
      });
    });
    nameText(L("查的是什么", "What was checked"), CX, 262, {
      color: P.authority,
      alpha: g * named(t, askAt)
    });
  }
  if (stageB > 0) {
    const ats = [locAt, labAt, hubAt], b = building(t, ats, 270, 0.35), xs = [420 + b, 960 + b, 1500 + b], Y = 450, names = en ? ["Local proof", "Checks on GitLab", "Checks on GitHub"] : ["本地证明", "GitLab 上的检查", "GitHub 上的检查"], CW = 296, CH = 190;
    ats.forEach((at, i) => {
      const on = stageB * ramp(t, (i ? at : locAt + 0.1) - 0.15, 0.4), c = blend(
        P.ink,
        P.evidence,
        i ? speaking(t, ats, i) : ramp(t, proofAt - 0.15, 0.3) * (1 - ramp(t, labAt - 0.15, 0.3))
      ), x = xs[i];
      if (i === 0) {
        terminalIcon(x - CW / 2, Y - CH / 2, CW, CH, { alpha: on, color: c, command: "prove" });
        line(
          x - CW / 2 + 24,
          Y + CH / 2 - 26,
          mix(
            x - CW / 2 + 24,
            x + CW / 2 - 24,
            soon(t, locAt + 0.25, Math.max(0.6, proofAt - locAt - 0.4))
          ),
          Y + CH / 2 - 26,
          { color: P.evidence, alpha: on, width: 3 }
        );
      } else {
        box(x - CW / 2, Y - CH / 2, CW, CH, {
          fill: P.row,
          stroke: c,
          alpha: on,
          radius: 12,
          width: 2.5
        });
        stroke(
          () => {
            ctx.moveTo(x - 110, Y - 44);
            ctx.lineTo(x + 110, Y - 44);
            ctx.moveTo(x - 110, Y);
            ctx.lineTo(x + 60, Y);
            ctx.moveTo(x - 110, Y + 44);
            ctx.lineTo(x + 84, Y + 44);
          },
          { color: P.muted, alpha: on, width: 2 }
        );
      }
      seal(x + CW / 2, Y - CH / 2, 34, {
        alpha: on,
        stamp: i ? on : stageB * ramp(t, proofAt - 0.15, 0.4),
        color: P.evidence
      });
      if (i === 0)
        nameText(L("仓库声明的检查", "Declared checks"), x, Y - CH / 2 - NAME_GAP, {
          valign: "bottom",
          size: NOTE,
          color: P.muted,
          alpha: on
        });
      nameText(names[i], x, Y + CH / 2 + NAME_GAP, {
        valign: "top",
        alpha: stageB * (i ? listIn(t, ats, i) : named(t, proofAt) * listLevel(t, ats, 0)),
        set: "planes"
      });
    });
    nameText(L("来源不同的三份证据", "Three separate sources of evidence"), 960, 660, {
      color: P.authority,
      alpha: stageB * named(t, threeAt)
    });
  }
  if (stageC > 0) {
    const names = en ? [
      "The author's identity",
      "The commit's signature",
      "The released files",
      "The installed program"
    ] : ["作者身份", "提交签名", "发布出去的文件", "装好的程序"];
    const ats = [idAt, sigAt, relAt, instAt], xs = railStations(names, 340, 1580, { wrap: 260 }), Y = 470;
    nameText(L("这些也各是一份独立的证据", "These are separate evidence too"), 960, 330, {
      color: P.authority,
      alpha: stageC * named(t, alsoAt)
    });
    const bx = building(t, ats, 207, 0.55);
    ats.forEach((at, i) => {
      const on = stageC * ramp(t, (i ? at : more) - 0.15, 0.4), c = blend(P.ink, P.evidence, speaking(t, ats, i)), x = xs[i] + bx;
      if (i === 0) person(x, Y - 4, { alpha: on, size: 1.4, color: c });
      if (i === 1) {
        commitDot(x - 22, Y, { alpha: on, color: c, r: 14 });
        seal(x + 24, Y, 26, { alpha: on, color: c });
      }
      if (i === 2) {
        tagIcon(x - 66, Y - 30, 76, 34, { alpha: on, color: c });
        documentIcon(x + 4, Y - 26, 50, 62, { alpha: on, rows: 2, stroke: c });
      }
      if (i === 3) terminalIcon(x - 62, Y - 44, 124, 88, { alpha: on, color: c });
    });
    railNames(
      names,
      xs.map((x) => x + bx),
      Y + 58,
      { gap: NAME_GAP, alpha: (i) => stageC * listIn(t, ats, i), set: "kinds", wrap: 260 }
    );
    const one = stageC * named(t, oneAt), LY = 660;
    seal(620, LY, 34, { alpha: one, color: P.evidence });
    link(662, LY, 1090, LY, {
      alpha: one * ramp(t, neverAt - 0.15, 0.3),
      dash: [8, 9],
      upto: soon(t, neverAt, 0.6),
      color: P.muted
    });
    cross(876, LY, 30, { alpha: one * ramp(t, neverAt + 0.3, 0.4), width: 3.5 });
    ring(1130, LY, 34, {
      color: P.muted,
      alpha: one * ramp(t, otherAt - 0.15, 0.4),
      width: 2.5,
      dash: [6, 6]
    });
    text("?", 1130, LY + 1, 30, {
      role: "mark",
      align: "center",
      color: P.muted,
      alpha: one * ramp(t, otherAt - 0.15, 0.4)
    });
    nameText(
      L("一份通过，推不出另一份", "A pass on one never implies another"),
      586,
      LY + 34 + NAME_GAP,
      { align: "left", valign: "top", alpha: one }
    );
  }
  if (stageD > 0) {
    const proofs = en ? ["Local proof", "Checks on GitLab", "Checks on GitHub"] : ["本地证明", "GitLab 上的检查", "GitHub 上的检查"];
    const kinds = en ? [
      "The author's identity",
      "The commit's signature",
      "The released files",
      "The installed program"
    ] : ["作者身份", "提交签名", "发布出去的文件", "装好的程序"];
    const cells = [
      ...proofs.map((v, k) => [840, 400 + k * 100, v]),
      ...kinds.map((v, k) => [1200, 350 + k * 100, v])
    ], lit = [1, 0, 0, 1, 0, 1, 0], R = 30;
    const ask = stageD * named(t, nameAt), done = stageD * ramp(t, verifiedAt - 0.15, 0.4), PX = 500;
    person(PX, 520, { alpha: stageD, size: 1.5, color: P.authority });
    box(PX - 150, 360, 300, 80, {
      fill: P.row,
      stroke: P.ink,
      alpha: stageD,
      radius: 18,
      width: 2.5
    });
    nameText(L("做完了", "It's done"), PX, 400, { alpha: stageD, bold: true });
    nameText(L("这一次检验了哪几样", "Which of these, this time"), PX, 600, {
      valign: "top",
      width: 380,
      color: P.authority,
      alpha: ask
    });
    cells.forEach(([x, y, v], i) => {
      ring(x, y, R, { color: P.line, alpha: stageD, width: 2, dash: [6, 6] });
      if (lit[i]) {
        ring(x, y, R, { color: P.evidence, alpha: done, width: 3 });
        check(x, y + 2, 26, { color: P.evidence, alpha: done, upto: soon(t, verifiedAt, 0.4) });
      }
      nameText(v, x + R + 14, y, { align: "left", alpha: stageD, set: "verified" });
    });
  }
  if (stageE > 0) {
    const [labE, hubE] = en ? cues(s, [
      ["", "the results on"],
      ["", "the results on"]
    ]) : [cueFrom(s, "GitLab", "", exAt), cueFrom(s, "GitHub", "", exAt)];
    const said1 = cueFrom(s, "本地证明通过", "the local proof passed", honestAt), said2 = cueFrom(s, "两个平台上的结果", "and the hosted results", honestAt);
    const ats = [exAt, labE, hubE], b = building(t, ats, 270, 0.3), xs = [420 + b, 960 + b, 1500 + b], Y = 400, names = en ? ["Local proof", "Checks on GitLab", "Checks on GitHub"] : ["本地证明", "GitLab", "GitHub"];
    const first = stageE * ramp(t, said1 - 0.15, 0.4), second = stageE * ramp(t, said2 - 0.15, 0.4), nv = stageE * ramp(t, notYetAt - 0.15, 0.4);
    xs.forEach((x, i) => {
      const on = stageE * (i ? ramp(t, ats[i] - 0.15, 0.4) : 1);
      box(x - 150, Y - 90, 300, 180, {
        fill: P.row,
        stroke: i ? blend(P.line, P.unknown, second) : P.evidence,
        alpha: on,
        radius: 12,
        width: i ? 2.5 : 2.5 + first,
        dash: i ? [8, 8] : null
      });
      if (!i) seal(x, Y - 10, 42, { alpha: on, color: P.evidence });
      else text("?", x, Y - 10, 56, { role: "mark", align: "center", color: P.unknown, alpha: nv });
      nameText(names[i], x, Y + 56, {
        alpha: i ? stageE * listIn(t, ats, i) : stageE,
        set: "statement"
      });
    });
    nameText(L("通过了", "Passed"), xs[0], Y + 90 + NAME_GAP, {
      valign: "top",
      size: NOTE,
      color: P.evidence,
      alpha: stageE
    });
    nameText(L("还没看", "Not read"), (xs[1] + xs[2]) / 2, Y + 90 + NAME_GAP, {
      valign: "top",
      size: NOTE,
      color: P.unknown,
      alpha: nv
    });
    const h = stageE * named(t, honestAt), parts = en ? ["Local proof passed; ", "hosted results not yet verified"] : ["本地证明通过；", "两个平台上的结果还没有检验"];
    nameText(L("如实的说法", "The honest statement"), 960, 600, {
      size: NOTE,
      color: P.muted,
      alpha: h
    });
    growName(t, parts, [said1, said2], 960 - measure(parts.join("")) / 2, 660, {
      valign: "middle",
      color: P.authority,
      alpha: stageE,
      build: true
    });
  }
};

// picture/film/scenes/review/integration.js
function s11Commits(points, { alpha = 1, color = P.ink, r = 11, width = 3 } = {}) {
  if (alpha < 0.01 || !points.length) return;
  const discs = () => points.forEach(([x, y]) => {
    ctx.moveTo(x + r, y);
    ctx.arc(x, y, r, 0, Math.PI * 2);
  });
  fill(discs, { color: P.ground, alpha });
  stroke(discs, { color, alpha, width });
}
function s11Branch(xs, y, { alpha = 1, color = P.authority, r = 12, width = 4 } = {}) {
  if (alpha < 0.01) return;
  const discs = () => xs.forEach((x) => {
    ctx.moveTo(x + r, y);
    ctx.arc(x, y, r, 0, Math.PI * 2);
  });
  fill(discs, { color: P.ground, alpha });
  stroke(
    () => {
      ctx.moveTo(xs[0] + r, y);
      ctx.lineTo(xs.at(-1) - r, y);
      discs();
    },
    { color, alpha, width }
  );
}
scenes["11"] = function(s, t) {
  const [waitAt, exact, newOnes] = cues(s, [
    ["审阅不用等", "Review does not"],
    ["明确指定的那一次提交", "one exact commit"],
    ["新带进来的", "the new commits"]
  ]);
  const [lanesAt, candAt, oneAt, toReviewer] = cues(s, [
    ["几条通道的改动", "Lanes can combine"],
    ["候选分支", "a candidate branch"],
    ["某一次提交单独拿出来", "one exact commit can"],
    ["交给审阅者", "for review"]
  ]);
  const [protectAt, devAt, mainAt, holdsAt, releaseAt] = cues(s, [
    ["ETHOS 只保护两个分支", "ETHOS protects"],
    ["dev 和", "dev, which"],
    ["main。", "main, which"],
    ["dev 存放", "holds accepted work"],
    ["main 用来发布", "carries releases"]
  ]);
  const [noWrite, mrAt, maintAt, acceptAt] = cues(s, [
    ["对这两个分支没有写入权限", "Someone without"],
    ["合并请求", "a merge request"],
    ["维护者重新核对", "a maintainer"],
    ["接受审阅过的", "accept the reviewed"]
  ]);
  const [judgeAt, trustedAt, selfAt] = cues(s, [
    ["一项改动还没被接受", "Work that has not"],
    ["之前已经信任的规则", "the rules that were"],
    ["不能自己给自己盖章", "cannot approve itself"]
  ]);
  const [ciAt, pushAt, ciBoxAt, obsAt, noneAt] = cues(s, [
    ["每次推送代码", "Continuous integration"],
    ["每次推送代码", "the service that"],
    ["持续集成服务", "Continuous integration"],
    ["观察结果", "observes"],
    ["不持有租约", "without holding"]
  ]);
  const stageA = stageOut(t, lanesAt), stageB = stageIn(t, lanesAt) * stageOut(t, protectAt), stageC = stageIn(t, protectAt) * stageOut(t, noWrite), stageD = stageIn(t, noWrite) * stageOut(t, judgeAt), stageE = stageIn(t, judgeAt) * stageOut(t, ciAt), stageF = stageIn(t, ciAt);
  if (stageA > 0) {
    const g = stageA * clearOfTitle(s, t, 360), GY = mix(470, 360, soon(t, exact - 0.3, 0.5)), Y = 710, by = 540, pick = g * ramp(t, exact - 0.15, 0.4), nw = g * ramp(t, newOnes - 0.15, 0.4);
    person(700, GY, { alpha: g, size: 1.2, color: P.authority });
    nameText(L("审阅不用等", "Review need not wait"), 700, GY + 50, {
      valign: "top",
      color: P.authority,
      alpha: g * named(t, waitAt)
    });
    const PX = 1240;
    terminalIcon(PX - 130, GY - 55, 260, 110, { alpha: g, command: "prove" });
    nameText(L("证明还在跑", "A proof still running"), PX, GY + 55 + NAME_GAP, {
      valign: "top",
      alpha: g * named(t, waitAt)
    });
    const pq = voiceTime(t) * 0.3 % 1;
    line(PX - 110, GY + 40, mix(PX - 110, PX + 110, pq), GY + 40, {
      color: P.evidence,
      alpha: g,
      width: 3
    });
    const xs = [560, 710, 860, 1010], heads = [860, 1010, 1160];
    line(xs[0], Y, xs.at(-1), Y, { color: P.ink, alpha: pick, width: 2.5 });
    s11Commits(
      xs.map((x) => [x, Y]),
      { alpha: pick, color: P.ink }
    );
    link(xs[1], Y - 11, heads[0] - 11, by, { route: "vh", alpha: pick, color: P.line, end: false });
    line(heads[0], by, heads.at(-1), by, {
      color: blend(P.line, P.evidence, nw),
      alpha: pick,
      width: 2.5
    });
    s11Commits(
      heads.map((x) => [x, by]),
      { alpha: pick, color: blend(P.ink, P.evidence, nw) }
    );
    ring(heads.at(-1), by, 20, { color: P.evidence, alpha: pick, width: 2.5 });
    nameText(L("明确指定的那一次提交", "One exact commit"), heads.at(-1) + 34, by, {
      align: "left",
      color: P.evidence,
      alpha: g * named(t, exact)
    });
    nameText(L("新带进来的提交", "The new commits it brings"), heads[1], by + 28, {
      valign: "top",
      alpha: g * named(t, newOnes),
      size: NOTE,
      color: P.muted
    });
  }
  if (stageB > 0) {
    const ys = [340, 470, 600], X0 = 240, MX = mix(1690, 900, soon(t, candAt - 0.45, 0.6)), Y = 470, EX = 1520, q = voiceTime(t) * 0.4, cand = stageB * ramp(t, candAt - 0.15, 0.4), one = stageB * ramp(t, oneAt - 0.15, 0.4), rev = stageB * ramp(t, toReviewer - 0.15, 0.4);
    laneGroup(X0, MX - 150, ys, { alpha: stageB, q });
    ys.forEach(
      (y) => link(MX - 150, y, MX, Y, {
        route: "hvh",
        mid: MX - 70,
        alpha: cand,
        upto: soon(t, candAt, 0.5)
      })
    );
    nameText(L("几条通道", "Lanes"), X0, ys[0] - 26 - NAME_GAP, {
      align: "left",
      valign: "bottom",
      alpha: stageB
    });
    line(MX, Y, EX - 50, Y, { color: P.authority, alpha: cand, width: 4 });
    [0, 1, 2].forEach(
      (i) => commitDot(MX + 90 + i * 150, Y, { alpha: cand, color: P.authority, r: 11 })
    );
    nameText(L("候选分支", "A candidate branch"), MX + 240, Y - 34, {
      valign: "bottom",
      color: P.authority,
      alpha: stageB * named(t, candAt)
    });
    nameText(L("本地专门做集成", "Local, for bringing work together"), MX + 240, Y + 30, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: stageB * named(t, candAt)
    });
    commitDot(1e3, 650, { alpha: one, color: P.evidence, picked: 1, r: 13 });
    nameText(L("某一次提交单独送审", "One commit, put forward alone"), 1e3, 700, {
      valign: "top",
      alpha: stageB * named(t, oneAt)
    });
    link(1034, 650, 1340, 650, { alpha: rev, upto: soon(t, toReviewer, 0.5), color: P.evidence });
    person(1400, 650, { alpha: rev, size: 1, color: P.authority });
    nameText(L("审阅者", "A reviewer"), 1400, 692, {
      valign: "top",
      alpha: stageB * named(t, toReviewer)
    });
  }
  if (stageC > 0) {
    const X0 = 480, X1 = 1260, ys = [380, 470, 560, 650], dv = stageC * ramp(t, devAt - 0.15, 0.4), mn = stageC * ramp(t, mainAt - 0.15, 0.4);
    stroke(
      () => ys.forEach((y) => {
        ctx.moveTo(X0, y);
        ctx.lineTo(mix(X0, X1, soon(t, protectAt + 0.18, 0.6)), y);
      }),
      { color: P.muted, alpha: stageC, width: 3 }
    );
    nameText(L("只保护两个分支", "Only two are protected"), 960, 300, {
      color: P.authority,
      alpha: stageC
    });
    lock(960 - measure(L("只保护两个分支", "Only two are protected")) / 2 - 40, 300, {
      alpha: stageC,
      color: P.authority
    });
    const commits = [X0, X0 + 260, X0 + 520, X1];
    s11Branch(commits, ys[0], { alpha: dv, color: P.authority });
    s11Branch(commits, ys[2], { alpha: mn, color: P.evidence });
    nameText("dev", X0 - 12 - NAME_GAP, ys[0], { align: "right", color: P.authority, alpha: dv });
    nameText("main", X0 - 12 - NAME_GAP, ys[2], { align: "right", color: P.evidence, alpha: mn });
    nameText(L("存放已经接受的改动", "Holds accepted work"), X1 + 12 + NAME_GAP, ys[0], {
      align: "left",
      alpha: stageC * named(t, holdsAt),
      set: "protected"
    });
    nameText(L("用来发布", "Carries releases"), X1 + 12 + NAME_GAP, ys[2], {
      align: "left",
      alpha: stageC * named(t, releaseAt),
      set: "protected"
    });
  }
  if (stageD > 0) {
    const Y = 470, PX = 320, MRX = 800, MX = 1200, BX = 1560, q = voiceTime(t) * 0.45 % 1, mr = stageD * ramp(t, mrAt - 0.15, 0.4), mt = stageD * ramp(t, maintAt - 0.15, 0.4), ac = stageD * ramp(t, acceptAt - 0.15, 0.4);
    person(PX, Y - 6, { alpha: stageD, size: 1.6 });
    nameText(L("没有写入权限", "No write access"), PX, Y + 54 + NAME_GAP, {
      valign: "top",
      alpha: stageD
    });
    link(PX + 50, Y, MRX - 100, Y, { alpha: mr, upto: soon(t, mrAt, 0.5), flow: q });
    box(MRX - 100, Y - 66, 200, 132, {
      fill: P.row,
      stroke: P.ink,
      alpha: mr,
      radius: 12,
      width: 2.5
    });
    commitDot(MRX - 40, Y, { alpha: mr, color: P.evidence, r: 12 });
    link(MRX - 16, Y, MRX + 60, Y, { alpha: mr, color: P.muted });
    nameText(L("合并请求", "A merge request"), MRX, Y + 66 + NAME_GAP, {
      valign: "top",
      alpha: stageD * named(t, mrAt)
    });
    link(MRX + 100, Y, MX - 50, Y, { alpha: mt, upto: soon(t, maintAt, 0.5), flow: q });
    person(MX, Y - 6, { alpha: mt, size: 1.6, color: P.authority });
    check(MX + 62, Y - 44, 30, { alpha: mt * ramp(t, acceptAt - 0.3, 0.4), color: P.evidence });
    nameText(L("维护者重新核对", "A maintainer checks again"), MX, Y + 54 + NAME_GAP, {
      valign: "top",
      width: 260,
      color: P.authority,
      alpha: stageD * named(t, maintAt)
    });
    link(MX + 50, Y, BX - 12, Y, { alpha: ac, upto: soon(t, acceptAt, 0.5), color: P.authority });
    line(BX, Y - 150, BX, Y + 150, { color: P.authority, alpha: stageD, width: 5 });
    s11Commits(
      [
        [BX, Y - 80],
        [BX, Y + 80]
      ],
      { alpha: stageD, color: P.authority }
    );
    commitDot(BX, Y, { alpha: ac, color: P.evidence, r: 13, picked: 1 });
    nameText("dev", BX, Y - 150 - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: stageD
    });
  }
  if (stageE > 0) {
    const Y = 460, TX = 500, PX = mix(960, 1320, soon(t, trustedAt - 0.3, 0.5)), tr = stageE * ramp(t, trustedAt - 0.15, 0.4), self = stageE * ramp(t, selfAt - 0.15, 0.4);
    documentIcon(TX - 90, Y - 120, 180, 240, { alpha: tr, rows: 5, stroke: P.authority });
    seal(TX + 90, Y + 110, 44, { alpha: tr });
    nameText(L("之前已经信任的规则", "The rules already trusted"), TX, Y + 120 + NAME_GAP + 20, {
      valign: "top",
      color: P.authority,
      alpha: stageE * named(t, trustedAt)
    });
    documentIcon(PX - 90, Y - 120, 180, 240, {
      alpha: stageE,
      rows: 5,
      stroke: P.ink,
      fold: false
    });
    nameText(L("还没被接受的改动", "Work not yet accepted"), PX, Y + 120 + NAME_GAP + 20, {
      valign: "top",
      alpha: stageE
    });
    link(TX + 100, Y, PX - 100, Y, {
      alpha: tr,
      upto: soon(t, trustedAt + 0.1, 0.6),
      flow: voiceTime(t) * 0.45 % 1,
      color: P.authority
    });
    const sx = PX + 90, sy = Y - 110;
    const bend = rounded(
      [
        [sx, sy + 30],
        [sx + 110, sy + 30],
        [sx + 110, sy - 60],
        [sx - 120, sy - 60],
        [sx - 120, sy - 14]
      ],
      14
    );
    path(along(bend, soon(t, selfAt + 0.05, 0.6)).kept, {
      color: P.unknown,
      alpha: self,
      width: 2.5,
      dash: [8, 8]
    });
    cross(sx + 110, sy - 16, 30, { alpha: self * ramp(t, selfAt + 0.4, 0.4), width: 3.5 });
    nameText(L("不能自己给自己盖章", "Cannot approve itself"), sx - 40, sy - 60 - NAME_GAP, {
      valign: "bottom",
      color: P.unknown,
      alpha: stageE * named(t, selfAt)
    });
  }
  if (stageF > 0) {
    const Y = 470, BX = 400, CX = 1100, q = voiceTime(t) * 0.4 % 1, pu = stageF * ramp(t, pushAt - 0.15, 0.4), ci = stageF * ramp(t, ciBoxAt - 0.15, 0.4), both = Math.min(pu, ci);
    const seen = stageF * ramp(t, obsAt - 0.15, 0.4), none = stageF * ramp(t, noneAt - 0.15, 0.4);
    commitRow(BX - 80, 130, Y, 4, { alpha: pu, color: P.ink });
    nameText(L("每次推送", "Every push"), BX + 115, Y + 24 + NAME_GAP, {
      valign: "top",
      alpha: stageF * named(t, pushAt)
    });
    link(BX + 330, Y, CX - 140, Y, {
      alpha: both,
      upto: soon(t, Math.max(pushAt, ciBoxAt), 0.5),
      flow: q,
      color: P.evidence
    });
    box(CX - 140, Y - 100, 280, 200, {
      fill: P.row,
      stroke: P.evidence,
      alpha: ci,
      radius: 16,
      width: 3
    });
    ring(CX, Y - 36, 44, { color: P.evidence, alpha: ci, width: 3 });
    const a = voiceTime(t) * 1.6;
    line(CX, Y - 36, CX + 34 * Math.cos(a), Y - 36 + 34 * Math.sin(a), {
      color: P.evidence,
      alpha: ci,
      width: 3
    });
    nameText(L("持续集成", "Continuous integration"), CX, Y + 50, {
      color: P.evidence,
      alpha: stageF * named(t, ciBoxAt),
      width: 250
    });
    check(CX + 200, Y - 40, 42, { alpha: seen, color: P.evidence });
    nameText(L("观察结果", "Observes"), CX + 240, Y - 40, {
      align: "left",
      alpha: stageF * named(t, obsAt)
    });
    const ix = CX + 200;
    lock(ix, Y + 60, { alpha: none, color: P.muted, size: 1.2 });
    cross(ix + 44, Y + 60, 22, { alpha: none, width: 3 });
    nameText(L("不持有租约，也没有决定权", "No Lease, no authority"), ix + 76, Y + 60, {
      align: "left",
      width: 300,
      alpha: stageF * named(t, noneAt)
    });
  }
};

// picture/film/scenes/review/release.js
function forgeMark(x, y, w, h, name, { alpha = 1, color = P.ink, named: nameAlpha = alpha, set = null, place = 0 } = {}) {
  if (alpha < 0.01 && nameAlpha < 0.01) return;
  box(x - w / 2, y - h / 2, w, h, { fill: P.row, stroke: color, alpha, radius: 14, width: 2.5 });
  if (place > 0.01)
    box(x - w / 2 + 40, y - 34, w - 80, 68, {
      stroke: P.muted,
      alpha: alpha * place,
      radius: 10,
      width: 3,
      dash: [6, 6]
    });
  nameText(name, x, y + h / 2 + NAME_GAP, { valign: "top", alpha: nameAlpha, set });
}
scenes["12"] = function(s, t) {
  const [acceptAt, cutAt2, handAt] = en ? cues(s, [
    ["", "Accepting code"],
    ["", "cutting a release"],
    ["", "putting it in users' hands"]
  ]) : cues(s, [
    ["代码被接受", ""],
    ["做成发布版本", ""],
    ["交到使用者手里", ""]
  ]);
  const [localAt, commitAt, tagAt, gitAt] = cues(s, [
    ["发布时", "For a release"],
    ["提交、标签", "the commit and"],
    ["标签这些", "the tag are"],
    ["本地 Git", "local Git"]
  ]);
  const [everyAt, labAt, hubAt, sameAt, noCopy, noSign] = cues(s, [
    ["声明的每个平台", "Every declared platform"],
    ["GitLab", "GitLab"],
    ["GitHub", "GitHub"],
    ["同一次提交", "the same commit"],
    ["谁也不从别的平台", "none copies"],
    ["也都不能改写", "none may rebuild"]
  ]);
  const [oneOk, otherAt, behindAt, windowAt, pendingAt, pastAt, divergeAt] = cues(s, [
    ["推到一个平台成功了", "A push that succeeds"],
    ["不代表别的平台", "says nothing about"],
    ["落后", "temporarily behind"],
    ["设定的时间窗口", "within the declared"],
    ["就算待同步", "is pending"],
    ["过了这个窗口", "past that window"],
    ["才算分歧", "counts as divergence"]
  ]);
  const [owedAt, stillOwed, acceptedAt, notDone] = cues(s, [
    ["正式变更也要记下", "The official Change"],
    ["没完成的责任", "still owed"],
    ["代码被接受了", "accepted code"],
    ["不等于交付完成了", "does not mean delivery"]
  ]);
  const [confirmAt, whereAt, runAt] = cues(s, [
    ["还要确认", "There is still more"],
    ["部署到了哪里", "where the version"],
    ["实际在用", "actually running"]
  ]);
  const stageA = stageOut(t, localAt), stageB = stageIn(t, localAt) * stageOut(t, oneOk), stageC = stageIn(t, oneOk) * stageOut(t, owedAt), stageD = stageIn(t, owedAt) * stageOut(t, confirmAt), stageE = stageIn(t, confirmAt);
  if (stageA > 0) {
    const Y = 470, names = en ? ["Code accepted", "A release cut", "In users' hands"] : ["代码被接受", "做成发布版本", "交到使用者手里"], xs = railStations(names, 420, 1500), ats = [acceptAt, cutAt2, handAt], R = 84;
    line(xs[0], Y, xs[2], Y, { color: P.muted, alpha: stageA, width: 3 });
    ats.forEach((at, i) => {
      const on = stageA * ramp(t, (i ? at : s.voice_start) - 0.15, 0.4), c = blend(P.ink, P.authority, speaking(t, ats, i)), x = xs[i];
      dot(x, Y, R, { color: P.ground, alpha: on });
      ring(x, Y, R, { color: c, alpha: on, width: 3 });
      if (i === 0) {
        commitDot(x, Y, { alpha: on, color: c, r: 20 });
        check(x, Y + 2, 22, { alpha: on, color: c });
      }
      if (i === 1) tagIcon(x - 44, Y, 88, 44, { alpha: on, color: c });
      if (i === 2) person(x, Y + 2, { alpha: on, size: 1.3, color: c });
    });
    railNames(names, xs, Y + R, {
      gap: NAME_GAP,
      alpha: (i) => stageA * listIn(t, ats, i),
      set: "steps"
    });
  }
  if (stageB > 0) {
    const LX = mix(960, 460, soon(t, everyAt - 0.3, 0.5)), Y = 480, FX = 1380, YA = 320, YB = 640, FW = 340, FH = 160, q = voiceTime(t) * 0.4, sm = stageB * ramp(t, sameAt - 0.15, 0.4), nc = stageB * ramp(t, noCopy - 0.15, 0.4);
    const cm = stageB * ramp(t, commitAt - 0.15, 0.4), tg = stageB * ramp(t, tagAt - 0.15, 0.4);
    repoIcon(LX, Y, 310, 186, { alpha: stageB });
    commitDot(LX - 20, Y + 35, { alpha: cm, color: P.authority, r: 14 });
    tagIcon(LX + 30, Y + 35, 100, 44, { alpha: tg });
    nameText(L("提交", "Commit"), LX - 20, Y + 35 - 14 - 12, {
      valign: "bottom",
      size: NOTE,
      alpha: stageB * named(t, commitAt)
    });
    nameText(L("标签", "Tag"), LX + 80, Y + 35 - 22 - 12, {
      valign: "bottom",
      size: NOTE,
      alpha: stageB * named(t, tagAt)
    });
    nameText(L("先在本地定下来", "Created locally first"), LX, Y - 93 - NAME_GAP - 10, {
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: stageB
    });
    nameText(L("本地 Git", "Local Git"), LX, Y + 93 + NAME_GAP, {
      valign: "top",
      alpha: stageB * named(t, gitAt)
    });
    nameText(L("声明的每个平台", "Every declared platform"), FX, YA - FH / 2 - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: stageB * named(t, everyAt)
    });
    [
      ["GitLab", YA, 0, labAt],
      ["GitHub", YB, 1, hubAt]
    ].forEach(([name, y, i, at]) => {
      forgeMark(FX, y, FW, FH, name, {
        alpha: stageB * ramp(t, at - 0.15, 0.4),
        named: stageB * named(t, at),
        set: "forges",
        place: 1
      });
      link(LX + 155, Y, FX - FW / 2, y, {
        route: "hvh",
        mid: 850,
        alpha: sm,
        upto: soon(t, sameAt, 0.5),
        flow: (q + i * 0.5) % 1,
        color: P.authority
      });
      commitDot(FX - 60, y, { alpha: sm, color: P.authority, r: 14 });
      tagIcon(FX + 4, y, 92, 42, { alpha: sm });
    });
    nameText(L("同一次提交、同一个标签", "The same commit and tag"), 874, Y, {
      align: "left",
      width: 320,
      color: P.authority,
      alpha: stageB * named(t, sameAt)
    });
    dashed(FX, YA + FH / 2 + 56, FX, YB - FH / 2, { color: P.muted, alpha: nc });
    cross(FX, Y + 18, 28, { alpha: nc * ramp(t, noCopy + 0.3, 0.4), width: 3.5 });
    nameText(L("不互相拷贝", "No copying between them"), FX + 34, Y + 18, {
      align: "left",
      width: 380,
      alpha: stageB * named(t, noCopy)
    });
    nameText(L("也不重建、不重新签名", "No rebuild, no new signature"), LX, 720, {
      valign: "top",
      alpha: stageB * named(t, noSign),
      size: NOTE,
      color: P.muted
    });
  }
  if (stageC > 0) {
    const lead = 200 * (1 - soon(t, windowAt - 0.3, 0.5)), YA = 360, YB = 560, X0 = 460 + lead, X1 = 1100 + lead, CX = 1290, CR = 56;
    const other = stageC * ramp(t, otherAt - 0.15, 0.4), bh = stageC * named(t, behindAt), win = stageC * ramp(t, windowAt - 0.15, 0.4), dv = stageC * ramp(t, divergeAt - 0.15, 0.4);
    const target = X1 - 80;
    nameText("GitLab", X0 - NAME_GAP, YA, { align: "right", alpha: stageC, set: "forges" });
    line(X0, YA, X1, YA, { color: P.line, alpha: stageC });
    line(X0, YA, mix(X0, target, soon(t, oneOk + 0.1, 0.8)), YA, {
      color: P.evidence,
      alpha: stageC,
      width: 5
    });
    seal(target, YA, 28, { alpha: stageC * ramp(t, oneOk + 0.7, 0.4), color: P.evidence });
    nameText(L("成功了", "Succeeds"), target, YA - 28 - NAME_GAP, {
      valign: "bottom",
      color: P.evidence,
      alpha: stageC * named(t, oneOk + 0.7)
    });
    nameText("GitHub", X0 - NAME_GAP, YB, { align: "right", alpha: stageC, set: "forges" });
    line(X0, YB, X1, YB, { color: P.line, alpha: stageC });
    const behind = mix(X0, X0 + 260, soon(t, otherAt + 0.1, 0.8));
    line(X0, YB, behind, YB, { color: P.evidence, alpha: other, width: 5 });
    dot(behind, YB, 10, { color: P.evidence, alpha: other });
    nameText(L("落后", "Temporarily behind"), X0 + 260, YB - 10 - NAME_GAP, {
      valign: "bottom",
      alpha: bh
    });
    const hand = 0.18 * soon(t, windowAt, 0.5) + 0.17 * soon(t, pendingAt, 0.5) + 0.27 * soon(t, pastAt, 0.8);
    ring(CX, YB, CR, { color: P.ink, alpha: win, width: 2.5 });
    ring(CX, YB, CR * 0.78, { color: P.authority, alpha: win, width: 3, upto: 0.5, dash: [6, 6] });
    const a = -Math.PI / 2 + Math.PI * 2 * hand;
    line(CX, YB, CX + CR * 0.8 * Math.cos(a), YB + CR * 0.8 * Math.sin(a), {
      color: blend(P.authority, P.unknown, soon(t, pastAt + 0.5, 0.4)),
      alpha: win,
      width: 3
    });
    dot(CX, YB, 5, { color: P.ink, alpha: win });
    const parts = en ? ["Within the window", ": pending"] : ["时间窗口内", "：待同步"];
    growName(
      t,
      parts,
      [windowAt, pendingAt],
      CX - measure(parts.join("")) / 2,
      YB + CR + NAME_GAP,
      { color: P.authority, alpha: stageC, build: true }
    );
    cross(CX + CR + 50, YB, 30, { alpha: dv, width: 3.5 });
    nameText(L("过了窗口：分歧", "Past it: divergence"), CX + CR + 80, YB, {
      align: "left",
      color: P.unknown,
      alpha: stageC * named(t, divergeAt)
    });
  }
  if (stageD > 0) {
    const CX = 960, Y = 300, rows = en ? ["Code accepted", "Release published", "Deployed and in use"] : ["代码被接受", "版本发布", "部署并投入使用"], W = 128 + Math.max(...rows.map((v) => measure(v))) + 70, H = 340;
    const owed = ramp(t, stillOwed - 0.15, 0.4), ok = ramp(t, acceptedAt - 0.15, 0.4), n = stageD * ramp(t, notDone - 0.15, 0.4);
    folderIcon(CX - W / 2, Y, W, H, { alpha: stageD, color: P.authority });
    nameText(L("正式变更记下还欠的责任", "The Change tracks what is owed"), CX, Y - NAME_GAP + 4, {
      valign: "bottom",
      color: P.authority,
      alpha: stageD
    });
    rows.forEach((v, i) => {
      const y = Y + 92 + i * 88, rx = CX - W / 2 + 80;
      if (i === 0) {
        ring(rx, y, 26, { color: P.muted, alpha: stageD * (1 - ok), width: 2.5, dash: [6, 6] });
        ring(rx, y, 26, { color: P.evidence, alpha: stageD * ok, width: 2.5 });
        check(rx, y + 2, 24, {
          color: P.evidence,
          alpha: stageD * ok,
          upto: soon(t, acceptedAt, 0.4)
        });
      } else
        ring(rx, y, 26, {
          color: blend(P.muted, P.unknown, owed),
          alpha: stageD,
          width: 2.5,
          dash: [6, 6]
        });
      nameText(v, CX - W / 2 + 128, y, { align: "left", alpha: stageD, set: "owed" });
    });
    nameText(L("不等于交付完成", "Delivery is not finished"), CX, Y + H + NAME_GAP, {
      valign: "top",
      color: P.unknown,
      alpha: n
    });
  }
  if (stageE > 0) {
    const lead = 240 * (1 - soon(t, whereAt - 0.3, 0.5)) + 150 * (1 - soon(t, runAt - 0.3, 0.5)), Y = 470, TX = 330 + lead, SX = 960 + lead, UX = 1560 + lead, q = voiceTime(t) * 0.4 % 1, de = stageE * ramp(t, whereAt - 0.15, 0.4), ru = stageE * ramp(t, runAt - 0.15, 0.4);
    tagIcon(TX - 90, Y, 180, 84, { alpha: stageE });
    nameText(L("发布的版本", "The released version"), TX, Y + 42 + NAME_GAP, {
      valign: "top",
      alpha: stageE
    });
    link(TX + 100, Y, SX - 170, Y, { alpha: de, upto: soon(t, whereAt, 0.5), flow: q });
    box(SX - 170, Y - 110, 340, 220, { stroke: P.ink, alpha: stageE, radius: 14, width: 2.5 });
    stroke(
      () => [0, 1, 2].forEach((i) => {
        ctx.moveTo(SX - 130, Y - 60 + i * 60);
        ctx.lineTo(SX + 130, Y - 60 + i * 60);
      }),
      { color: P.muted, alpha: stageE, width: 2 }
    );
    [0, 1, 2].forEach(
      (i) => dot(SX + 110, Y - 60 + i * 60 - 22, 7, {
        color: i === 1 ? P.authority : P.evidence,
        alpha: stageE
      })
    );
    nameText(L("部署到了哪里", "Where it was deployed"), SX, Y + 110 + NAME_GAP, {
      valign: "top",
      alpha: stageE * named(t, whereAt)
    });
    link(SX + 170, Y, UX - 44, Y, { alpha: ru, upto: soon(t, runAt, 0.5), flow: q });
    person(UX, Y - 8, { alpha: ru, size: 1.6, color: P.authority });
    text("?", UX + 64, Y - 62, 44, { role: "mark", color: P.unknown, alpha: ru });
    nameText(L("实际在用哪个版本", "The version users actually run"), UX, Y + 54 + NAME_GAP, {
      valign: "top",
      width: 280,
      alpha: stageE * named(t, runAt)
    });
  }
};

// picture/film/scenes/real-use/answers.js
scenes["13"] = function(s, t) {
  const [pipe, sig] = cues(s, [
    ["行情数据管线", "the market-data pipeline"],
    ["选股信号", "the stock-selection signal"]
  ]);
  const [suppose, checksAt, deployAt, missAt, dupAt, realAt] = cues(s, [
    ["就算检查都通过了", "Suppose the checks"],
    ["检查都通过了", "the checks pass"],
    ["版本也部署了", "the version is deployed"],
    ["有没有漏", "Is any market data"],
    ["多出重复的记录", "any records duplicated"],
    ["到实际环境里", "Only real use"]
  ]);
  const [showAt, verAt, envAt, baseAt, winAt] = cues(s, [
    ["这次的结论", "What the result"],
    ["哪个版本", "which version"],
    ["什么环境", "what environment"],
    ["什么基线", "which baseline"],
    ["哪段时间", "observation window"]
  ]);
  const [interim] = cues(s, [["部署成功", "A successful deployment"]]);
  const interimName = cue(s, "阶段性的结论", "intermediate claims");
  const [signalAt, infoAt, availAt, sampleAt, unsureAt] = cues(s, [
    ["信号研究也一样", "The signal study"],
    ["回测用到的信息", "the information the backtest"],
    ["当时真的能知道吗", "really available"],
    ["某一段样本", "one stretch"],
    ["哪些地方还不确定", "where does uncertainty"]
  ]);
  const [histAt, futureAt] = cues(s, [
    ["历史回测", "A historical backtest"],
    ["将来的交易收益", "future trading returns"]
  ]);
  const [mapAt, ethosAt, obsAt, reqAt, devAt, ownAt] = cues(s, [
    ["按设计", "ETHOS is designed"],
    ["ETHOS 要把", "ETHOS is designed"],
    ["这些观察", "these observations"],
    ["原来的要求和假设", "the original requirements"],
    ["开发上的指标", "development metrics"],
    ["衡量业务成败的标准", "own measure"]
  ]);
  const stageA = stageOut(t, suppose), stageB = stageIn(t, suppose) * stageOut(t, showAt), stageC = stageIn(t, showAt) * stageOut(t, interim), stageD = stageIn(t, interim) * stageOut(t, signalAt);
  const stageE = stageIn(t, signalAt) * stageOut(t, histAt), stageF = stageIn(t, histAt) * stageOut(t, mapAt), stageG = stageIn(t, mapAt);
  const q = voiceTime(t) * 0.4 % 1;
  if (stageA > 0) {
    const g = stageA * clearOfTitle(s, t, 300), LX = 520, RX = 1400, Y = 470, HY = 337;
    pipelineMark(LX, Y, 680, { alpha: g, flow: q });
    signalMark(RX, Y, 680, 190, { alpha: g, seen: 1, marker: 1 });
    nameText(L("例一", "Example one"), LX, HY, {
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: g
    });
    nameText(L("例二", "Example two"), RX, HY, {
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: g
    });
    nameText(L("行情数据管线", "Market-data pipeline"), LX, Y + 95 + NAME_GAP, {
      valign: "top",
      alpha: g * named(t, pipe),
      set: "examples"
    });
    nameText(L("选股信号", "Stock-selection signal"), RX, Y + 95 + NAME_GAP, {
      valign: "top",
      alpha: g * named(t, sig),
      set: "examples"
    });
    illustrative(g);
  }
  if (stageB > 0) {
    const Y = 505, m = pipelineMark(960, Y, 1160, { alpha: stageB, flow: q, back: soon(t, dupAt - 0.4, 0.8) }), TY = 315;
    const ck = stageB * ramp(t, checksAt - 0.15, 0.4), dp = stageB * ramp(t, deployAt - 0.15, 0.4);
    seal(760, TY, 28, { alpha: ck, color: P.evidence });
    nameText(L("检查都通过", "Checks pass"), 760 + 28 + 14, TY, {
      align: "left",
      alpha: stageB * named(t, checksAt),
      set: "passed"
    });
    seal(1060, TY, 28, { alpha: dp, color: P.evidence });
    nameText(L("版本部署", "Deployed"), 1060 + 28 + 14, TY, {
      align: "left",
      alpha: stageB * named(t, deployAt),
      set: "passed"
    });
    const miss = stageB * ramp(t, missAt - 0.15, 0.4), dup = stageB * ramp(t, dupAt - 0.15, 0.4);
    text("?", m.feedX, m.top - 34, 46, {
      role: "mark",
      align: "center",
      color: P.unknown,
      alpha: miss
    });
    text("?", m.storeX, m.top - 34, 46, {
      role: "mark",
      align: "center",
      color: P.unknown,
      alpha: dup
    });
    nameText(L("数据有没有漏", "Any data missing?"), m.feedX - 56, Y, {
      align: "right",
      width: 170,
      alpha: stageB * named(t, missAt)
    });
    nameText(L("有没有重复", "Any duplicates?"), m.storeX, m.loop + 14, {
      valign: "top",
      alpha: stageB * named(t, dupAt)
    });
    nameText(L("要到实际环境里找答案", "Only real use can answer"), 960, 745, {
      color: P.authority,
      alpha: stageB * named(t, realAt)
    });
    illustrative(stageB);
  }
  if (stageC > 0) {
    const Y = mix(470, 300, soon(t, verAt - 0.3, 0.5)), RY = 560, R = 44, ats = [verAt, envAt, baseAt, winAt], names = en ? ["Which version", "What environment", "Which baseline", "What window"] : ["哪个版本", "什么环境", "什么基线", "哪段时间"], bx = building(t, ats, 187, 0.55), xs = railStations(names, 400, 1520).map((x) => x + bx);
    box(750, Y - 68, 420, 136, {
      fill: P.row,
      stroke: P.evidence,
      alpha: stageC,
      radius: 14,
      width: 2.5
    });
    nameText(L("这次的结论", "This result"), 960, Y, {
      color: P.evidence,
      alpha: stageC,
      bold: true
    });
    nameText(L("能说明什么", "What it can show"), 960, Y - 68 - 12, {
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: stageC
    });
    nameText(L("要看条件", "Depends on its conditions"), 1170 + 16, Y, {
      align: "left",
      size: NOTE,
      color: P.muted,
      alpha: stageC
    });
    xs.forEach((x, i) => {
      const on = stageC * ramp(t, ats[i] - 0.15, 0.4), c = blend(P.ink, P.evidence, speaking(t, ats, i));
      link(960, Y + 68, x, RY - R, {
        route: "vhv",
        mid: 440,
        alpha: on,
        upto: soon(t, ats[i], 0.5)
      });
      dot(x, RY, R, { color: P.ground, alpha: on });
      ring(x, RY, R, { color: c, alpha: on, width: 2.5 });
      if (i === 0) tagIcon(x - 26, RY, 52, 26, { alpha: on, color: c });
      if (i === 1) {
        box(x - 24, RY - 18, 48, 36, { stroke: c, alpha: on, radius: 6 });
        line(x - 24, RY - 6, x + 24, RY - 6, { color: c, alpha: on });
      }
      if (i === 2) {
        path(
          [
            [x - 24, RY + 12],
            [x - 8, RY - 2],
            [x + 6, RY + 4],
            [x + 24, RY - 14]
          ],
          { color: c, alpha: on }
        );
        dashed(x - 26, RY + 2, x + 26, RY + 2, { color: P.muted, alpha: on });
      }
      if (i === 3) {
        path(
          [
            [x - 22, RY - 12],
            [x - 22, RY + 12],
            [x + 22, RY + 12],
            [x + 22, RY - 12]
          ],
          { color: c, alpha: on, width: 3 }
        );
      }
    });
    railNames(names, xs, RY + R, {
      gap: NAME_GAP,
      alpha: (i) => stageC * listIn(t, ats, i),
      set: "conditions"
    });
    illustrative(stageC);
  }
  if (stageD > 0) {
    const Y = 470, X0 = 280, X1 = 1640, mid = 880;
    line(X0, Y, mid, Y, { color: P.evidence, alpha: stageD, width: 5 });
    dashed(mid, Y, X1 - 40, Y, { color: P.muted, alpha: stageD, width: 3 });
    seal(480, Y, 44, { alpha: stageD, color: P.evidence });
    seal(800, Y, 44, { alpha: stageD, color: P.evidence });
    nameText(L("部署成功", "Deployment succeeded"), 480, Y + 44 + NAME_GAP, {
      valign: "top",
      width: 240,
      alpha: stageD,
      set: "claims"
    });
    nameText(L("检查通过", "Checks passed"), 800, Y + 44 + NAME_GAP, {
      valign: "top",
      alpha: stageD,
      set: "claims"
    });
    ring(X1, Y, 44, { color: P.muted, alpha: stageD, width: 2.5, dash: [6, 6] });
    text("?", X1, Y + 2, 40, { role: "mark", align: "center", color: P.muted, alpha: stageD });
    nameText(L("业务结果", "Business outcome"), X1, Y + 44 + NAME_GAP, {
      valign: "top",
      width: 220,
      color: P.muted,
      alpha: stageD
    });
    const a = stageD * named(t, interimName);
    path(
      [
        [440, Y - 76],
        [440, Y - 96],
        [840, Y - 96],
        [840, Y - 76]
      ],
      { color: P.authority, alpha: a, width: 2.5 }
    );
    nameText(L("都只是阶段性的", "Intermediate claims"), 640, Y - 96 - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: a
    });
  }
  if (stageE > 0) {
    const Y = 500, H = 280, m = signalMark(960, Y, 1200, H, { alpha: stageE, seen: soon(t, infoAt, 0.9), marker: 1 }), ats = [availAt, sampleAt, unsureAt];
    nameText(L("信号研究", "The signal study"), 960, m.top - 72, {
      valign: "bottom",
      color: P.authority,
      alpha: stageE
    });
    const av = stageE * ramp(t, availAt - 0.15, 0.4), sa = stageE * ramp(t, sampleAt - 0.15, 0.4), un = stageE * ramp(t, unsureAt - 0.15, 0.4);
    const [fx, fy] = m.point(8);
    text("?", fx, fy - 42, 40, { role: "mark", align: "center", color: P.unknown, alpha: av });
    const b0 = m.x0 + 60, b1 = m.x0 + 460;
    path(
      [
        [b0, m.bottom - 24],
        [b0, m.bottom],
        [b1, m.bottom],
        [b1, m.bottom - 24]
      ],
      { color: P.evidence, alpha: sa, width: 4 }
    );
    box(m.x1 - 150, m.top - 8, 150, H, { stroke: P.unknown, alpha: un, radius: 8, dash: [8, 8] });
    const names = en ? ["Available at the time?", "One stretch of the sample?", "Where uncertainty remains"] : ["当时能知道吗", "只靠某一段样本吗", "还有哪些不确定"];
    nameText(names[0], fx, m.top - 16 - NAME_GAP, {
      valign: "bottom",
      width: 340,
      alpha: stageE * listIn(t, ats, 0),
      set: "asks"
    });
    nameText(names[1], (b0 + b1) / 2, m.bottom + NAME_GAP, {
      valign: "top",
      width: 400,
      alpha: stageE * listIn(t, ats, 1),
      set: "asks"
    });
    nameText(names[2], m.x1 - 75, m.bottom + NAME_GAP, {
      valign: "top",
      width: 300,
      alpha: stageE * listIn(t, ats, 2),
      set: "asks"
    });
    illustrative(stageE);
  }
  if (stageF > 0) {
    const Y = 470, H = 280, W = 900, X = 660, m = signalMark(X, Y, W, H, { alpha: stageF, seen: 1, marker: 0 }), [ex, ey] = m.point(11), fu = stageF * ramp(t, futureAt - 0.15, 0.4);
    nameText(L("历史回测", "A historical backtest"), X, m.bottom + NAME_GAP, {
      valign: "top",
      alpha: stageF
    });
    dashed(ex, m.top - 20, ex, m.bottom, { color: P.authority, alpha: stageF, width: 2.5 });
    [[-90], [-20], [50]].forEach(
      ([dy]) => dashed(ex + 8, ey, ex + 420, ey + dy, { color: P.muted, alpha: fu, width: 2.5 })
    );
    text("?", ex + 460, ey - 20, 46, {
      role: "mark",
      align: "center",
      color: P.unknown,
      alpha: fu
    });
    rejectedName(L("将来的交易收益", "Future trading returns"), ex + 230, m.bottom + NAME_GAP, {
      valign: "top",
      alpha: stageF * named(t, futureAt),
      mark: ramp(t, futureAt + 0.3, 0.4),
      width: 400
    });
    illustrative(stageF);
  }
  if (stageG > 0) {
    const lead = 200 * (1 - soon(t, reqAt - 0.3, 0.5)), Y = mix(450, 340, soon(t, devAt - 0.3, 0.5)), OX = 420 + lead, KX = 920 + lead, DX = 1420 + lead, ob = stageG * ramp(t, obsAt - 0.15, 0.4), re = stageG * ramp(t, reqAt - 0.15, 0.4), dv = stageG * ramp(t, devAt - 0.15, 0.4), ow = stageG * ramp(t, ownAt - 0.15, 0.4), fl = voiceTime(t) * 0.45 % 1;
    [
      [-40, -44],
      [10, -18],
      [-22, 18],
      [36, 40],
      [-46, 56]
    ].forEach(([dx, dy]) => dot(OX + dx, Y + dy, 9, { color: P.evidence, alpha: ob }));
    nameText(L("这些观察", "These observations"), OX, Y + 72 + 10, {
      valign: "top",
      alpha: stageG * named(t, obsAt)
    });
    kernelIcon(KX, Y, 60, { alpha: stageG });
    nameText("ETHOS", KX, Y + 60 + 12, { valign: "top", alpha: stageG * named(t, ethosAt) });
    link(OX + 64, Y, KX - 54, Y, {
      alpha: ob,
      upto: soon(t, obsAt, 0.5),
      flow: fl,
      color: P.evidence
    });
    link(KX + 54, Y, DX - 50, Y, { alpha: re, upto: soon(t, reqAt, 0.5), flow: fl });
    documentIcon(DX - 50, Y - 64, 100, 128, { alpha: re, rows: 4, stroke: P.authority });
    nameText(L("原来的要求和假设", "Original requirements, hypotheses"), DX, Y + 64 + 12, {
      valign: "top",
      width: 360,
      color: P.authority,
      alpha: stageG * named(t, reqAt)
    });
    const LY = 620;
    terminalIcon(500, LY - 50, 170, 100, { alpha: dv, color: P.muted });
    rejectedName(L("开发上的指标", "Development metrics"), 690, LY, {
      align: "left",
      alpha: stageG * named(t, devAt),
      mark: ramp(t, devAt + 0.3, 0.4)
    });
    seal(1190, LY, 42, { alpha: ow });
    nameText(L("项目自己的标准", "The project's own measure"), 1190 + 42 + 16, LY, {
      align: "left",
      color: P.authority,
      alpha: stageG * named(t, ownAt)
    });
  }
};

// picture/film/scenes/feedback/layers.js
var FEEDBACK_LAYERS = {
  ys: [650, 540, 430, 320],
  names: () => en ? ["How it is used", "The method", "Concepts and structures", "Purpose and assumptions"] : ["实际的用法", "做法", "概念和结构", "目的和当初的假设"]
};
function layerSlab(x, w, h, i, { alpha = 1, lit = 0, tone = P.authority, inkAlpha = alpha, set = null } = {}) {
  if (alpha < 0.01) return;
  const y = FEEDBACK_LAYERS.ys[i], c = blend(P.line, tone, lit);
  box(x, y - h / 2, w, h, { fill: P.row, stroke: c, alpha, radius: 10, width: 2 + lit });
  nameText(FEEDBACK_LAYERS.names()[i], x + w / 2, y, {
    alpha: inkAlpha,
    set,
    color: blend(P.ink, tone, lit)
  });
}
var s14Shake = (t, at) => {
  const p = clamp((t - at) / 0.6);
  return p > 0 && p < 1 ? 7 * Math.sin(Math.PI * 2 * 5 * p * 0.6) * (1 - p) : 0;
};
scenes["14"] = function(s, t) {
  const [fixAt, singleAt, useAt, methodAt, conceptAt, purposeAt] = cues(s, [
    ["反馈不一定", "Feedback is not"],
    ["修好一个错误", "a single fix"],
    ["纠正实际的用法", "correct how something"],
    ["换一种做法", "call for"],
    ["概念和结构", "shake the concepts"],
    ["重新理解目的", "or change how"]
  ]);
  const reachConcept = en ? conceptAt : cue(s, "可能动摇", "");
  const [upAt, evidAt, fixedAt, downAt] = cues(s, [
    ["更高一层的理解", "When evidence"],
    ["被证据动摇", "When evidence"],
    ["修正后的含义", "the corrected meaning"],
    ["顺着依赖它的各层", "recompiled through"]
  ]);
  const shakenAt = cueFrom(s, "动摇", "challenges", upAt);
  const [goalAt, whoAt, againAt, passAt, looseAt] = cues(s, [
    ["改目标", "A revised goal"],
    ["有权决定的人", "whoever has the authority"],
    ["重新采纳", "accepted again"],
    ["让结果通过检查", "a result passes"],
    ["悄悄把条件放宽", "quietly loosening"]
  ]);
  const crossAt = en ? cue(s, "", "is not allowed") : looseAt + 0.7, nameAt = Math.min(whoAt, againAt);
  const [openAt, closeAt, techAt, delivAt, bizAt, eachAt] = en ? cues(s, [
    ["", "The feedback mechanism"],
    ["", "To call a round"],
    ["", "technical verification"],
    ["", "delivery"],
    ["", "business results"],
    ["", "each need their own"]
  ]) : cues(s, [
    ["反馈机制本身", ""],
    ["一轮反馈处理完了", ""],
    ["技术上的检验", ""],
    ["交付", ""],
    ["业务上的结果", ""],
    ["各自要有", ""]
  ]);
  const [projAt, suggestAt, keepAt, privAt] = cues(s, [
    ["一个项目的经验", "One project's experience"],
    ["提议改进", "suggest improvements"],
    ["决定权", "that project's authority"],
    ["不公开的业务背景", "private business context"]
  ]);
  const notAt = en ? privAt : cue(s, "不会跟着", "");
  const stageA = stageOut(t, upAt), stageB = stageIn(t, upAt) * stageOut(t, goalAt), stageC = stageIn(t, goalAt) * stageOut(t, openAt), stageD = stageIn(t, openAt) * stageOut(t, projAt), stageE = stageIn(t, projAt);
  const X = 680, W = 760, H = 86;
  if (stageA > 0) {
    const g = stageA * clearOfTitle(s, t, 300), ats = [useAt, methodAt, conceptAt, purposeAt], reachAts = [useAt, methodAt, reachConcept, purposeAt], ys = FEEDBACK_LAYERS.ys, RX = 540;
    stroke(() => ys.forEach((y) => ctx.roundRect(X, y - H / 2, W, H, 10)), {
      color: P.muted,
      alpha: g,
      width: 3,
      dash: [8, 8]
    });
    nameText(
      L("理解的几个层次", "Layers of understanding"),
      X + W + NAME_GAP,
      (ys[0] + ys[3]) / 2,
      { align: "left", size: NOTE, color: P.muted, alpha: g, width: 200 }
    );
    ats.forEach(
      (at, i) => layerSlab(X + (i === 2 ? s14Shake(t, at) : 0), W, H, i, {
        alpha: g * ramp(t, at - 0.15, 0.4),
        lit: speaking(t, ats, i),
        inkAlpha: g * listIn(t, ats, i),
        set: "layers"
      })
    );
    const reach = reachAts.reduce((v, at, i) => mix(v, ys[i], soon(t, at - 0.1, 0.5)), 740), single = g * ramp(t, singleAt - 0.15, 0.4);
    line(RX, 760, RX, ys[3], { color: P.muted, alpha: g, width: 3 });
    dot(RX, reach, 13, { color: P.evidence, alpha: g });
    check(RX - 60, 760, 26, { alpha: single, color: P.evidence, upto: soon(t, singleAt, 0.4) });
    nameText(L("修好一个错误", "A single fix"), RX - 90, 760, {
      align: "right",
      alpha: g * named(t, singleAt),
      width: 220
    });
    nameText(L("反馈", "Feedback"), RX, ys[3] - 44 - 14, {
      valign: "bottom",
      color: P.evidence,
      alpha: g * named(t, fixAt)
    });
  }
  if (stageB > 0) {
    const lead = 150 * (1 - soon(t, downAt - 0.3, 0.5)), BX = X - lead, ys = FEEDBACK_LAYERS.ys, RX = 1510 - lead, down = soon(t, downAt + 0.1, Math.min(2, thoughtEnd(downAt) - downAt - 0.1));
    const shaken = soon(t, shakenAt, 0.35), fixed = soon(t, fixedAt, 0.35), reached = (i) => 0.7 * clamp((down - (3 - i) / 3 + 0.14) / 0.12);
    [0, 1, 2, 3].forEach(
      (i) => layerSlab(BX + (i === 2 ? s14Shake(t, shakenAt) : 0), W, H, i, {
        alpha: stageB,
        lit: i === 2 ? shaken : i < 2 ? reached(i) : 0,
        tone: i === 2 ? blend(P.unknown, P.authority, fixed) : P.authority,
        set: "layers"
      })
    );
    [
      [-30, -16],
      [24, -24],
      [-10, 16],
      [30, 20]
    ].forEach(
      ([dx, dy]) => dot(RX + 140 + dx, ys[2] + dy, 8, { color: P.evidence, alpha: stageB })
    );
    nameText(L("证据", "Evidence"), RX + 140, ys[2] + 52, {
      valign: "top",
      color: P.evidence,
      alpha: stageB
    });
    link(RX + 90, ys[2], BX + W, ys[2], {
      alpha: stageB,
      upto: soon(t, evidAt, 0.5),
      color: P.evidence
    });
    const dq = clamp(down), on = stageB * ramp(t, downAt - 0.15, 0.4);
    line(620, ys[2], 620, mix(ys[2], ys[0], dq), { color: P.authority, alpha: on, width: 3.5 });
    dot(620, mix(ys[2], ys[0], dq), 11, { color: P.authority, alpha: on });
    nameText(L("顺着各层重新编译", "Recompiled through each layer"), 590, (ys[2] + ys[0]) / 2, {
      align: "right",
      width: 300,
      color: P.authority,
      alpha: stageB * named(t, downAt)
    });
  }
  if (stageC > 0) {
    const lead = 180 * (1 - soon(t, nameAt - 0.3, 0.5)), X0 = 300 + lead, X1 = 1e3 + lead, Y0 = 620, HIGH = 400, drop = soon(t, looseAt + 0.1, 0.9), lineY = mix(HIGH, HIGH + 100, drop);
    const who = stageC * ramp(t, whoAt - 0.15, 0.4), acc = stageC * ramp(t, againAt - 0.15, 0.4), loose = stageC * ramp(t, looseAt - 0.15, 0.4), pass2 = soon(t, passAt, 0.4);
    line(X0 + 30, Y0, X0 + 600, Y0, { color: P.line, alpha: stageC });
    stroke(
      () => {
        ctx.moveTo(X0 + 60, Y0);
        ctx.lineTo(X0 + 60, 500);
        ctx.moveTo(X0 + 230, Y0);
        ctx.lineTo(X0 + 230, 450);
        ctx.moveTo(X0 + 400, Y0);
        ctx.lineTo(X0 + 400, 530);
        ctx.moveTo(X0 + 570, Y0);
        ctx.lineTo(X0 + 570, 470);
      },
      { color: P.evidence, alpha: stageC * mix(0.62, 1, pass2), width: 14 }
    );
    line(X0, HIGH, X1 + 80, HIGH, {
      color: P.authority,
      alpha: stageC * (1 - loose * 0.5),
      width: 3.5
    });
    if (loose > 0) dashed(X0, lineY, X1, lineY, { color: P.unknown, alpha: loose, width: 3 });
    nameText(L("目标和标准", "A goal or standard"), X0, HIGH - NAME_GAP, {
      align: "left",
      valign: "bottom",
      color: P.authority,
      alpha: stageC
    });
    cross(X1 + 40, lineY, 28, { alpha: loose * ramp(t, crossAt, 0.4), width: 3.5 });
    nameText(L("悄悄放宽条件", "Loosening it quietly"), X0 + 350, Y0 + NAME_GAP, {
      valign: "top",
      width: 420,
      color: P.unknown,
      alpha: stageC * named(t, looseAt)
    });
    const PX = 1400, PY = 450;
    person(PX, PY, { alpha: who, size: 2, color: P.authority });
    seal(PX + 110, PY - 30, 36, { alpha: acc });
    nameText(
      L("有权决定的人重新采纳", "Accepted again by whoever has the authority"),
      PX + 20,
      PY + 70 + NAME_GAP,
      { valign: "top", width: 400, color: P.authority, alpha: stageC * named(t, nameAt) }
    );
    link(X1 + 80, HIGH, PX - 60, PY - 30, {
      route: "hvh",
      mid: X1 + 210,
      alpha: stageC * ramp(t, nameAt - 0.15, 0.4),
      upto: soon(t, nameAt + 0.2, 0.5)
    });
  }
  if (stageD > 0) {
    const ats = [techAt, delivAt, bizAt], names = en ? ["Technical verification", "Delivery", "Business results"] : ["技术上的检验", "交付", "业务上的结果"], xs = railStations(names, 480, 1440), Y = 545, cl = stageD * ramp(t, closeAt - 0.15, 0.4);
    const CX = 960, CY = mix(450, 320, soon(t, techAt - 0.3, 0.5)), R = 84, q = voiceTime(t) * 0.2 % 1;
    ring(CX, CY, R, {
      color: P.authority,
      alpha: stageD,
      width: 3,
      upto: 0.82,
      start: -Math.PI * 0.3
    });
    const a = -Math.PI * 0.3 + Math.PI * 2 * 0.82;
    dot(CX + R * Math.cos(a), CY + R * Math.sin(a), 8, { color: P.authority, alpha: stageD });
    dot(
      CX + R * Math.cos(-Math.PI * 0.3 + q * Math.PI * 2 * 0.82),
      CY + R * Math.sin(-Math.PI * 0.3 + q * Math.PI * 2 * 0.82),
      9,
      { color: P.evidence, alpha: stageD }
    );
    nameText(L("反馈机制本身也能改", "The mechanism itself stays open"), CX + R + NAME_GAP, CY, {
      align: "left",
      width: 340,
      color: P.authority,
      alpha: stageD
    });
    nameText(L("说处理完了，要有证据", "To call a round closed, evidence"), CX - R - NAME_GAP, CY, {
      align: "right",
      width: 340,
      alpha: cl
    });
    ats.forEach((at, i) => {
      const on = stageD * ramp(t, at - 0.15, 0.4), c = blend(P.ink, P.evidence, speaking(t, ats, i));
      seal(xs[i], Y, 50, { alpha: on, color: c });
    });
    railNames(names, xs, Y + 50, {
      gap: NAME_GAP,
      alpha: (i) => stageD * listIn(t, ats, i),
      set: "kinds"
    });
    nameText(L("各自要有各自的证据", "Each with its own evidence"), 960, 700, {
      size: NOTE,
      color: P.muted,
      alpha: stageD * named(t, eachAt)
    });
  }
  if (stageE > 0) {
    const Y = 480, PX = 480, SX = 1440, q = voiceTime(t) * 0.45 % 1, sg = stageE * ramp(t, suggestAt - 0.15, 0.4), kp = stageE * ramp(t, keepAt - 0.15, 0.4), pv = stageE * ramp(t, privAt - 0.15, 0.4), no = stageE * ramp(t, notAt - 0.15, 0.4);
    const grown = soon(t, keepAt - 0.5, 0.4) + soon(t, privAt - 0.5, 0.4), RW = 480, RH = 160 + 80 * grown, TOP = Y - 160;
    repoIcon(PX, TOP + RH / 2, RW, RH, { alpha: stageE });
    nameText(L("一个项目", "One project"), PX, TOP + RH + NAME_GAP, {
      valign: "top",
      alpha: stageE
    });
    documentIcon(PX - 34, Y - 112, 68, 88, { alpha: stageE, rows: 3, stroke: P.evidence });
    nameText(L("经验", "Experience"), PX + 50, Y - 68, {
      align: "left",
      color: P.evidence,
      alpha: stageE
    });
    lock(PX - 150, Y + 30, { alpha: kp, size: 1.2 });
    nameText(L("决定权", "Its authority"), PX - 120, Y + 30, {
      align: "left",
      alpha: stageE * named(t, keepAt),
      set: "kept"
    });
    lock(PX - 150, Y + 96, { alpha: pv, size: 1.2 });
    nameText(L("不公开的业务背景", "Private business context"), PX - 120, Y + 96, {
      align: "left",
      width: 320,
      alpha: stageE * named(t, privAt),
      set: "kept"
    });
    link(PX + RW / 2, Y - 68, SX - 100, Y - 68, {
      alpha: sg,
      upto: soon(t, suggestAt, 0.6),
      flow: q,
      color: P.evidence
    });
    documentIcon(960 - 30, Y - 107, 60, 78, { alpha: sg, rows: 3, stroke: P.evidence });
    nameText(L("一条建议", "A suggestion"), 960, Y - 107 - 14, {
      valign: "bottom",
      color: P.evidence,
      alpha: stageE * named(t, suggestAt)
    });
    kernelIcon(SX, Y - 68, 100, { alpha: sg });
    nameText(L("大家共用的机制", "Shared mechanisms"), SX, Y + 32 + NAME_GAP, {
      valign: "top",
      width: 260,
      alpha: stageE * named(t, suggestAt)
    });
    link(PX + RW / 2, Y + 64, 1160, Y + 64, {
      alpha: no,
      upto: soon(t, notAt, 0.5),
      dash: [8, 9],
      color: P.muted,
      end: false
    });
    cross(1190, Y + 64, 24, { alpha: no * ramp(t, notAt + 0.3, 0.4), width: 3 });
  }
};

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

// picture/film/scenes/feedback/model-promotion.js
function s15Cases(points, r, { alpha = 1, color = P.unknown } = {}) {
  if (alpha < 0.01) return;
  stroke(
    () => points.forEach(([x, y]) => {
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, Math.PI * 2);
    }),
    { color, alpha, width: 3 }
  );
}
scenes["15"] = function(s, t) {
  const [newAt, modelAt, conceptsAt, statAt] = cues(s, [
    ["新的情况", "a new situation"],
    ["这里说的模型", "Model here means"],
    ["概念和结构", "the concepts and structures"],
    ["不是统计模型", "not a statistical"]
  ]);
  const [twoAt, validAt, clashAt, rightAt, loseAt] = cues(s, [
    ["两份都有效的输入", "Two valid inputs"],
    ["有效", "valid"],
    ["互相矛盾", "contradict each other"],
    ["用现有的模型", "the current model cannot"],
    ["总要丢掉一些信息", "losing information"]
  ]);
  const [reportAt, ethosAt, needAt, blockAt, stopAt, waitAt, unrelAt] = cues(s, [
    ["按设计", "By design"],
    ["这时 ETHOS", "ETHOS then"],
    ["ETHOS 会报告", "reports that Model Promotion"],
    ["依赖这层含义的改动", "every change"],
    ["也会先停下", "is blocked"],
    ["等模型提升做完", "until Model Promotion is done"],
    ["跟它无关的工作", "unrelated work"]
  ]);
  const termAt = en ? null : cue(s, "Model Promotion", "");
  const [howAt, keepAt, evidAt, smallAt, holdAt] = cues(s, [
    ["模型提升的做法", "Model Promotion means"],
    ["留住那些互相冲突", "keeping the conflicting"],
    ["和证据", "their evidence"],
    ["找到模型里", "finding the smallest"],
    ["把它改到能装下", "changing it"]
  ]);
  const [thenAt, recompAt, plansAt, viewsAt, verifyAt, coverAt, oldAt, absorbAt, retireAt] = cues(
    s,
    [
      ["然后重新编译", "After that"],
      ["重新编译", "are recompiled"],
      ["计划", "the plans"],
      ["视图", "the views"],
      ["再检验", "the new model is verified"],
      ["该覆盖的情况", "cover every case"],
      ["旧模型留下的东西", "what is left of the old"],
      ["吸收进新模型", "absorbed"],
      ["要么撤掉", "or retired"]
    ]
  );
  const [noAt, exAt, alAt, faAt, shAt, parAt] = cues(s, [
    ["整个过程不能靠", "No exception"],
    ["加例外", "exception"],
    ["加别名", "alias"],
    ["加兜底路径", "fallback"],
    ["兼容代码", "compatibility shim"],
    ["另立一个权威来源", "no parallel source"]
  ]);
  const stageA = stageOut(t, twoAt), stageB = stageIn(t, twoAt) * stageOut(t, reportAt), stageC = stageIn(t, reportAt) * stageOut(t, howAt), stageD = stageIn(t, howAt) * stageOut(t, thenAt), stageE = stageIn(t, thenAt) * stageOut(t, noAt), stageF = stageIn(t, noAt);
  const MW = 480, MH = 300, MX = 560, MY = 320;
  if (stageA > 0) {
    const fit = soon(t, newAt + 0.1, 1.2), sx = mix(1500, 1200, fit), sy = MY + MH / 2, opened = named(t, newAt - 0.25);
    modelGrid(MX, MY, MW, MH, {
      alpha: stageA,
      color: blend(P.ink, P.authority, soon(t, modelAt, 0.4))
    });
    nameText(L("现有的模型", "The model as it stands"), MX + MW / 2, MY + MH + NAME_GAP, {
      valign: "top",
      alpha: stageA * opened
    });
    stroke(
      () => {
        ctx.arc(sx, sy, 86, 0, Math.PI * 2);
      },
      { color: P.unknown, alpha: stageA, width: 3.5 }
    );
    text("?", sx, sy + 2, 56, { role: "mark", align: "center", color: P.unknown, alpha: stageA });
    nameText(L("新的情况", "A new situation"), sx, sy + 86 + NAME_GAP, {
      valign: "top",
      color: P.unknown,
      alpha: stageA * opened
    });
    nameText(L("概念和结构", "Concepts and structures"), MX + MW / 2, MY - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: stageA * named(t, conceptsAt)
    });
    rejectedName(L("统计模型", "A statistical model"), 310, MY + MH / 2, {
      alpha: stageA * named(t, statAt),
      mark: ramp(t, statAt + 0.3, 0.4)
    });
  }
  if (stageB > 0) {
    const LX = 480, RX = 1420, Y = 450, ri = stageB * ramp(t, rightAt - 0.15, 0.4), va = stageB * ramp(t, validAt - 0.15, 0.4), cl = stageB * ramp(t, clashAt - 0.15, 0.4), shift = 420 * (1 - soon(t, rightAt - 0.3, 0.5)), DX = LX + shift, lost = soon(t, loseAt, 0.8);
    documentIcon(DX - 305, Y - 110, 170, 220, { alpha: stageB, rows: 5, stroke: P.authority });
    documentIcon(DX + 135, Y - 110, 170, 220, { alpha: stageB, rows: 5, stroke: P.authority });
    seal(DX - 220, Y - 110, 26, { alpha: va });
    seal(DX + 220, Y - 110, 26, { alpha: va });
    stroke(
      () => {
        ctx.moveTo(DX - 26, Y - 14);
        ctx.lineTo(DX + 26, Y - 14);
        ctx.moveTo(DX - 26, Y + 14);
        ctx.lineTo(DX + 26, Y + 14);
        ctx.moveTo(DX + 14, Y - 34);
        ctx.lineTo(DX - 14, Y + 34);
      },
      { color: P.unknown, alpha: cl, width: 4.5 }
    );
    nameText(L("两份有效的输入互相矛盾", "Two valid inputs contradict"), DX, Y + 110 + NAME_GAP, {
      valign: "top",
      width: 420,
      alpha: stageB,
      set: "causes"
    });
    modelGrid(RX - 170, Y - 100, 340, 200, { alpha: ri });
    stroke(() => ctx.arc(RX + 170, Y, 70, Math.PI * 0.5, Math.PI * 1.5), {
      color: P.unknown,
      alpha: ri,
      width: 3.5
    });
    dashed(RX + 170, Y - 70, RX + 170, Y + 70, { color: P.unknown, alpha: ri });
    [
      [230, -34],
      [254, 6],
      [226, 38]
    ].forEach(
      ([dx, dy]) => dot(RX + dx + 46 * lost, Y + dy + 30 * lost * Math.sign(dy || 1), 7, {
        color: P.unknown,
        alpha: ri * (1 - lost)
      })
    );
    nameText(
      L("表达时总要丢掉一些信息", "Held only by losing information"),
      RX,
      Y + 110 + NAME_GAP,
      { valign: "top", width: 440, alpha: stageB * named(t, rightAt), set: "causes" }
    );
  }
  if (stageC > 0) {
    const TY = mix(450, 340, soon(t, blockAt - 0.3, 0.5)), Y1 = 540, Y2 = 670, q = voiceTime(t) * 0.4 % 1, rep = stageC * ramp(t, needAt - 0.15, 0.4), bl = stageC * ramp(t, blockAt - 0.15, 0.4), un = stageC * ramp(t, unrelAt - 0.15, 0.4);
    kernelIcon(420, TY, 70, { alpha: stageC });
    nameText("ETHOS", 420, TY + 70 + 12, { valign: "top", alpha: stageC * named(t, ethosAt) });
    link(490, TY, 800, TY, { alpha: rep, upto: soon(t, needAt, 0.4), color: P.authority });
    box(800, TY - 48, 560, 96, {
      fill: P.row,
      stroke: P.authority,
      alpha: rep,
      radius: 12,
      width: 3
    });
    nameText(L("需要做模型提升", "Model Promotion required"), 1080, TY - 1, {
      color: P.authority,
      alpha: rep,
      bold: true
    });
    if (termAt !== null)
      nameText("Model Promotion", 1360 + NAME_GAP, TY, {
        align: "left",
        size: NOTE,
        color: P.muted,
        alpha: stageC * named(t, termAt)
      });
    laneTrack(420, 1040, Y1, { alpha: bl, flow: null });
    writeGate(1090, Y1, 96, { alpha: bl });
    dot(mix(500, 1e3, soon(t, blockAt + 0.1, Math.max(0.8, stopAt - blockAt))), Y1, 9, {
      color: P.authority,
      alpha: bl
    });
    link(1090, Y1 - 48, 1090, TY + 48, {
      alpha: stageC * ramp(t, waitAt - 0.15, 0.4),
      upto: soon(t, waitAt, 0.5),
      dash: [8, 9],
      color: P.muted
    });
    nameText(L("依赖这层含义的改动先停下", "Changes that depend on it wait"), 1150, Y1, {
      align: "left",
      width: 420,
      alpha: stageC * named(t, blockAt)
    });
    laneTrack(420, 1040, Y2, { alpha: un, flow: q });
    nameText(L("其他工作照常进行", "Unrelated work continues"), 1150, Y2, {
      align: "left",
      width: 420,
      alpha: stageC * named(t, unrelAt)
    });
  }
  if (stageD > 0) {
    const GX = 800, GY = 330, GW = 560, GH = 280, ke = stageD * ramp(t, keepAt - 0.15, 0.4), ev = stageD * ramp(t, evidAt - 0.15, 0.4), sm = stageD * ramp(t, smallAt - 0.15, 0.4), ho = soon(t, holdAt + 0.1, 1.1), CX = 380, CY = 470;
    modelGrid(GX, GY, GW, GH, { alpha: stageD, cell: [2, 1], lit: sm, grow: ho });
    nameText(L("模型提升的做法", "Model Promotion"), GX + GW / 2, GY - NAME_GAP, {
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: stageD
    });
    nameText(L("模型", "Model"), GX + GW / 2, GY + GH + NAME_GAP, { valign: "top", alpha: stageD });
    s15Cases(
      [
        [-40, -60],
        [50, -30],
        [-20, 50]
      ].map(([dx, dy]) => [
        mix(CX + dx, GX + GW * 0.62 + dx * 0.35, ho),
        mix(CY + dy, GY + GH / 2 + dy * 0.35, ho)
      ]),
      22,
      { alpha: ke }
    );
    documentIcon(CX - 150, CY + 10, 62, 80, { alpha: ev, rows: 2, stroke: P.evidence });
    nameText(L("冲突的情况和证据", "The conflicting cases and evidence"), CX, CY + 110, {
      valign: "top",
      width: 340,
      alpha: stageD * named(t, keepAt),
      set: "steps"
    });
    nameText(L("受影响的最小部分", "The smallest affected part"), 1420, GY + GH / 2 - 60, {
      align: "left",
      width: 300,
      color: P.authority,
      alpha: stageD * named(t, smallAt),
      set: "steps"
    });
    nameText(L("改到能装下", "Changed to hold them"), 1420, GY + GH / 2 + 50, {
      align: "left",
      width: 300,
      alpha: stageD * named(t, holdAt),
      set: "steps"
    });
  }
  if (stageE > 0) {
    const ats = [recompAt, verifyAt, oldAt], names = en ? ["Plans and views recompiled", "Every case verified", "The old absorbed or retired"] : ["重新编译计划和视图", "检验该覆盖的都覆盖了", "旧模型吸收或撤掉"], bx = building(t, ats, 280, 0.35), xs = railStations(names, 400, 1520, { wrap: 300 }).map((x) => x + bx), Y = 450;
    const on = (i) => stageE * ramp(t, (i ? ats[i] : thenAt) - 0.15, 0.4), pl = stageE * ramp(t, plansAt - 0.15, 0.4), vw = stageE * ramp(t, viewsAt - 0.15, 0.4), taken = soon(t, absorbAt, 0.9);
    line(xs[0] + 150, Y, xs[1] - 100, Y, { color: P.muted, alpha: on(1), width: 3 });
    line(xs[1] + 100, Y, xs[2] - 100, Y, { color: P.muted, alpha: on(2), width: 3 });
    kernelIcon(xs[0] - 70, Y, 88, { alpha: on(0) });
    beats(t, xs[0] - 70, Y, 96, [recompAt], { color: P.authority, alpha: on(0) });
    documentIcon(xs[0] + 44, Y - 80, 116, 132, { alpha: vw, rows: 3, stroke: P.evidence });
    documentIcon(xs[0] + 30, Y - 66, 116, 132, { alpha: pl, rows: 3, stroke: P.evidence });
    nameText(L("依赖模型的那些", "What depends on the model"), xs[0], Y - 106, {
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: on(0)
    });
    modelGrid(xs[1] - 90, Y - 54, 180, 108, { alpha: on(1) });
    check(xs[1], Y, 50, {
      alpha: stageE * ramp(t, coverAt - 0.15, 0.4),
      color: P.evidence,
      width: 5,
      upto: soon(t, coverAt, 0.5)
    });
    modelGrid(xs[2] - 90, Y - 54, 180, 108, { alpha: on(2), color: P.muted });
    if (taken > 0 && taken < 1)
      box(mix(xs[2] - 30, xs[1] - 30, taken), Y - 18, 60, 36, {
        stroke: P.muted,
        alpha: on(2) * pass(taken, 0.2),
        radius: 6,
        width: 2.5
      });
    cross(xs[2] + 90, Y - 54, 28, { alpha: stageE * ramp(t, retireAt - 0.15, 0.4), width: 3.5 });
    railNames(names, xs, Y + 86, {
      gap: NAME_GAP,
      alpha: (i) => stageE * (i ? listIn(t, ats, i) : ramp(t, thenAt - 0.05, 0.4) * listLevel(t, ats, 0)),
      set: "after",
      wrap: 300
    });
  }
  if (stageF > 0) {
    const ats = [exAt, alAt, faAt, shAt], names = en ? ["An exception", "An alias", "A fallback", "A compatibility shim"] : ["加例外", "加别名", "加兜底路径", "兼容代码"], GX = 800, GY = 350, GW = 320, GH = 200, RX = 1260, ys = [340, 420, 500, 580];
    modelGrid(GX - 300, GY + 40, GW, GH, { alpha: stageF, color: P.authority });
    nameText(L("唯一的模型", "The one model"), GX - 300 + GW / 2, GY + 40 + GH + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageF
    });
    nameText(L("绕过去的办法", "Ways around it"), RX - 240, ys[0] - 30 - NAME_GAP, {
      align: "left",
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: stageF
    });
    ats.forEach(
      (at, i) => rejectedName(names[i], RX - 240, ys[i], {
        align: "left",
        alpha: stageF * named(t, at),
        mark: ramp(t, at + 0.3, 0.4),
        set: "refused"
      })
    );
    rejectedName(L("另立一个权威来源", "A parallel source of truth"), RX - 240, ys[3] + 100, {
      align: "left",
      alpha: stageF * named(t, parAt),
      mark: ramp(t, parAt + 0.3, 0.4)
    });
  }
};

// picture/film/scenes/adoption/isomorphic.js
scenes["16"] = function(s, t) {
  const [adopt, same, isoAt] = cues(s, [
    ["接入它的其他仓库", "the repositories that adopt"],
    ["用的是同一个内核", "with the same kernel"],
    ["同构治理", "governance means"]
  ]);
  const [diffAt, adapWord, eachAt, ownProf] = cues(s, [
    ["区别只在配置和适配器", "The difference lies"],
    ["适配器", "adapters"],
    ["每个仓库", "each repository declares"],
    ["在自己的配置里", "in its own profile"]
  ]);
  const rowAts = cues(s, [
    ["检查", "checks"],
    ["参数", "parameters"],
    ["证明做到多深", "depth of proof"]
  ]);
  const [connectAt, ...toolAts] = cues(s, [
    ["负责连接原生工具", "connect native tools"],
    ["Git", "Git"],
    ["代码托管平台", "codehosting platform"],
    ["持续集成", "integration"]
  ]);
  const [noCopy, copyWords, keepsAt, layoutAt, convAt, judgeAt, loopAt] = cues(s, [
    ["这不是把 ETHOS 复制一份", "This does not turn"],
    ["复制一份", "a copy of ETHOS"],
    ["保留自己的业务模型", "keeps its own domain"],
    ["目录结构", "layout"],
    ["和平台习惯", "and platform conventions"],
    ["ETHOS 只用", "ETHOS judges"],
    ["以证据为准的循环", "evidence-grounded loop"]
  ]);
  const [hourAt, runAt, ...outAts] = cues(s, [
    ["上手的头一个小时", "The first hour"],
    ["运行 ETHOS 的状态命令", "run the ETHOS status"],
    ["现在的事实", "the current facts"],
    ["缺口", "the gaps"],
    ["下一步", "the next action"]
  ]);
  const [prevAt, planAt, nothing, applyWord, noConf, recov, breakAt] = cues(s, [
    ["还没接入的仓库", "For a repository"],
    ["先预览接入计划", "preview the adoption plan"],
    ["预览什么都不改", "the preview changes"],
    ["再正式执行", "Apply it only"],
    ["确认没有冲突", "no conflicts"],
    ["清楚出了错", "how to recover"],
    ["中途被打断", "is interrupted"]
  ]);
  const stageA = stageOut(t, diffAt), stageB = stageIn(t, diffAt) * stageOut(t, noCopy), stageC = stageIn(t, noCopy) * stageOut(t, hourAt), stageD = stageIn(t, hourAt) * stageOut(t, prevAt), stageE = stageIn(t, prevAt);
  const LX = 500, RX = 1420;
  if (stageA > 0) {
    const Y = 460, RW = 430, RH = 280, g = stageA * clearOfTitle(s, t, 300), ad = g * ramp(t, adopt - 0.15, 0.4);
    const shift = 460 * (1 - soon(t, adopt - 0.3, 0.5)), lx = LX + shift, rx = RX + shift, eq = g * ramp(t, (en ? adopt : same) - 0.15, 0.4);
    repoIcon(lx, Y, RW, RH, { alpha: g });
    kernelIcon(lx, Y - 18, 76, { alpha: g });
    nameText(L("ETHOS 自己的产品仓库", "ETHOS's own repository"), lx, Y + 104, {
      width: 380,
      color: P.authority,
      alpha: g
    });
    repoIcon(rx, Y, RW, RH, { alpha: ad });
    kernelIcon(rx, Y - 18, 76, { alpha: ad });
    nameText(L("接入它的仓库", "A repository that adopts it"), rx, Y + 104, {
      width: 380,
      alpha: ad
    });
    stroke(
      () => {
        ctx.moveTo(960 - 34, Y - 14);
        ctx.lineTo(960 + 34, Y - 14);
        ctx.moveTo(960 - 34, Y + 14);
        ctx.lineTo(960 + 34, Y + 14);
      },
      { color: P.ink, alpha: eq, width: 5 }
    );
    nameText(L("同一个内核、同一套流程", "Same kernel, same procedure"), 960, 282, {
      alpha: g * named(t, same)
    });
    nameText(L("同构治理", "Isomorphic governance"), 960, Y + RH / 2 + 60, {
      color: P.authority,
      alpha: g * named(t, isoAt),
      bold: true
    });
  }
  if (stageB > 0) {
    const KY = 320, DY = 440, AY = 650, RAIL = 770, rows = en ? ["Checks", "Parameters", "Depth of proof"] : ["检查", "参数", "证明做到多深"];
    const ad = stageB * ramp(t, adapWord - 0.15, 0.4), co = stageB * ramp(t, connectAt - 0.15, 0.4);
    [
      [LX, P.authority, [0.8, 0.5, 0.7], eachAt],
      [RX, P.evidence, [0.5, 0.9, 0.4], ownProf]
    ].forEach(([x, c, widths, litAt], side) => {
      const tone = blend(P.ink, c, soon(t, litAt, 0.45));
      kernelIcon(x, KY, 54, { alpha: stageB });
      line(x, KY + 54, x, DY, { color: P.line, alpha: stageB, width: 2 });
      documentIcon(x - 80, DY, 160, 170, { alpha: stageB, rows: 0, stroke: tone });
      nameText(L("配置", "Profile"), x - 8, DY + 30, {
        color: tone,
        alpha: stageB,
        set: side ? "profB" : "profA"
      });
      stroke(
        () => widths.forEach((w, i) => {
          const y = DY + 75 + i * 35, grow = soon(t, rowAts[i] - 0.1, 0.5);
          if (grow > 0) {
            ctx.moveTo(x - 56, y);
            ctx.lineTo(x - 56 + 112 * w * grow, y);
          }
        }),
        { color: c, alpha: stageB, width: 4 }
      );
      link(x, DY + 170, x, AY, { alpha: ad, upto: soon(t, adapWord - 0.15, 0.3) });
      box(x - 170, AY, 340, 62, { fill: P.row, stroke: P.ink, alpha: ad, radius: 12 });
      nameText(L("适配器", "Adapters"), x, AY + 31, { alpha: ad, set: side ? "adB" : "adA" });
      link(x, AY + 62, side ? 1220 : 700, RAIL, {
        route: "vh",
        alpha: co,
        upto: soon(t, connectAt - 0.1, 0.5)
      });
    });
    rows.forEach(
      (v, i) => nameText(v, 960, DY + 75 + i * 35, {
        size: NOTE,
        alpha: stageB * listIn(t, rowAts, i),
        set: "declares"
      })
    );
    line(700, RAIL, 1220, RAIL, {
      color: P.line,
      alpha: co * ramp(t, connectAt + 0.2, 0.3),
      width: 2
    });
    const tools = ["Git", L("平台", "Platform"), L("持续集成", "CI")];
    tools.forEach((v, i) => {
      const x = 840 + i * 120, on = stageB * ramp(t, toolAts[i] - 0.15, 0.4);
      dot(x, RAIL, 7, { color: P.ink, alpha: on });
      nameText(v, x, RAIL + 7 + 14, {
        valign: "top",
        size: NOTE,
        color: P.muted,
        alpha: stageB * listIn(t, toolAts, i),
        set: "tools"
      });
    });
  }
  if (stageC > 0) {
    const CY = 440, R = 74, q = voiceTime(t) * 0.3 % 1, et = stageC * ramp(t, judgeAt - 0.15, 0.4), lo = stageC * ramp(t, loopAt - 0.15, 0.4);
    rejectedName(L("复制一份 ETHOS", "A copy of ETHOS"), 960, 262, {
      alpha: stageC * (en ? named(t, cue(s, "", "turn each repository")) : 1),
      mark: ramp(t, copyWords + 0.1, 0.4)
    });
    repoIcon(LX, CY, 460, 270, { alpha: stageC });
    repoIcon(RX, CY, 460, 270, { alpha: stageC });
    nameText(L("ETHOS 自己的产品仓库", "ETHOS's own repository"), LX, CY - 135 - 12, {
      valign: "bottom",
      color: P.authority,
      alpha: stageC
    });
    nameText(L("接入它的仓库", "A repository that adopts it"), RX, CY - 135 - 12, {
      valign: "bottom",
      alpha: stageC
    });
    pipelineMark(LX + 20, CY + 30, 340, { alpha: stageC });
    modelGrid(RX - 120, CY - 60, 260, 150, { alpha: stageC, color: P.evidence });
    const parts = en ? ["Keeps its own domain model, ", "layout, ", "platform conventions"] : ["保留自己的业务模型、", "目录结构、", "平台习惯"];
    const lines = growTexts(parts, 700), wide = Math.max(...lines.map((line2) => measure(line2.map(([, v]) => v).join(""))));
    growName(
      t,
      parts,
      [keepsAt, layoutAt, convAt],
      Math.round(960 - wide / 2),
      CY + 135 + NAME_GAP,
      { width: 700, alpha: stageC, build: true }
    );
    ring(960, CY, R, { color: P.authority, alpha: et, width: 3 });
    nameText("ETHOS", 960, CY, { color: P.authority, alpha: et, bold: true });
    const a = -Math.PI / 2 + q * Math.PI * 2;
    flowDot(960 + R * Math.cos(a), CY + R * Math.sin(a), 9, q, { color: P.evidence, alpha: lo });
    link(LX + 230, CY, 960 - R, CY, {
      alpha: lo,
      color: P.line,
      end: false,
      upto: soon(t, loopAt - 0.1, 0.5)
    });
    link(960 + R, CY, RX - 230, CY, {
      alpha: lo,
      color: P.line,
      end: false,
      upto: soon(t, loopAt - 0.1, 0.5)
    });
    nameText(L("同一个循环", "One loop"), 960, CY + R + 12, {
      valign: "top",
      color: P.authority,
      alpha: stageC * named(t, loopAt)
    });
  }
  if (stageD > 0) {
    const lead = 300 * (1 - soon(t, outAts[0] - 0.15, 0.5)), TX = 380 + lead, TW = 560, TH = 96, TY = 490, run = stageD * ramp(t, runAt - 0.15, 0.4);
    const names = en ? ["The current facts", "The gaps", "The next action"] : ["现在的事实", "缺口", "下一步"], IX = 1250 + lead, ys = [370, 510, 650];
    clock(TX + TW / 2, 370, 62, {
      alpha: stageD,
      hand: soon(t, hourAt, 4) * 0.15,
      color: P.authority
    });
    nameText(L("头一个小时", "The first hour"), TX + TW / 2, 370 - 62 - 12, {
      valign: "bottom",
      color: P.authority,
      alpha: stageD
    });
    terminalIcon(TX, TY, TW, TH, { alpha: stageD });
    const prompt = TY + 30 + (TH - 30) / 2;
    text("$", TX + 22, prompt, 26, { role: "mark", color: P.muted, alpha: stageD });
    text("ethos status", TX + 48, prompt, 26, { role: "mark", color: P.evidence, alpha: run });
    nameText(L("状态命令", "The status command"), TX + TW / 2, TY + TH + NAME_GAP, {
      valign: "top",
      alpha: stageD * named(t, runAt)
    });
    outAts.forEach((at, i) => {
      const on = stageD * ramp(t, at - 0.15, 0.4), c = blend(P.ink, i === 2 ? P.authority : P.evidence, speaking(t, outAts, i)), y = ys[i];
      link(TX + TW, TY + TH / 2, IX - 34, y, {
        route: "hvh",
        mid: IX - 110,
        alpha: on,
        upto: soon(t, at, 0.4)
      });
      ring(IX, y, 34, { color: c, alpha: on, width: 2.5 });
      if (i === 0)
        [
          [-10, -8],
          [10, -10],
          [0, 10]
        ].forEach(([dx, dy]) => dot(IX + dx, y + dy, 5, { color: c, alpha: on }));
      if (i === 1) dashed(IX - 16, y, IX + 16, y, { color: c, alpha: on, width: 3 });
      if (i === 2) dot(IX, y, 11, { color: c, alpha: on });
      nameText(names[i], IX + 34 + NAME_GAP, y, {
        align: "left",
        alpha: stageD * listIn(t, outAts, i),
        set: "shows"
      });
    });
  }
  if (stageE > 0) {
    const Y = 440, rows = en ? ["No conflicts", "Recovery is known"] : ["没有冲突", "清楚怎么恢复"], ys = [Y - 56, Y + 56];
    const pl = stageE * ramp(t, planAt - 0.15, 0.4), no = stageE * ramp(t, noConf - 0.15, 0.4), re = stageE * ramp(t, recov - 0.15, 0.4), ap = stageE * ramp(t, applyWord - 0.15, 0.4);
    const met = en ? soon(t, recov + 0.3, 0.4) : 1, hf = stageE * ramp(t, breakAt - 0.15, 0.4);
    const RPX = 300, PX = 670, CX = 995, AX = 1525, BW = 320, rowRight = CX + 32 + NAME_GAP + Math.max(...rows.map((v) => measure(v)));
    const centre = (a, b) => 960 - (a + b) / 2, lead0 = centre(140, 460), lead1 = centre(140, 770), lead2 = en ? 0 : centre(235, rowRight);
    const lead = (lead0 - lead1) * (1 - soon(t, planAt - 0.15, 0.5)) + (lead1 - lead2) * (1 - soon(t, en ? applyWord - 0.35 : noConf - 0.15, 0.5)) + lead2 * (1 - soon(t, applyWord - 0.5, 0.5));
    repoIcon(RPX + lead, Y, 320, 210, { alpha: stageE });
    stroke(
      () => [
        [-35, 1],
        [0, 0.7],
        [35, 0.85],
        [70, 0.55]
      ].forEach(([dy, w]) => {
        ctx.moveTo(RPX - 100 + lead, Y + dy);
        ctx.lineTo(RPX - 100 + 210 * w + lead, Y + dy);
      }),
      { color: P.muted, alpha: stageE, width: 2.5 }
    );
    nameText(L("还没接入的仓库", "Not yet adopted"), RPX + lead, Y + 105 + NAME_GAP, {
      valign: "top",
      alpha: stageE
    });
    link(RPX + 160 + lead, Y, PX - 100 + lead, Y, { alpha: pl, upto: soon(t, planAt - 0.15, 0.4) });
    documentIcon(PX - 75 + lead, Y - 100, 150, 200, { alpha: pl, rows: 5, stroke: P.evidence });
    box(PX - 100 + lead, Y - 125, 200, 250, {
      stroke: P.evidence,
      alpha: pl,
      radius: 12,
      dash: [8, 8],
      width: 3
    });
    const planName = nameText(
      L("预览接入计划", "Preview the plan"),
      PX + lead,
      Y + 125 + NAME_GAP,
      { valign: "top", width: 320, color: P.evidence, alpha: pl }
    );
    nameText(L("预览什么都不改", "Changes nothing"), PX + lead, planName.bottom + 10, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: stageE * named(t, nothing)
    });
    [no, re].forEach((on, i) => {
      ring(CX + lead, ys[i], 32, { color: P.evidence, alpha: on, width: 2.5 });
      check(CX + lead, ys[i] + 2, 28, { alpha: on, color: P.evidence });
      nameText(rows[i], CX + 32 + NAME_GAP + lead, ys[i], {
        align: "left",
        alpha: stageE * listIn(t, [noConf, recov], i),
        set: "needs"
      });
      link(PX + 100 + lead, Y, CX - 32 + lead, ys[i], {
        route: "hvh",
        mid: CX - 110 + lead,
        alpha: on,
        upto: soon(t, i ? recov : noConf, 0.4)
      });
    });
    link(rowRight + 20 + lead, Y, AX - BW / 2 + lead, Y, {
      alpha: ap * met,
      upto: soon(t, en ? recov + 0.3 : applyWord, 0.4)
    });
    box(AX - BW / 2 + lead, Y - 50, BW, 100, {
      stroke: P.authority,
      alpha: ap,
      radius: 12,
      width: 3,
      dash: [8, 8]
    });
    box(AX - BW / 2 + lead, Y - 50, BW, 100, {
      fill: P.row,
      stroke: P.authority,
      alpha: ap * met,
      radius: 12,
      width: 3
    });
    nameText(L("再正式执行", "Apply"), AX + lead, Y, { color: P.authority, alpha: ap, bold: true });
    const fillTo = mix(0, 0.5, soon(t, breakAt, 0.8));
    line(AX - BW / 2 + lead, Y + 96, AX + BW / 2 + lead, Y + 96, {
      color: P.line,
      alpha: hf,
      width: 8
    });
    line(AX - BW / 2 + lead, Y + 96, AX - BW / 2 + BW * fillTo + lead, Y + 96, {
      color: P.unknown,
      alpha: hf,
      width: 8
    });
    nameText(L("中途打断，可能只改了一半", "Interrupted: maybe half done"), AX + lead, Y + 122, {
      valign: "top",
      width: 360,
      color: P.unknown,
      alpha: stageE * named(t, breakAt)
    });
  }
};

// picture/film/scenes/adoption/handoff.js
function doorMark(x, y, w, h, { alpha = 1, open = 0, color = P.ink } = {}) {
  if (alpha < 0.01) return;
  box(x - w / 2, y - h / 2, w, h, { stroke: color, alpha, radius: 6, width: 2.5 });
  const swing = ease(open) * w * 0.55;
  stroke(
    () => {
      ctx.moveTo(x - w / 2, y - h / 2);
      ctx.lineTo(x + w / 2 - swing, y - h / 2 + swing * 0.4);
      ctx.lineTo(x + w / 2 - swing, y + h / 2 - swing * 0.4);
      ctx.lineTo(x - w / 2, y + h / 2);
    },
    { color, alpha, width: 2.5 }
  );
}
scenes["17"] = function(s, t) {
  const [bitAt, adjustAt, handAt, leaveAt, designAt] = cues(s, [
    ["一点一点引入", "a little at a time"],
    ["按自己的工作去调整", "adjust it"],
    ["交给别人", "handed over"],
    ["完全退出", "leave ETHOS"],
    ["按设计", "by design"]
  ]);
  const boxesAt = en ? cue(s, "", "the structure it needs") : bitAt;
  const [adoptAt, prevAt, sameAt, leastAt, undoAt, backAt] = cues(s, [
    ["接入在设计上", "Adoption is designed"],
    ["可以先预览", "to be previewable"],
    ["重复执行结果不变", "the same result"],
    ["已有的东西", "change as little"],
    ["第一次受治理的改动", "to be reversible"],
    ["都可以撤回", "reversible"]
  ]);
  const [uninst, hookAt, genAt, secondAt] = cues(s, [
    ["卸载也有设计要求", "Uninstalling"],
    ["自动运行的钩子脚本", "no hook scripts"],
    ["充当权威来源的生成文件", "no generated file"],
    ["第二套控制机制", "no second control"]
  ]);
  const [before, ownAt, usefulAt, giveAt, keepAt] = cues(s, [
    ["交接或者退出之前", "Before a handoff"],
    ["归属权", "ownership"],
    ["有用的结果和必要的证据", "useful results"],
    ["要交给负责", "go to their owner"],
    ["存成可以恢复", "be kept"]
  ]);
  const [afterAt, retireAt, burdenAt] = cues(s, [
    ["做完这些以后", "After that"],
    ["就该撤下", "should be retired"],
    ["别让它", "so that it does not"]
  ]);
  const mechAt = en ? cue(s, "", "a mechanism whose") : cue(s, "责任已经结束的机制", "") - 0.2;
  const stageA = stageOut(t, adoptAt), stageB = stageIn(t, adoptAt) * stageOut(t, uninst), stageC = stageIn(t, uninst) * stageOut(t, before), stageD = stageIn(t, before) * stageOut(t, afterAt), stageE = stageIn(t, afterAt);
  if (stageA > 0) {
    const Y = 460, ats = [bitAt, adjustAt, handAt, leaveAt], names = en ? ["A little at a time", "Adjusted to its work", "Handed over", "Leave ETHOS altogether"] : ["一点一点引入", "按自己的工作调整", "交给别人或 Agent", "完全退出"], xs = railStations(names, 380, 1540, { wrap: 280 }), bx = building(t, ats, 193, 0.55);
    const on = (i) => stageA * ramp(t, (i ? ats[i] : s.voice_start) - 0.15, 0.4), n = soon(t, boxesAt - 0.15, 1.8);
    ctx.save();
    ctx.translate(bx, 0);
    repoIcon(xs[0], Y - 10, 260, 220, { alpha: on(0) });
    nameText(L("一个项目", "A project"), xs[0], Y - 120 - 12, { valign: "bottom", alpha: on(0) });
    [0, 1, 2].forEach(
      (i) => box(xs[0] - 60, Y + 44 - i * 46, 140, 38, {
        fill: P.row,
        stroke: P.evidence,
        alpha: on(0) * clamp(n * 3 - i),
        radius: 8
      })
    );
    modelGrid(xs[1] - 80, Y - 56, 160, 112, {
      alpha: on(1),
      color: P.evidence,
      cell: [1, 1],
      lit: on(1),
      grow: soon(t, adjustAt + 0.1, 0.8)
    });
    person(xs[2] - 44, Y, { alpha: on(2), size: 1.1 });
    agent(xs[2] + 54, Y - 6, { alpha: on(2), size: 1.2 });
    link(xs[2] - 18, Y - 6, xs[2] + 26, Y - 6, { alpha: on(2), upto: soon(t, handAt + 0.1, 0.4) });
    doorMark(xs[3], Y, 96, 150, {
      alpha: on(3),
      open: soon(t, leaveAt + 0.1, 0.8),
      color: P.authority
    });
    nameText(L("按设计", "By design"), xs[3], Y - 75 - 40, {
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: stageA * named(t, designAt)
    });
    [0, 1, 2].forEach(
      (i) => line(xs[i] + [136, 90, 90][i], Y, xs[i + 1] - [86, 90, 64][i], Y, {
        color: P.muted,
        alpha: on(i + 1),
        width: 3
      })
    );
    railNames(names, xs, Y + 100, {
      gap: NAME_GAP,
      alpha: (i) => stageA * (i ? listIn(t, ats, i) : ramp(t, bitAt - 0.15, 0.4) * listLevel(t, ats, 0)),
      set: "life",
      wrap: 280
    });
    ctx.restore();
  }
  if (stageB > 0) {
    const ats = [prevAt, sameAt, leastAt, undoAt], ys = [320, 430, 540, 650], names = en ? [
      "Previewable",
      "Same result when repeated",
      "Changes as little as it can",
      "Reversible until the first governed change"
    ] : [
      "可以先预览",
      "重复执行结果不变",
      "已有的东西尽量少改",
      "第一次受治理的改动之前都可撤回"
    ];
    const widest = Math.max(...names.map((v) => measure(v))), rest = 110 * (1 - soon(t, sameAt - 0.15, 0.5)) + 60 * (1 - soon(t, leastAt - 0.15, 0.5)) + 120 * (1 - soon(t, undoAt - 0.15, 0.5)), GX = Math.round(960 - (68 + NAME_GAP + widest) / 2 + 34) + 180 + rest;
    const lead = 270 * (1 - soon(t, prevAt - 0.15, 0.5)), DX = GX - 340 + lead;
    folderIcon(DX - 140, 390, 280, 200, { alpha: stageB, color: P.authority });
    nameText(L("接入", "Adoption"), DX, 490, { color: P.authority, alpha: stageB, bold: true });
    nameText(L(["在设计上", "要做到几点"], "Designed to be"), DX, 590 + NAME_GAP, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: stageB
    });
    ats.forEach((at, i) => {
      const on = stageB * ramp(t, at - 0.15, 0.4), c = blend(P.ink, P.evidence, speaking(t, ats, i)), y = ys[i];
      ring(GX, y, 34, { color: c, alpha: on, width: 2.5 });
      if (i === 0) box(GX - 15, y - 19, 30, 38, { stroke: c, alpha: on, radius: 4, dash: [4, 4] });
      if (i === 1)
        stroke(
          () => {
            ctx.moveTo(GX - 14, y - 7);
            ctx.lineTo(GX + 14, y - 7);
            ctx.moveTo(GX - 14, y + 7);
            ctx.lineTo(GX + 14, y + 7);
          },
          { color: c, alpha: on, width: 3 }
        );
      if (i === 2) dot(GX, y, 7, { color: c, alpha: on });
      if (i === 3) recoverIcon(GX, y, 15, { color: c, alpha: on, upto: soon(t, backAt, 0.6) });
      nameText(names[i], GX + 34 + NAME_GAP, y, {
        align: "left",
        width: 700,
        alpha: stageB * listIn(t, ats, i),
        set: "properties"
      });
      link(DX + 140, 490, GX - 34, y, {
        route: "hvh",
        mid: GX - 100,
        alpha: on,
        upto: soon(t, at, 0.4)
      });
    });
  }
  if (stageC > 0) {
    const ats = [hookAt, genAt, secondAt], names = en ? ["No hook scripts", "No generated source of truth", "No second set of controls"] : ["不留钩子脚本", "不留充当权威的生成文件", "不留第二套控制机制"], Y = 480, RX = 960, STEP = 320, EDGE = 170;
    const growth = ats.map((at) => soon(t, at - 0.5, 0.4)), n = growth.filter((v) => v >= 1).length, reach = (k) => EDGE * 2 + (k - 1) * STEP;
    const RW = n === 0 ? mix(300, reach(1), growth[0]) : n >= 3 ? reach(3) : mix(reach(n), reach(n + 1), growth[n]), RH = mix(180, 330, growth[0]), left = RX - RW / 2;
    repoIcon(RX, Y, RW, RH, { alpha: stageC });
    nameText(L("卸载也有设计要求", "Uninstalling, by design"), RX, Y - RH / 2 - 12, {
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: stageC
    });
    nameText(
      L("卸干净以后的仓库", "The repository after uninstalling"),
      RX,
      Y + RH / 2 + NAME_GAP,
      { valign: "top", alpha: stageC }
    );
    ats.forEach((at, i) => {
      const on = stageC * ramp(t, at - 0.15, 0.4), x = left + EDGE + i * STEP, yy = Y - 40;
      if (i === 0) {
        terminalIcon(x - 66, yy - 40, 132, 80, { alpha: on, color: P.muted });
      }
      if (i === 1) {
        documentIcon(x - 36, yy - 46, 72, 92, { alpha: on, rows: 3, stroke: P.muted });
      }
      if (i === 2) {
        kernelIcon(x, yy, 46, { alpha: on, color: P.muted });
      }
      cross(x + 76, yy - 36, 26, { alpha: on, width: 3.5 });
      nameText(names[i], x, yy + 76, {
        valign: "top",
        width: 280,
        alpha: stageC * listIn(t, ats, i),
        set: "clean"
      });
    });
  }
  if (stageD > 0) {
    const Y1 = 385, Y2 = 600, PX = 420, QX = 1440, q = voiceTime(t) * 0.45 % 1, ow = stageD * ramp(t, ownAt - 0.15, 0.4), us = stageD * ramp(t, usefulAt - 0.15, 0.4);
    person(PX, Y1, { alpha: stageD, size: 1.6 });
    nameText(L("现在的负责人", "The current owner"), PX, Y1 + 54 + 12, {
      valign: "top",
      alpha: stageD
    });
    person(QX, Y1, { alpha: ow, size: 1.6, color: P.authority });
    nameText(L("接手的一方", "Whoever takes over"), QX, Y1 + 54 + 12, {
      valign: "top",
      color: P.authority,
      alpha: stageD * named(t, ownAt)
    });
    link(PX + 50, Y1, QX - 50, Y1, {
      alpha: ow,
      upto: soon(t, ownAt, 0.7),
      color: P.authority,
      flow: q
    });
    nameText(L("归属权", "Ownership"), 930, Y1 - 12, {
      valign: "bottom",
      color: P.authority,
      alpha: stageD * named(t, ownAt)
    });
    [
      [-46, 0],
      [0, 12],
      [46, -6]
    ].forEach(
      ([dx, dy], i) => documentIcon(PX + dx - 26, Y2 - 40 + dy, 52, 72, {
        alpha: us,
        rows: 3,
        stroke: i === 1 ? P.authority : P.evidence
      })
    );
    nameText(L("有用的结果和必要的证据", "Results, and the evidence needed"), PX, Y2 + 54, {
      valign: "top",
      width: 420,
      alpha: stageD * named(t, usefulAt)
    });
    const go = stageD * ramp(t, giveAt - 0.15, 0.4), parts = en ? ["To its owner,", " or kept recoverable"] : ["交给负责的一方，", "或存成可恢复的"];
    link(PX + 90, Y2, QX - 120, Y2, {
      alpha: us,
      upto: soon(t, giveAt, 0.7),
      flow: q,
      color: P.evidence
    });
    repoIcon(QX, Y2, 240, 150, { alpha: go });
    recoverIcon(QX + 16, Y2 + 12, 30, { alpha: go });
    growName(t, parts, [giveAt, keepAt], QX - measure(parts.join("")) / 2, Y2 + 75 + 12, {
      build: true,
      color: P.evidence,
      alpha: stageD
    });
  }
  if (stageE > 0) {
    const Y = 620, X0 = 300, X1 = 1620, q = voiceTime(t) * 0.4 % 1, off = soon(t, retireAt + 0.1, 1), MX = 960, MY = mix(Y, Y - 150, off), a = stageE * (1 - off * 0.55);
    line(X0, Y, X1, Y, { color: P.evidence, alpha: stageE, width: 4 });
    flowDot(mix(X0, X1, q), Y, 10, q, { color: P.evidence, alpha: stageE });
    box(MX - 130, MY - 140, 260, 140, { stroke: P.muted, alpha: a, radius: 12, width: 3 });
    seal(MX, MY - 70, 40, { alpha: a, color: P.muted });
    nameText(L("责任已经结束的机制", "A mechanism with its job done"), MX, MY - 140 - 12, {
      valign: "bottom",
      width: 520,
      alpha: stageE * named(t, mechAt)
    });
    cross(MX + 158, MY - 70, 28, { alpha: stageE * ramp(t, retireAt + 0.4, 0.4), width: 3.5 });
    nameText(L("别变成新的负担", "Not a new burden"), MX + 158 + 14 + NAME_GAP, MY - 70, {
      align: "left",
      color: P.authority,
      alpha: stageE * named(t, burdenAt)
    });
  }
};

// picture/film/scenes/adoption/coda.js
function s18Lines({ alpha = 1, upper = 1, lower = 1 } = {}) {
  const { x0, x1, y1, y2 } = TWO_LINES;
  if (alpha < 0.01) return;
  stroke(
    () => {
      ctx.moveTo(x0, y1);
      ctx.lineTo(x1, y1);
      ctx.moveTo(x0, y2);
      ctx.lineTo(x1, y2);
    },
    { color: P.muted, alpha, width: 4 }
  );
  if (upper > 0.01) line(x0, y1, x1, y1, { color: P.authority, alpha: alpha * upper, width: 4 });
  if (lower > 0.01) line(x0, y2, x1, y2, { color: P.evidence, alpha: alpha * lower, width: 4 });
  dot(x1, y1, 7, { color: blend(P.muted, P.authority, upper), alpha });
  dot(x1, y2, 7, { color: blend(P.muted, P.evidence, lower), alpha });
}
function s18RowWidth(term, qual, width) {
  const { one } = termRowLayout(term, qual, width);
  return one ? measure(term.join("")) + TERM_GAP + measure(qual.join(""), NOTE) : Math.max(measure(term.join("")), measure(qual.join(""), NOTE));
}
scenes["18"] = function(s, t) {
  const [underAt, dirAt, realAt, corrAt] = cues(s, [
    ["理解给行动", "Understanding gives"],
    ["给行动指出方向", "gives action"],
    ["实际的结果", "real outcomes"],
    ["又回过头来修正", "come back to correct"]
  ]);
  const rulesCut = cue(s, "ETHOS 的设计", "The design of ETHOS");
  const ruleAts = cues(s, [
    ["一是", "Preserve meaning"],
    ["二是", "make a distinction"],
    ["三是", "Keep authority"],
    ["四是", "retire a mechanism"]
  ]);
  const judgment = en ? cue(s, "", "of judgment") : null;
  const qualAts = cues(s, [
    ["留住含义", "with the smallest model"],
    ["做区分", "only where it changes"],
    ["看得到", "because seeing"],
    ["就让它退场", "when its obligation"]
  ]);
  const [apartAt, goneAt] = cues(s, [
    ["跟决定权分开", "separate from views"],
    ["退场", "is gone"]
  ]);
  const [doneAt, pipeAt, resAt, askAt] = cues(s, [
    ["照这样做的话", "Done this way"],
    ["可以检验的改进", "an improvement"],
    ["结论成立的条件", "the conditions under"],
    ["去追问", "to question"]
  ]);
  const [newAt, knownAt, learnedAt, startAt] = cues(s, [
    ["新的问题出现时", "When a new problem"],
    ["已有的理解", "what was understood"],
    ["学到的东西", "what was learned"],
    ["作为起点", "a place to start"]
  ]);
  const [goAt, openAt] = cues(s, [
    ["项目可以接着做下去", "The project can"],
    ["方法也始终可以修改", "the method stays"]
  ]);
  const stageA = stageOut(t, rulesCut), stageB = stageIn(t, rulesCut) * stageOut(t, doneAt), stageC = stageIn(t, doneAt) * stageOut(t, newAt), stageD = stageIn(t, newAt) * stageOut(t, goAt), stageE = stageIn(t, goAt);
  const { x0, x1, y1, y2 } = TWO_LINES, q = voiceTime(t) * 0.35 % 1, Y = (y1 + y2) / 2;
  if (stageA > 0) {
    s18Lines({
      alpha: stageA,
      upper: ramp(t, underAt - 0.15, 0.4),
      lower: ramp(t, realAt - 0.15, 0.4)
    });
    nameText(L("开头那两条线", "The opening's two lines"), 960, Y, {
      alpha: stageA * named(t, s.voice_start)
    });
    nameText(L("理解", "Understanding"), x0 - NAME_GAP, y1, {
      align: "right",
      color: P.authority,
      alpha: stageA * named(t, underAt)
    });
    nameText(L("实际的结果", "Real outcomes"), x0 - NAME_GAP, y2, {
      align: "right",
      color: P.evidence,
      alpha: stageA * named(t, realAt)
    });
    const dn = stageA * ramp(t, dirAt - 0.15, 0.4), up = stageA * ramp(t, corrAt - 0.15, 0.4), XA = 700, XB = 1220;
    link(XA, y1, XA, y2, {
      alpha: dn,
      upto: soon(t, dirAt, 0.6),
      color: P.authority,
      flow: voiceTime(t) * 0.5 % 1,
      width: 3
    });
    nameText(L("指出方向", "Gives direction"), XA - 18, Y, {
      align: "right",
      alpha: stageA * named(t, dirAt)
    });
    link(XB, y2, XB, y1, {
      alpha: up,
      upto: soon(t, corrAt, 0.6),
      color: P.evidence,
      flow: (voiceTime(t) * 0.5 + 0.5) % 1,
      width: 3
    });
    nameText(L("回过头来修正", "Comes back to correct"), XB + 18, Y, {
      align: "left",
      alpha: stageA * named(t, corrAt)
    });
  }
  if (stageB > 0) {
    const ys = [340, 450, 560, 670], W = en ? 620 : 520;
    const terms = en ? [
      ["Preserve meaning"],
      ["Distinguish only"],
      ["Keep authority separate from views"],
      ["Retire a mechanism"]
    ] : [["最小够用的模型"], ["只在影响行动的地方"], ["视图只管展示"], ["责任结束的机制"]];
    const quals = en ? [
      ["with the smallest sufficient model"],
      ["where it changes what we do"],
      ["because seeing is not permission"],
      ["once its obligation is gone"]
    ] : [["留住含义"], ["做区分"], ["看得到，不等于有权去做"], ["就让它退场"]];
    const widest = Math.max(...terms.map((term, i) => s18RowWidth(term, quals[i], W))), GX = Math.round(960 - (72 + NAME_GAP + widest) / 2 + 36);
    if (en) {
      const head = ["Four plain rules", " of judgment"], w = measure(head.join(""));
      growName(t, head, [rulesCut, judgment], Math.round(960 - w / 2), 258, {
        valign: "middle",
        alpha: stageB,
        color: P.authority,
        build: true
      });
    } else nameText("几条朴素的准则", 960, 258, { color: P.authority, alpha: stageB });
    line(960 - 150, 284, 960 + 150, 284, { color: P.authority, alpha: stageB, width: 2.5 });
    stroke(
      () => ys.forEach((y) => ctx.roundRect(GX - 56, y - 46, 112 + NAME_GAP + widest + 40, 92, 12)),
      { color: P.muted, alpha: stageB, width: 3, dash: [8, 8] }
    );
    ruleAts.forEach((at, i) => {
      const on = stageB * ramp(t, at - 0.15, 0.4), c = blend(P.ink, P.authority, speaking(t, ruleAts, i)), y = ys[i];
      ring(GX, y, 36, { color: c, alpha: on, width: 2.5 });
      if (i === 0) modelGrid(GX - 20, y - 15, 40, 30, { alpha: on, color: c });
      if (i === 1) {
        line(GX, y - 20, GX, y + 20, { color: c, alpha: on, width: 3 });
        dot(GX - 12, y, 5, { color: c, alpha: on });
        dot(GX + 12, y, 5, { color: c, alpha: on });
      }
      if (i === 2) {
        const d = 12 * soon(t, apartAt, 0.5);
        ring(GX - d, y, 13, { color: c, alpha: on, width: 2.5 });
        dot(GX + d, y, 5, { color: c, alpha: on });
      }
      if (i === 3) {
        const dx = 10 * soon(t, goneAt, 0.6);
        stroke(
          () => {
            ctx.moveTo(GX - 16 + dx, y);
            ctx.lineTo(GX + 10 + dx, y);
            ctx.moveTo(GX + 2 + dx, y - 9);
            ctx.lineTo(GX + 12 + dx, y);
            ctx.lineTo(GX + 2 + dx, y + 9);
          },
          { color: c, alpha: on, width: 3 }
        );
      }
      const { height } = termRowLayout(terms[i], quals[i], W);
      termRow(t, terms[i], [at], quals[i], [qualAts[i]], GX + 36 + NAME_GAP, y - height / 2, {
        width: W,
        alpha: stageB * listLevel(t, ruleAts, i),
        set: "rules"
      });
    });
  }
  if (stageC > 0) {
    const LX = 520, RX = 1400, CY = 430, pi = stageC * ramp(t, pipeAt - 0.15, 0.4), re = stageC * ramp(t, resAt - 0.15, 0.4);
    pipelineMark(LX, CY, 680, { alpha: stageC, flow: q });
    signalMark(RX, CY, 680, 180, { alpha: stageC, seen: 1, marker: 1 });
    nameText(L("行情数据管线", "Market-data pipeline"), LX, CY - 90 - NAME_GAP - 8, {
      valign: "bottom",
      alpha: stageC,
      set: "examples"
    });
    nameText(L("选股信号", "Stock-selection signal"), RX, CY - 90 - NAME_GAP - 8, {
      valign: "bottom",
      alpha: stageC,
      set: "examples"
    });
    seal(LX - 200, CY + 150, 34, { alpha: pi, color: P.evidence });
    nameText(
      L("可以检验的改进", "An improvement that can be verified"),
      LX - 200 + 34 + 16,
      CY + 150,
      { align: "left", width: 420, alpha: stageC * named(t, pipeAt), color: P.evidence }
    );
    documentIcon(RX - 240, CY + 110, 62, 80, { alpha: re, rows: 3, stroke: P.authority });
    askIcon(RX - 240 - 34, CY + 145, 18, { alpha: stageC * ramp(t, askAt - 0.15, 0.4) });
    nameText(
      L("写明结论成立的条件", "The conditions its conclusion needs"),
      RX - 240 + 62 + 16,
      CY + 150,
      { align: "left", width: 420, alpha: stageC * named(t, resAt), color: P.authority }
    );
    illustrative(stageC);
  }
  if (stageD > 0) {
    s18Lines({
      alpha: stageD,
      upper: ramp(t, knownAt - 0.15, 0.4),
      lower: ramp(t, learnedAt - 0.15, 0.4)
    });
    text("?", x1 + 130, Y + 2, 72, {
      role: "mark",
      align: "center",
      color: P.unknown,
      alpha: stageD
    });
    nameText(L("新的问题", "A new problem"), x1 + 130, Y + 60, {
      valign: "top",
      width: 200,
      color: P.unknown,
      alpha: stageD
    });
    nameText(L("已有的理解", "What was understood"), x0, y1 - NAME_GAP, {
      align: "left",
      valign: "bottom",
      color: P.authority,
      alpha: stageD * named(t, knownAt)
    });
    nameText(L("学到的东西", "What was learned"), x0, y2 + NAME_GAP, {
      align: "left",
      valign: "top",
      color: P.evidence,
      alpha: stageD * named(t, learnedAt)
    });
    const st = stageD * ramp(t, startAt - 0.15, 0.4);
    line(x1, y1, x1, mix(y1, y2, soon(t, startAt - 0.1, 0.5)), {
      color: P.authority,
      alpha: st,
      width: 3
    });
    link(x1 + 80, Y, x1 + 2, Y, {
      alpha: st,
      color: P.line,
      end: false,
      upto: soon(t, startAt + 0.1, 0.4)
    });
    nameText(L("起点", "A place to start"), x1 - NAME_GAP, Y, {
      align: "right",
      color: P.authority,
      alpha: stageD * named(t, startAt)
    });
  }
  if (stageE > 0) {
    const reach = soon(t, goAt, 1.6), ex = mix(x1, 1740, reach), CX = 960, CY = 500;
    path(
      [
        [x0, y1],
        [ex, y1]
      ],
      { color: P.authority, alpha: stageE, width: 4 }
    );
    path(
      [
        [x0, y2],
        [ex, y2]
      ],
      { color: P.evidence, alpha: stageE, width: 4 }
    );
    dot(ex, y1, 7, { color: P.authority, alpha: stageE });
    dot(ex, y2, 7, { color: P.evidence, alpha: stageE });
    line(x1, y1, x1, y2, { color: P.authority, alpha: stageE, width: 3 });
    nameText(L("项目接着做下去", "The project keeps going"), x0, y1 - NAME_GAP, {
      align: "left",
      valign: "bottom",
      alpha: stageE
    });
    const op = stageE * ramp(t, openAt - 0.15, 0.4);
    ring(CX, CY, 70, {
      color: P.authority,
      alpha: op,
      width: 3,
      upto: 0.84,
      start: -Math.PI * 0.3
    });
    nameText(L("方法始终可以修改", "The method stays open"), CX + 70 + NAME_GAP, CY, {
      align: "left",
      color: P.authority,
      alpha: stageE * named(t, openAt)
    });
  }
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
