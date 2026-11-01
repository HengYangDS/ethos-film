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

// picture/film/timing/pauses.js
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
var line = (x1, y1, x2, y2, o = {}) => stroke(() => {
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
}, o);

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

// picture/film/framing/chapters.js
var chapterOrder = film.chapters.map((c) => c.id);
var chapterNumber = (id) => String(chapterOrder.indexOf(id) + 1).padStart(2, "0");
var opensChapter = (s) => {
  const i = film.segments.indexOf(s);
  return i > 0 && film.segments[i - 1].chapter !== s.chapter;
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
