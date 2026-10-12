import Image from "next/image";
import Link from "next/link";
import { WORK_FEATURE_COPY, type WorkItem as WorkItemData } from "@/lib/work/config";

interface WorkItemProps {
  item: WorkItemData;
  /** Position in the selection, 1-based, and how many pieces there are. */
  index: number;
  total: number;
  /** The first piece is near the fold and loads eagerly; the rest are lazy. */
  priority?: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * One piece of client work.
 *
 * The frame is a plain editorial rectangle — no rounded corners, no card, no
 * shadow. Reveal is a single language: the clip opens and the picture inside
 * settles from a slight over-scale; the highlighted piece opens along a
 * wave-edged front instead of a straight one (see lib/work/animation).
 *
 * The caption reads as a contents line: the piece's number, the project, then
 * the discipline set quietly — the work is the subject, the service is a note.
 *
 * Sizing is driven by the intrinsic ratio of the asset, so nothing is ever
 * letterboxed or distorted; the grid decides how wide the frame is and the
 * aspect-ratio decides how tall.
 */
export function WorkItem({ item, index, total, priority = false }: WorkItemProps) {
  const featured = item.featured;
  return (
    <figure
      className="work-item"
      data-slot={item.slot}
      data-work-item=""
      data-featured={featured ? "" : undefined}
    >
      {featured && (
        <p className="work-item__tag" data-work-tag="">
          <span className="eyebrow-box">{WORK_FEATURE_COPY.tag}</span>
        </p>
      )}

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
          sizes={
            featured
              ? "(min-width: 700px) 92vw, 88vw"
              : "(min-width: 1100px) 55vw, (min-width: 700px) 70vw, 88vw"
          }
        />
      </div>

      <figcaption className="work-item__meta" data-work-meta="">
        <span className="work-item__count" aria-hidden="true">
          {pad(index)}
          <span className="work-item__count-total"> / {pad(total)}</span>
        </span>
        <span className="work-item__project">{item.project}</span>
        <span className="work-item__discipline">{item.discipline}</span>
        {item.note && <span className="work-item__note">{item.note}</span>}
        {featured && (
          // One link, stretched over the whole piece by work.css, so the image
          // is clickable without a second link to the same place.
          <Link className="work-item__cta" href={featured.href}>
            {WORK_FEATURE_COPY.cta}
            <span className="visually-hidden">: {item.project}</span>
            <span className="work-item__cta-arrow" aria-hidden="true">
              {" "}
              →
            </span>
          </Link>
        )}
      </figcaption>
    </figure>
  );
}
