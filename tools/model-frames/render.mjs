// Renders the homepage's 3D specimens (client round 2, priority 5) as short
// runs of transparent webp frames, one folder per model.
//
//   node tools/model-frames/render.mjs <models-dir> [only-id]
//
// <models-dir> holds the Sketchfab downloads named as in models.json (GLB
// files, or a folder with scene.gltf). The models are CC BY 4.0 and are not
// committed; their sources and credits are in src/lib/specimens/config.ts.
// Nothing is installed: three.js comes from a CDN inside headless Chrome (the
// puppeteer cache binary, see ../sunflower-frames/cdp.mjs).
//
// models.json is the single place the frame parameters live; `frames` there
// must agree with SPECIMEN_FRAMES in the config.
import { spawn } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { launch, openTab, sleep } from "../sunflower-frames/cdp.mjs";

const here = dirname(fileURLToPath(import.meta.url));
if (!process.argv[2]) { console.error("usage: node tools/model-frames/render.mjs <models-dir> [only-id]"); process.exit(1); }
const modelsDir = resolve(process.argv[2]);
const only = process.argv[3];
const manifest = JSON.parse(readFileSync(resolve(here, "models.json"), "utf8"));
const outRoot = resolve("public/assets/brand/specimens");
const PORT = 8125;

// Stage: render.html beside a link to the models, served over http.
const stage = resolve(here, ".stage");
rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
cpSync(resolve(here, "render.html"), resolve(stage, "render.html"));
symlinkSync(modelsDir, resolve(stage, "m"));
const server = spawn(process.execPath, [resolve(here, "../sunflower-frames/server.mjs"), stage, String(PORT)], { stdio: "ignore" });
await sleep(600);

const chrome = await launch(9345);
try {
  const tab = await openTab(9345);
  await tab.viewport(manifest.size + 40, manifest.size + 40);
  await tab.goto(`http://localhost:${PORT}/render.html`);
  for (let i = 0; i < 400; i++) { if (await tab.evaluate("!!window.ready")) break; await sleep(250); }
  await tab.evaluate(`window.setSize(${manifest.size})`);
  for (const model of manifest.models) {
    if (only && model.id !== only) continue;
    await tab.evaluate(`window.loadModel('/m/${model.file}', ${JSON.stringify(model.light ?? {})})`);
    const out = resolve(outRoot, model.id);
    mkdirSync(out, { recursive: true });
    let total = 0;
    for (let i = 0; i < manifest.frames; i++) {
      const yaw = model.yaw[0] + (model.yaw[1] - model.yaw[0]) * (i / (manifest.frames - 1));
      const url = await tab.evaluate(`window.renderFit(${yaw}, ${model.pitch}, 24, 0.9, 'image/webp', ${manifest.quality})`);
      const buf = Buffer.from(url.split(",")[1], "base64");
      total += buf.length;
      writeFileSync(resolve(out, `t-${String(i).padStart(2, "0")}.webp`), buf);
    }
    console.log(`${model.id}: ${manifest.frames} frames, ${(total / 1024).toFixed(0)} KB`);
  }
  tab.close();
} finally {
  chrome.kill();
  server.kill();
}
