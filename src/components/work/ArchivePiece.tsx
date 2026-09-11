import Image from "next/image";
import type { ArchivePiece as ArchivePieceData, Industry } from "@/lib/work/archive";

interface ArchivePieceProps {
  piece: ArchivePieceData;
  /**
   * Position in the CURRENTLY FILTERED list, not in the archive. The grid
   * rhythm in work-page.css keys off `position % 4`, which is what lets any
   * filtered subset compose without a per-item slot that only works for "All".
   */
  position: number;
  /** Resolved labels for this piece's industries. */
  industries: Industry[];
  /** The first piece of a view is above the fold and loads eagerly. */
  priority?: boolean;
}

/**
 * ONE PIECE OF WORK.
 *
 * The picture is the object and everything else is a caption under it. No card,
 * no panel, no border box, no radius, no shadow, no overlay, no gradient scrim,
 * no tag pill, no "view project" button and no hover-only metadata — every fact
 * about the piece is on screen at rest, on a phone as much as on a desktop.
 *
 * SIZED BY THE ASSET, NEVER BY THE SLOT. The frame carries the file's own
 * aspect ratio as an inline style, so the grid decides how wide a piece is and
 * the artwork decides how tall. Nothing is letterboxed, nothing is stretched,
 * and because the ratio is in the markup the row height is correct before the
 * image arrives — a slow picture never moves the type around it. This is the
 * same contract the homepage's Selected Work section and the About page's
 * figures already use.
 *
 * NO LINK, YET, AND NO PRETEND ONE. `href` is null on every piece today because
 * no case-study route exists — see the header of `lib/work/archive`. A piece
 * with an href renders as an `<a>` wrapping the frame and takes the hover
 * treatment; a piece without one is a plain `<figure>` and has no hover state at
 * all, because a picture that moves under the pointer and then does nothing is
 * a worse picture. Nothing about the caption changes either way.
 *
 * `data-wk-frame` and `data-wk-meta` belong to the scroll reveal; the wrapper's
 * `data-wk-piece` belongs to the filter transition. They are deliberately
 * different elements — see the header of `lib/work/pageAnimation`.
 */
export function ArchivePiece({
  piece,
  position,
  industries,
  priority = false,
}: ArchivePieceProps) {
  /*
   * The wide slots are seven of twelve columns and the narrow ones five, inside
   * the page gutter. A tall asset is never given a wide slot, so it is always
   * asking for the narrow measure.
   */
  const wide = position % 4 === 0 || position % 4 === 3;
  const sizes =
    wide && !piece.tall
      ? "(min-width: 1100px) 56vw, (min-width: 700px) 78vw, 88vw"
      : "(min-width: 1100px) 40vw, (min-width: 700px) 64vw, 88vw";

  const frame = (
    <div
      className="wk-piece__frame"
      data-wk-frame=""
      style={{ aspectRatio: `${piece.width} / ${piece.height}` }}
    >
      <Image
        className="wk-piece__image"
        src={piece.src}
        alt={piece.alt}
        width={piece.width}
        height={piece.height}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
      />
    </div>
  );

  return (
    <figure
      className="wk-piece"
      data-wk-piece=""
      data-pos={position % 4}
      data-tall={piece.tall ? "" : undefined}
      data-linked={piece.href ? "" : undefined}
    >
      {piece.href ? (
        <a className="wk-piece__link" href={piece.href}>
          {frame}
        </a>
      ) : (
        frame
      )}

      <figcaption className="wk-piece__meta" data-wk-meta="">
        {/* The client is the loudest thing in the caption and the only part of
            it set in the display face — it is what a reader is scanning for. */}
        <span className="wk-piece__client">{piece.project}</span>

        <span className="wk-piece__facts">
          <span className="wk-piece__discipline">{piece.discipline}</span>

          {industries.map((industry) => (
            <span className="wk-piece__industry" key={industry.id}>
              {industry.label}
            </span>
          ))}

          {/* Only where the deck genuinely states a second line — a location for
              the bakery, a category for the honey. Absent on the other four. */}
          {piece.note && <span className="wk-piece__note">{piece.note}</span>}
        </span>
      </figcaption>
    </figure>
  );
}
