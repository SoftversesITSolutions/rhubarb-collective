import Image from "next/image";
import type { ArchiveArticle } from "@/lib/insights/archive";

interface ArticleCardProps {
  article: ArchiveArticle;
  /**
   * Place in the CURRENTLY FILTERED list. Position 0 is the feature; the rest
   * cycle a three-beat rhythm. Keying off the filtered index rather than a
   * per-piece slot is what lets any subset compose — the same rule /work's
   * archive is placed under.
   */
  position: number;
  /** The first card of an unfiltered archive is above the fold. */
  priority?: boolean;
}

/**
 * ONE PIECE, AS AN EDITORIAL COMPOSITION.
 *
 * Image, strand, headline, standfirst, byline — laid out as one object rather
 * than packed into a box. No card: no border, no fill, no radius, no shadow, no
 * scrim, no "read more" button, no arrow and no tag pill. The picture is the
 * picture and the type sits under it, which is how the homepage's editorial
 * section and /work's archive already treat a frame and its caption.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EVERY FIELD IS OPTIONAL AND NOTHING IS FILLED IN
 * ─────────────────────────────────────────────────────────────────────────────
 * `title` is the only thing a piece must have. A piece with no image renders as
 * type and keeps its place in the grid — no placeholder plate, no grey
 * rectangle, no stock photograph. No author, no byline. No date, no date. No
 * strand, no label. This is the same grammar the homepage uses for a position
 * with no piece in it and /work uses for a case study with no page.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE DATE
 * ─────────────────────────────────────────────────────────────────────────────
 * `<time>` always; `dateTime` only when the entry carries a real machine date.
 * A `dateTime` derived by parsing a hand-typed display string is how an archive
 * quietly announces the wrong day to every machine reading it, so the attribute
 * is simply omitted when the ISO date is absent — which is still valid and
 * still correct.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE LINK
 * ─────────────────────────────────────────────────────────────────────────────
 * `href` is null until an article route exists, and no article route is built
 * by this task. So a piece renders as a plain `<article>` and takes NO hover
 * treatment: a headline that lifts under the pointer and then goes nowhere is
 * worse than one that sits still. When a route lands, the headline becomes a
 * real `<a>` whose box covers the picture too, and the hover rule — already
 * written and gated on `[data-linked]` — starts applying.
 *
 * The link wraps the headline rather than the whole composition, with a
 * stretched hit area over the frame: that keeps the accessible name to the
 * headline instead of the picture's alt text plus the excerpt plus the byline
 * read out as one link.
 */
export function ArticleCard({ article, position, priority = false }: ArticleCardProps) {
  const { title, category, date, iso, author, excerpt, image, href } = article;

  /* Position 0 is the feature; the rest cycle three beats. Both need different
     picture widths, and the `sizes` hint has to agree with the grid. */
  const feature = position === 0;
  const beat = feature ? "feature" : String((position - 1) % 3);
  const wide = feature || beat === "2";
  const sizes = wide
    ? "(min-width: 1100px) 62vw, (min-width: 700px) 82vw, 88vw"
    : "(min-width: 1100px) 40vw, (min-width: 700px) 62vw, 88vw";

  const hasMeta = Boolean(category ?? date);

  return (
    <article
      className="in-card"
      data-in-card=""
      data-beat={beat}
      data-linked={href ? "" : undefined}
      data-imageless={image ? undefined : ""}
    >
      {image && (
        <div
          className="in-card__frame"
          data-in-reveal=""
          style={{
            aspectRatio: image.ratio
              ? `${image.ratio[0]} / ${image.ratio[1]}`
              : `${image.width} / ${image.height}`,
          }}
        >
          <Image
            className="in-card__image"
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes={sizes}
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        </div>
      )}

      <div className="in-card__body">
        {hasMeta && (
          <p className="in-card__meta" data-in-reveal="">
            {category && <span className="in-card__category">{category}</span>}
            {category && date && (
              <span className="in-card__separator" aria-hidden="true" />
            )}
            {date && (
              <time className="in-card__date" dateTime={iso ?? undefined}>
                {date}
              </time>
            )}
          </p>
        )}

        <h3 className="in-card__title" data-in-reveal="">
          {href ? (
            <a className="in-card__link" href={href}>
              {title}
            </a>
          ) : (
            title
          )}
        </h3>

        {excerpt && (
          <p className="in-card__excerpt" data-in-reveal="">
            {excerpt}
          </p>
        )}

        {author && (
          <p className="in-card__byline" data-in-reveal="">
            {author}
          </p>
        )}
      </div>
    </article>
  );
}
