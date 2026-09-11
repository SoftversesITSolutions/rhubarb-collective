import Image from "next/image";
import type { InsightBlock } from "@/lib/insights/article";

/**
 * ONE BLOCK OF THE PIECE.
 *
 * Five kinds, and the component branches on `type` rather than on position — so
 * re-ordering the data re-orders the page, which is what the future dynamic
 * route will do when a CMS hands it a different sequence.
 *
 *   lede    the opening paragraph, one step above reading size
 *   prose   an optional heading and paragraphs
 *   pause   the page's one typographic break, at display scale
 *   figure  one picture with an optional caption under it
 *   list    a label, a heading and its items
 *
 * EVERYTHING IS CONDITIONAL. A block renders exactly the fields it has — a
 * figure with no caption is a picture, a prose block with one paragraph is one
 * paragraph, a block with no index carries no marker. Nothing is filled in and
 * no field is required except `id` and `type`.
 *
 * `slot` places the block in the 12-column field; the rules are in
 * `insight-article.css`.
 *
 * THE READING ORDER IS THE DOM ORDER on every tier. No `order`, no `dense`
 * auto-flow and no absolute positioning is used anywhere on this route, so what
 * a screen reader reads is what the page shows, in the sequence the data sets.
 */
export function InsightArticleBlock({
  block,
  priority = false,
}: {
  block: InsightBlock;
  priority?: boolean;
}) {
  const { id, type, index, label, heading, body, items, image, source, slot } = block;

  /* ---------------------------------------------------------------- *
   * THE PAUSE
   *
   * NOT a `<blockquote>` and no quotation marks: it is a block of this piece
   * set large, not a statement quoted from a speaker, and marking it as a
   * quotation would imply an attributable source the material does not have.
   * A `<p>`, because that is what it is.
   * ---------------------------------------------------------------- */
  if (type === "pause") {
    return (
      <section className="ia-pause" data-ia-block="" data-slot={slot ?? "full"}>
        <span className="ia-pause__rule" aria-hidden="true" data-ia-rule="" />

        <p className="ia-pause__line">
          <span className="ia-pause__inner" data-ia-reveal="">
            {heading}
          </span>
        </p>

        {source && (
          <p className="ia-pause__source" data-ia-reveal="">
            {source}
          </p>
        )}
      </section>
    );
  }

  /* A heading gets an id so its section can point at it; a block without one
     stays unlabelled rather than being given an invented name. */
  const headingId = heading ? `ia-${id}` : undefined;

  return (
    <section
      className="ia-block"
      data-ia-block=""
      data-type={type}
      data-slot={slot ?? "full"}
      aria-labelledby={headingId}
    >
      {(index ?? label) && (
        <p className="ia-block__marker" data-ia-reveal="">
          {index && <span className="ia-block__index">{index}</span>}
          {index && label && (
            <span className="ia-block__marker-rule" aria-hidden="true" />
          )}
          {label && <span className="ia-block__label">{label}</span>}
        </p>
      )}

      {/* A figure leads with its picture and the type follows it, because the
          picture is the subject and the caption is the commentary. */}
      {type === "figure" && image && (
        <figure className="ia-block__figure">
          <div
            className="ia-block__frame"
            data-ia-reveal=""
            style={{ aspectRatio: `${image.width} / ${image.height}` }}
          >
            <Image
              className="ia-block__image"
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes={image.sizes}
              priority={priority}
              loading={priority ? undefined : "lazy"}
            />
          </div>

          {/* Only where a caption genuinely exists. Never written for the page. */}
          {image.caption && (
            <figcaption className="ia-block__caption" data-ia-reveal="">
              {image.caption}
            </figcaption>
          )}
        </figure>
      )}

      {heading && type === "list" && (
        <h2 className="ia-block__list-heading" id={headingId} data-ia-reveal="">
          {heading}
        </h2>
      )}

      {heading && type !== "list" && (
        <h2 className="ia-block__heading" id={headingId}>
          <span className="ia-block__heading-inner" data-ia-reveal="">
            {heading}
          </span>
        </h2>
      )}

      {body?.map((paragraph) => (
        <p className="ia-block__body" key={paragraph} data-ia-reveal="">
          {paragraph}
        </p>
      ))}

      {/* A real list, marked up as one. No chips, no pills, no boxes — eight
          names in a stated order is a `<ul>`. */}
      {items && items.length > 0 && (
        <ul className="ia-block__items">
          {items.map((item) => (
            <li className="ia-block__item" key={item} data-ia-reveal="">
              {item}
            </li>
          ))}
        </ul>
      )}

      {/* Where a quoted block came from. Present only where the body really is
          a quotation, so a reader can tell whose words they are reading. */}
      {source && (
        <p className="ia-block__source" data-ia-reveal="">
          {source}
        </p>
      )}
    </section>
  );
}
