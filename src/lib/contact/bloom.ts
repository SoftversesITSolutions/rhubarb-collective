"use client";

/**
 * THE BLOOM — playback
 *
 * Draws one frame of the pre-rendered turn (see `BLOOM` in ./config) into a
 * canvas, chosen by a scroll progress the animation hands in. There is no clock
 * anywhere in here: `draw(progress)` is a pure mapping from a number to a
 * frame, so scrubbing back over the section shows exactly the frames it showed
 * on the way down.
 *
 * Loading is deferred until the figure is within reach of the viewport — the
 * run is the heaviest asset on the page and sits at its very foot — and the
 * frames arrive face-first, so the still the reader sees under reduced motion
 * and before JavaScript is also the first one available. Until the wanted frame
 * has decoded, the nearest one that has is drawn instead, so a fast scroll never
 * shows a blank.
 */

import { BLOOM } from "./config";

export interface BloomPlayer {
  /** 0 = the back of the head, 1 = face-on. Clamped. */
  draw(progress: number): void;
  destroy(): void;
}

const CONCURRENCY = 6;

export function createBloomPlayer(root: HTMLElement): BloomPlayer | null {
  const figure = root.querySelector<HTMLElement>("[data-contact-bloom]");
  const canvas = figure?.querySelector<HTMLCanvasElement>("[data-bloom-canvas]");
  const context = canvas?.getContext("2d");
  if (!figure || !canvas || !context) return null;

  const last = BLOOM.frames - 1;
  const frames: (HTMLImageElement | null)[] = new Array<HTMLImageElement | null>(
    BLOOM.frames,
  ).fill(null);
  let wanted = last;
  let painted = -1;
  let destroyed = false;
  let loading = false;

  // Layout size, never the painted size: the figure carries a scale and a
  // rotation mid-scroll, so its bounding box is a function of scroll position.
  const fit = () => {
    const edge = figure.clientWidth;
    const scale = Math.min(window.devicePixelRatio || 1, BLOOM.size / Math.max(1, edge));
    const px = Math.max(1, Math.round(edge * scale));
    if (canvas.width !== px || canvas.height !== px) {
      canvas.width = px;
      canvas.height = px;
      painted = -1;
    }
  };

  const nearestLoaded = (index: number): number => {
    for (let d = 0; d < BLOOM.frames; d++) {
      if (frames[index + d]) return index + d;
      if (frames[index - d]) return index - d;
    }
    return -1;
  };

  const paint = () => {
    if (destroyed) return;
    const index = nearestLoaded(wanted);
    if (index < 0 || index === painted) return;
    const image = frames[index];
    if (!image) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    painted = index;
    figure.dataset.bloomReady = "1";
    // Which frame is up, for anyone verifying the scrub from outside.
    figure.dataset.bloomFrame = String(index);
  };

  // Face first, then the rest of the run from the face backwards, with the
  // currently wanted frame promoted to the front of the queue.
  const load = () => {
    if (loading) return;
    loading = true;
    const order: number[] = [];
    const push = (i: number) => {
      if (i >= 0 && i <= last && !order.includes(i)) order.push(i);
    };
    push(wanted);
    for (let i = last; i >= 0; i--) push(i);

    let next = 0;
    const worker = async () => {
      while (next < order.length && !destroyed) {
        const index = order[next++];
        const image = new Image();
        image.decoding = "async";
        image.src = BLOOM.src(index);
        try {
          await image.decode();
        } catch {
          continue;
        }
        if (destroyed) return;
        frames[index] = image;
        // Repaint when this frame is the wanted one, or is nearer to it than
        // what is on the canvas.
        if (index === wanted || Math.abs(index - wanted) < Math.abs(painted - wanted)) {
          paint();
        }
      }
    };
    for (let i = 0; i < CONCURRENCY; i++) void worker();
  };

  const watcher =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              load();
              watcher?.disconnect();
            }
          },
          { rootMargin: "150% 0px" },
        )
      : null;
  if (watcher) watcher.observe(figure);
  else load();

  const resizer = new ResizeObserver(() => {
    fit();
    paint();
  });
  resizer.observe(figure);
  fit();

  return {
    draw(progress) {
      const clamped = Math.min(1, Math.max(0, progress));
      wanted = Math.round(clamped * last);
      paint();
    },
    destroy() {
      destroyed = true;
      watcher?.disconnect();
      resizer.disconnect();
      delete figure.dataset.bloomReady;
    },
  };
}
