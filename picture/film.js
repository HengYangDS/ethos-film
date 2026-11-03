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
  ground: "#10242C",
  row: "#1E3037",
  line: "#687771",
  ink: PAPER,
  muted: "#B1B4B0",
  accent: "#B5523D",
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
function growName(t, parts, ats, x, y, {
  width = Infinity,
  size = LABEL,
  valign = "top",
  alpha = 1,
  build = false,
  align = "left",
  ...o
} = {}) {
  const em = labelSize(size), step = em * LEADING, lines = growTexts(parts, width, size);
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
var claimParts = () => L(["“做完了，", "测试全过”"], ["“Done. ", "All tests pass.”"]);
var claimWidth = () => measure(claimParts().join("")) + 2 * CLAIM_PAD;
var datumMark = (x, y, r = CLAIM_DATUM, alpha = 1) => ethosMark(x, y, 512 * r / 14, { datum: 1, hole: 0, passages: 0, boundary: 0, alpha });
function claimPanel(t, x, y, { alpha = 1, words = alpha, ats = null, datum = 1, datumAt = null } = {}) {
  const parts = claimParts(), w = claimWidth(), left = x - w / 2, right = x + w / 2;
  box(left, y - CLAIM_H / 2, w, CLAIM_H, { stroke: P.ink, alpha, radius: 16, width: 2.5 });
  growName(t, parts, ats ?? [-Infinity], left + CLAIM_PAD, y, {
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

// picture/film/naming/placement.js
var rowNameTop = (bottoms, gap = NAME_GAP) => Math.max(...bottoms) + gap;
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
  const need = widths.slice(1).map((w, i) => (widths[i] + w) / 2 + gap), pitch = names.length > 1 ? (last - first) / (names.length - 1) : 0;
  if (need.every((d) => d <= pitch)) return names.map((_, i) => first + i * pitch);
  const slack = Math.max(0, last - first - need.reduce((a, b) => a + b, 0)) / Math.max(1, need.length);
  return need.reduce((xs, d) => [...xs, xs.at(-1) + d + slack], [first]);
}

// picture/film/scenes/p01/done.js
var routePoint = (corners, q) => along(rounded(corners, 14), q).point;
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
  const whole = Math.floor(n), part = n - whole, col = (i) => x + (i - (Math.ceil(n) - 1) / 2) * step;
  const draw = (from, to, a) => {
    if (a < 0.01 || to <= from) return;
    const xs = Array.from({ length: to - from }, (_, k) => col(from + k));
    agentRow(xs, y, { alpha: a, size: 0.55 });
    stroke(
      () => xs.forEach((cx) => {
        ctx.moveTo(cx - 7, y + 38);
        ctx.lineTo(cx - 2, y + 43);
        ctx.lineTo(cx + 8, y + 32);
      }),
      { color: P.ink, alpha: a, width: 2.5 }
    );
  };
  draw(0, whole, alpha);
  draw(whole, whole + 1, alpha * part);
}
scenes["01"] = function(s, t) {
  const first = s.words[0].start;
  const [hand, done, pass2, landed, much] = cues(s, [
    ["交回来", "hands back"],
    ["做完了", "Done"],
    ["测试全过", "All tests pass"],
    ["全过", "pass"],
    ["到底说明了多少", "How much"]
  ]);
  const opens = cue(s, "它说的是", "Which commit"), qs = cues(s, [
    ["哪一次提交", "Which commit"],
    ["哪些测试", "Which tests ran"],
    ["是不是当初真正要的", "really asked for"],
    ["能不能退回去", "can you get back"]
  ]);
  const [relay, codeAt, inter, ends, pick] = cues(s, [
    ["替我们", "our code"],
    ["改代码", "our code"],
    ["可以互相替换的 Agent", "interchangeable Agents"],
    ["会话结束了", "session ends"],
    ["换一个接着做", "another picks up"]
  ]);
  const [writing, easier, flatAt, rely, hard] = cues(s, [
    ["写一个改动", "Writing code"],
    ["越来越容易", "keeps getting easier"],
    ["能不能放心依靠它", "Knowing whether"],
    ["能不能放心依靠它", "whether you can rely on it"],
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
  const q = voiceTime(t) * 0.45 % 1;
  illustrative(Math.max(stageA, stageD, stageE));
  const W = claimWidth();
  if (stageA > 0) {
    const aside = soon(t, hand + 0.05, 0.6), AX2 = mix(960, 740, aside), AY = mix(560, 640, aside), AR = 33, gone = ramp(t, opens - 0.15, 0.4), lead = Math.max(first - 0.28, s.voice_start - 0.1), seen = stageA * ramp(t, lead - 0.15, 0.4) * (1 - gone);
    const slide = soon(t, opens + 0.05, 0.7), PX = mix(1060, 960, slide), PY = 360, left = PX - W / 2;
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
    if (handed >= 1 && seen > 0.01) {
      const [fx, fy] = routePoint(corners, q);
      flowDot(fx, fy, 6, q, { color: P.ink, alpha: seen });
    }
    const panel = stageA * ramp(t, hand + 0.35, 0.4);
    const placed = claimPanel(t, PX, PY, {
      alpha: panel,
      words: stageA,
      ats: [done, pass2],
      datum: soon(t, landed + 0.05, 0.35)
    });
    const [DX, DY] = placed.datum;
    nameText(L("到底说明了多少？", "How much?"), PX, PY - CLAIM_H / 2 - NAME_GAP, {
      valign: "bottom",
      alpha: stageA * named(t, much)
    });
    beats(t, DX, DY, 30, [much], { alpha: stageA });
    const names = L(
      ["哪一次提交？", "哪些测试，在哪儿？", "是不是当初真正要的？", "能不能退回去？"],
      ["Which commit?", "Which tests ran?", "Really asked for?", "Can you get back?"]
    );
    const RY = 620, RR = 34, base = railStations(names, 420, 1500, { wrap: 300 }), shift = building(t, qs, (base[1] - base[0]) / 2), xs = base.map((x) => x + shift), mid = (PY + CLAIM_H / 2 + RY - RR) / 2;
    xs.forEach((x, i) => {
      const on = stageA * ramp(t, qs[i] - 0.15, 0.4), lit = speaking(t, qs, i);
      if (on < 0.01) return;
      link(PX, PY + CLAIM_H / 2, x, RY - RR, {
        route: "vhv",
        mid,
        alpha: on,
        upto: soon(t, qs[i] + 0.05, 0.5)
      });
      const [fx, fy] = routePoint(
        [
          [PX, PY + CLAIM_H / 2],
          [PX, mid],
          [x, mid],
          [x, RY - RR]
        ],
        q
      );
      flowDot(fx, fy, 5, q, { color: P.ink, alpha: on * lit });
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
    railNames(names, xs, RY + RR, {
      gap: NAME_GAP,
      wrap: 300,
      alpha: (i) => stageA * listIn(t, qs, i),
      set: "questions"
    });
  }
  if (stageB > 0) {
    const xs = [560, 720, 880], Y3 = 500, R = 33, S = 48, RX = 1330, RW = 260, RH = 200;
    const row = stageB;
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
    if (!en)
      nameText("改代码", (xs[2] + R + RX - RW / 2) / 2, Y3 - NAME_GAP, {
        valign: "bottom",
        alpha: stageB * named(t, codeAt)
      });
    else
      nameText("Our code", RX, Y3 + RH / 2 + NAME_GAP, {
        valign: "top",
        alpha: stageB * named(t, codeAt)
      });
    nameText(L("可以互相替换的 Agent", "Interchangeable Agents"), xs[1], Y3 + S + NAME_GAP, {
      valign: "top",
      alpha: stageB * named(t, inter)
    });
    const ended = ramp(t, ends - 0.15, 0.4), moved = soon(t, pick + 0.05, 0.7), FX = mix(xs[0], xs[1], moved), dashedShare = ended * (1 - ramp(t, pick + 0.45, 0.4));
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
    const parts = L(["会话结束了，", "换一个"], ["Session ends, ", "another picks up"]), wide = measure(parts.join(""));
    growName(t, parts, [ends, pick], (xs[0] + xs[1]) / 2 - wide / 2, Y3 - S - NAME_GAP, {
      valign: "bottom",
      alpha: stageB,
      build: true
    });
  }
  if (stageC > 0) {
    const X0 = 340, X1 = 1300, Y0 = 610, climb = 120 + 160 * soon(t, easier + 0.05, 1.6) + 6 * Math.max(0, voiceTime(t) - voiceTime(easier + 1.65));
    const rise = (x) => Y0 - climb * ((x - X0) / (X1 - X0)) ** 1.7, points = [];
    for (let x = X0; x < X1; x += 12) points.push([x, rise(x)]);
    points.push([X1, rise(X1)]);
    path(points, { color: P.ink, alpha: stageC, width: 4 });
    dot(X1, rise(X1), 7, { color: P.ink, alpha: stageC });
    nameText(L("写一个改动越来越容易", "Writing code"), X1 + 7 + NAME_GAP, rise(X1), {
      align: "left",
      alpha: stageC * named(t, writing)
    });
    const flat = stageC * ramp(t, flatAt - 0.15, 0.4), flatReach = mix(X0, X1, soon(t, flatAt - 0.1, 1));
    line(X0, Y0, flatReach, Y0, { color: P.ink, alpha: flat, width: 4 });
    dot(flatReach, Y0, 7, { color: P.ink, alpha: flat });
    beats(t, X1, Y0, 22, [hard - 0.1], { alpha: flat });
    nameText(L("能不能放心依靠它", "Whether you can rely on it"), X1 + 7 + NAME_GAP, Y0, {
      align: "left",
      width: 300,
      alpha: stageC * named(t, rely)
    });
  }
  if (stageD > 0 || stageE > 0) {
    const PY = 300, move = soon(t, ethos + 0.05, 0.8);
    claimPanel(t, 960, PY, {
      alpha: stageD + stageE,
      datum: mix(1, 1.5, move),
      datumAt: [mix(960 + W / 2, 960, move), mix(PY, 620, move)]
    });
    nameText("ETHOS", 960, 620 + 18 + NAME_GAP, { valign: "top", alpha: stageE * named(t, ethos) });
    if (stageD > 0) {
      const HX = 960, HY = 450 + 170 * (1 - soon(t, two + 0.05, 0.5)), heard1 = stageD;
      link(HX, PY + CLAIM_H / 2, HX, HY - 44, { alpha: heard1 });
      person(HX, HY, { size: 1.3, alpha: heard1 });
      nameText(L("人", "People"), HX + 34 + NAME_GAP, HY - 12, {
        align: "left",
        alpha: stageD * named(t, people)
      });
      const XS2 = [620, 1300], FY = HY + 42, MID = 525, BY = 565, GY = BY + 120, CY = GY + 45, ways = [trust, again], costs = [luck, cantName], marks = [luck, cant], fork = stageD * ramp(t, two + 0.25, 0.3);
      XS2.forEach((x, i) => {
        link(HX, FY, x, BY, {
          route: "vhv",
          mid: MID,
          alpha: fork,
          upto: soon(t, two + 0.4, 0.6)
        });
        const [fx, fy] = routePoint(
          [
            [HX, FY],
            [HX, MID],
            [x, MID],
            [x, BY]
          ],
          q
        );
        flowDot(fx, fy, 5, q, { color: P.ink, alpha: fork * speaking(t, ways, i) });
        nameText(
          L(["照单全收", "从头再查一遍"], ["Take it on trust", "Check everything again"])[i],
          x,
          BY + NAME_GAP,
          { valign: "top", alpha: stageD * listIn(t, ways, i), set: "ways" }
        );
        const on = stageD * ramp(t, marks[i] - 0.15, 0.4);
        link(x, BY + NAME_GAP + 40, x, GY - 32, { alpha: on, upto: soon(t, marks[i] - 0.1, 0.4) });
      });
      die(XS2[0], GY, 46, { alpha: stageD * ramp(t, luck - 0.15, 0.4) });
      nameText(L("靠的是运气", "A gamble"), XS2[0], CY, {
        valign: "top",
        alpha: stageD * listIn(t, costs, 0),
        set: "costs"
      });
      const grid = stageD * ramp(t, cant - 0.15, 0.4);
      checksGrid(XS2[1], GY - 16, mix(2, 7, soon(t, many + 0.05, 0.65)), { alpha: grid });
      nameText(L("查不过来", "Stops working"), XS2[1], CY, {
        valign: "top",
        alpha: stageD * listIn(t, costs, 1),
        set: "costs"
      });
    }
  }
};

// picture/film/scenes/p02/beyond.js
function stageClaims(t, a, c) {
  if (a <= 0) return;
  const X0 = 760, EW = 130, CW = 500, H = 30, ys = [430, 570, 710].map((y) => y + building(t, [c.eCut, c.merge, c.deploy], 105)), evidence = [c.local, c.merge, c.deploy], claims = [c.everything, c.release, c.benefit2], own = ramp(t, c.ownPart - 0.15, 0.4);
  const evidenceNames = L(
    ["本地跑通了", "代码合进去了", "部署成功了"],
    ["Passed on one machine", "A merge", "A deployment"]
  ), claimNames = L(
    ["全部通过", "已经发布", "实际效益"],
    ["Everything passes", "A release", "Actual benefit"]
  );
  ys.forEach((y, i) => {
    const on = a * ramp(t, (i ? evidence[i] : c.eCut) - 0.15, 0.4), grow = soon(t, claims[i] - 0.1, 0.6), w = mix(EW, CW, grow);
    if (on < 0.01) return;
    box(X0, y - H / 2, EW, H, { fill: P.ink, alpha: on, radius: 6 });
    box(X0, y - H / 2, w, H, {
      stroke: P.ink,
      alpha: on * (1 - own * grow),
      radius: 8,
      width: 2.5
    });
    box(X0, y - H / 2, w, H, {
      stroke: P.ink,
      alpha: on * own * grow * 0.85,
      radius: 8,
      width: 2.5,
      dash: [8, 8]
    });
    const flash = clamp((t - c.ownPart - 0.05 - 0.3 * i) / 0.5);
    if (flash > 0 && flash < 1)
      box(X0 - 7, y - H / 2 - 7, EW + 14, H + 14, {
        stroke: P.ink,
        alpha: on * Math.sin(Math.PI * flash) * 0.6,
        radius: 10,
        width: 3
      });
    nameText(evidenceNames[i], X0 - NAME_GAP, y, {
      align: "right",
      alpha: a * listIn(t, [c.eCut, ...evidence.slice(1)], i),
      set: "evidence"
    });
    nameText(claimNames[i], X0 + CW + NAME_GAP, y, {
      align: "left",
      alpha: a * listIn(t, claims, i),
      set: "claims"
    });
  });
  nameText(L("只证明了它自己那一段", "Proves only its own part"), X0 + CW / 2, ys[2] + H / 2 + 40, {
    valign: "top",
    alpha: a * named(t, c.ownPart)
  });
}
function stageTests(t, a, c) {
  if (a <= 0) return;
  illustrative(a);
  const PY = 380, GX2 = 960, GY = 650, S = 46, cols = 8, rows = 4, left = GX2 - cols * S / 2, top = GY - rows * S / 2;
  claimPanel(t, 960, PY, { alpha: a });
  const tests = a * ramp(t, c.written - 0.15, 0.4), q = voiceTime(t) * 0.45 % 1;
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
  link(960, PY + 42, left + 1.5 * S, top + 4, {
    route: "vhv",
    mid: (PY + 42 + top) / 2,
    alpha: a,
    flow: q
  });
  nameText(L("已经写好的那些测试", "The tests someone wrote"), left - NAME_GAP, top + S, {
    align: "right",
    alpha: a * named(t, c.written)
  });
  nameText(L("这些测试够不够", "Whether those tests are enough"), GX2, top + rows * S + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.enough)
  });
}

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
var RAIL = { y: 690, x0: 400, x1: 1520, xs: [700, 960, 1220], heads: [604, 624, 604] };
function handlers(seen) {
  const { xs } = RAIL;
  person(xs[0], 640, { size: 1.1, alpha: seen[0] });
  agent(xs[1], 646, { alpha: seen[1] });
  person(xs[2], 640, { size: 1.1, alpha: seen[2] });
}
var requestDoc = (alpha) => paper(RAIL.x0 - 36, RAIL.y - 100, 72, 96, { alpha, rows: 4 });
function railEnd(alpha) {
  ring(RAIL.x1, RAIL.y, 14, { color: P.ink, alpha, width: 2.5 });
  dot(RAIL.x1, RAIL.y, 5, { color: P.ink, alpha });
}
function stagePerson(t, a, c) {
  if (a <= 0) return;
  const Y3 = 700, walk = soon(t, c.span - 0.05, 3), ux = mix(560, 1360, walk), work2 = a * ramp(t, c.work - 0.15, 0.4), who = a * ramp(t, c.person - 0.15, 0.4);
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
  const stops = [...xs, x1], steps = [...stations, en ? c.delivery : c.people], px = steps.reduce(
    (x, at, i) => x + (stops[i] - (i ? stops[i - 1] : x0)) * soon(t, at + 0.05, 0.5),
    x0
  );
  token(px, y, { r: 9, alpha: a });
}
function stageSummaries(t, a, c) {
  if (a <= 0) return;
  const { y, x0, x1, xs, heads } = RAIL;
  railLine(a);
  requestDoc(a);
  railEnd(a);
  handlers([a, a, a]);
  const q = voiceTime(t) * 0.3 % 1;
  flowDot(mix(x0 + 44, x1 - 20, q), y, 7, q, { color: P.ink, alpha: a });
  nameText(L("原话", "The words before it"), x0, y - 100 - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, c.orig - 0.1)
  });
  papers(
    [
      [xs[0], 56, 3, heads[0] - 4],
      [xs[1], 48, 2, heads[1] - 4],
      [xs[2], 40, 1, heads[2] - 4],
      [x1, 32, 1, y - 18]
    ].map(([x, w, rows, foot]) => [x - w / 2, foot - w * 1.27, w, w * 1.27, rows]),
    a * ramp(t, c.summary - 0.15, 0.4)
  );
  nameText(L("一份总结顶替一次", "A summary takes the place"), (xs[0] + x1) / 2, 507, {
    valign: "bottom",
    alpha: a * named(t, c.summary)
  });
  const lost = [c.unwritten, c.mustNot, c.benefit], LY = y + 34;
  xs.forEach((x, i) => {
    const on = a * ramp(t, lost[i] - 0.15, 0.4), gone = i ? 1 : ramp(t, c.gone - 0.15, 0.4);
    line(x - 44, LY, x + 44, LY, { color: P.ink, alpha: on * (1 - gone), width: 3 });
    dashed(x - 44, LY, x + 44, LY, { color: P.ink, alpha: on * gone * 0.85, width: 3 });
  });
  railNames(
    L(
      ["没写下来的约束", "不能做什么", "想要得到的好处"],
      ["Never written down", "What must not be done", "The benefit"]
    ),
    xs,
    LY,
    { gap: NAME_GAP, alpha: (i) => a * listIn(t, lost, i), set: "lost" }
  );
}
function stageWrongGoal(t, a, c) {
  if (a <= 0) return;
  const DX = 640, DY = 580, TX = 1280, q = voiceTime(t) * 0.45 % 1, aim = a * ramp(t, c.wrong - 0.15, 0.4);
  paper(DX - 70, DY - 90, 140, 180, { alpha: a, rows: 6 });
  dot(DX + 70, DY + 90, 22, { color: P.ground, alpha: a });
  ring(DX + 70, DY + 90, 22, { color: P.ink, alpha: a, width: 2.5 });
  check(DX + 70, DY + 91, 20, { color: P.ink, alpha: a, width: 3 });
  const namesTop = rowNameTop([DY + 90 + 22, DY + 58]);
  nameText(L("格式齐全、挑不出毛病", "Complete and well formed"), DX, namesTop, {
    valign: "top",
    alpha: a * named(t, c.gCut + 0.15)
  });
  link(DX + 70, DY, TX - 58, DY, {
    alpha: a,
    upto: soon(t, c.gCut + 0.3, 0.6),
    flow: q,
    width: 2.5
  });
  [58, 36].forEach((r) => ring(TX, DY, r, { color: P.ink, alpha: a, width: 2.5 }));
  dot(TX, DY, 10, { color: P.ink, alpha: a });
  cross(TX + 62, DY - 62, 26, { color: P.ink, alpha: aim, width: 3.5 });
  nameText(L("从一开始就定错了", "Aimed at the wrong goal"), TX, namesTop, {
    valign: "top",
    alpha: a * named(t, c.wrong)
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
function stageBranch(t, a, c) {
  if (a <= 0) return;
  const xs = [760, 920, 1080, 1240], Y3 = 640, AX2 = 920, BX2 = 1240, AY = 460, R = 31;
  agentPair([AX2, BX2], AY, { alpha: a, size: 1.4 });
  nameText(L("两个 Agent", "Two Agents"), (AX2 + BX2) / 2, AY + R + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.bCut)
  });
  const over = soon(t, c.overwritten + 0.05, 0.6), branch2 = a * ramp(t, c.branch - 0.15, 0.4);
  line(xs[2], Y3, xs[3], Y3, { color: P.ink, alpha: branch2, width: 2.5 });
  commitRow(xs[0], xs[1] - xs[0], Y3, 3, { alpha: branch2, single: true });
  nameText(L("一条分支", "The same branch"), xs[0] - 9 - NAME_GAP, Y3, {
    align: "right",
    alpha: a * named(t, c.branch)
  });
  const dropY = mix(Y3, Y3 + 96, over);
  commitDot(BX2, dropY, { alpha: branch2 * mix(1, 0.75, over) });
  cross(BX2, dropY, 30, { color: P.ink, alpha: branch2 * over, width: 3.5 });
  nameText(L("被覆盖了", "Overwritten"), BX2, dropY + 15 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.overwritten)
  });
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
    flow: voiceTime(t) * 0.45 % 1
  });
  dot(BX2, Y3, 9 * soon(t, c.writes + 0.75, 0.3), { color: P.ink, alpha: a });
}
function stagePlatforms(t, a, c) {
  if (a <= 0) return;
  const VX = 470, VY = 560, PX = 1100, ys = [420, 700], W = 220, H = 84, q = voiceTime(t) * 0.4 % 1;
  tagIcon(VX, VY, 140, 56, { alpha: a, color: P.ink });
  nameText(L("同一个版本", "The same version"), VX + 70, VY - 28 - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, c.vCut)
  });
  const hosts = [c.gitlab, c.github], come = L(hosts, [c.platforms, c.platforms2]), calls = hosts.map((at, i) => L(at, Math.max(come[i], at - 1.4))), results = [c.ok, c.fail];
  ys.forEach((y, i) => {
    const on = a * ramp(t, come[i] - 0.15, 0.4);
    link(VX + 140, VY, PX - W / 2, y, {
      route: "hvh",
      mid: 840,
      alpha: on,
      upto: soon(t, come[i] + 0.05, 0.5),
      flow: q
    });
    box(PX - W / 2, y - H / 2, W, H, { stroke: P.ink, alpha: on, radius: 14, width: 2.5 });
    nameText(["GitLab", "GitHub"][i], PX, y, { alpha: a * named(t, calls[i]), set: "hosts" });
    const done = a * ramp(t, results[i] - 0.15, 0.4);
    if (i === 0) check(PX + W / 2 + 40, y, 30, { color: P.ink, alpha: done, width: 4 });
    else stopSign(PX + W / 2 + 40, y, 20, { color: P.ink, alpha: done });
    nameText(
      L(["一边成功", "一边失败"], ["Succeeds on one", "Fails on the other"])[i],
      PX + W / 2 + 76,
      y,
      { align: "left", alpha: a * listIn(t, results, i), set: "results" }
    );
  });
  const unknown = a * ramp(t, c.unclear - 0.15, 0.4), UY = (ys[0] + ys[1]) / 2;
  unknownMark(PX + W / 2 + 40, UY, unknown);
  nameText(L("说不清现在到底是什么状态", "Nobody can say"), PX + W / 2 + 76, UY, {
    align: "left",
    alpha: a * named(t, c.unclear)
  });
  const again = a * ramp(t, c.retry - 0.15, 0.4);
  link(VX + 70, VY + 28, VX + 70 + 300, 800, {
    route: "vh",
    alpha: again,
    upto: soon(t, c.retry + 0.05, 0.6),
    dash: [8, 8]
  });
  unknownMark(VX + 70 + 330, 800, again * soon(t, c.retry + 0.55, 0.3));
  nameText(L("再试一遍", "Trying again"), VX + 70 + 330 + UNKNOWN_R + 16, 800, {
    align: "left",
    alpha: a * named(t, c.retry)
  });
}
function stageSent(t, a, c) {
  if (a <= 0) return;
  const X0 = 760, X1 = 1160, ys = [560, 760].map((y) => y + building(t, [c.s2Cut, c.error], 100)), near = [c.sent, c.error], far = [c.received, c.nothing], q = voiceTime(t) * 0.4 % 1;
  ys.forEach((y, i) => {
    const on = a * ramp(t, (i ? near[i] : c.s2Cut) - 0.15, 0.4), off = a * ramp(t, far[i] - 0.15, 0.4);
    dot(X0, y, 10, { color: P.ink, alpha: on });
    link(X0 + 10, y, 930, y, {
      alpha: on,
      upto: soon(t, near[i] + 0.05, 0.4),
      end: false,
      flow: q
    });
    unknownMark(960, y, off);
    dashed(990, y, X1 - 14, y, { color: P.line, alpha: off, width: 2.5 });
    ring(X1, y, 14, { color: P.ink, alpha: off, width: 2.5 });
    nameText(
      L(["请求发出去了", "看到报错"], ["Sent", "An error message"])[i],
      X0 - 10 - NAME_GAP,
      y,
      { align: "right", alpha: a * listIn(t, [c.s2Cut, near[1]], i), set: "near" }
    );
    nameText(
      L(["对方收下了", "什么都没发生"], ["Received", "Nothing happened"])[i],
      X1 + 14 + NAME_GAP,
      y,
      { align: "left", alpha: a * listIn(t, far, i), set: "far" }
    );
  });
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
  const xs = [720, 960, 1200], W = 136, H = 166, ats = [c.register, c.ledger, c.copyRule], stale = ramp(t, c.stale - 0.15, 0.4), fight = ramp(t, c.fight - 0.15, 0.4), sink = 28 * soon(t, c.burden + 0.05, 0.6), SY = 700 + sink;
  line(xs[0] - W / 2 - 40, SY, xs[2] + W / 2 + 40, SY, { color: P.ink, alpha: a, width: 3 });
  nameText(L("加流程", "More process"), 960, SY + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.lCut + 0.15)
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
    L(["登记表", "台账", "重复的规定"], ["Register", "Ledger", "Copy of the same rule"]),
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
  const parts = L(
    ["过期，", "互相打架，", "成了新的负担"],
    ["Go stale,", " contradict each other,", " a burden of their own"]
  );
  growName(t, parts, [c.stale, c.fight, c.burden], 960, 806, {
    width: 640,
    valign: "top",
    alpha: a,
    build: true,
    align: "center"
  });
}

// picture/film/scenes/p02/hard.js
var INDEX_XS = [420, 960, 1500];
function hardIndex(t, k, { heading, headAt, names, ats, levels }) {
  const Y3 = mix(540, 156, k), R = mix(54, 16, k), pointR = mix(12, 6, k), shown = ats.map((at) => ramp(t, at - 0.15, 0.4)), reach = shown.map((v) => Math.max(pointR * (1 - v), R * v));
  stroke(
    () => [0, 1].forEach((i) => {
      ctx.moveTo(INDEX_XS[i] + reach[i], Y3);
      ctx.lineTo(INDEX_XS[i + 1] - reach[i + 1], Y3);
    }),
    { color: P.line, width: 2.5 }
  );
  fill(
    () => INDEX_XS.forEach((x, i) => {
      if (shown[i] > 0) return;
      const r = pointR;
      ctx.moveTo(x + r, Y3);
      ctx.arc(x, Y3, r, 0, Math.PI * 2);
    }),
    { color: P.ink }
  );
  INDEX_XS.forEach((x, i) => {
    if (shown[i] <= 0) return;
    ring(x, Y3, R * shown[i], { color: P.ink, alpha: shown[i], width: mix(2.5, 3.5, levels[i]) });
    text(String(i + 1), x, Y3 + 1, mix(30, 18, k), {
      role: "mark",
      align: "center",
      alpha: clamp((shown[i] - 0.4) / 0.6) * mix(0.58, 1, levels[i])
    });
  });
  railNames(names, INDEX_XS, Y3 + R, {
    gap: mix(NAME_GAP, 12, k),
    wrap: 460,
    alpha: (i) => named(t, ats[i]) * mix(0.58, 1, levels[i]),
    set: "hard"
  });
  nameText(heading, 960, Y3 - 98, {
    valign: "bottom",
    alpha: named(t, headAt) * clamp(1.5 - 2 * k)
  });
  const clear = Math.max(16 + 24, measure(names[0]) / 2 + labelSize(LABEL)), end = Math.max(INDEX_XS[0] - clear, 120 + measure(heading));
  nameText(heading, end, 156, {
    align: "right",
    alpha: named(t, headAt) * clamp(2 * k - 0.5)
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
    gone: ["跟着没了", "ends with it"],
    mustNot: ["不能做什么", "what must not be done"],
    benefit: ["想要得到的好处", "the benefit"],
    gCut: ["需求哪怕", "A specification"],
    wellFormed: ["格式齐全", "complete and well formed"],
    wrong: ["从一开始就定错了", "aimed at the wrong goal"],
    second: ["第二个", "The second"],
    n2: ["结论超出了证据", "claims go beyond their evidence"],
    eCut: ["本地跑通了", "A run that passed"],
    local: ["本地跑通了", "passed on one machine"],
    everything: ["全部通过", "everything passes"],
    merge: ["代码合进去了", "A merge"],
    release: ["已经发布", "a release"],
    deploy: ["部署成功了", "a deployment"],
    benefit2: ["实际效益", "actual benefit"],
    ownPart: ["只证明了它自己那一段", "proves only its own part"],
    tCut: ["就连", "Even"],
    allPass: ["测试全过", "all tests pass"],
    written: ["已经写好的那些测试", "the tests someone wrote"],
    enough: ["这些测试够不够", "whether those tests are enough"],
    third: ["第三个", "The third"],
    // The third name's clause opens on 是事实 / changes, before the words it quotes.
    n3: ["是事实", "changes are made"],
    bCut: ["两个 Agent", "Two Agents"],
    branch: ["一条分支", "the same branch"],
    memory: ["过时的记忆", "an outdated memory"],
    writes: ["写下去", "writes"],
    overwritten: ["被覆盖了", "overwritten"],
    vCut: ["同一个版本", "The same version"],
    gitlab: ["GitLab", "GitLab"],
    github: ["GitHub", "GitHub"],
    platforms: ["两个平台", "code-hosting platforms"],
    platforms2: ["两个平台", "platforms"],
    ok: ["一边成功", "succeeds on one"],
    fail: ["一边失败", "fails on the other"],
    unclear: ["说不清", "nobody can say"],
    retry: ["再试一遍", "trying again"],
    s2Cut: ["因为请求", "A request that was sent"],
    sent: ["请求发出去了", "was sent"],
    received: ["对方收下了", "received"],
    error: ["看到报错", "an error message"],
    nothing: ["什么都没发生", "nothing happened"],
    lCut: ["常见的办法", "The usual answer"],
    process: ["加流程", "more process"],
    register: ["登记表", "register"],
    ledger: ["台账", "ledger"],
    copyRule: ["重复的规定", "copy of the same rule"],
    keepUp: ["有人维护", "someone to keep it up"],
    stale: ["过期", "go stale"],
    fight: ["互相打架", "contradict each other"],
    burden: ["新的负担", "a burden of their own"]
  });
  const k = soon(t, c.pCut + 0.05, 0.6) - soon(t, c.second + 0.2, 0.6) + soon(t, c.eCut + 0.05, 0.6) - soon(t, c.third + 0.2, 0.6) + soon(t, c.bCut + 0.05, 0.6);
  const told = [
    [c.n1, c.n2 - 0.15],
    [c.n2 - 0.15, c.n3 - 0.1],
    [c.n3 - 0.1, c.lCut]
  ];
  const levels = told.map(
    ([from, to]) => ramp(t, from - 0.15, 0.4) * (1 - ramp(t, to - 0.15, 0.4))
  );
  hardIndex(t, clamp(k), {
    heading: L("难处", "Three ways"),
    headAt: c.head,
    names: L(
      ["原意会走样", "结论超出了证据", "没看清，就先动了手"],
      ["Meaning drifts", "Claims go beyond their evidence", "Changes before facts"]
    ),
    ats: [c.n1, c.n2 - 0.15, c.n3 - 0.1],
    levels
  });
  const stage = (from, to, after = 0) => stageIn(t, c[from] + after) * (to ? stageOut(t, c[to]) : 1);
  stagePerson(t, stage("pCut", "rCut", 0.32), c);
  stageRail(t, stage("rCut", "sCut"), c);
  stageSummaries(t, stage("sCut", "gCut"), c);
  stageWrongGoal(t, stage("gCut", "second"), c);
  stageClaims(t, stage("eCut", "tCut", 0.32), c);
  stageTests(t, stage("tCut", "third"), c);
  stageBranch(t, stage("bCut", "vCut", 0.32), c);
  stagePlatforms(t, stage("vCut", "s2Cut"), c);
  stageSent(t, stage("s2Cut", "lCut"), c);
  stageLedgers(t, stage("lCut", null), c);
};

// picture/film/drawing/lanes.js
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

// picture/film/scenes/p03/kernel.js
var KERNEL = { IX: 560, KX: 860, PX: 1180, GX: 1380, SX: 1620 };
var BUILD_REACH = 0.07 * 1920;
function balancedShift([e0, e1], [f0, f1]) {
  const centred = 960 - (f0 + f1) / 2, early = (e0 + e1) / 2;
  return centred < 0 ? Math.max(centred, 960 - BUILD_REACH - early) : Math.min(centred, 960 + BUILD_REACH - early);
}
function stageKernel(t, a, c) {
  if (a <= 0) return;
  const PY = 380, KY = 560, KR = 54, ys = [440, 560, 680], LOOP = 740, q = voiceTime(t) * 0.45 % 1;
  const inputNames = L(
    ["已经采纳的意图", "刚观察到的事实", "留下的存证"],
    ["Intent", "Fresh facts", "Attestations"]
  ), intentQual = ["that has been accepted"], inputsWide = Math.max(
    ...inputNames.map((v) => measure(v)),
    en ? measure(intentQual.join(""), NOTE) : 0
  );
  const parts = L(
    ["看到了什么、", "判断了什么、", "做了什么"],
    ["What it observed,", " what it decided", " and what it did"]
  ), recordWidth = Math.max(...parts.map((v) => measure(v.trim()))) + 1, recordWide = Math.max(
    ...growTexts(parts, recordWidth).map((r) => measure(r.map(([, v]) => v).join("")))
  );
  const checkName = L("再核对一遍", "Checks again"), newName = L("新的存证", "New attestations"), loopX = KERNEL.SX + Math.max(120, measure(newName) / 2 + 24), left = KERNEL.IX - 34 - NAME_GAP - inputsWide, right = Math.max(loopX + 1.25, KERNEL.SX + recordWide / 2), pathFrom = KERNEL.KX - 260, pathTo = KERNEL.GX + 90, dx = balancedShift([left, pathTo + 7], [left, right]);
  const IX = KERNEL.IX + dx, KX = KERNEL.KX + dx, PX = KERNEL.PX + dx, GX2 = KERNEL.GX + dx, SX = KERNEL.SX + dx, RX = loopX + dx, NX = IX - 34 - NAME_GAP, namesTop = rowNameTop([KY + KR, KY + 45, KY + 50, KY + 34]);
  line(pathFrom + dx, PY, pathTo + dx, PY, { color: P.ink, alpha: a, width: 3 });
  dot(pathTo + dx, PY, 7, { color: P.ink, alpha: a });
  kernelIcon(KX, KY, KR, {
    alpha: a,
    color: P.ink,
    beat: speaking(t, [c.plan], 0),
    turn: 0.1 * voiceTime(t)
  });
  link(KX, KY - KR, KX, PY + 3, { alpha: a, end: false });
  nameText(L("很小的信任内核", "A small trust kernel"), KX, namesTop, {
    valign: "top",
    alpha: a * named(t, L(c.kernel - 0.55, c.kCut))
  });
  const ats = [c.in1, c.in2, c.in3], places = a * ramp(t, c.inputs - 0.15, 0.4);
  ats.forEach((at, i) => {
    const on = a * ramp(t, at - 0.15, 0.4), y = ys[i], open = places * (1 - on / Math.max(a, 1e-6));
    if (open > 0.01)
      stroke(
        () => {
          ctx.moveTo(IX + 30, y);
          ctx.arc(IX, y, 30, 0, Math.PI * 2);
        },
        { color: P.muted, alpha: open, width: 3 }
      );
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
  if (en) {
    const { height } = termRowLayout(["Intent"], intentQual, 360, false);
    termRow(t, ["Intent"], [c.in1], intentQual, [c.in1q], NX, ys[0] - height / 2, {
      width: 360,
      align: "right",
      alpha: a * listLevel(t, ats, 0),
      set: "inputs"
    });
  } else
    nameText(inputNames[0], NX, ys[0], {
      align: "right",
      alpha: a * listIn(t, ats, 0),
      set: "inputs"
    });
  [1, 2].forEach(
    (i) => nameText(inputNames[i], NX, ys[i], {
      align: "right",
      alpha: a * listIn(t, ats, i),
      set: "inputs"
    })
  );
  const rules = a * ramp(t, c.rules - 0.15, 0.4), plan2 = a * ramp(t, c.plan - 0.15, 0.4), gate = a * ramp(t, c.writeAt - 0.15, 0.4), rec = a * ramp(t, c.rec1 - 0.15, 0.4), stamped = a * ramp(t, c.newAtt - 0.15, 0.4);
  link(KX + KR * 0.87, KY, PX, KY, { alpha: rules, upto: soon(t, c.rules + 0.05, 0.6), flow: q });
  nameText(L("按固定的规则", "By fixed rules"), (KX + KR * 0.87 + PX) / 2, KY - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, c.rules)
  });
  paper(PX, KY - 45, 70, 90, { alpha: plan2, rows: 4 });
  nameText(L("一份计划", "A plan"), PX + 35, namesTop, {
    valign: "top",
    alpha: a * named(t, c.plan)
  });
  link(PX + 70, KY, GX2 - 30, KY, { alpha: gate, upto: soon(t, c.writeAt + 0.05, 0.4) });
  writeGate(GX2, KY, 100, {
    alpha: gate,
    color: P.ink,
    single: true,
    open: soon(t, c.check + 0.3, 0.6)
  });
  nameText(checkName, GX2, namesTop, {
    valign: "top",
    alpha: a * named(t, c.check)
  });
  link(GX2 + 30, KY, SX - 34, KY, { alpha: rec, upto: soon(t, c.rec1 + 0.05, 0.4) });
  seal(SX, KY, 34, { color: P.ink, alpha: rec, stamp: stamped });
  growName(t, parts, [c.rec1, c.rec2, c.rec3], SX, KY - 34 - NAME_GAP, {
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
  link(SX + 34, KY, RX, LOOP, { route: "hv", alpha: stamped, upto: back, end: false });
  link(RX, LOOP, IX, ys[2] + 28, {
    route: "hv",
    alpha: stamped * (back >= 1 ? 1 : 0),
    upto: soon(t, c.newAtt + 0.3, 0.3),
    flow: q
  });
}
function stageLifetimes(t, a, c) {
  if (a <= 0) return;
  const ys = [440, 590, 740], X0 = 290, X1 = 1630, M0 = 960, starts = [c.intent, c.facts, c.planRow];
  stroke(
    () => ys.forEach((y) => {
      ctx.moveTo(X0, y);
      ctx.lineTo(X1, y);
    }),
    { color: P.ink, alpha: a * 0.7, width: 2.5 }
  );
  const rows = [
    [[L("意图", "Intent")], [c.intent], [L("一份正式变更", "one official Change")], [c.change]],
    [
      [L("事实", "Facts")],
      [c.facts],
      L(["每次都重新去看，", "从不存下来"], ["observed again every time, ", "never stored"]),
      [c.again, c.never]
    ],
    [
      [L("计划", "A plan")],
      [c.planRow],
      L(["要么执行，", "要么作废"], ["carried out ", "or discarded"]),
      [c.carried, c.discarded]
    ]
  ], termTops = rows.map(([term, , qual], i) => ys[i] - 14 - termRowLayout(term, qual, 640).height);
  nameText(
    L("寿命不一样", "Different lengths of time"),
    X0,
    termTops[0] - labelSize(LABEL) * LEADING,
    {
      align: "left",
      valign: "bottom",
      alpha: a * named(t, L(c.lifetimes - 0.25, c.lCut + 0.15))
    }
  );
  ys.forEach((y, i) => {
    const q = (voiceTime(t) * 0.18 + i * 0.33) % 1;
    flowDot(mix(X0 + 20, X1 - 20, q), y, 6, q, {
      color: P.ink,
      alpha: a
    });
  });
  const kept = a * ramp(t, c.change - 0.15, 0.4);
  folderIcon(M0 - 4, ys[0] - 44, 56, 44, { alpha: a * ramp(t, c.intent - 0.15, 0.4) });
  line(M0 + 52, ys[0], X1, ys[0], { color: P.ink, alpha: kept, width: 6 });
  papers(
    [1160, 1380, 1580].map((x) => [x - 12, ys[0] + 6, 24, 30, 2]),
    a * ramp(t, c.afresh - 0.15, 0.4)
  );
  const facts = a * ramp(t, c.facts - 0.15, 0.4), w = voiceTime(t) * 0.25 % 1;
  if (facts > 0.01)
    stroke(
      () => {
        for (let k = 0; k < 13; k++) {
          const x = M0 + 20 + k * 52, d = Math.abs(k / 12 - w);
          if (Math.min(d, 1 - d) > 0.14) continue;
          ctx.moveTo(x, ys[1] - 18);
          ctx.lineTo(x, ys[1]);
        }
      },
      { color: P.ink, alpha: facts, width: 3 }
    );
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
    alpha: p1 * gone * soon(t, c.carried + 0.4, 0.3),
    width: 3.5
  });
  cross(M0 + 500, ys[2], 22, {
    color: P.ink,
    alpha: p2 * gone * soon(t, c.discarded + 0.4, 0.3),
    width: 3.5
  });
  line(M0 + 560, ys[2], M0 + 560 + 100 * soon(t, c.again2, 0.6), ys[2], {
    color: P.ink,
    alpha: p3,
    width: 6
  });
  rows.forEach(([term, termAts, qual, qualAts], i) => {
    termRow(t, term, termAts, qual, qualAts, X0, termTops[i], {
      width: 640,
      alpha: a * listLevel(t, starts, i),
      set: "lifetimes",
      build: true
    });
  });
}
function stageScope(t, a, c) {
  if (a <= 0) return;
  const kernelName = L("内核", "The kernel"), voidName = L("就不算数", "Does not count"), fieldNames2 = L(["谁出具的", "范围"], ["Who verified it", "Where it holds"]), W = 24 + 72 + 24 + Math.max(...fieldNames2.map((v) => measure(v))) + 24, scopeEnd = 1e3 + W / 2 + 40, copyAt = scopeEnd + 100, left = Math.min(600 - 44, 600 - measure(kernelName) / 2), right = Math.max(copyAt + 180, copyAt + 90 + measure(voidName) / 2), dx = balancedShift([left, scopeEnd], [left, right]);
  const CX = 1e3 + dx, CY = 520, H = 150, KX = 600 + dx, namesTop = rowNameTop([CY + 44, CY + 50]), headBottom = CY - H / 2 - 40 - NAME_GAP, q = voiceTime(t) * 0.4 % 1;
  kernelIcon(KX, CY, 44, { alpha: a, color: P.ink, turn: 0.1 * voiceTime(t) });
  nameText(kernelName, KX, namesTop, {
    valign: "top",
    alpha: a * named(t, c.aCut + 0.1)
  });
  link(KX + 44 * 0.87, CY, CX - W / 2, CY, { alpha: a, flow: q });
  nameText(L("长期留下的", "For the long term"), CX, headBottom - labelSize(LABEL) * LEADING, {
    valign: "bottom",
    alpha: a * named(t, c.aCut + 0.15)
  });
  box(CX - W / 2, CY - H / 2, W, H, { stroke: P.ink, alpha: a, radius: 14, width: 2.5 });
  seal(CX - W / 2 + 60, CY, 36, { color: P.ink, alpha: a, stamp: a * ramp(t, c.att - 0.15, 0.4) });
  nameText(L("存证", "The attestation"), CX, headBottom, {
    valign: "bottom",
    alpha: a * named(t, c.att)
  });
  const fields = [c.who, c.scope];
  fieldNames2.forEach(
    (v, i) => nameText(v, CX - W / 2 + 120, CY - 28 + 56 * i, {
      align: "left",
      alpha: a * listIn(t, fields, i),
      set: "fields"
    })
  );
  const scope = a * ramp(t, c.scope - 0.15, 0.4), bottom = CY + H / 2 + 40;
  box(CX - W / 2 - 40, CY - H / 2 - 40, W + 80, H + 80, {
    stroke: P.ink,
    alpha: scope * 0.85,
    radius: 26,
    width: 2.5,
    dash: [9, 8]
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
  nameText(voidName, copyAt + 90 + dx, namesTop, {
    valign: "top",
    alpha: a * named(t, c.notCount)
  });
}

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
var STATION_NAMES = () => L(["弄清一个问题", "改动代码仓库", "用起来到底怎么样"], ["A problem", "A repository", "In use"]);
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
  const g = a * clearOfTitle(s, t, 330), open = g * ramp(t, c.first - 0.4, 0.4), xs = [560, 760, 960, 1160, 1360], LY = 430, LR = 40, Y3 = L(560, 600), X0 = (xs[0] + xs[1]) / 2, X1 = (xs[3] + xs[4]) / 2, lights = [c.w1, c.w2, c.w3, c.w4, c.w5], q = voiceTime(t) * 0.35 % 1;
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
  const drawn = soon(t, c.otherPath - 0.1, 0.9), reach = mix(X0 + 14, X1, drawn), on = a * ramp(t, c.otherPath - 0.15, 0.4);
  datumMark(X0, Y3, 14, on);
  line(X0 + 14, Y3, reach, Y3, { color: P.ink, alpha: on, width: 3 });
  dot(reach, Y3, 7, { color: P.ink, alpha: on });
  if (drawn >= 1) flowDot(mix(X0 + 14, X1, q), Y3, 6, q, { color: P.ink, alpha: on });
  nameText(L("另一条路", "A different path"), X1 + 7 + NAME_GAP, Y3, {
    align: "left",
    alpha: a * named(t, c.otherPath)
  });
  if (en)
    railNames(
      ["Evidence-grounded", "Trust", "Human-Agent", "Operational", "Stewardship"],
      xs,
      LY + LR,
      { gap: NAME_GAP, alpha: (i) => a * listIn(t, lights, i), set: "initials" }
    );
  else {
    nameText("几个英文词的首字母", 960, LY + LR + NAME_GAP, {
      valign: "top",
      alpha: a * named(t, c.initials)
    });
    nameText("人和 Agent 一起打理工作", 960, Y3 + 50, {
      valign: "top",
      alpha: a * named(t, c.gloss1)
    });
    nameText("信任要建立在证据上", 960, Y3 + 100, {
      valign: "top",
      alpha: a * named(t, c.gloss2)
    });
  }
}
var PATH_LEN = 1080;
var PROMISE_PITCH = 80;
function stagePath(t, a, c) {
  if (a <= 0) return;
  const PY = mix(560, 380, soon(t, c.three + 0.05, 0.7)), endName = L("一条靠得住的路", "One reliable path"), X0 = 960 - (PATH_LEN + 7 + NAME_GAP + measure(endName)) / 2, X1 = X0 + PATH_LEN, q = voiceTime(t) * 0.35 % 1, names = STATION_NAMES(), xs = railStations(names, X0 + 240, X1 - 60), sts = [c.st1, c.st2, c.st3];
  pathLine(
    X0,
    X1,
    PY,
    xs.filter((x, i) => t > sts[i] - 0.15),
    { alpha: a }
  );
  dot(X1, PY, 7, { color: P.ink, alpha: a });
  flowDot(mix(X0, X1, q), PY, 6, q, { color: P.ink, alpha: a });
  nameText(endName, X1 + 7 + NAME_GAP, PY, {
    align: "left",
    alpha: a * (en ? named(t, c.reliable) : ramp(t, c.reliable - 1.1, 0.4))
  });
  const TX = X0 + 40;
  person(TX, PY - 50, { size: 1.3, alpha: a });
  agent(TX + 64, PY - 44, { size: 1.1, alpha: a });
  nameText(L("人和可以互相替换的 Agent", "People and interchangeable Agents"), TX - 30, PY - 114, {
    valign: "bottom",
    align: "left",
    alpha: a * named(t, c.pCut + 0.15)
  });
  xs.forEach((x, i) => station(x, PY, i, a * ramp(t, sts[i] - 0.15, 0.4)));
  railNames(names, xs, PY + 28, {
    gap: NAME_GAP,
    alpha: (i) => a * listIn(t, sts, i),
    set: "stations"
  });
  const ps = [c.p1, c.p2, c.p3], edge = xs[0] - measure(names[0]) / 2, IX = edge + 22, rowY = (i) => PY + 185 + PROMISE_PITCH * i;
  ps.forEach((at, i) => {
    const on = a * ramp(t, at - 0.15, 0.4), y = rowY(i);
    if (on < 0.01) return;
    dot(IX, y, 22, { color: P.ground, alpha: on });
    ring(IX, y, 22, { color: P.ink, alpha: on, width: 2.5 });
    if (i === 0) check(IX, y + 1, 18, { color: P.ink, alpha: on, width: 3 });
    if (i === 1) text("?", IX, y + 1, 26, { role: "mark", align: "center", alpha: on, bold: true });
    if (i === 2) recoverIcon(IX, y, 11, { color: P.ink, alpha: on });
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
  const names = STATION_NAMES(), kernelName = L("光有这个内核", "The kernel alone"), deliveredName = L("已经走通", "Delivered"), base = railStations(names, 840, 1380), left = Math.min(600, 700 - measure(kernelName) / 2), right = Math.max(1440 + 7, base[2] + measure(names[2]) / 2, 1282 + measure(deliveredName) + 42), dx = 960 - (left + right) / 2;
  const PY = 430, X0 = 600 + dx, X1 = 1440 + dx, KX = 700 + dx, split = 800 + dx, xs = base.map((x) => x + dx);
  pathLine(X0, X1, PY, xs, { alpha: a, split });
  dot(X1, PY, 7, { color: P.ink, alpha: a });
  xs.forEach((x, i) => station(x, PY, i, a));
  railNames(names, xs, PY + 28, { gap: NAME_GAP, alpha: () => a, set: "aims stations" });
  nameText(L("设计目标", "Design aims"), (split + X1) / 2, PY - 28 - NAME_GAP, {
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
  rejectedName(deliveredName, 1260 + NAME_GAP + dx, 636, {
    align: "left",
    alpha: a * named(t, c.delivered),
    mark: ramp(t, c.delivered + 0.3, 0.4)
  });
}

// picture/film/scenes/p03/tools.js
function stageTools(t, a, c) {
  if (a <= 0) return;
  const KX = 960, KY = 420, KR = 36, q = voiceTime(t) * 0.4 % 1, turnTo = a * ramp(t, c.elseAt - 0.15, 0.4), tools = [
    [620, 640, 300, 190],
    [1300, 640, 260, 166]
  ];
  kernelIcon(KX, KY, KR, { alpha: a, color: P.ink, turn: 0.1 * voiceTime(t) });
  beats(t, KX, KY, KR + 16, [c.less], { alpha: a });
  nameText(L("ETHOS 自己的代码", "Its own code"), KX, KY - KR - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, c.tCut + 0.15)
  });
  nameText(L("内核这一件事", "The kernel's one job"), KX, KY + KR + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.oneJob)
  });
  nameText(L("就少得多", "Much less"), KX, KY + KR + NAME_GAP + 52, {
    valign: "top",
    alpha: a * named(t, c.less)
  });
  tools.forEach(([x, y, w, h], i) => {
    box(x - w / 2, y - h / 2, w, h, { stroke: P.ink, alpha: a, radius: 18, width: 2.5 });
    link(KX + (i ? 1 : -1) * KR * 0.87, KY, x, y - h / 2, {
      route: "hv",
      alpha: turnTo,
      upto: soon(t, c.elseAt + 0.05, 0.6),
      flow: (q + 0.5 * i) % 1
    });
  });
  const [gx, gy] = tools[0];
  stroke(
    () => {
      ctx.moveTo(gx - 70, gy - 30);
      ctx.lineTo(gx - 70, gy + 30);
      ctx.moveTo(gx - 70, gy + 8);
      ctx.quadraticCurveTo(gx - 70, gy - 16, gx - 40, gy - 20);
    },
    { color: P.ink, alpha: a, width: 3 }
  );
  const [fx, fy] = tools[1];
  stroke(
    () => [-32, 0, 32].forEach((dy, k) => {
      ctx.moveTo(fx - 80, fy + dy);
      ctx.lineTo(fx - 80 + [160, 110, 140][k], fy + dy);
    }),
    { color: P.muted, alpha: a * 0.8, width: 2.5 }
  );
  nameText("Git", gx + 20, gy, { alpha: a * named(t, c.git) });
  nameText(L("现成、成熟的工具", "Mature tools that already exist"), KX, 760, {
    valign: "top",
    alpha: a * named(t, c.mature)
  });
}
function stageSystems(t, a, c) {
  if (a <= 0) return;
  const KX = 960, KY = 480, KR = 40, W = L(300, 400), H = 84, spots = [
    [L(520, 470), 380],
    [L(1400, 1450), 380],
    [L(520, 470), 600],
    [L(1400, 1450), 600]
  ], ats = [c.sys1, c.sys2, c.sys3, c.sys4], q = voiceTime(t) * 0.4 % 1, joined = a * ramp(t, c.connect - 0.15, 0.4);
  nameText(L("原有的系统", "The systems you already have"), KX, 290, {
    alpha: a * named(t, c.sCut + 0.15)
  });
  kernelIcon(KX, KY, KR, { alpha: a, color: P.ink, turn: 0.1 * voiceTime(t) });
  nameText("ETHOS", KX, KY - KR - NAME_GAP, { valign: "bottom", alpha: a * named(t, c.sCut) });
  stroke(() => spots.forEach(([x, y]) => ctx.roundRect(x - W / 2, y - H / 2, W, H, 14)), {
    color: P.ink,
    alpha: a,
    width: 2.5
  });
  spots.forEach(([x, y], i) => {
    nameText(
      L(
        ["描述业务用的模型", "持续集成", "运行 Agent 的应用", "问题跟踪系统"],
        ["Business model", "Automated checks", "Apps your Agents run in", "Issue tracker"]
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
var REPO_WIDTHS = [220, 260, 300];
var REPO_GAP = 140;
function stageLayer(t, a, c) {
  if (a <= 0) return;
  const total = REPO_WIDTHS.reduce((sum, w) => sum + w, 0) + REPO_GAP * (REPO_WIDTHS.length - 1), x0 = 960 - total / 2, x1 = x0 + total, repos = REPO_WIDTHS.map((w, i) => [
    x0 + REPO_WIDTHS.slice(0, i).reduce((sum, v) => sum + v + REPO_GAP, 0) + w / 2,
    w
  ]), RH = 150, RY = 520, LY = RY + RH / 2 + 50, q = voiceTime(t) * 0.3 % 1;
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
  flowDot(mix(x0 + 30, x1 - 30, q), LY + 22, 6, q, { color: P.ink, alpha: a });
  nameText(L("共有的部分，归 ETHOS", "ETHOS owns in one place"), (x0 + x1) / 2, LY - 6, {
    alpha: a * named(t, c.owns)
  });
  const own = a * ramp(t, c.own - 0.15, 0.4), [[ax], [bx], [cx]] = repos;
  ring(ax + 26, RY + 10, 26, { color: P.ink, alpha: own, width: 3 });
  stroke(
    () => {
      ctx.moveTo(bx + 30, RY - 18);
      ctx.lineTo(bx + 58, RY + 30);
      ctx.lineTo(bx + 2, RY + 30);
      ctx.closePath();
    },
    { color: P.ink, alpha: own, width: 3 }
  );
  box(cx + 16, RY - 16, 48, 48, { stroke: P.ink, alpha: own, radius: 6, width: 3 });
  const term = [L("每个仓库", "Each repository")], qual = [L("自己特有的事", "its own purpose")], { height } = termRowLayout(term, qual, 520, false);
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
    initials: ["几个英文词的首字母", "Evidence-grounded"],
    w1: ["证据", "Evidence-grounded"],
    w2: ["信任", "Trust"],
    w3: ["人和 Agent", "Human-Agent"],
    w4: ["工作", "Operational"],
    w5: ["打理", "Stewardship"],
    gloss1: ["人和 Agent 一起打理工作", "Human-Agent"],
    gloss2: ["信任要建立在证据上", "Trust"],
    // 03.2 the path and its promises.
    pCut: ["它想给", "It aims"],
    travellers: ["人和可以互相替换的 Agent", "people and interchangeable Agents"],
    reliable: ["一条靠得住的路", "one reliable path"],
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
    kCut: ["这条路", "A small trust kernel"],
    kernel: ["很小的信任内核", "a small trust kernel"],
    inputs: ["三样东西", "three inputs"],
    in1: ["已经采纳的意图", "the intent"],
    in1q: ["已经采纳的意图", "that has been accepted"],
    in2: ["刚观察到的事实", "fresh facts"],
    in3: ["留下的存证", "attestations already on record"],
    rules: ["按固定的规则", "by fixed rules"],
    plan: ["一份计划", "a plan"],
    writeAt: ["真要写入的那一刻", "At the moment it writes"],
    check: ["再核对一遍", "checks again"],
    rec1: ["看到了什么", "what it observed"],
    rec2: ["判断了什么", "what it decided"],
    rec3: ["做了什么", "and what it did"],
    newAtt: ["新的存证", "new attestations"],
    // 03.4 lifetimes.
    lCut: ["这几样东西", "These things"],
    lifetimes: ["寿命不一样", "different lengths of time"],
    intent: ["意图写在", "Intent lives"],
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
    later: ["回头去查", "check it later"],
    outside: ["出了这个范围", "outside that scope"],
    notCount: ["就不算数", "does not count"],
    // 03.6 the tools it relies on.
    tCut: ["ETHOS 自己的代码", "ETHOS concentrates"],
    ownCode: ["ETHOS 自己的代码", "its own code"],
    oneJob: ["内核这一件事", "the kernel's one job"],
    elseAt: ["别的功能", "everything else"],
    mature: ["现成、成熟的工具", "mature tools that already exist"],
    git: ["Git", "Git"],
    less: ["就少得多", "much less"],
    // 03.7 the systems it leaves as they are, and what it owns in one place.
    sCut: ["ETHOS 也不接管", "ETHOS does not take over"],
    systems: ["原有的系统", "the systems you already have"],
    sys1: ["描述业务用的模型", "the model that describes your business"],
    sys2: ["持续集成", "automated checks"],
    sys3: ["运行 Agent 的应用", "the apps your Agents run in"],
    sys4: ["问题跟踪系统", "your issue tracker"],
    machine: ["自己的机器", "your own machine"],
    vendor: ["不依赖哪一家平台", "without depending on any one vendor"],
    connect: ["接进来的系统", "connecting a system"],
    truth: ["真相的来源", "a source of truth"],
    layerCut: ["所有仓库共有的部分", "What every repository shares"],
    // The layer is named on its own words; in English they follow the clause that opens the stage.
    owns: ["共有的部分", "ETHOS owns in one place"],
    each: ["每个仓库", "each repository"],
    own: ["自己特有的事", "its own purpose"],
    // 03.8 design aims.
    aimsCut: ["这些都是", "These are"],
    aims: ["设计目标", "design aims"],
    docs: ["它自己的文档", "its own documents"],
    alone: ["光有这个内核", "the kernel alone"],
    delivered: ["已经走通", "has been delivered"]
  });
  c.att = cueFrom(s, "只有存证", "the attestation", c.aCut);
  c.reader = cueFrom(s, "后来的人", "someone", c.aCut);
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
  if (flow !== null) {
    const q = flow, px = mix(feedX + r, storeX - storeW / 2, q);
    flowDot(px, y, 8 * Math.max(k, 0.6), q, { color: P.evidence, alpha });
  }
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
  const ends = end ? clamp((upto - 0.9) / 0.1) : 0;
  if (ends > 0)
    stroke(
      () => paths.forEach((points) => {
        const [x, y] = points.at(-1);
        ctx.moveTo(x + 2.25, y);
        ctx.arc(x, y, 2.25, 0, Math.PI * 2);
      }),
      { color, alpha: alpha * ends, width: 4.5 }
    );
  if (flow !== null)
    paths.forEach((points, k) => {
      const q = (flow + k / paths.length) % 1;
      if (q < upto) flowDot(...along(points, q).point, width + 2, q, { color, alpha });
    });
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
var QUOTE = () => L("按股票代码、日期去重", "Deduplicate by stock code and date");
var flowOf = (t) => voiceTime(t) * 0.42 % 1;
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
  const m = pipelineMark(960, 470, 900, { alpha: g, flow: flowOf(t) });
  nameText(L("一个例子", "One example"), 960, m.top - NAME_GAP, {
    valign: "bottom",
    alpha: g * named(t, c.example)
  });
  const idea = L("只为说明道理", "To show the idea"), refused = L("实测", "A measured case");
  const w1 = measure(idea), row = w1 + 80 + measure(refused) + 42, x1 = 960 - row / 2, y = m.bottom + NAME_GAP + 18;
  nameText(idea, x1, y, { align: "left", alpha: g * named(t, c.idea) });
  rejectedName(refused, x1 + w1 + 80, y, {
    align: "left",
    alpha: g * named(t, c.measured),
    mark: ramp(t, c.measured + 0.35, 0.35)
  });
}
function requestStage(s, t, c, g) {
  const Y3 = mix(470, 400, soon(t, c.researcher + 0.05, 0.6));
  const m = pipelineMark(960, Y3, 900, {
    alpha: g,
    flow: flowOf(t),
    back: soon(t, c.runAgain + 0.05, 0.6)
  });
  nameText(L("行情数据管线", "Market-data pipeline"), 960, m.top - NAME_GAP, {
    valign: "bottom",
    alpha: g * named(t, c.pipe)
  });
  nameText(L("可以再跑一遍", "Can be run again"), 960, m.loop + NAME_GAP, {
    valign: "top",
    alpha: g * named(t, c.runAgain)
  });
  const lines = REQUEST(), ats = [c.dup, c.corrected], lw = Math.max(...lines.map((v) => measure(v))), who = L("研究员", "A researcher"), figure = 1.55 * 15 * 1.2, nameHalf = measure(who) / 2, unit = Math.max(figure, nameHalf), lead = Math.max(figure + 36, nameHalf + 30), PX = 960 - (lead + lw - unit) / 2, RY = 690, on = g * named(t, c.researcher);
  person(PX, RY, { alpha: on, size: 1.2 });
  nameText(who, PX, RY + 28 + NAME_GAP, { valign: "top", alpha: on });
  lines.forEach(
    (v, i) => nameText(v, PX + lead, RY - 24 + i * 50, {
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
  const cw = requestWidth(), qw = quoteWidth(), x0 = 960 - (cw + 120 + 180 + 120 + qw) / 2, a1 = x0 + cw + 120, a2 = a1 + 180, qx = a2 + 120, [Y0, Y1, Y22, Y3] = [380, 465, 550, 640], h = g * named(t, c.handoffs);
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
  nameText(L("一个 Agent 写的总结", "An Agent's summary"), a2 + 22 + NAME_GAP, Y22, {
    align: "left",
    alpha: g * named(t, c.summary)
  });
  const path2 = [
    [x0 + cw, Y0],
    [a1, Y0],
    [a1, Y1],
    [a2, Y1],
    [a2, Y22]
  ], p = clamp((t - c.summary) / Math.max(0.8, c.single - c.summary - 0.1));
  if (p > 0 && p < 1)
    flowDot(...along(path2, p).point, p < 0.42 ? 12 : p < 0.75 ? 9 : 6, p, {
      color: P.ink,
      alpha: g
    });
  const q = g * named(t, c.single);
  link(a2, Y22 + 22, qx, Y3, { route: "vh", alpha: q, upto: soon(t, c.single + 0.05, 0.4) });
  quoteCard(qx, Y3, { alpha: q, words: g * named(t, c.quote) });
  nameText(L("只剩下一句", "A single line"), qx + qw / 2, Y3 + 32 + NAME_GAP, {
    valign: "top",
    alpha: q
  });
}
function deleteStage(s, t, c, g) {
  const TW = 560, TH = 226, keepName = L("最该留下的那些更正", "Corrections that had to stay"), room = soon(t, Math.min(c.corrections, c.deleted) - 0.1, 0.5), tx = 960 - (TW + room * (40 + measure(keepName))) / 2, ty = 420, qw = quoteWidth(), qy = 300;
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
  nameText(keepName, tx + TW + 40, ry + 3 * step, { align: "left", alpha: named2 });
  nameText(L("恰好会被删掉", "Would delete exactly"), tx + TW / 2, ty + TH + NAME_GAP, {
    valign: "top",
    alpha: g * named(t, c.deleted)
  });
}
function replaceStage(s, t, c, g) {
  const cw = requestWidth(), qw = quoteWidth(), gone = L("没人再回头看", "No one goes back"), takes = L("顶替了原话", "Takes the place"), col = Math.max(cw, qw), left = 960 - (col + 40 + Math.max(measure(gone), measure(takes))) / 2, start = 960 - (cw + 160 + qw) / 2;
  const step = soon(t, c.replace + 0.05, 0.6), take = soon(t, c.replace + 0.35, 0.7), fade = soon(t, c.noOne + 0.05, 1);
  const ox = mix(start, left + (col - cw) / 2, step), oy = mix(400, 670, step), qx = mix(start + cw + 160, left + (col - qw) / 2, take), qy = mix(560, 400, take);
  link(start + cw, 400, start + cw + 160 + qw / 2, 528, {
    route: "hv",
    alpha: g * (1 - ramp(t, c.replace - 0.15, 0.25)),
    flow: voiceTime(t) * 0.5 % 1
  });
  requestCard(ox, oy, { alpha: g * (1 - fade), ink: mix(1, 0.58, step), frame: g, dash: fade });
  nameText(L("原话", "Original words"), ox + cw / 2, oy + 54 + NAME_GAP, {
    valign: "top",
    alpha: g * named(t, c.original) * (1 - fade)
  });
  nameText(gone, ox + cw + 40, oy, { align: "left", alpha: g * named(t, c.noOne) });
  quoteCard(qx, qy, { alpha: g });
  nameText(takes, qx + qw + 40, qy, { align: "left", alpha: g * named(t, c.replace) });
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
    statement: L("用刚好够用的模型，留住原意", "Preserve meaning with the smallest model that is enough"),
    statementAt: c.statement,
    size: 560,
    glyph: { datum: 1, passages: 0, boundary: 0 },
    shares: { datum: on, hole: ramp(t, c.first4 - 0.05, 0.6), passages: 0, boundary: 0 },
    alpha: g
  });
  beats(t, h.mx, h.my, 26, [c.keep], { color: P.ink, alpha: g });
  return h.bottom;
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
  if (flowing > 0) {
    const q = voiceTime(t) * 0.5 % 1, path2 = [links[0][0], links[0][1], links[1][0], links[1][1]];
    flowDot(...along(path2, q).point, 6, q, { color: P.ink, alpha: a * flowing });
  }
}
var MODEL_PITCH = 450;
function modelStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const s2 = soon(t, c.big - 0.1, 0.5), s3 = soon(t, c.small + 0.05, 0.6), Y3 = 620, half = MODEL_PITCH / 2, under = rowNameTop([Y3 + 48, Y3 + 75, Y3 + 20]), xs = [960 - MODEL_PITCH, 960 - half * s2 + half * s3, 960 + half + half * s3], bigAt = c.big + 0.25, row = { alpha: g, align: "center" };
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
  const small = g * named(t, c.small), lost = soon(t, c.lost + 0.05, 0.9);
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
var CHANGE_W = 150;
var CHANGE_H = 240;
var fieldNames = () => L(
  ["要解决什么", "为什么要解决", "做到什么样才算解决"],
  ["What is to be solved", "Why", "What counts as solved"]
);
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
  const names = fieldNames(), nw = Math.max(...names.map((v) => measure(v))), DX = 960 - (190 + CHANGE_W + 90 + nw) / 2 + 190, DY = 440, FX = DX + CHANGE_W + 90, ats = [c.f1, c.f2, c.f3], into = soon(t, c.change + 0.05, 0.7), fields = ats.map((at) => ramp(t, at - 0.15, 0.4));
  changeDocument(DX, DY, { alpha: g * named(t, c.change), fields, intent: 0 });
  const ix = mix(DX - 190, DX + 52, into), iy = mix(DY + 150, DY + 26, into), meant = g * named(t, c.intent);
  documentIcon(ix, iy, 46, 58, { alpha: meant, rows: 2, fold: false });
  nameText(L("意图", "The intent"), DX - 190 + 23, DY + 150 + 58 + NAME_GAP, {
    valign: "top",
    alpha: meant * (1 - ramp(t, c.change + 0.05, 0.3))
  });
  termRow(
    t,
    L(["正式变更"], ["One official Change"]),
    [c.change],
    L(["只写在这一处"], ["only there"]),
    [c.only],
    DX + CHANGE_W / 2,
    DY + CHANGE_H + NAME_GAP,
    { alpha: g, align: "center" }
  );
  names.forEach((v, i) => {
    link(DX + CHANGE_W, fieldY(DY, i), FX - 14, fieldY(DY, i), {
      alpha: g * fields[i],
      upto: soon(t, ats[i] + 0.05, 0.4)
    });
    nameText(v, FX, fieldY(DY, i), { align: "left", alpha: g * listIn(t, ats, i), set: "fields" });
  });
}
function readersStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const DX = 960 - CHANGE_W / 2 - 60, DY = 440, RX = DX - 250, AY = 666, names = rowNameTop([AY + 22, DY + CHANGE_H]), who = g * named(t, c.readers), reading = g * named(t, c.same), q = voiceTime(t) * 0.5 % 1;
  changeDocument(DX, DY, { alpha: g });
  termRow(
    t,
    L(["正式变更"], ["The Change"]),
    [c.first5],
    L(["只写在一处"], ["one copy"]),
    [c.first5],
    DX + CHANGE_W / 2,
    names,
    { alpha: g, align: "center" }
  );
  person(RX, 540, { alpha: who, size: 1.1 });
  agent(RX, AY, { alpha: who });
  nameText(L("后面接手的人和 Agent", "Everyone who picks up the work"), RX, names, {
    valign: "top",
    width: 300,
    alpha: who
  });
  for (const [x, y, to, k] of [
    [RX + 34, DY + 90, DY + 90, 0],
    [RX + 26, AY, DY + 160, 0.5]
  ])
    link(x, y, DX, to, {
      route: "hvh",
      alpha: reading,
      upto: soon(t, c.same + 0.05, 0.5),
      flow: (q + k) % 1
    });
  nameText(L("读到的都是同一份", "Reads the same thing"), DX + CHANGE_W + NAME_GAP + 10, DY + 120, {
    align: "left",
    alpha: reading
  });
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
    L(["来考一考对它的理解"], ["test how it has been understood"]),
    [c.understood],
    960,
    bottom + 50,
    { alpha: g, align: "center" }
  ), em = labelSize(LABEL), Y3 = heading.bottom + 40 + em + NAME_GAP, X1 = 960 - 280, X2 = 960 + 280, vy = Y3 + 72, q = voiceTime(t) * 0.5 % 1;
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
  cross(X1 + EX_W / 2 + NAME_GAP + 12, vy, 20, { color: P.ink, alpha: gone, width: 3.5 });
  nameText(L("要去掉", "goes"), X1 + EX_W / 2 + NAME_GAP + 36, vy, { align: "left", alpha: gone });
  const two = g * named(t, c.correction), stays = g * named(t, c.stays);
  exampleCard(X2, Y3, true, two);
  termRow(
    t,
    L(["同一只股票的更正"], ["A correction"]),
    [c.correction],
    L(["同一天"], ["same stock, same day"]),
    [c.correction],
    X2,
    Y3 - NAME_GAP - em,
    { alpha: g, align: "center", inline: true }
  );
  check(X2 + EX_W / 2 + NAME_GAP + 12, vy, 22, { color: P.ink, alpha: stays });
  nameText(L("要留下", "stays"), X2 + EX_W / 2 + NAME_GAP + 36, vy, {
    align: "left",
    alpha: stays
  });
  const [v0, v1] = valueCell(X2 - EX_W / 2 + 34, EX_W - 68);
  beats(t, (v0 + v1) / 2, vy, 22, [c.saved], { alpha: g });
  const qy = Y3 + 280, qw = measure(QUOTE()) + 56, tried = g * named(t, c.quote2), draw = soon(t, c.quote2 + 0.05, 0.6);
  card(960 - qw / 2, qy - 32, qw, 64, { alpha: g, color: P.ink });
  nameText(QUOTE(), 960, qy, { alpha: g });
  linkSet(
    [
      [960 - qw / 2 + 40, qy - 32, X1, Y3 + EX_H, "vhv"],
      [960 + qw / 2 - 40, qy - 32, X2, Y3 + EX_H, "vhv"]
    ],
    { alpha: tried, upto: draw, flow: q }
  );
  const fails = g * named(t, c.fails), sy = (Y3 + EX_H + qy - 32) / 2;
  stopSign(X2, sy, 18, { color: P.ink, alpha: fails });
  nameText(L("过不了第二个例子", "Fails that second example"), X2 + 18 + NAME_GAP, sy, {
    align: "left",
    alpha: fails
  });
}
function constraintsStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const names = L(
    ["留下", "经授权明确排除", "标明还没解决"],
    ["Kept", "Excluded by an authorized decision", "Marked as unresolved"]
  ), kinds = ["pass", "cross", "unknown"], ats = [c.kept, c.excluded, c.unresolved], CW = 280, CH = 190, nw = Math.max(...names.map((v) => measure(v))), W = CW + 150 + 26 + NAME_GAP + nw, CX = 960 - W / 2, CY = 470, rows = [0, 1, 2].map((i) => CY + 50 + i * 45);
  card(CX, CY, CW, CH, { alpha: g });
  recordRows(CX + 36, rows[0], CW - 72, [0, 1, 2], { step: 45, alpha: g, color: P.ink });
  nameText(L("原话", "The original words"), CX + CW / 2, CY - NAME_GAP, {
    valign: "bottom",
    alpha: g
  });
  termRow(
    t,
    L(["每一条约束"], ["Every relevant constraint"]),
    [c.constraint],
    L(["都要有个交代"], ["accounted for"]),
    [c.accounted],
    CX + CW / 2,
    CY + CH + NAME_GAP,
    { alpha: g, align: "center" }
  );
  const MX = CX + CW + 150;
  names.forEach((v, i) => {
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
function compileStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const Y3 = 580, xs = [430, 784, 1138, 1492], mid = (xs[0] + xs[3]) / 2, under = Y3 + 64 + NAME_GAP, over = Y3 - 64 - NAME_GAP, q = voiceTime(t) * 0.45 % 1;
  const meant = g * named(t, c.interpretation);
  documentIcon(xs[0] - 50, Y3 - 64, 100, 128, { alpha: meant, rows: 3 });
  verdictMark("unknown", xs[0] + 78, Y3 - 72, 20, { alpha: meant });
  const names = [
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
  names.push(
    nameText(L("人确认过、采纳了", "Confirmed and accepted"), xs[1], under, {
      valign: "top",
      width: 260,
      alpha: who
    })
  );
  link(xs[0] + 70, Y3, xs[1] - 44, Y3, { alpha: who });
  const rules = g * named(t, c.compiled);
  kernelIcon(xs[2], Y3, 50, {
    alpha: rules,
    color: P.ink,
    beat: ramp(t, c.compiled, 0.3) * (1 - ramp(t, c.compiled + 0.6, 0.4))
  });
  link(xs[1] + 44, Y3, xs[2] - 52, Y3, { alpha: rules, flow: q });
  names.push(
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
  link(xs[2] + 52, Y3, xs[3] - 40, Y3, { alpha: made });
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
  names.push(nameText(L("检查", "Checks"), xs[3], under, { valign: "top", alpha: made }));
  nameText(L("同样的输入", "The same input"), mid, over, {
    valign: "bottom",
    alpha: g * named(t, c.sameInput)
  });
  nameText(L("同样的检查", "The same checks"), xs[3], over, {
    valign: "bottom",
    alpha: g * named(t, c.sameChecks)
  });
  const refused = g * named(t, c.cannot), ry = Math.max(...names.map((v) => v.bottom)) + 47;
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
function leadsStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const names = L(["对话", "记忆", "总结"], ["Conversations", "Memories", "Summaries"]), ats = [c.talk, c.memory, c.summaries], xs = [960 - 300, 960, 960 + 300], Y3 = 620, back = mix(1, 0.58, soon(t, c.leads + 0.05, 0.5));
  ats.forEach((at, i) => {
    const on = g * ramp(t, at - 0.15, 0.4) * back;
    if (i === 0) bubble(xs[i], Y3, 40, { alpha: on, color: P.ink });
    else if (i === 1) layersIcon(xs[i], Y3, 110, 90, { alpha: on });
    else documentIcon(xs[i] - 40, Y3 - 52, 80, 104, { alpha: on, rows: 3 });
    nameText(names[i], xs[i], Y3 + 52 + NAME_GAP, {
      valign: "top",
      alpha: g * listIn(t, ats, i) * back,
      set: "leads"
    });
  });
  nameText(L("只能当线索", "Only leads"), 960, Y3 - 52 - NAME_GAP - 20, {
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
    single: cue(s, "只剩下一句", "a single line"),
    quote: cue(s, "按股票代码和日期去重", "Deduplicate by stock code and date"),
    follow: cue(s, "照这句话去做", "Followed to the letter"),
    corrections: cue(s, "最该留下的那些更正", "the corrections that had to stay"),
    deleted: cue(s, "恰好会被删掉", "would delete exactly"),
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
    same: cue(s, "读到的都是同一份", "reads the same thing"),
    first5b: cue(s, "还要拿正例和反例", "Then positive and negative"),
    examples: cue(s, "正例和反例", "positive and negative examples"),
    understood: cue(s, "来考一考对它的理解", "test how it has been understood"),
    exact: cue(s, "一模一样的重复", "An exact repeat"),
    correction: cue(s, "同一天", "A correction to the same stock"),
    fails: cue(s, "过不了第二个例子", "fails that second example"),
    saved: cue(s, "保住了", "saved"),
    first6: cue(s, "原话里相关的每一条约束", "Every relevant constraint"),
    constraint: cue(s, "每一条约束", "Every relevant constraint"),
    accounted: cue(s, "都要有个交代", "accounted for"),
    kept: cue(s, "要么留下", "kept excluded"),
    excluded: cue(s, "经授权明确排除", "excluded by an authorized decision"),
    unresolved: cue(s, "标明还没解决", "marked as unresolved"),
    first6b: cue(s, "理解随时可以被质疑", "The interpretation always"),
    interpretation: cue(s, "理解随时", "The interpretation"),
    challenge: cue(s, "可以被质疑", "open to challenge"),
    confirmed: cue(s, "人确认过", "a person has confirmed"),
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
    leads: cue(s, "只能当线索", "only leads")
  };
  c.goes = cueFrom(s, "要去掉", "goes", c.exact);
  c.stays = cueFrom(s, "要留下", "stays", c.correction);
  c.quote2 = cueFrom(s, "按股票代码和日期去重", "Deduplicate by stock code and date", c.correction);
  c.summaries = cueFrom(s, "总结", "summaries", c.memory);
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
  if (Math.abs(ay - py) < 1) link(ax + 22, ay, edge.left, py, { alpha, flow });
  else link(ax, ay - 22, edge.left, py, { route: "vh", alpha, flow });
  return edge;
}
function claimAt(t, c) {
  const w = claimWidth(), rise = soon(t, c.local + 0.05, 0.7), gap = mix(560, 260, rise), ax = 960 - (w + gap) / 2;
  return { ax, ay: mix(600, 214, rise), px: ax + gap + w / 2, py: mix(420, 214, rise), rise };
}
function apartStage(s, t, c, g) {
  const { ax, ay, px, py, rise } = claimAt(t, c), under = py + CLAIM_H / 2 + NAME_GAP;
  claimRow(t, ax, ay, px, py, {
    alpha: g,
    flow: voiceTime(t) * 0.4 % 1,
    // The Agent's name keeps its gap under the Agent while it rises and joins the panel's line as the two come level.
    nameTop: Math.max(ay + 22, mix(ay + 22, py + CLAIM_H / 2, rise)) + NAME_GAP
  });
  const ats = [c.local + 0.35, c.ci, c.release, c.use, c.benefit], stateAts = [c.passed, c.noResult, c.release, c.use, c.noObs], x = 960 - PLANE_W / 2, top = PLANES_TOP + building(t, ats, PLANE_STEP, 0.15);
  termRow(
    t,
    L(["按 ETHOS 的规则"], ["By ETHOS's rules"]),
    [c.first2],
    L(["拆开来看"], ["taken apart"]),
    [c.apart],
    px,
    under,
    { alpha: g, align: "center" }
  );
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

// picture/film/scenes/p05/rule-two.js
var TOP = PLANES_TOP;
var ASIDE = 400;
var rowOf = (top, i) => top + i * PLANE_STEP + PLANE_H / 2;
var outcomeNames = () => L(["通过", "拦下", "未知"], ["Pass", "Block", "Unknown"]);
var outcomeQuals = () => L(
  [["允许动手"], ["有冲突，或者明确失败"], ["缺了，或者没法核实"]],
  [["lets work go ahead"], ["a conflict or an explicit failure"], ["missing or unverifiable"]]
);
function outcomesX() {
  const widest = (list) => Math.max(...list.map((v) => measure(v, LABEL))), width = PLANE_W + 80 + 18 + NAME_GAP + widest(outcomeNames()) + TERM_GAP + widest(outcomeQuals().map((q) => q.join("")));
  return 960 - width / 2;
}
function ruleTwoHeading(t, c, g) {
  ruleHeading(t, {
    number: L("第二条准则", "Rule two"),
    numberAt: c.first3,
    statement: L("只在影响行动的地方做区分", "Distinguish only what changes action"),
    statementAt: c.statement,
    size: 560,
    glyph: { datum: 1, passages: 1, boundary: 0 },
    shares: { datum: g, hole: 1, passages: soon(t, c.statement + 0.05, 1.1), boundary: 0 },
    alpha: g
  });
}
function separateStage(s, t, c, g) {
  ruleTwoHeading(t, c, g);
  const x = mix(960 - PLANE_W / 2, ASIDE, soon(t, c.nextStep + 0.05, 0.7)), nx = x + PLANE_W, reach = [80, 130, 180, 230, 280], steps = g * named(t, c.nextStep), q = voiceTime(t) * 0.45 % 1;
  planeStack(t, x, TOP, { alpha: g });
  nameText(L("各自独立的证据", "Separate planes of evidence"), x, TOP - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: g * named(t, c.separate)
  });
  linkSet(
    reach.map((d, i) => [nx, rowOf(TOP, i), nx + d - 12, rowOf(TOP, i), "hv"]),
    { alpha: steps, upto: soon(t, c.nextStep + 0.05, 0.6), flow: q, end: false }
  );
  stroke(
    () => reach.forEach((d, i) => {
      ctx.moveTo(nx + d + 12, rowOf(TOP, i));
      ctx.arc(nx + d, rowOf(TOP, i), 12, 0, Math.PI * 2);
    }),
    { color: P.ink, alpha: steps * ramp(t, c.nextStep + 0.3, 0.3), width: 2.5 }
  );
  dot(nx + reach[0], rowOf(TOP, 0), 6, {
    color: P.ink,
    alpha: steps * ramp(t, c.nextStep + 0.6, 0.3)
  });
  nameText(L("下一步都不一样", "A different next step"), nx + 40, TOP - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: steps
  });
}
function verifiedStage(s, t, c, g) {
  ruleTwoHeading(t, c, g);
  const one = rowOf(TOP, 0);
  planeStack(t, ASIDE, TOP, { alpha: g });
  beats(t, ASIDE + PLANE_W - 36, one, 24, [c.first3b], { alpha: g });
  rejectedName(
    L("另一样也通过", "Another has passed"),
    ASIDE + PLANE_W / 2,
    TOP + 5 * PLANE_STEP + 18,
    { alpha: g * named(t, c.another), mark: ramp(t, c.another + 0.35, 0.35) }
  );
  const PX = 1400, PY = rowOf(TOP, 2), edge = claimPanel(t, PX, PY, { alpha: g }), verified = g * named(t, c.verified);
  beats(t, edge.right, PY, 20, [c.saysDone], { alpha: g });
  link(edge.left, PY, ASIDE + PLANE_W, one, {
    route: "hvh",
    alpha: g * named(t, c.tell),
    upto: soon(t, c.tell + 0.05, 0.6),
    flow: voiceTime(t) * 0.45 % 1
  });
  nameText(L("实际确认过的", "Verified this time"), PX, edge.bottom + NAME_GAP, {
    valign: "top",
    alpha: verified
  });
}
function outcomesStage(s, t, c, g) {
  const settle = soon(t, c.first4 + 0.05, 0.7), top = mix(TOP, 340, settle), x = mix(ASIDE, outcomesX(), settle), LX = x + PLANE_W + 80, em = labelSize(LABEL), names = outcomeNames(), quals = outcomeQuals(), kinds = ["pass", "block", "unknown"], ats = [c.pass, c.block, c.unknown], qualAts = [c.ahead, c.conflict, c.missing], ys = [1, 2, 3].map((i) => rowOf(top, i)), qualLeft = LX + 18 + NAME_GAP + Math.max(...names.map((v) => measure(v, LABEL))) + TERM_GAP;
  planeStack(t, x, top, { alpha: g });
  termRow(
    t,
    L(["一次判断的结果"], ["A judgment"]),
    [c.first4],
    L(["只分三种"], ["only three outcomes"]),
    [c.three],
    LX - 18,
    rowOf(top, 0) - em / 2,
    { alpha: g, width: 1824 - LX }
  );
  const restated = [[c.onlyPass], [c.isBlock], [c.isUnknownToo]];
  ats.forEach((at, i) => {
    verdictMark(kinds[i], LX, ys[i], 18, { alpha: g * ramp(t, at - 0.15, 0.4) });
    beats(t, LX, ys[i], 26, restated[i], { alpha: g });
    termRow(t, [names[i]], [at], quals[i], [qualAts[i]], LX + 18 + NAME_GAP, ys[i] - em / 2, {
      alpha: g * listLevel(t, ats, i),
      set: "outcomes",
      width: 1800 - LX,
      qualLeft
    });
  });
  nameText(L("不等于可以", "Never permission"), LX + 18 + NAME_GAP, rowOf(top, 4), {
    align: "left",
    alpha: g * named(t, c.never)
  });
  const two = rowOf(top, 1), example = g * named(t, c.isUnknown);
  beats(t, x + PLANE_W - 36, two, 22, [c.example, c.notYet], { alpha: g });
  link(x + PLANE_W, two, LX - 26, ys[2], {
    route: "hvh",
    alpha: example,
    upto: soon(t, c.isUnknown + 0.05, 0.5),
    flow: voiceTime(t) * 0.45 % 1
  });
  rejectedName(L("没有问题", "No problem"), x + PLANE_W / 2, top + 5 * PLANE_STEP + 18, {
    alpha: g * named(t, c.noProblem),
    mark: ramp(t, c.noProblem + 0.35, 0.35)
  });
}
function refusedStage(s, t, c, g) {
  const settle = soon(t, c.first5 + 0.05, 0.7), top = mix(340, 320, settle), x = mix(outcomesX(), 480, settle), sy = top + 5 * PLANE_STEP, offered = g * named(t, c.distinction), refused = soon(t, c.never2 + 0.05, 0.5);
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
  nameText(L("真正要紧的那几个", "The ones that matter"), bx + NAME_GAP, rowOf(top, 2), {
    align: "left",
    alpha: matter
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
    noObs: cue(s, "一点观察都还没有", "no observation at all"),
    first3: cue(s, "这就是第二条准则", "That is rule two"),
    statement: cue(s, "只在影响行动的地方做区分", "distinguish only what changes action"),
    separate: cue(s, "各自独立的证据", "separate planes of evidence"),
    nextStep: cue(s, "允许做的下一步都不一样", "permits a different next step"),
    first3b: cue(s, "其中一样通过了", "One of them passing"),
    another: cue(s, "推不出另一样也通过", "never means another has passed"),
    verified: cue(s, "实际确认过的", "were verified this time"),
    saysDone: cue(s, "所以说做完了", "says done"),
    tell: cue(s, "要讲明", "they need to say"),
    first4: cue(s, "一次判断的结果", "A judgment too"),
    three: cue(s, "只分三种", "only three outcomes"),
    block: cue(s, "拦下", "block and unknown"),
    unknown: cue(s, "未知", "unknown"),
    missing: cue(s, "缺了", "Missing or unverifiable"),
    conflict: cue(s, "有冲突", "a conflict or an explicit failure"),
    isUnknownToo: cue(s, "结果是未知", "make it unknown"),
    isBlock: cue(s, "结果是拦下", "makes it block"),
    onlyPass: cue(s, "只有通过", "Only pass"),
    ahead: cue(s, "才允许动手", "lets the work go ahead"),
    never: cue(s, "从来不等于可以", "never permission"),
    example: cue(s, "比如 GitLab 和 GitHub 上的检查", "Take the checks on GitLab"),
    isUnknown: cue(s, "这一项就是未知", "their result is unknown"),
    noProblem: cue(s, "不能算作没有问题", "does not count as no problem"),
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
  const A = stageOut(t, c.first3), G1 = stageIn(t, c.first3) * stageOut(t, c.first3b), G2 = stageIn(t, c.first3b) * stageOut(t, c.first4), H = stageIn(t, c.first4) * stageOut(t, c.first5), I = stageIn(t, c.first5);
  if (A > 0) apartStage(s, t, c, A);
  if (G1 > 0) separateStage(s, t, c, G1);
  if (G2 > 0) verifiedStage(s, t, c, G2);
  if (H > 0) outcomesStage(s, t, c, H);
  if (I > 0) refusedStage(s, t, c, I);
  illustrative(A);
};

// picture/film/scenes/p06/authority.js
var FULL = { datum: 1, passages: 1, boundary: 1 };
var flowOf2 = (t) => voiceTime(t) * 0.4 % 1;
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
    statementAt: c.statement,
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
var PANEL_LEFT = -120;
var VIEWS = () => L(
  ["摘要", "看板", "状态输出", "Agent 的汇报"],
  ["Summaries", "Dashboards", "Status output", "An Agent's report"]
);
var GREEN = () => L(["那片绿灯"], ["that green dashboard"]);
var openingOf = (size) => 0.82 * 164 * (size / 512);
function viewsPlace() {
  const e = markExtent(VIEWS_SIZE, FULL), widths = VIEWS().map(
    (v, i) => measure(v) + (i === 1 ? TERM_GAP + measure(GREEN()[0], NOTE) : 0)
  ), right = openingOf(VIEWS_SIZE) + VIEW_RUN + Math.max(VIEW_TEXT + Math.max(...widths), PANEL_LEFT + claimWidth());
  return { x: 960 - (e.left + right) / 2, y: VIEWS_Y, size: VIEWS_SIZE };
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
    "The accepted Change",
    "Fresh facts",
    "The applicable policy",
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
    boundary: soon(t, c.statement + 0.05, 1.2),
    alpha: g
  });
  beats(t, x, y, 21 * k, [c.inEthos], { alpha: g });
  nameText(L("权威依据", "Authority"), x - 14 * k - NAME_GAP, y, {
    align: "right",
    alpha: g * named(t, c.authority)
  });
}
function authorityStage(s, t, c, g) {
  ruleThreeHeading(t, c, g);
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
function views(t, c, g, place, { only = null, flow = null, linked = true } = {}) {
  const ats = c.views, names = VIEWS(), v = viewsOf(place), set = only === null ? "views" : "view";
  names.forEach((name, i) => {
    if (only !== null && only !== i) return;
    const on = g * ramp(t, ats[i] - 0.15, 0.4);
    if (linked)
      link(v.open - 40, place.y, v.vx - 36, v.ys[i], {
        route: "hvh",
        mid: v.open + 60,
        alpha: on,
        flow: flow === null ? null : (flow + i * 0.25) % 1
      });
    viewIcon(i, v.vx, v.ys[i], on);
    if (i === 1)
      termRow(t, [name], [ats[i]], GREEN(), [c.thatGreen], v.text, v.ys[i] - labelSize(LABEL) / 2, {
        alpha: g * (only === null ? listLevel(t, ats, i) : 1),
        set,
        width: 1800 - v.text
      });
    else
      nameText(name, v.text, v.ys[i], {
        align: "left",
        alpha: g * listIn(t, ats, i),
        set
      });
  });
}
function viewsStage(s, t, c, g) {
  const place = viewsPlace(), v = viewsOf(place);
  boundaryMark(t, c, g, place);
  views(t, c, g, place, { flow: ramp(t, c.derived, 0.4) > 0.5 ? flowOf2(t) : null });
  nameText(L("给人看的视图", "Views"), v.vx - 32, v.ys[0] - 40 - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: g * named(t, c.areViews)
  });
  const report = g * named(t, c.sentence), py = v.ys[3] + 95, panel = claimPanel(t, v.vx + PANEL_LEFT + claimWidth() / 2, py, { alpha: report });
  link(v.vx, v.ys[3] + 26, v.vx, panel.top, { alpha: report });
  beats(t, v.vx, v.ys[3], 34, [c.suchReport], { alpha: g });
}
var BSTEP = 70;
function branchOf({ x, y }) {
  const bx = x - 180;
  return { bx, by: y - 126, end: bx + 4 * BSTEP, mid: bx + 2 * BSTEP };
}
function innerBranch(t, c, g, place, moved, { named: says = true } = {}) {
  const b = branchOf(place);
  commitRow(b.bx, BSTEP, b.by, 4, { alpha: g, single: true });
  stroke(
    () => {
      ctx.moveTo(b.bx + 3 * BSTEP + 9, b.by);
      ctx.lineTo(mix(b.bx + 3 * BSTEP + 9, b.end - 9, moved), b.by);
    },
    { color: P.ink, alpha: g * ramp(moved, 0, 0.1), width: 2.5 }
  );
  commitDot(b.end, b.by, { alpha: g * ramp(moved, 0.6, 0.4) });
  if (says)
    nameText(L("情况可能又变了", "Things can change"), b.mid, b.by - 22 - NAME_GAP + 8, {
      valign: "bottom",
      alpha: g * named(t, c.change)
    });
}
function staleViewStage(s, t, c, g) {
  const place = viewsPlace(), v = viewsOf(place);
  boundaryMark(t, c, g, place);
  views(t, c, g, place, { only: 1, flow: flowOf2(t) });
  nameText(L("视图算出来以后", "Computed"), v.text, v.ys[1] - 46, {
    align: "left",
    alpha: g * named(t, c.first5)
  });
  innerBranch(t, c, g, place, soon(t, c.change + 0.05, 0.7));
  beats(t, v.vx, v.ys[1], 36, [c.notShown, c.turnedGreen], { alpha: g });
  nameText(L("看不出来", "Without the view showing it"), v.text, v.ys[1] + 46, {
    align: "left",
    alpha: g * named(t, c.notShown)
  });
}
function notAuthorityStage(s, t, c, g) {
  const place = viewsPlace(), v = viewsOf(place), b = branchOf(place);
  boundaryMark(t, c, g, place);
  views(t, c, g, place, { only: 1, linked: false });
  innerBranch(t, c, g, place, 1, { named: false });
  nameText(L("帮人看清楚", "Helps people see"), v.text, v.ys[1] - 46, {
    align: "left",
    alpha: g * named(t, c.first5b)
  });
  const refused = g * named(t, c.never), reach = mix(0.45, 1, soon(t, c.act + 0.05, 0.9)) * soon(t, c.never + 0.05, 0.5), counts = L("当权威依据", "Counts as authority"), room = v.vx - 30 - 20 - v.open, mouth = v.open + room / 2;
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
  nameText(
    L("覆盖掉别人的工作", "Overwrite someone else's work"),
    b.mid,
    b.by - 22 - NAME_GAP + 8,
    {
      valign: "bottom",
      size: NOTE,
      width: 260,
      alpha: over
    }
  );
  const stop = g * named(t, c.cannotPass);
  growName(
    t,
    L(["不明确，", "或者已经过时"], ["Ambiguous", " or stale"]),
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
var flowOf3 = (t) => voiceTime(t) * 0.4 % 1;
function exampleContext(t, c, g, settle = 1) {
  const m = pipelineMark(mix(1110, 1e3, settle), mix(Y, 222, settle), mix(700, 400, settle), {
    alpha: g,
    flow: flowOf3(t)
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
  const a = g * ramp(t, c.agent - 0.25, 0.3);
  agents([[AX, Y]], { alpha: a });
  nameText(L("另一个 Agent", "A second Agent"), AX - 22 - NAME_GAP, Y, {
    align: "right",
    alpha: a
  });
  return a;
}
function branch(t, g, { moved = 0, nameAlpha = g } = {}) {
  commitRow(BRANCH_X, STEP, Y, 4, { alpha: g, single: true });
  nameText(L("分支", "The branch"), BRANCH_X + 1.5 * STEP, ROW_NAMES, {
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
  commitDot(NEW, Y, { alpha: g * ramp(moved, 0.5, 0.4) });
}
var plan = (a) => documentIcon(PLAN_X - 48, Y - 60, 96, 120, { alpha: a, rows: 3 });
function staleStage(s, t, c, g) {
  exampleContext(t, c, g, soon(t, c.remembers + 0.05, 0.8));
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
  link(AX, Y + 22, 560, DY, { route: "vh", alpha: board });
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
  branch(t, real, { moved: soon(t, c.changed + 0.05, 0.8) });
  nameText(L("别人可能已经改过了", "May have changed"), NEW + 20, Y - 22 - NAME_GAP, {
    align: "right",
    valign: "bottom",
    alpha: changed
  });
}
function checkStage(s, t, c, g) {
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
  const p = clamp((t - c.first1b - 0.1) / 0.5);
  if (p > 0 && p < 1) dot(mix(PLAN_X + 48, GATE_X - 36, p), Y, 9, { color: P.ink, alpha: g });
  branch(t, g, { moved: 1 });
  const look = g * named(t, c.checks);
  link(GATE_X, Y - 75, HEAD, Y - 22, {
    route: "hv",
    alpha: look,
    dash: [8, 9],
    upto: soon(t, c.checks + 0.05, 0.6)
  });
  nameText(L("ETHOS 又核对了一遍", "ETHOS checks again"), GATE_X + 20, Y - 75 - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: look
  });
  const moving = soon(t, c.movedOn + 0.05, 0.6);
  ring(mix(HEAD, NEW, moving), Y, 18, { color: P.ink, alpha: look, width: 2.5 });
  nameText(L("往前走了", "Moved on"), NEW + 30, ROW_NAMES, {
    align: "right",
    valign: "top",
    alpha: g * named(t, c.movedOn)
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
    flow: flowOf3(t)
  });
  nameText(L("刚观察到的事实", "Fresh facts"), (PLAN_X + NEW) / 2, 340 - NAME_GAP + 6, {
    valign: "bottom",
    alpha: fresh
  });
}
var GX = 700;
var BX = 860;
var BSTEP2 = 110;
function oneStepStage(s, t, c, g) {
  const names = rowNameTop([Y + 100, Y + 22]);
  card(GX - 70, Y - 100, 140, 200, { alpha: g, color: P.ink });
  writeGate(GX, Y, 150, {
    alpha: g,
    color: P.ink,
    single: true,
    open: soon(t, c.afterwards + 0.05, 0.6)
  });
  termRow(
    t,
    L(["核对和写入"], ["Checking and writing"]),
    [c.first2],
    L(["一步完成"], ["as one step"]),
    [c.oneStep],
    GX,
    names,
    { alpha: g, align: "center" }
  );
  commitRow(BX, BSTEP2, Y, 5, { alpha: g, single: true });
  link(GX + 70, Y, BX - 9, Y, { alpha: g });
  nameText(L("分支", "The branch"), BX + 2 * BSTEP2, names, { valign: "top", alpha: g });
  const wrote = soon(t, c.afterwards + 0.3, 0.6), end = BX + 5 * BSTEP2;
  stroke(
    () => {
      ctx.moveTo(BX + 4 * BSTEP2 + 9, Y);
      ctx.lineTo(mix(BX + 4 * BSTEP2 + 9, end - 9, wrote), Y);
    },
    { color: P.ink, alpha: g * ramp(wrote, 0, 0.1), width: 2.5 }
  );
  commitDot(end, Y, { alpha: g * ramp(wrote, 0.6, 0.4), picked: g * ramp(wrote, 0.6, 0.4) });
  const back = g * named(t, c.readBack);
  link(end, Y - 30, GX, Y - 100, {
    route: "vhv",
    mid: 330,
    alpha: back,
    upto: soon(t, c.readBack + 0.05, 0.8),
    flow: flowOf3(t)
  });
  planeState("pass", GX, 330, back * ramp(t, c.confirm - 0.15, 0.4));
  nameText(L("读回来确认", "Read back to confirm"), (GX + end) / 2, 330 - NAME_GAP, {
    valign: "bottom",
    alpha: back
  });
}
function platformsStage(s, t, c, g) {
  const VX = 540, LX = 1420, PW = 330, PX = (VX + LX) / 2 - PW / 2, ys = [Y - 130, Y, Y + 130], states = ["pass", "block", "none"], names = L(["成功", "失败", "还没推"], ["Succeeded", "Failed", "Still pending"]), ats = [c.succeeded, c.failed, c.pending], ends = rowNameTop([Y + 26, Y + 65]);
  const version = g * named(t, c.version);
  tagIcon(VX - 60, Y, 120, 52, { alpha: version, color: P.ink });
  nameText(L("一个版本", "A version"), VX, ends, { valign: "top", alpha: version });
  const several = g * named(t, c.several);
  nameText(L("几个平台", "Several platforms"), PX + PW / 2, ys[0] - 30 - NAME_GAP, {
    valign: "bottom",
    alpha: several
  });
  linkSet(
    ys.map((y) => [VX + 60, Y, PX, y, "hvh"]),
    { alpha: several, upto: soon(t, c.several + 0.05, 0.5) }
  );
  stroke(() => ys.forEach((y) => ctx.roundRect(PX, y - 30, PW, 60, 12)), {
    color: P.line,
    alpha: several,
    width: 2.5
  });
  ats.forEach((at, i) => {
    const on = g * ramp(t, at - 0.15, 0.4);
    if (states[i] === "block") stopSign(PX + PW - 36, ys[i], 15, { color: P.ink, alpha: on });
    else planeState(states[i], PX + PW - 36, ys[i], on);
    nameText(names[i], PX + 24, ys[i], {
      align: "left",
      alpha: g * listIn(t, ats, i),
      set: "platforms"
    });
  });
  const kept = g * named(t, c.recorded);
  linkSet(
    ys.map((y) => [PX + PW, y, LX - 56, Y, "hvh"]),
    { alpha: kept, upto: soon(t, c.recorded + 0.05, 0.6), flow: flowOf3(t) }
  );
  ledger(LX, Y, 100, 130, { alpha: kept });
  nameText(L("照实记下", "All recorded"), LX, ends, { valign: "top", alpha: kept });
  rejectedName(
    L("同时成功、同时失败", "All succeed or fail together"),
    PX + PW / 2,
    ys[2] + 30 + 70,
    {
      alpha: g * named(t, c.together),
      mark: ramp(t, c.together + 0.35, 0.35)
    }
  );
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
    together: cue(s, "同时成功", "succeed or fail together"),
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
    change: cue(s, "情况可能又变了", "things can change"),
    notShown: cue(s, "视图上却看不出来", "without the view showing it"),
    turnedGreen: cue(s, "那片绿灯亮起来的时候", "that dashboard turned green"),
    first5b: cue(s, "视图帮人看清楚", "A view helps people see"),
    never: cue(s, "可不能拿它当权威依据", "but it never counts as authority"),
    act: cue(s, "照着视图去改东西", "Acting on what a view shows"),
    overwrite: cue(s, "覆盖掉别人的工作", "overwrite someone else's work"),
    ambiguous: cue(s, "权威依据不明确", "When authority is ambiguous"),
    stale: cue(s, "或者条件已经过时", "or a condition has gone stale"),
    cannotPass: cue(s, "判断就不能通过", "the judgment cannot pass")
  };
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
  const J1 = stageOut(t, c.first1b), J2 = stageIn(t, c.first1b) * stageOut(t, c.first2), K1 = stageIn(t, c.first2) * stageOut(t, c.first2b), K2 = stageIn(t, c.first2b) * stageOut(t, c.first3), L3 = stageIn(t, c.first3) * stageOut(t, c.first4), M4 = stageIn(t, c.first4) * stageOut(t, c.first5), N1 = stageIn(t, c.first5) * stageOut(t, c.first5b), N2 = stageIn(t, c.first5b);
  if (J1 > 0) staleStage(s, t, c, J1);
  if (J2 > 0) checkStage(s, t, c, J2);
  if (K1 > 0) oneStepStage(s, t, c, K1);
  if (K2 > 0) platformsStage(s, t, c, K2);
  if (L3 > 0) authorityStage(s, t, c, L3);
  if (M4 > 0) viewsStage(s, t, c, M4);
  if (N1 > 0) staleViewStage(s, t, c, N1);
  if (N2 > 0) notAuthorityStage(s, t, c, N2);
  illustrative(J1 + J2 + K1 + K2);
};

// picture/film/scenes/p07/example.js
var R1 = 370;
var R2 = 620;
var SCRIPT = [200, 120];
var SHEET = [120, 160];
var OWNER = [170, 120];
var LIST = [140, 170];
function taskList(x, y, w, h, { alpha = 1, rows = 4, done = 0, tick = 1, last = tick } = {}) {
  if (alpha < 0.01) return;
  documentIcon(x - w / 2, y - h / 2, w, h, { alpha, rows: 0 });
  const ys = Array.from(
    { length: rows },
    (_, i) => y - h / 2 + h * (0.3 + 0.55 * i / (rows - 1))
  );
  stroke(
    () => ys.forEach((ry) => {
      ctx.roundRect(x - w * 0.32, ry - 7, 14, 14, 3);
      ctx.moveTo(x - w * 0.32 + 26, ry);
      ctx.lineTo(x + w * 0.3, ry);
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
var CHECK_NAME = () => L("仓库自己声明的检查", "own declared check");
function makings(s, t, a) {
  if (a <= 0) return;
  const [agentAt, scriptAt, sheetAt, checkAt, dedupAt, listAt, progressAt, retireAt, caseAt] = cues(
    s,
    [
      ["最早那个 Agent", "the first Agent"],
      ["写了一个临时的去重脚本", "wrote a temporary deduplication script"],
      ["进度表", "progress sheet"],
      ["仓库自己声明的检查", "the repository's own declared check"],
      ["去重这项义务", "the obligation to deduplicate"],
      ["正式变更里的任务清单", "the official Change's task list"],
      ["接住了进度", "carries the progress"],
      ["撤掉", "are retired"],
      ["以防万一", "just in case"]
    ]
  );
  const lift = soon(t, checkAt + 0.05, 0.9), gone = a * (1 - ramp(t, retireAt + 0.05, 0.4)), settle = soon(t, retireAt + 0.05, 0.9);
  const agentHalf = Math.max(53, measure(L("最早那个 Agent", "the first Agent")) / 2), makingHalf = Math.max(
    SCRIPT[0] / 2,
    nameWidth(L("临时的去重脚本", "temporary deduplication script"), 350) / 2,
    measure(L("进度表", "progress sheet")) / 2
  ), ownerHalf = Math.max(
    OWNER[0] / 2,
    nameWidth(CHECK_NAME(), 300) / 2,
    nameWidth(L("正式变更里的任务清单", "the official Change's task list"), 300) / 2
  ), first = 960 - (640 - agentHalf + 1040 + makingHalf) / 2, owned = 960 - (400 - agentHalf + 1330 + ownerHalf) / 2;
  const AX2 = mix(640 + first, 400 + owned, lift), MX = mix(1040 + first, 760 + owned, lift), OX = mix(1330 + owned, 1150, settle), AY = 495, flow = voiceTime(t) * 0.35 % 1;
  agent(AX2, AY, { size: 1.5, alpha: gone });
  ring(AX2, AY, 52, { color: P.line, alpha: gone, width: 2 });
  nameText(L("最早那个 Agent", "the first Agent"), AX2, AY + 52 + NAME_GAP, {
    valign: "top",
    alpha: gone * ramp(t, agentAt - 0.35, 0.4),
    set: "07.1:makings"
  });
  const sIn = gone * named(t, scriptAt), hIn = gone * named(t, sheetAt), mid = (AX2 + 52 + MX - SCRIPT[0] / 2) / 2;
  link(AX2 + 52, AY, MX - SCRIPT[0] / 2 - 10, R1, {
    route: "hvh",
    mid,
    alpha: gone,
    end: sIn > 0.5,
    flow: sIn > 0.5 ? flow : null
  });
  link(AX2 + 52, AY, MX - SHEET[0] / 2 - 10, R2, {
    route: "hvh",
    mid,
    alpha: gone,
    end: hIn > 0.5,
    flow: hIn > 0.5 ? (flow + 0.5) % 1 : null
  });
  const top1 = rowNameTop([R1 + SCRIPT[1] / 2, R1 + OWNER[1] / 2]), top2 = rowNameTop([R2 + SHEET[1] / 2, R2 + LIST[1] / 2]);
  terminalIcon(MX - SCRIPT[0] / 2, R1 - SCRIPT[1] / 2, SCRIPT[0], SCRIPT[1], { alpha: sIn });
  nameText(L("临时的去重脚本", "temporary deduplication script"), MX, top1, {
    valign: "top",
    width: 350,
    alpha: sIn,
    set: "07.1:makings"
  });
  ledger(MX, R2, SHEET[0], SHEET[1], { alpha: hIn });
  nameText(L("进度表", "progress sheet"), MX, top2, {
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
  nameText(L("正式变更里的任务清单", "the official Change's task list"), OX, top2, {
    valign: "top",
    width: 300,
    alpha: lIn,
    set: "07.1:owners"
  });
  const rows = [
    [R1, MX + SCRIPT[0] / 2, OX - OWNER[0] / 2, dedupAt, L("去重", "deduplicate")],
    [R2, MX + SHEET[0] / 2, OX - LIST[0] / 2, progressAt, L("进度", "progress")]
  ];
  const lead = Math.min(...rows.map(([, , to]) => to)) - 150, spans = rows.map(([, from, to]) => [mix(from + 12, lead, settle), to - 12]);
  const axis = Math.min(
    (spans[0][0] + spans[0][1] + spans[1][0] + spans[1][1]) / 4,
    ...rows.map(([, , to, , name]) => to - 20 - measure(name) / 2)
  );
  rows.forEach(([y, , , at, name], i) => {
    const shown = a * named(t, at);
    link(spans[i][0], y, spans[i][1], y, {
      alpha: shown,
      upto: soon(t, at + 0.05, 0.6),
      flow: (flow + 0.5 * i) % 1
    });
    nameText(name, axis, y - 26, {
      valign: "bottom",
      alpha: shown,
      set: "07.1:duties"
    });
  });
  rejectedName(L("以防万一", "just in case"), 700, AY, {
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
  const FOUND = L("又被人翻出来用", "someone may find it"), left = Math.min(390 - 30, 390 - nameWidth(FOUND, 220) / 2), right = Math.max(1310 + OWNER[0] / 2, 1310 + nameWidth(CHECK_NAME(), 300) / 2), DX = 960 - (left + right) / 2;
  const step = soon(t, backAt + 0.2, 0.9), CX = mix(1150, 1310 + DX, step), CY = mix(R1, 380, step), GX2 = 640 + DX, FX = 390 + DX, QX = 975 + DX, Y3 = 380, RY = 625;
  declaredCheck(CX, CY, a);
  nameText(CHECK_NAME(), CX, CY + OWNER[1] / 2 + NAME_GAP, { valign: "top", width: 300, alpha: a });
  const g = a * named(t, backAt), m = a * named(t, monthsAt);
  ghostScript(GX2, Y3, g);
  clock(GX2 + SCRIPT[0] / 2, Y3 - SCRIPT[1] / 2, 22, {
    hand: (voiceTime(t) - voiceTime(monthsAt)) * 0.45 % 1,
    alpha: m
  });
  nameText(L("这个脚本", "the script"), GX2, Y3 + SCRIPT[1] / 2 + NAME_GAP, {
    valign: "top",
    alpha: g
  });
  nameText(L("过几个月", "months later"), GX2 + SCRIPT[0] / 2 + 38, Y3 - SCRIPT[1] / 2, {
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
  nameText(L("它算出的结果", "its results"), GX2, RY + 60 + NAME_GAP, { valign: "top", alpha: r1 });
  resultCard(CX, RY, 4, { alpha: r2 });
  nameText(L("不一样", "differ"), CX, RY + 60 + NAME_GAP, { valign: "top", alpha: r2 });
  askIcon(QX, RY - 6, 30, { alpha: q, color: P.ink });
  nameText(L("该信哪一个", "which to trust"), QX, RY + 60 + NAME_GAP, { valign: "top", alpha: q });
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
function ruleHeading2(t, q, { kick, kickAt, rule, ruleAt, alpha }) {
  const rest = ruleHeadingLayout(kick, rule, GLYPH, FULL2), lift = 500 - (rest.top + rest.bottom) / 2, open = ruleHeadingLayout(kick, rule, OPENING, FULL2, { dy: lift }), dy = mix(lift, 0, q), TX = mix(open.tx, rest.tx, q);
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
}
function ruleFour(s, t, a) {
  if (a <= 0) return;
  const [kickAt, ruleAt, everyAt, oneAt, sharedAt, ethosAt, eachAt, ownAt] = cues(s, [
    ["第四条准则", "rule four"],
    ["义务没了", "retire a mechanism"],
    ["每一项义务", "Every obligation"],
    ["只有一个归属", "exactly one owner"],
    ["对所有仓库都一样的规则", "the same for every repository"],
    ["归 ETHOS", "belongs to ETHOS"],
    ["每个仓库", "each repository"],
    ["只声明自己特有的检查", "declares only the checks"]
  ]);
  const drift = 0.12 * clamp((voiceTime(t) - voiceTime(kickAt)) / 4);
  ruleHeading2(t, drift + (1 - drift) * soon(t, everyAt + 0.05, 0.9), {
    kick: L("第四条准则", "Rule four"),
    kickAt,
    rule: L("义务没了，机制就退场", "Retire a mechanism when its obligation disappears"),
    ruleAt,
    alpha: a
  });
  const heads = [everyAt + 0.85, Math.max(oneAt, everyAt + 0.85)], duties = [sharedAt, ownAt], owners = [ethosAt, eachAt], flow = voiceTime(t) * 0.4 % 1, LEG = 730, DUTY = 410, OWN = 580, C1 = 690, C2 = 1230, G = [C2 - 110, C2, C2 + 110], KERNEL2 = 34, REPO = [96, 76], ownerTop = rowNameTop([OWN + KERNEL2, OWN + REPO[1] / 2]), e = a * named(t, ethosAt), r = a * named(t, eachAt), o = a * named(t, ownAt);
  const every = L("每一项义务", "Every obligation"), one = L("只有一个归属", "exactly one owner"), kx = (measure(every, NOTE) - measure(one, NOTE)) / 2;
  nameText(every, 900 + kx, LEG, {
    align: "right",
    size: NOTE,
    color: P.muted,
    alpha: a * listIn(t, heads, 0),
    set: "07.3:heads"
  });
  link(912 + kx, LEG, 1008 + kx, LEG, {
    alpha: a * named(t, heads[1]),
    upto: soon(t, heads[1] + 0.05, 0.4)
  });
  nameText(one, 1020 + kx, LEG, {
    align: "left",
    size: NOTE,
    color: P.muted,
    alpha: a * listIn(t, heads, 1),
    set: "07.3:heads"
  });
  const d1 = nameText(L("对所有仓库都一样的规则", "the same for every repository"), C1, DUTY, {
    width: 330,
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
  const d2 = nameText(L("自己特有的检查", "the checks that are its own"), C2, DUTY, {
    width: 330,
    alpha: a * listIn(t, duties, 1),
    set: "07.3:duties"
  });
  link(C2, d2.bottom + 12, C2, OWN - REPO[1] / 2 - 12, {
    alpha: o,
    upto: soon(t, ownAt + 0.05, 0.5),
    flow: (flow + 0.5) % 1
  });
  repoGroup(G, OWN, REPO[0], REPO[1], { alpha: r, checks: o });
  nameText(L("每个仓库", "each repository"), C2, ownerTop, {
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
  const DX = 960 - (620 - 52 + 1450 + 50) / 2, KX = 620 + DX, LX = 960 + DX, MID = 1100 + DX, G = [1210, 1330, 1450].map((x) => x + DX), OWNX = G[1], flow = voiceTime(t) * 0.4 % 1, o = a * named(t, ownAt), g = a * named(t, allAt), l = a * named(t, sameAt), top = rowNameTop([500 + 60, 500 + 65]);
  kernelIcon(KX, 500, 60, { alpha: a, color: P.ink });
  nameText("ETHOS", KX, top, { valign: "top", alpha: a * named(t, ethosAt) });
  link(KX + 72, 500, OWNX - 102, 330, {
    route: "hvh",
    mid: MID,
    alpha: o,
    upto: soon(t, ownAt + 0.05, 0.8),
    flow
  });
  link(LX + 50, 500, G[0] - 62, 690, {
    route: "hvh",
    mid: MID,
    alpha: l,
    upto: soon(t, sameAt + 0.05, 0.6),
    flow: (flow + 0.5) % 1
  });
  ownRepo(OWNX, 330, o, named(t, sameAt + 0.4));
  nameText(L("自己的仓库", "its own repository"), OWNX, 385 + NAME_GAP, {
    valign: "top",
    alpha: o
  });
  repoGroup(G, 690, 100, 76, { alpha: g, checks: named(t, sameAt + 0.4) });
  nameText(L("所有仓库", "every other one"), G[1], 728 + NAME_GAP, { valign: "top", alpha: g });
  ledger(LX, 500, 100, 130, { alpha: l });
  nameText(L("同一套义务", "the same obligations"), LX, top, {
    valign: "top",
    width: 230,
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
  const n = a * named(t, newAt), w = a * named(t, weakAt), o = a * named(t, oldAt);
  wayBox(700, 430, 3, { alpha: o });
  nameText(L("旧做法", "what it replaces"), 700, 505 + NAME_GAP, { valign: "top", alpha: o });
  wayBox(1220, 430, 4, { alpha: n, more: w, extra: 1 });
  const named2 = nameText(L("新做法", "A replacement"), 1220, 505 + NAME_GAP, {
    valign: "top",
    alpha: n
  });
  link(827, 430, 1093, 430, {
    alpha: Math.min(n, o),
    upto: soon(t, Math.max(newAt, oldAt) + 0.05, 0.6),
    flow: voiceTime(t) * 0.4 % 1
  });
  if (en)
    nameText("may never be weaker", 1220, named2.top + LEADING * labelSize(LABEL), {
      valign: "top",
      alpha: w
    });
  else nameText("新的不能比旧的弱", 960, 650, { alpha: w });
}
function closing(s, t, a) {
  if (a <= 0) return;
  const [changeAt, deliveredAt, recordAt, passAt] = cues(s, [
    ["一项正式变更", "And an official Change"],
    ["做到哪儿", "what it actually delivered"],
    ["没做完的留下记录", "unfinished work stays on the record"],
    ["冒充做完了", "passing for done"]
  ]);
  const DELIVERED = L("做到哪儿，就按哪儿收尾", "what it actually delivered"), RECORD = L("没做完的留下记录", "unfinished work stays on the record"), DY = 440, H = 270, left = Math.min(700 - 100, 700 - nameWidth(L("一项正式变更", "an official Change")) / 2), DELIVERED_WIDTH = L(330, 300), right = Math.max(
    1240 + 55,
    1240 + nameWidth(RECORD, 300) / 2,
    700 + 156 + nameWidth(DELIVERED, DELIVERED_WIDTH)
  ), S = 960 - (left + right) / 2, LX = 700 + S, RX = 1240 + S, top = rowNameTop([DY + H / 2, DY + 70 + 70]);
  const c = a * named(t, changeAt), d = a * named(t, deliveredAt), r = a * named(t, recordAt), p = a * named(t, passAt);
  taskList(LX, DY, 200, H, { alpha: c, done: 2, tick: d });
  nameText(L("一项正式变更", "an official Change"), LX, top, {
    valign: "top",
    alpha: c
  });
  stroke(
    () => {
      ctx.moveTo(LX + 118, DY - 72);
      ctx.lineTo(LX + 132, DY - 72);
      ctx.lineTo(LX + 132, DY + 12);
      ctx.lineTo(LX + 118, DY + 12);
    },
    { color: P.ink, alpha: d, width: 2.5 }
  );
  nameText(DELIVERED, LX + 156, DY - 30, {
    align: "left",
    width: DELIVERED_WIDTH,
    alpha: d
  });
  link(LX + 122, DY + 70, RX - 62, DY + 70, {
    alpha: r,
    upto: soon(t, recordAt + 0.05, 0.7),
    flow: voiceTime(t) * 0.4 % 1
  });
  ledger(RX, DY + 70, 110, 140, { alpha: r });
  nameText(RECORD, RX, top, {
    valign: "top",
    width: 300,
    alpha: r
  });
  rejectedName(L("冒充做完了", "passing for done"), 960, DY + 290, {
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
    ["过期", "goes stale"]
  ]);
  const GX2 = 960, GY = 490, R = 100, PY = GY + 10, top = rowNameTop([GY + R, personBottom(PY, 1.3)]), stale = ramp(t, staleAt - 0.15, 0.4), turn = 0.3 * voiceTime(Math.min(t, staleAt + 0.2)), flow = voiceTime(t) * 0.45 % 1, m = a * named(t, maintainAt), e = a * named(t, explainAt);
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
  nameText(L("过期", "goes stale"), GX2, GY - R - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, staleAt)
  });
  person(640, PY, { size: 1.3, alpha: m });
  link(678, GY, GX2 - R - 12, GY, { alpha: m, upto: soon(t, maintainAt + 0.05, 0.5), flow });
  nameText(L("有人维护", "maintain it"), 640, top, { valign: "top", alpha: m });
  person(1280, PY, { size: 1.3, alpha: e });
  link(1242, GY, GX2 + R + 12, GY, {
    alpha: e,
    upto: soon(t, explainAt + 0.05, 0.5),
    flow: (flow + 0.5) % 1
  });
  nameText(L("有人解释", "explain it"), 1280, top, { valign: "top", alpha: e });
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
function burden(s, t, a) {
  if (a <= 0) return;
  const [goneAt, burdenAt] = cues(s, [
    ["已经没有义务的机制", "the ones whose obligation is gone"],
    ["治理本身就成了负担", "becomes the burden"]
  ]);
  const PILE_NAME = L("没有义务的机制", "whose obligation is gone"), [mx, my, mr] = PILE[4], NX = mx - mr - 30, SHELF = [700, 1280], MIDX = (SHELF[0] + SHELF[1]) / 2, S = 960 - (NX - nameWidth(PILE_NAME, 300) + SHELF[1] + 2) / 2;
  const kept = 1 + Math.floor((PILE.length - 1) * clamp((t - goneAt - 0.05) / 0.6)), sag = 34 * soon(t, burdenAt + 0.05, 1.2), depth = (x) => sag * (1 - ((x - MIDX) / (MIDX - SHELF[0])) ** 2), g = a * named(t, goneAt), b = a * named(t, burdenAt);
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
    width: 300,
    alpha: g
  });
  nameText(L("治理本身就成了负担", "becomes the burden"), MIDX, 602 + sag + NAME_GAP + 8, {
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

// picture/film/scenes/p08/rail.js
var RAIL_Y = 500;
function journeyRail(x0, x1, { alpha = 1, upto = 1, dash = null } = {}) {
  if (alpha < 0.01 || upto <= 0) return;
  line(x0, RAIL_Y, mix(x0, x1, clamp(upto)), RAIL_Y, { color: P.line, alpha, width: 4, dash });
}
function railFlow(t, x0, x1, { alpha = 1, rate = 0.12 } = {}) {
  const q = voiceTime(t) * rate % 1;
  flowDot(mix(x0, x1, q), RAIL_Y, 6, q, { color: P.line, alpha });
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

// picture/film/scenes/p08/lane.js
var REQ = [120, 150];
var REQ_X = 250;
var LIFE_DX = 34;
var requirement = (alpha) => docMark(REQ_X - REQ[0] / 2, RAIL_Y - REQ[1] / 2, REQ[0], REQ[1], { alpha, rows: 4 });
function lifeStart(s, t, a) {
  if (a <= 0) return;
  const [firstAt, thisAt] = cues(s, [
    ["把这项需求", "Now follow"],
    ["这项需求的一生", "this requirement"]
  ]);
  ctx.save();
  ctx.translate(LIFE_DX, 0);
  requirement(a * clearOfTitle(s, t, RAIL_Y - REQ[1] / 2));
  journeyRail(REQ_X + REQ[0] / 2 + 8, 1680, { alpha: a, upto: soon(t, firstAt + 0.05, 1.6) });
  nameText(L("这项需求的一生", "this requirement"), REQ_X + REQ[0] / 2 + 24, RAIL_Y - 34, {
    align: "left",
    valign: "bottom",
    alpha: a * ramp(t, thisAt - 0.4, 0.4)
  });
  if (en)
    nameText("its whole life", 1120, RAIL_Y - 34, {
      valign: "bottom",
      alpha: a * named(t, cue(s, "这项需求的一生", "its whole life"))
    });
  railFlow(t, REQ_X + 70, 1680, { alpha: a * soon(t, firstAt + 1.4, 0.4) });
  ctx.restore();
}
var XS = [REQ_X, 490, 680, 1180, 1460];
var STATIONS = () => [
  // Authored as its lines: wrapped by measure, the English name would break onto three.
  L("研究员的要求", ["The researcher's", "request"]),
  L("正式变更", "official Change"),
  L("工作通道", "Work Lane"),
  L("再查一次", "checks once more"),
  L("受版本管理的文件", "file under version control")
];
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
  const ats = [reqAt, changeAt, laneAt, checkAt, fileAt], spoken = [...ats].sort((p, q) => p - q), level = (i) => a * listIn(t, spoken, spoken.indexOf(ats[i])), shown = (i) => a * named(t, ats[i]), [x0, x1, x2, x3, x4] = XS;
  ctx.save();
  ctx.translate(LIFE_DX, 0);
  journeyRail(REQ_X + REQ[0] / 2 + 8, 1680, { alpha: a });
  railFlow(t, REQ_X + 70, 1680, { alpha: a });
  requirement(a);
  docMark(x1 - 75, RAIL_Y - 85, 150, 170, { alpha: shown(1), rows: 5 });
  folderIcon(x2 - 36, RAIL_Y - 29, 72, 58, { alpha: shown(2) });
  link(x2 + 44, RAIL_Y, x3 - 40, RAIL_Y, {
    color: P.ink,
    width: 3,
    alpha: shown(2),
    upto: soon(t, laneAt + 0.05, 0.8),
    end: false
  });
  writeGate(x3, RAIL_Y, 110, { alpha: shown(3), open: soon(t, writeAt + 0.05, 0.6) });
  docMark(x4 - 45, RAIL_Y - 57, 90, 115, { alpha: shown(4), rows: 3 });
  railNames(STATIONS(), XS, RAIL_Y + 85, { alpha: level, set: "08.2:stations" });
  const lease = [holdAt, untilAt], hx = mix(x2, x3, 0.3), ux = mix(x2, x3, 0.7), h = a * named(t, holdAt), u = a * named(t, untilAt);
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
  nameText(L("由谁持有", "who holds that lane"), hx, LEASE_Y - 34, {
    valign: "bottom",
    width: 230,
    alpha: a * listIn(t, lease, 0),
    set: "08.2:lease"
  });
  nameText(L("持有到什么时候", "until when"), ux, LEASE_Y - 34, {
    valign: "bottom",
    width: 230,
    alpha: a * listIn(t, lease, 1),
    set: "08.2:lease"
  });
  let wx = x0 + REQ[0] / 2 + 22;
  [
    [changeAt, x1 + 75 + 22],
    [laneAt, x2 + 36 + 26],
    [fileAt, x3 - 30 - 24],
    [writeAt, x3 + 30 + 26]
  ].forEach(([at, to]) => wx = mix(wx, to, soon(t, at + 0.05, 0.9)));
  work(wx, RAIL_Y, a);
  ctx.restore();
}
var SOURCES2 = () => [
  [L("刚观察到的事实", "fresh facts"), L("仓库现在是什么样子", "as it is now")],
  [L("正式变更", "the Change"), L("要做什么、做到什么样才算完", "what counts as done")],
  [L("已有的存证", "attestations"), L("做过了什么、哪些核验已经通过", "which proofs have passed")]
];
var ROWS = [360, 500, 640];
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
    ["仓库现在是什么样子", "as it is now"],
    ["再读正式变更", "reads the Change"],
    ["做到什么样才算完", "what counts as done"],
    ["已有的存证", "attestations already"],
    ["哪些核验已经通过", "which proofs have passed"]
  ]);
  const sources2 = SOURCES2(), widest = Math.max(
    ...sources2.map(([term, tell]) => Math.max(measure(term), measure(tell, NOTE)))
  ), S = 960 - (560 - 320 - 2 + TEXT_X + widest) / 2, reading = soon(t, factsAt - 0.4, 0.8), off = mix(960 - (560 + 820) / 2, S, reading), AX2 = 560 + off, BX2 = 820 + off, AY = 410, railEnd2 = BX2 + 60 + 280 * (1 - soon(t, factsAt - 0.4, 1.2)), ended = ramp(t, endsAt - 0.15, 1.2), passed = soon(t, overAt + 0.05, 0.9), b = a * named(t, overAt), m = a * named(t, memoryAt), WX = mix(AX2, BX2, passed), flow = voiceTime(t) * 0.4 % 1;
  journeyRail(AX2 - 320, BX2 + 60, { alpha: a });
  journeyRail(BX2 + 60, railEnd2, { alpha: a });
  railFlow(t, AX2 - 320, railEnd2, { alpha: a });
  work(WX, RAIL_Y, a);
  nameText(L("做到一半", "Halfway through"), WX, RAIL_Y + 30, {
    valign: "top",
    alpha: a * named(t, halfAt)
  });
  agent(AX2, AY, { size: 1.1, alpha: a * (1 - 0.5 * ended) });
  ring(AX2, AY, 34, { color: P.line, alpha: a * ended, width: 2, dash: [6, 6] });
  link(AX2, AY + 28, AX2, RAIL_Y - 20, { alpha: a * (1 - passed) });
  nameText(L("会话结束了", "session ends"), AX2, AY - 40, {
    valign: "bottom",
    alpha: a * named(t, endsAt)
  });
  agent(BX2, AY, { size: 1.1, alpha: b });
  link(BX2, AY + 28, BX2, RAIL_Y - 20, { alpha: b * passed, upto: passed });
  nameText(L("接手的 Agent", "the Agent that takes over"), BX2, AY - 40, {
    valign: "bottom",
    width: 320,
    alpha: b
  });
  bubble((AX2 + BX2) / 2, RAIL_Y + 80, 18, { alpha: m, color: P.muted });
  rejectedName(L("前一个的记忆", "the last one's memory"), (AX2 + BX2) / 2, RAIL_Y + 130, {
    alpha: m,
    mark: ramp(t, memoryAt + 0.3, 0.4)
  });
  const terms = [factsAt, changeAt, attestAt], tells = [nowAt, doneAt, passedAt];
  sources2.forEach(([term, tell], i) => {
    const y = ROWS[i], r = a * named(t, terms[i]);
    link(BX2 + 30, AY, ORDER_X + S - 20, y, {
      route: "hvh",
      mid: ORDER_X + S - 60,
      alpha: r,
      upto: soon(t, Math.max(terms[i], factsAt + 0.45) + 0.05, 0.6),
      flow: (flow + i / 3) % 1
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
  const [doneAt, commitAt, proofAt, attestAt, reviewAt, branchAt, publishAt, ownAt] = cues(s, [
    ["改完以后", "When the work is committed"],
    ["这一次提交", "that exact commit"],
    ["完整的核验", "a full local proof"],
    ["留下存证", "leaves an attestation"],
    ["维护者审阅", "A maintainer reviews"],
    ["受保护的开发分支", "the protected development branch"],
    ["分别发布", "published to each platform"],
    ["单独确认", "confirmed on its own"]
  ]);
  const DONE = L("改完以后", "When the work is committed"), OWN = L("单独确认", "confirmed on its own"), EACH = L("每一个平台", "each platform"), left = Math.min(220 - 2, 260 - nameWidth(DONE, 300) / 2), right = 1600 + Math.max(70, nameWidth(OWN) / 2, nameWidth(EACH) / 2), S = 960 - (left + right) / 2;
  const WX = 260 + S, CX = 570 + S, AX2 = 820 + S, MX = 1070 + S, BX2 = 1270 + S, PX = 1600 + S, UP = 410, PY = [360, 640], above = Math.min(UP - 26, UP - 22, UP + 4 - 2.15 * 15 * 1.15) - NAME_GAP, below = rowNameTop([RAIL_Y + 23, RAIL_Y + 19]), flow = voiceTime(t) * 0.4 % 1, c = a * named(t, commitAt), p = a * named(t, proofAt), at = a * named(t, attestAt), m = a * named(t, reviewAt), br = a * named(t, branchAt), pub = a * named(t, publishAt);
  const end = mix(1680 + S, BX2 + 90, soon(t, publishAt - 0.8, 0.5));
  journeyRail(220 + S, end, { alpha: a });
  railFlow(t, 220 + S, end, { alpha: a });
  const finisher = a * (1 - ramp(t, proofAt + 0.3, 0.5));
  agent(WX, UP, { size: 1.45, alpha: finisher });
  link(WX, UP + 36, WX, RAIL_Y - 22, { alpha: finisher, end: false });
  nameText(DONE, WX, below, {
    valign: "top",
    width: 300,
    alpha: a * named(t, doneAt)
  });
  commitDot(CX, RAIL_Y, { alpha: c, r: 14, picked: c });
  nameText(L("这一次提交", "that exact commit"), CX, below, { valign: "top", alpha: c });
  proofMark(CX, UP, p);
  link(CX, UP + 30, CX, RAIL_Y - 24, { alpha: p, upto: soon(t, proofAt + 0.05, 0.4) });
  nameText(L("完整的核验", "a full local proof"), CX, above, { valign: "bottom", alpha: p });
  link(CX + 30, UP, AX2 - 34, UP, { alpha: at, upto: soon(t, attestAt + 0.05, 0.5) });
  seal(AX2, UP, 22, { alpha: at, color: P.ink });
  nameText(L("存证", "attestation"), AX2, above, { valign: "bottom", alpha: at });
  person(MX, UP + 4, { size: 1.15, alpha: m });
  link(MX, UP + 40, MX, RAIL_Y - 12, { alpha: m, upto: soon(t, reviewAt + 0.05, 0.5) });
  nameText(L("维护者审阅、授权", ["A maintainer reviews", "and authorizes"]), MX, above, {
    valign: "bottom",
    width: 300,
    alpha: m
  });
  commitRow(BX2 - 60, 40, RAIL_Y, 4, { alpha: br, single: true });
  lock(BX2, RAIL_Y - 52, { alpha: br, color: P.ink, size: 0.9 });
  nameText(L("受保护的开发分支", "the protected development branch"), BX2, below, {
    valign: "top",
    width: 300,
    alpha: br
  });
  PY.forEach(
    (y, i) => link(BX2 + 102, RAIL_Y, PX - 82, y, {
      route: "hvh",
      mid: BX2 + 210,
      alpha: pub,
      upto: soon(t, publishAt + 0.05 + 0.25 * i, 0.6),
      flow: (flow + 0.5 * i) % 1
    })
  );
  platforms(PX, PY, { alpha: pub, w: 140, h: 76 });
  nameText(EACH, PX, RAIL_Y, { alpha: pub });
  PY.forEach(
    (y, i) => check(PX + 34, y + 12, 26, { alpha: a * named(t, ownAt + 0.7 * i), width: 3.5 })
  );
  nameText(OWN, PX, PY[1] + 38 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, ownAt)
  });
  let wx = WX, from = WX;
  [
    [proofAt, CX + 36],
    [reviewAt, MX + 30],
    [branchAt, BX2 + 90],
    [publishAt, BX2 + 70]
  ].forEach(([cueAt, to]) => {
    wx = mix(wx, to, soon(t, cueAt + 0.05, Math.max(0.9, Math.abs(to - from) / 390)));
    from = to;
  });
  work(wx, RAIL_Y, a * (1 - ramp(t, publishAt + 0.6, 0.4)));
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
  L("上线的那个版本", "the version"),
  L("真实运行的环境", "the environment"),
  L("和原来的做法比", "how things were done before"),
  L("一段时间", "a set period")
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
    ["和原来的做法比", "how things were done before"],
    ["一段时间", "a set period"]
  ]);
  const needs = NEEDS(), NEEDS_END = NEED_X + 50 + Math.max(...needs.map((v2) => nameWidth(v2, 360))), S = 960 - (220 - 2 + NEEDS_END) / 2;
  const QX = 1100, QY = RAIL_Y - 11, TX = 380, UX = 740, NAMES = NEED_Y[2], ats = [versionAt, envAt, baseAt, periodAt], back = soon(t, versionAt - 0.2, 0.7), flow = voiceTime(t) * 0.4 % 1, v = a * named(t, liveAt), q = a * named(t, worksAt), u = a * named(t, useAt);
  ctx.save();
  ctx.translate(S, 0);
  journeyRail(220, QX - 40, { alpha: a });
  journeyRail(QX + 40, mix(NEEDS_END - 20, QX + 40, back), { alpha: a });
  railFlow(t, 220, QX - 40, { alpha: a });
  tagIcon(TX - 30, RAIL_Y, 64, 34, { alpha: v, color: P.ink });
  nameText(L("版本上线", "the version is live"), TX, NAMES, { alpha: v });
  person(UX, RAIL_Y - 66, { size: 1.15, alpha: u });
  link(UX, RAIL_Y - 30, UX, RAIL_Y - 10, { alpha: u, upto: soon(t, useAt + 0.05, 0.4) });
  nameText(L("实际使用", "real use"), UX, NAMES, { alpha: u });
  askIcon(QX, QY, 30, { alpha: q, color: P.ink });
  nameText(L("管不管用", "whether it works"), QX, QY - 30 - NAME_GAP, {
    valign: "bottom",
    alpha: q
  });
  nameText(L("实际效益", "actual benefit"), QX, NAMES, { alpha: a * named(t, benefitAt) });
  needs.forEach((v2, i) => {
    const y = NEED_Y[i], n = a * named(t, ats[i]);
    link(QX + 34, RAIL_Y, NEED_X - 44, y, {
      route: "hvh",
      mid: QX + 150,
      alpha: n,
      upto: soon(t, ats[i] + 0.05, 0.6),
      flow: (flow + i / 4) % 1
    });
    needMark(i, NEED_X, y, n);
    nameText(v2, NEED_X + 50, y, {
      align: "left",
      width: 360,
      alpha: a * listIn(t, ats, i),
      set: "08.5:needs"
    });
  });
  ctx.restore();
}
var STRETCHES = [
  [240, 600],
  [640, 820],
  [860, 1200],
  [1240, 1680]
];
function overview(s, t, a) {
  if (a <= 0) return;
  const [hereAt, pathAt, docsAt, handoverAt, acceptAt] = cues(s, [
    ["从这里往后", "From here on"],
    ["设计要走通的一段路", "ETHOS is designed for"],
    ["它的文档也写明", "its own documents"],
    ["换 Agent 接手那一段", "the handover between Agents"],
    ["都还没有完成验收", "has not yet completed acceptance"]
  ]);
  const h = a * named(t, handoverAt), acc = a * named(t, acceptAt), [A, B, C, D] = STRETCHES;
  const solid = t < handoverAt - 0.15 ? [A, B, C] : [A, C];
  stroke(
    () => solid.forEach(([x02, x1]) => {
      ctx.moveTo(x02, RAIL_Y);
      ctx.lineTo(x1, RAIL_Y);
    }),
    { color: P.line, alpha: a, width: 4 }
  );
  journeyRail(B[0], B[1], { alpha: h, dash: [12, 10] });
  journeyRail(D[0], D[1], { alpha: a, dash: [12, 10] });
  railFlow(t, D[0], D[1], { alpha: a });
  const HERE = D[0] + 40;
  work(HERE, RAIL_Y, a);
  nameText(L("从这里往后", "From here on"), HERE, RAIL_Y - 30, {
    valign: "bottom",
    alpha: a * named(t, hereAt)
  });
  const db = nameText(
    L("设计要走通的一段路", "ETHOS is designed for"),
    (D[0] + D[1]) / 2,
    RAIL_Y + 30,
    {
      valign: "top",
      alpha: a * ramp(t, pathAt - (en ? 1.35 : 0.15), 0.4)
    }
  );
  const hb = nameText(
    L("换 Agent 接手那一段", "the handover between Agents"),
    (B[0] + B[1]) / 2,
    RAIL_Y + 30,
    {
      valign: "top",
      width: 300,
      alpha: h
    }
  );
  const NY = 700, accept = L("尚未完成验收", "has not yet completed acceptance"), DOC = [40, 52], row = DOC[0] + NAME_GAP + measure(accept), x0 = 1100 - row / 2;
  documentIcon(x0, NY - DOC[1] / 2, DOC[0], DOC[1], { alpha: a * named(t, docsAt), rows: 3 });
  nameText(accept, x0 + DOC[0] + NAME_GAP, NY, { align: "left", alpha: acc });
  [
    [x0 - 14, (B[0] + B[1]) / 2, hb.bottom + 12],
    [x0 + row + 14, (D[0] + D[1]) / 2, db.bottom + 12]
  ].forEach(
    ([x1, x2, y2]) => link(x1, NY, x2, y2, { route: "hv", alpha: acc, upto: soon(t, acceptAt + 0.05, 0.6) })
  );
}

// picture/film/scenes/p08/feedback.js
var Y2 = 530;
var FEED = 470;
var RUN = 800;
var STORE = [1220, Y2, 400, 148];
var SLOTS = [Y2 - 37, Y2 + 37];
function pipelineParts(alpha, store, slots) {
  if (alpha < 0.01) return;
  const [sx, sy, sw, sh] = STORE;
  ring(FEED, Y2, 38, { color: P.ink, alpha, width: 2.5 });
  dot(FEED, Y2, 12, { color: P.ink, alpha });
  box(RUN - 110, Y2 - 48, 220, 96, { fill: P.row, stroke: P.ink, alpha, radius: 10, width: 2.5 });
  stroke(
    () => {
      for (let i = -1; i <= 1; i++) {
        const cx = RUN + i * 50;
        ctx.moveTo(cx - 8, Y2 - 16);
        ctx.lineTo(cx + 8, Y2);
        ctx.lineTo(cx - 8, Y2 + 16);
      }
    },
    { color: P.ink, alpha, width: 2.5 }
  );
  link(FEED + 40, Y2, RUN - 110, Y2, { alpha, end: false });
  link(RUN + 110, Y2, sx - sw / 2 - 2, Y2, { alpha: Math.min(alpha, store), end: false });
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
  [RUN, Y2]
];
var INTO_SLOT = [
  [RUN, Y2],
  [STORE[0] + 150, Y2],
  [STORE[0] + 165, SLOTS[1]]
];
var travel = (t, toRun, toSlot) => toSlot > 0 ? along(INTO_SLOT, toSlot).point : along(INTO_RUN, toRun).point;
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
  const LATER = L("几天后", "A few days later"), VENDOR = L("厂商", "the vendor"), TWO = L("两次更正", "two corrections"), OVER = L("覆盖掉了", "overwrites the first"), left = Math.min(FEED - 38, FEED - measure(TWO) / 2, FEED - measure(VENDOR) / 2), before = Math.max(RUN + 110, FEED + 40 + measure(LATER)), after = Math.max(before, STORE[0] + STORE[2] / 2, STORE[0] + measure(OVER) / 2), ABOVE = Y2 - 48 - NAME_GAP;
  const v = a * named(t, vendorAt), over = ramp(t, overAt - 0.15, 0.4), alone = 960 - (left + before) / 2, done = 960 - (left + after) / 2, off = mix(alone, done, soon(t, origAt - 0.45, Math.max(0.8, Math.abs(alone - done) / 350)));
  ctx.save();
  ctx.translate(off, 0);
  clock(FEED, 330, 24, { hand: voiceTime(t) * 0.5 % 1, alpha: a });
  nameText(LATER, FEED + 40, 330, {
    align: "left",
    alpha: a * named(t, laterAt)
  });
  pipelineParts(v, a * named(t, origAt), [a * named(t, origAt), a * named(t, singleAt)]);
  nameText(VENDOR, FEED, Y2 + 38 + NAME_GAP, { valign: "top", alpha: v });
  nameText(L("管线", "The pipeline"), RUN, ABOVE, {
    valign: "bottom",
    alpha: a * named(t, pipeAt)
  });
  nameText(L("原值", "an original value"), STORE[0] - 170, SLOTS[0], {
    align: "left",
    alpha: a * named(t, origAt)
  });
  nameText(L("一次更正", "a single correction"), STORE[0] - 170, SLOTS[1], {
    align: "left",
    alpha: a * named(t, singleAt)
  });
  const c = a * named(t, twoAt);
  nameText(TWO, FEED, ABOVE, { valign: "bottom", alpha: c });
  if (c > 0.01) {
    const [x1, y1] = travel(t, soon(t, twoAt + 0.1, 1), soon(t, singleAt + 0.2, 1)), [x2, y2] = travel(t, 0.8 * soon(t, twoAt + 0.3, 1), soon(t, secondAt + 0.05, 1.2));
    dot(x1, y1, 7, { color: P.ink, alpha: c * (1 - over) });
    dot(x2, y2, 16, { color: P.ink, alpha: c });
  }
  nameText(OVER, STORE[0], STORE[1] + STORE[3] / 2 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, overAt)
  });
  ctx.restore();
}
var JUDGED = () => [
  [L("观察到的", "The observation"), L("第一次更正不见了", "the first correction has disappeared")],
  [
    L("推断的原因", "The inference"),
    L("厂商会多次更正", "the vendor can correct a value more than once")
  ],
  [
    L("提出的补救办法", "the proposed remedy"),
    L("按厂商给的修订编号来区分记录", "tell records apart by the revision number")
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
    ["三件事要分开判断", "three things be judged separately"],
    ["观察到的，是", "The observation is"],
    ["第一次更正不见了", "the first correction has disappeared"],
    ["推断的原因", "The inference"],
    ["厂商会多次更正", "the vendor can correct"],
    ["提出的补救办法", "the proposed remedy"],
    ["按厂商给的修订编号", "tell records apart"]
  ]);
  const [wrongAt, standsAt, rejectAt, problemAt] = cues(s, [
    ["可能错", "can be wrong"],
    ["照样成立", "still stands"],
    ["被否掉", "rejecting"],
    ["问题不存在", "the problem go away"]
  ]);
  const apartAt = cueFrom(s, "要分开", "They stay apart", remSays);
  const p = a * named(t, peopleAt), b = a * named(t, backAt), TOP2 = mix(450, 300, soon(t, obsAt - 0.5, 0.8)), [PX, , DX] = PANEL_X, DOC = [84, 108], names = rowNameTop([TOP2 + 22.7 * 1.5, TOP2 + DOC[1] / 2]);
  person(PX, TOP2, { size: 1.5, alpha: p });
  nameText(L("负责观察的人", ["The people watching", "the pipeline"]), PX, names, {
    valign: "top",
    alpha: p
  });
  link(PX + 40, TOP2, DX - DOC[0] / 2 - 12, TOP2, {
    alpha: b,
    upto: soon(t, backAt + 0.05, Math.max(0.8, (DX - DOC[0] / 2 - 52 - PX) / 760)),
    flow: voiceTime(t) * 0.4 % 1
  });
  documentIcon(DX - DOC[0] / 2, TOP2 - DOC[1] / 2, DOC[0], DOC[1], { alpha: b, rows: 0 });
  nameText(L("把情况报了回来", "report this back"), DX, names, {
    valign: "top",
    alpha: b
  });
  nameText(L("三件事要分开判断", "three things be judged separately"), PANEL_X[1], names, {
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
  [L("照样成立", "still stands"), L("可能错", "can be wrong"), L("被否掉", "rejecting")].forEach(
    (v, i) => nameText(v, PANEL_X[i] + shift, PANEL_Y + PANEL_H / 2 + NAME_GAP, {
      valign: "top",
      alpha: a * named(t, verdicts[i]),
      set: "08.7:verdicts"
    })
  );
}

// picture/film/scenes/p08/model.js
function faultApart(s, t, a) {
  if (a <= 0) return;
  const [codeAt, modelAt, apartAt, faultAt] = cues(s, [
    ["代码出错", "A failed implementation"],
    ["模型的问题", "the model is wrong"],
    ["要先分清", "told apart first"],
    ["问题出在模型上", "the fault is in the model"]
  ]);
  const W = 280, H = 160, Y0 = 390, GAP = 170, CX = 960 - GAP - W / 2, MX = 960 + GAP + W / 2, alone = (960 - CX) * (1 - soon(t, modelAt - 0.4, 0.8)), m = a * named(t, modelAt), d = a * named(t, apartAt), f = ramp(t, faultAt - 0.15, 0.6);
  terminalIcon(CX + alone - W / 2, Y0, W, H, { alpha: a * mix(1, 0.55, f) });
  nameText(L("代码出错", "A failed implementation"), CX + alone, Y0 + H + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, codeAt)
  });
  modelGrid(MX - W / 2, Y0, W, H, { alpha: m, cell: [3, 1], lit: f });
  nameText(L("模型的问题", "the model is wrong"), MX, Y0 + H + NAME_GAP, {
    valign: "top",
    alpha: m
  });
  line(960, Y0, 960, Y0 + H, { color: P.line, alpha: d, dash: [8, 8] });
  nameText(L("要先分清", "told apart first"), 960, Y0 - 20, { valign: "bottom", alpha: d });
  nameText(L("问题出在模型上", "the fault is in the model"), MX, Y0 - 20, {
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
  const GY = 390, GW = 400, GH = 225, DOC = [150, GH], DOC_X = 700, CHK = 960, CELL = GW - 5, MID = GY + GH / 2, RECORD = L("同一条记录", "the same record"), DIM = L("少了一个维度", "missing a dimension"), BOUND = L("受影响的最小范围", "the smallest boundary"), CHANGE = L("新的正式变更", ["a new official", "Change"]), REVISES = L("修订模型", "revises the model"), DEP = L("依赖它的检查", "every check that depends on it"), COMPILE = L("重新编译", "compiled again");
  const left = -22 - nameWidth(DIM, 200), right1 = Math.max(GW + 0.9 * (GW / 4) + 6, CELL + nameWidth(RECORD) / 2), right2 = Math.max(
    right1,
    CELL + nameWidth(BOUND) / 2,
    DOC_X + DOC[0] / 2,
    DOC_X + nameWidth(CHANGE) / 2,
    DOC_X + nameWidth(REVISES) / 2
  ), right3 = Math.max(right2, CHK + 46 + nameWidth(DEP, 280), CHK + nameWidth(COMPILE) / 2), at = (right) => 960 - (left + right) / 2, GX2 = at(right3) + (at(right2) - at(right3)) * (1 - soon(t, checksAt - 0.4, 0.8)) + (at(right1) - at(right2)) * (1 - soon(t, changeAt - 0.4, 0.8));
  ctx.save();
  ctx.translate(GX2, 0);
  const grow = soon(t, dimAt + 0.05, 0.8), c = a * named(t, changeAt), bd = a * named(t, boundAt), k = a * named(t, checksAt), flow = voiceTime(t) * 0.4 % 1, above = GY - NAME_GAP, below = rowNameTop([GY + GH, GY + GH - 10 + 22]);
  modelGrid(0, GY, GW, GH, { alpha: a, cell: [3, 1], lit: 1, grow });
  nameText(RECORD, CELL, above, {
    valign: "bottom",
    alpha: a * named(t, recordAt)
  });
  nameText(DIM, -22, MID, {
    align: "right",
    width: 200,
    alpha: a * named(t, dimAt)
  });
  const cx0 = 3 * (GW / 4) - 6, cx1 = GW + 0.9 * (GW / 4) * grow + 6, cy0 = GY + GH / 3 - GH / 3 * 0.5 * grow - 6, cy1 = GY + 2 * GH / 3 + GH / 3 * 0.5 * grow + 6;
  box(cx0, cy0, cx1 - cx0, cy1 - cy0, { stroke: P.line, alpha: bd, radius: 10, dash: [8, 7] });
  nameText(BOUND, CELL, below, {
    valign: "top",
    alpha: bd
  });
  docMark(DOC_X - DOC[0] / 2, GY, DOC[0], DOC[1], { alpha: c, rows: 4 });
  link(DOC_X - DOC[0] / 2 - 12, MID, cx1 + 10, MID, {
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
  const ys = [GY + 10, MID, GY + GH - 10];
  ys.forEach(
    (y, i) => link(DOC_X + DOC[0] / 2 + 12, MID, CHK - 38, y, {
      route: "hvh",
      mid: (DOC_X + DOC[0] / 2 + CHK) / 2,
      alpha: k,
      upto: soon(t, checksAt + 0.05 + 0.15 * i, 0.6),
      flow: (flow + i / 3) % 1
    })
  );
  checkGroup(t, CHK, ys, { alpha: k, at: compileAt });
  nameText(DEP, CHK + 46, MID, {
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
    L("例外", "exception"),
    L("旁路", "side path"),
    L("第二个真相来源", "second source of truth")
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
function workLane(x0, x1, y, { alpha = 1, flow = null, held = null, gate = null } = {}) {
  if (alpha < 0.01) return;
  folderIcon(x0, y - 26, 62, 52, { alpha });
  link(x0 + 70, y, x1, y, { alpha, end: false });
  if (gate !== null) writeGate(gate, y, 92, { alpha, open: 0, single: true });
  if (held !== null) flowDot(held, y, 10, 0.5, { color: P.ink, alpha });
  if (flow !== null)
    for (let k = 0; k < 3; k++) {
      const q = (flow + k / 3) % 1;
      flowDot(mix(x0 + 80, x1, q), y, 10, q, { color: P.ink, alpha });
    }
}
function meanwhile(s, t, a) {
  if (a <= 0) return;
  const [dependAt, waitAt, otherAt, onAt] = cues(s, [
    ["依赖这个概念的改动", "changes that depend on that idea"],
    ["先停下", "wait"],
    ["和它无关的工作", "work unrelated to it"],
    ["照常进行", "goes on as usual"]
  ]);
  const DEPEND = L("依赖这个概念的改动", "changes that depend on that idea"), WAIT = L("先停下", "wait"), OTHER = L("和它无关的工作", "work unrelated to it"), ON = L("照常进行", "goes on as usual"), Y1 = 520, Y22 = 670, GATE = 1200, right = Math.max(
    1440 + measure(ON),
    GATE + 50 + measure(WAIT),
    600 + nameWidth(DEPEND, 420),
    600 + measure(OTHER)
  ), S = 960 - (520 + right) / 2, d = a * named(t, dependAt), o = a * named(t, otherAt);
  ctx.save();
  ctx.translate(S, 0);
  workLane(520, 1260, Y1, {
    alpha: d,
    gate: GATE,
    held: mix(700, 1140, soon(t, dependAt + 0.1, 1.4))
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
  nameText(WAIT, GATE + 50, Y1 - 40, {
    align: "left",
    valign: "bottom",
    alpha: a * named(t, waitAt)
  });
  workLane(520, 1420, Y22, { alpha: o, flow: voiceTime(t) * 0.35 % 1 });
  nameText(OTHER, 600, Y22 + 40, {
    align: "left",
    valign: "top",
    alpha: o
  });
  nameText(ON, 1440, Y22, {
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
  const LY = 380, x0 = 560, x1 = 1372, LOCK = x1 + 20, AXIS = (x0 + LOCK + 17) / 2, PX = 1322, PY = 624, al = a * named(t, alignAt), q = a * named(t, quietAt), sink = soon(t, quietAt + 0.05, 1), flow = voiceTime(t) * 0.4 % 1;
  line(x0, LY, x1, LY, { color: P.ink, alpha: a, width: 5 });
  lock(LOCK, LY, { alpha: a, color: P.ink });
  nameText(L("不能多出重复记录", "no duplicate records"), AXIS, LY - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, goalAt)
  });
  nameText(L("这个目标", "The goal"), x0 - 24, LY, { align: "right", alpha: a * named(t, keptAt) });
  link(AXIS, 482, AXIS, LY + 12, { alpha: a, flow });
  resultCard(AXIS, 545, 4, { alpha: a, w: 170, h: 120 });
  nameText(L("一个字也没有放宽", "not relaxed in the slightest"), (AXIS + LOCK) / 2, LY + 28, {
    valign: "top",
    width: 300,
    alpha: a * named(t, notAt)
  });
  person(PX, PY, { size: 1.2, alpha: al });
  seal(LOCK, 620, 22, { alpha: al, color: P.ink });
  link(LOCK, 594, LOCK, LY + 22, { alpha: al, upto: soon(t, alignAt + 0.05, 0.6), flow });
  nameText(
    L("经授权重新对齐意图", "authorized intent alignment"),
    (PX - 28 + LOCK + 22) / 2,
    rowNameTop([PY + 22.7 * 1.2, 620 + 22]),
    {
      valign: "top",
      width: 340,
      alpha: al
    }
  );
  const low = LY + mix(50, 110, sink);
  line(x0 + 20, low, 800, low, { color: P.line, alpha: q, width: 4, dash: [10, 9] });
  rejectedName(L("悄悄放宽", "silently loosened"), (x0 + 20 + 800) / 2, low + 36, {
    alpha: q,
    mark: ramp(t, quietAt + 0.5, 0.4)
  });
}

// picture/film/scenes/p08/life.js
scenes["08"] = function(s, t) {
  const [laneAt, halfAt, proofAt, liveAt, hereAt, daysAt] = cues(s, [
    ["研究员的要求", "The researcher's request"],
    ["做到一半", "Halfway through"],
    ["改完以后", "When the work is committed"],
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
  const s1 = stageOut(t, laneAt), s2 = stageIn(t, laneAt) * stageOut(t, halfAt), s3 = stageIn(t, halfAt) * stageOut(t, proofAt), s4 = stageIn(t, proofAt) * stageOut(t, liveAt), s5 = stageIn(t, liveAt) * stageOut(t, hereAt), s5b = stageIn(t, hereAt) * stageOut(t, daysAt), s6 = stageIn(t, daysAt) * stageOut(t, peopleAt), s7 = stageIn(t, peopleAt) * stageOut(t, failAt), s8 = stageIn(t, failAt) * stageOut(t, recordAt), s8b = stageIn(t, recordAt) * stageOut(t, noneAt), s8c = stageIn(t, noneAt) * stageOut(t, meanAt), s8d = stageIn(t, meanAt) * stageOut(t, goalAt), s9 = stageIn(t, goalAt);
  illustrative(1);
  lifeStart(s, t, s1);
  lane(s, t, s2);
  handoff(s, t, s3);
  release(s, t, s4);
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
var BOUND_END = 1140;
var PLACE = 200;
var FAN = 210;
var BOUND_ROWS = [385, 470, 555];
var ATTESTED = () => [
  L("哪一次提交", "which commit it means"),
  L("核验了什么", "what the proof checked"),
  L("哪里还没有结果", "what still has no result")
];
var boundShift = () => 960 - (BOUND_X - 370 - 34 + BOUND_END + FAN + 30 + Math.max(...ATTESTED().map((v) => measure(v)))) / 2;
function bound(s, t, a) {
  if (a <= 0) return;
  const [beganAt, doneAt, wayAt, attestAt, commitAt, provedAt, openAt, lookAt, trustAt] = cues(s, [
    ["开头那句", "where we began"],
    ["做完了", "Done"],
    ["按 ETHOS 的做法", "In ETHOS"],
    ["跟着存证", "attestations behind it"],
    ["哪一次提交", "which commit it means"],
    ["核验了什么", "what the proof checked"],
    ["哪里还没有结果", "what still has no result"],
    ["都找得到", "can all be looked up"],
    ["这句话能不能信", "can be trusted"]
  ]);
  const before = 960 - (BOUND_X - 370 - 34 + BOUND_END + 6 + PLACE) / 2, off = mix(before, boundShift(), soon(t, wayAt + 0.05, 0.9)), PX = BOUND_X + off, Y3 = 470, clear = a * clearOfTitle(s, t, Y3 - 60), way = ramp(t, wayAt - 0.15, 0.5), at = a * named(t, attestAt), end = BOUND_END + off, rows = BOUND_ROWS, ats = [commitAt, provedAt, openAt];
  agent(PX - 370, Y3, { size: 1.5, alpha: clear });
  link(PX - 334, Y3, PX - claimWidth() / 2 - 2, Y3, { alpha: clear, end: false });
  const {
    datum: [dx, dy]
  } = claimPanel(t, PX, Y3, { alpha: clear, words: clear * named(t, doneAt) });
  nameText(L("开头那句", "where we began"), PX, Y3 - CLAIM_H / 2 - 44, {
    valign: "bottom",
    size: NOTE,
    color: P.muted,
    alpha: clear * ramp(t, beganAt - (en ? 0.6 : 0.15), 0.4)
  });
  nameText(L("这句话能不能信", "can be trusted"), PX, Y3 + CLAIM_H / 2 + 18, {
    valign: "top",
    size: NOTE,
    color: P.muted,
    alpha: clear * named(t, trustAt)
  });
  link(dx + 16, dy, end, dy, {
    alpha: clear * (1 - way),
    dash: [8, 8],
    flow: way < 1 ? voiceTime(t) * 0.4 % 1 : null
  });
  link(dx + 16, dy, end, dy, { alpha: a * way, flow: voiceTime(t) * 0.4 % 1 });
  box(end + 6, dy - 45, PLACE, 90, {
    stroke: P.line,
    alpha: clear * (1 - at),
    radius: 10,
    dash: [8, 8]
  });
  nameText(L("ETHOS 的做法", "In ETHOS"), (dx + end) / 2, dy - 22, {
    valign: "bottom",
    size: NOTE,
    color: P.muted,
    alpha: a * way
  });
  const x = end + FAN;
  seal(end + 36, dy, 26, { alpha: at, color: P.ink });
  nameText(L("存证", "attestations"), end + 36, dy + 26 + NAME_GAP, { valign: "top", alpha: at });
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
  const pitch = rows[1] - rows[0];
  nameText(L("都找得到", "can all be looked up"), x - 16, rows[2] + 1.5 * pitch, {
    align: "left",
    alpha: a * named(t, lookAt)
  });
}
var REFUSED = () => [L("谁说的", "who said it"), L("走了多少流程", "how much process")];
var CONDITIONS = () => [
  L("原意是不是有一处可查", "the meaning can be found in one place"),
  L("结论有没有超出证据", "stays within its evidence"),
  L("能不能退回去", "you can get back after a mistake")
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
  const refused = REFUSED(), conditions = CONDITIONS(), A = Math.max(...refused.map((v) => measure(v))) + 16 + 26, B = 36 + 20 + Math.max(...conditions.map((v) => measure(v))), GUTTER = 200, RX = 960 - (A + GUTTER + B) / 2 + A - 42, BX2 = RX + 42 + GUTTER;
  const q = soon(t, Math.max(trustAt + 0.05, cutAt2), 0.9), PX = mix(BOUND_X + boundShift(), 960, q), PY = mix(470, 380, q), conds = [meaningAt, withinAt, backAt], rows = [545, 630, 715];
  claimPanel(t, PX, PY, { alpha: a });
  nameText(L("这句话能不能信", "can be trusted"), PX, PY + CLAIM_H / 2 + 18, {
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
var MARK = [960, 470, 640];
function close(s, t, a) {
  if (a <= 0) return;
  const [cutAt2, markAt, originAt, beforeAt, twoAt, whereAt, boundaryAt, scopeAt, pointAt, boundAt] = cues(s, [
    ["ETHOS 的标志", "The ETHOS mark"],
    ["ETHOS 的标志", "the ETHOS mark"],
    ["一个起点", "One origin"],
    ["在变成改动之前", "bounded before it becomes a change"],
    ["两条路径", "Two passages"],
    ["只在影响行动的地方分开", "only where they decide action"],
    ["一道边界", "One boundary"],
    ["各自守在自己的范围里", "each keeping to their scope"],
    ["那一点朱红", "cinnabarred point"],
    ["结论必须落到证据上的地方", "bound to its evidence"]
  ]);
  const [X, Y3, S] = MARK, k = S / 512, r = 164 * k, lit = ramp(t, boundaryAt - 0.15, 0.5), o = a * named(t, originAt), datum = named(t, pointAt), passages = soon(t, twoAt + 0.05, 1);
  ethosMark(X, Y3, S, {
    datum: 0,
    passages: 0,
    boundary: soon(t, cutAt2, 1.6),
    alpha: a * mix(0.58, 1, lit)
  });
  ethosMark(X, Y3, S, { datum: 0, boundary: 0, passages, alpha: a });
  ring(X, Y3, 14 * k, { color: P.ink, alpha: o * (1 - datum), width: 3 });
  ethosMark(X, Y3, S, { datum, hole: 1, passages: 0, boundary: 0, alpha: a });
  const q = voiceTime(t) * 0.18 % 1, ang = -0.7 - q * (2 * Math.PI - 1.4);
  flowDot(X + r * Math.cos(ang), Y3 + r * Math.sin(ang), 7, q, {
    color: P.line,
    alpha: a * (1 - lit)
  });
  nameText(L("ETHOS 的标志", "the ETHOS mark"), X, Y3 + r + 16 * k + NAME_GAP, {
    valign: "top",
    alpha: a * ramp(t, markAt - (en ? 0.75 : 0.15), 0.4)
  });
  const LEFT = X - r - 50, RIGHT = X + markExtent(S).right + 40, pair = (term, termAt, said, saidAt, x, y, align, width = 380) => {
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
  pair(
    L("一个起点", "One origin"),
    originAt,
    L("在变成改动之前，先划清边界", "bounded before it becomes a change"),
    beforeAt,
    LEFT,
    Y3 - 96,
    "right",
    L(220, 380)
  );
  pair(
    L("两条路径", "Two passages"),
    twoAt,
    L("只在影响行动的地方分开", "only where they decide action"),
    whereAt,
    RIGHT,
    Y3 - 96,
    "left"
  );
  pair(
    L("一道边界", "One boundary"),
    boundaryAt,
    L("各自守在自己的范围里", "each keeping to their scope"),
    scopeAt,
    LEFT,
    Y3 + 70,
    "right"
  );
  pair(
    L("那一点朱红", "cinnabar-red point"),
    pointAt,
    L("结论必须落到证据上的地方", "bound to its evidence"),
    boundAt,
    RIGHT,
    Y3 + 70,
    "left"
  );
}
scenes["09"] = function(s, t) {
  const [judgeAt, markAt] = cues(s, [
    ["不看是谁说的", "Whether that sentence"],
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
