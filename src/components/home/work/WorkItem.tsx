import Image from "next/image";
import type { WorkItem as WorkItemData } from "@/lib/work/config";

interface WorkItemProps {
  item: WorkItemData;
  /** The first piece is near the fold and loads eagerly; the rest are lazy. */
  priority?: boolean;
}

/**
 * One piece of client work.
 *
 * The frame is a plain editorial rectangle — no rounded corners, no card, no
 * shadow. Reveal is a single language: the clip inset opens and the picture
 * inside settles from a slight over-scale. Everything else the timeline does to
 * this element is opacity on the caption.
 *
 * Sizing is driven by the intrinsic ratio of the asset, so nothing is ever
 * letterboxed or distorted; the grid decides how wide the frame is and the
 * aspect-ratio decides how tall.
 */
export function WorkItem({ item, priority = false }: WorkItemProps) {
  return (
    <figure className="work-item" data-slot={item.slot} data-work-item="">
      <div
        className="work-item__frame"
        data-work-frame=""
        style={{ aspectRatio: `${item.width} / ${item.height}` }}
      >
        <Image
          className="work-item__image"
          data-work-image=""
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(min-width: 1100px) 55vw, (min-width: 700px) 70vw, 88vw"
        />
      </div>

      <figcaption className="work-item__meta" data-work-meta="">
        <span className="work-item__project">{item.project}</span>
        <span className="work-item__discipline">{item.discipline}</span>
        {item.note && <span className="work-item__note">{item.note}</span>}
      </figcaption>
    </figure>
  );
}
