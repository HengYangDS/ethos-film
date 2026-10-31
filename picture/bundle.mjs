/** The composition the engine reads, picture/film.js, bundled from the modules under picture/film/. esbuild resolves
 * their imports into one classic script whose scenes still register at the start of their lines, as the engine's
 * headless runtime finds them. Run it after editing a module: npm run compose. The composition test checks that the
 * tracked bundle is exactly what this produces. */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { build } from "esbuild";

/** The repository root, where the module paths of the bundle's comments begin. */
export const ROOT = fileURLToPath(new URL("..", import.meta.url));
export const BUNDLE = "picture/film.js";
const BANNER = `/* Generated from picture/film/ by npm run compose: edit the modules, not this file. */
"use strict";`;

/** The bundle's text: the modules' code in import order, unminified, with each module's path as a comment. */
export async function bundle() {
  const result = await build({
    absWorkingDir: ROOT,
    entryPoints: ["picture/film/playback.js"],
    bundle: true,
    format: "esm",
    charset: "utf8",
    legalComments: "none",
    logLevel: "warning",
    banner: { js: BANNER },
    write: false,
  });
  return result.outputFiles[0].text;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  writeFileSync(join(ROOT, BUNDLE), await bundle());
