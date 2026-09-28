// Renders the contact bloom's turn (client note 8) as transparent webp frames.
//
//   node tools/sunflower-frames/render.mjs <model-dir> [out-dir]
//
// <model-dir> holds the Sketchfab glTF export: scene.gltf, scene.bin and
// textures/. The model is "Sunflower" by Polygonal Miniatures, CC BY 4.0 —
// https://sketchfab.com/3d-models/sunflower-569a71ccf4d94c1585c9573521fb998f.
// It is not committed (2 MB binary + a 21 MB texture); download it again from
// that page to re-render. Nothing is installed: three.js comes from a CDN inside
// headless Chrome, which is the puppeteer cache binary (see cdp.mjs).
//
// The frame parameters below are what `BLOOM` in src/lib/contact/config.ts
// expects: 41 frames, yaw -160° (the back of the head) → 0° (face-on), a 6°
// pitch so the disc shows its depth, 1024 px, the flower filling 90 % of the
// frame. Change them together or not at all.
import { spawn } from "node:child_process";
import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { launch, openTab, sleep } from "./cdp.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const modelDir = resolve(process.argv[2] || "");
const outDir = resolve(process.argv[3] || "public/assets/brand/sunflower");
if (!process.argv[2]) { console.error("usage: node tools/sunflower-frames/render.mjs <model-dir> [out-dir]"); process.exit(1); }

const STEPS = 40, YAW0 = -160, PITCH = 6, FOV = 28, FIT = 0.9, SIZE = 1024, QUALITY = 0.74, PORT = 8123;

// Stage: render.html next to a copy of the model, served over http (file://
// cannot load the .bin and the texture).
const stage = resolve(here, ".stage");
mkdirSync(stage, { recursive: true });
cpSync(resolve(here, "render.html"), resolve(stage, "render.html"));
cpSync(modelDir, resolve(stage, "model"), { recursive: true });
const server = spawn(process.execPath, [resolve(here, "server.mjs"), stage, String(PORT)], { stdio: "ignore" });
await sleep(600);

mkdirSync(outDir, { recursive: true });
const chrome = await launch(9333);
try {
  const tab = await openTab(9333);
  await tab.viewport(SIZE + 40, SIZE + 40);
  await tab.goto(`http://localhost:${PORT}/render.html`);
  for (let i = 0; i < 400; i++) { if (await tab.evaluate("!!window.ready")) break; await sleep(250); }
  await tab.evaluate(`window.__setSize(${SIZE})`);
  let total = 0;
  for (let i = 0; i <= STEPS; i++) {
    const yaw = YAW0 + (0 - YAW0) * (i / STEPS);
    const url = await tab.evaluate(`window.renderView(${yaw}, ${PITCH}, 0, ${FOV}, ${FIT}, 'image/webp', ${QUALITY})`);
    const buf = Buffer.from(url.split(",")[1], "base64");
    total += buf.length;
    writeFileSync(resolve(outDir, `turn-${String(i).padStart(2, "0")}.webp`), buf);
  }
  console.log(`${STEPS + 1} frames → ${outDir} (${(total / 1024).toFixed(0)} KB)`);
  tab.close();
} finally {
  chrome.kill();
  server.kill();
}
