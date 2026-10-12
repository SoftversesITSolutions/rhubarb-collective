/**
 * SPECIMENS — playback
 *
 * Draws one frame of a specimen's pre-rendered turn into a canvas, chosen by
 * a scroll progress. The same idea as the contact bloom's player
 * (lib/contact/bloom), kept separate so that approved piece is not touched:
 * no clock, a pure mapping from a number to a frame, frames fetched only
 * once the figure is near the viewport, and the nearest decoded frame shown
 * until the wanted one arrives.
 */

import { SPECIMEN_FRAMES, SPECIMEN_SIZE, specimenFrame, type SpecimenId } from "./config";

export interface SpecimenPlayer {
  /** 0 = the first frame of the turn, 1 = the last. Clamped. */
  draw(progress: number): void;
  destroy(): void;
}

export function createSpecimenPlayer(
  figure: HTMLElement,
  canvas: HTMLCanvasElement,
  id: SpecimenId,
): SpecimenPlayer | null {
  const context = canvas.getContext("2d");
  if (!context) return null;

  const last = SPECIMEN_FRAMES - 1;
  const frames: (HTMLImageElement | null)[] = new Array<HTMLImageElement | null>(
    SPECIMEN_FRAMES,
  ).fill(null);
  let wanted = Math.round(last / 2);
  let painted = -1;
  let destroyed = false;
  let loading = false;

  const fit = () => {
    const edge = figure.clientWidth;
    const scale = Math.min(window.devicePixelRatio || 1, SPECIMEN_SIZE / Math.max(1, edge));
    const px = Math.max(1, Math.round(edge * scale));
    if (canvas.width !== px || canvas.height !== px) {
      canvas.width = px;
      canvas.height = px;
      painted = -1;
    }
  };

  const nearestLoaded = (index: number): number => {
    for (let d = 0; d < SPECIMEN_FRAMES; d++) {
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
    figure.dataset.frame = String(index);
  };

  const load = () => {
    if (loading) return;
    loading = true;
    // The wanted frame first, then outward from it.
    const order: number[] = [wanted];
    for (let d = 1; d <= last; d++) {
      if (wanted + d <= last) order.push(wanted + d);
      if (wanted - d >= 0) order.push(wanted - d);
    }
    let next = 0;
    const worker = async () => {
      while (next < order.length && !destroyed) {
        const index = order[next++];
        const image = new Image();
        image.decoding = "async";
        image.src = specimenFrame(id, index);
        try {
          await image.decode();
        } catch {
          continue;
        }
        if (destroyed) return;
        frames[index] = image;
        if (painted < 0 || Math.abs(index - wanted) < Math.abs(painted - wanted)) paint();
      }
    };
    for (let i = 0; i < 4; i++) void worker();
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
          { rootMargin: "120% 0px" },
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
      wanted = Math.round(Math.min(1, Math.max(0, progress)) * last);
      paint();
    },
    destroy() {
      destroyed = true;
      watcher?.disconnect();
      resizer.disconnect();
    },
  };
}
