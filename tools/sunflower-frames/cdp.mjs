// Minimal CDP client over Node's global WebSocket. Zero dependencies.
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = `${process.env.HOME}/.cache/puppeteer/chrome-headless-shell/mac_arm-150.0.7871.24/chrome-headless-shell-mac-arm64/chrome-headless-shell`;

export async function launch(port = 9222) {
  const dir = mkdtempSync(join(tmpdir(), "rh-cdp-"));
  const proc = spawn(CHROME, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${dir}`,
    "--hide-scrollbars",
    "--no-first-run",
    "--disable-gpu",
    "about:blank",
  ], { stdio: "ignore" });
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (r.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  return { proc, port, kill: () => proc.kill("SIGKILL") };
}

export async function openTab(port = 9222) {
  const r = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" });
  const info = await r.json();
  const ws = new WebSocket(info.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) rej(new Error(JSON.stringify(msg.error)));
      else res(msg.result);
    } else if (msg.method) {
      for (const l of listeners) l(msg);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async (expression, awaitPromise = true) => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  await send("Page.enable");
  await send("Runtime.enable");
  return {
    send, evaluate, ws,
    on: (fn) => listeners.push(fn),
    async goto(url) {
      const done = new Promise((res) => { const l = (m) => { if (m.method === "Page.loadEventFired") res(); }; listeners.push(l); });
      await send("Page.navigate", { url });
      await done;
    },
    async viewport(width, height, dpr = 1) {
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: dpr, mobile: width < 700 });
    },
    async reducedMotion(on) {
      await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: on ? "reduce" : "no-preference" }] });
    },
    async screenshot(path, clip) {
      const { writeFileSync } = await import("node:fs");
      const r = await send("Page.captureScreenshot", { format: "png", ...(clip ? { clip: { ...clip, scale: 1 } } : {}) });
      writeFileSync(path, Buffer.from(r.data, "base64"));
    },
    close: () => ws.close(),
  };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
