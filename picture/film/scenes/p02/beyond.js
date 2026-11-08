/* 02.4 Claims go beyond their evidence: three steps whose claims overrun what they proved, and the opening sentence's
 * "all tests pass", which shows only that the tests someone wrote have passed. */

import { CLAIM_DATUM, claimPanel, claimWidth } from "../claim.js";
import { centring } from "../p03/kernel.js";
import { ctx } from "../../canvas.js";
import { flowClock, link } from "../../drawing/links.js";
import { box, drawnShare, labelSize, measure, stroke } from "../../drawing/strokes.js";
import { illustrative } from "../../framing/chapters.js";
import { building, listIn, listLevel, named } from "../../naming/lists.js";
import { NAME_GAP, nameText, termRow } from "../../naming/names.js";
import { LABEL, P } from "../../palette.js";
import { L } from "../../timeline.js";
import { clamp, mix, ramp } from "../../timing/easing.js";
import { glideSteps } from "../../timing/pauses.js";

/* 02.4 Each step's evidence is a short solid block, and the claim made from it an outline that grows out of the block
 * on the claim's words and runs far past it: one machine and everything, a merge and a release, a deployment and actual
 * benefit. The evidence is named at the left, the claim at the outline's end, each by its noun where the voice gives
 * one: English names the first evidence as a run, with "passed on one machine" joining under it on its words, and
 * Chinese names the second claim 发布, a release, on its word. On the words that say each step proves only its own
 * part, each block lights and the outlines' overrun turns dashed. */
export function stageClaims(t, a, c) {
  if (a <= 0) return;
  const X0 = 760,
    EW = 130,
    CW = 500,
    H = 30,
    // The rows keep their spoken order and stand lower while the list builds, rising a step as each arrives, so the
    // picture under the index stays balanced.
    ys = [430, 570, 710].map((y) => y + building(t, [c.eCut, c.merge, c.deploy], 105)),
    evidence = [c.local, c.merge, c.deploy],
    claims = [c.everything, c.release, c.benefit2],
    own = ramp(t, c.ownPart - 0.15, 0.4);
  const evidenceNames = L(
      ["本地跑通", "代码合进去", "部署成功"],
      ["A run", "A merge", "A deployment"],
    ),
    evidenceQuals = L([[], [], []], [["passed on one machine"], [], []]),
    claimNames = L(
      ["全部通过", "发布", "实际效益"],
      ["Everything passes", "A release", "Actual benefit"],
    ),
    claimAts = [c.everything, L(c.releaseName, c.release), c.benefit2],
    em = labelSize(LABEL);
  ys.forEach((y, i) => {
    // The first step stands from the cut, its clause already begun. The claim's outline draws out of the block, its
    // far end leading at the tip pace over its own way (drawnShare).
    const on = a * ramp(t, (i ? evidence[i] : c.eCut) - 0.15, 0.4),
      grow = drawnShare({ t, at: claims[i] - 0.1 }, CW - EW),
      w = mix(EW, CW, grow);
    if (on < 0.01) return;
    box(X0, y - H / 2, EW, H, { fill: P.ink, alpha: on, radius: 6 });
    // The claim's outline: solid over the evidence, and past it solid until the steps are said to prove only their
    // own part, then dashed.
    box(X0, y - H / 2, w, H, {
      stroke: P.ink,
      alpha: on * (1 - own * grow),
      radius: 8,
      width: 2.5,
    });
    box(X0, y - H / 2, w, H, {
      stroke: P.ink,
      alpha: on * own * grow * 0.85,
      radius: 8,
      width: 2.5,
      dash: [8, 8],
    });
    // Each block lights once, in turn, as the steps are said to prove only their own part.
    const flash = clamp((t - c.ownPart - 0.05 - 0.3 * i) / 0.5);
    if (flash > 0 && flash < 1)
      box(X0 - 7, y - H / 2 - 7, EW + 14, H + 14, {
        stroke: P.ink,
        alpha: on * Math.sin(Math.PI * flash) * 0.6,
        radius: 10,
        width: 3,
      });
    // Each evidence name stands on its row's line, its qualifier, where it has one, under it.
    const said = [c.eCut, ...evidence.slice(1)];
    termRow(
      t,
      [evidenceNames[i]],
      [said[i]],
      evidenceQuals[i],
      [c.local],
      X0 - NAME_GAP,
      y - em / 2,
      {
        align: "right",
        alpha: a * listLevel(t, said, i),
        set: "evidence",
      },
    );
    nameText(claimNames[i], X0 + CW + NAME_GAP, y, {
      align: "left",
      alpha: a * listIn(t, claimAts, i),
      set: "claims",
    });
  });
  // The part each step proves is its solid block, so its name stands under the blocks' column, not under the claim.
  nameText(L("它自己那一段", "Its own part"), X0 + EW / 2, ys[2] + H / 2 + 40, {
    valign: "top",
    alpha: a * named(t, c.ownName),
  });
}

/* 02.4 Even "all tests pass" shows only that the tests someone wrote have passed: the opening sentence, linked down to
 * the requirement's cells, which stand with it from the cut as one mark; on its words a block of them fills with the
 * checks of the tests written, and the words that ask whether they are enough name the whole grid. The sentence and its
 * grid stand centred on the frame from the cut; the tests' name hangs one gap left of the grid, on the axis of the
 * block it names, so as it is said the whole stage glides as one to centre what then stands, from that name to the
 * sentence's datum. */
export function stageTests(t, a, c) {
  if (a <= 0) return;
  illustrative(a);
  const S = 46,
    cols = 8,
    rows = 4,
    writtenName = L("已经写好的那些测试", "The tests someone wrote"),
    enoughName = L("这些测试够不够", "Whether those tests are enough"),
    reachLeft = (cols * S) / 2 + NAME_GAP + measure(writtenName),
    reachRight = Math.max((cols * S) / 2, claimWidth() / 2 + CLAIM_DATUM, measure(enoughName) / 2),
    dx = glideSteps(t, 0, [[c.written, centring(960 - reachLeft, 960 + reachRight)]]),
    PY = 380,
    GX = 960 + dx,
    GY = 650,
    left = GX - (cols * S) / 2,
    top = GY - (rows * S) / 2;
  claimPanel(t, GX, PY, { alpha: a });
  const tests = a * ramp(t, c.written - 0.15, 0.4),
    q = flowClock(t);
  // The cells: the tests written are the first three of the first two rows, the rest of the requirement around them.
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
          const x = left + i * S + S / 2,
            y = top + j * S + S / 2;
          ctx.moveTo(x - 9, y);
          ctx.lineTo(x - 3, y + 7);
          ctx.lineTo(x + 10, y - 8);
        }
    },
    { color: P.ink, alpha: tests, width: 3 },
  );
  stroke(
    cells((i, j) => !written(i, j)),
    { color: P.line, alpha: a, width: 2 },
  );
  stroke(cells(written), { color: P.line, alpha: a * (1 - tests), width: 2 });
  link(GX, PY + 42, left + 1.5 * S, top + 4, {
    route: "vhv",
    mid: (PY + 42 + top) / 2,
    alpha: a,
    flow: q,
  });
  nameText(writtenName, left - NAME_GAP, top + S, {
    align: "right",
    alpha: a * named(t, c.written),
  });
  nameText(enoughName, GX, top + rows * S + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.enough),
  });
}
