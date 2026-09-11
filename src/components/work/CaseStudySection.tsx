import Image from "next/image";
import type { CaseStudySection as SectionData } from "@/lib/work/case-study";

/**
 * ONE BLOCK OF THE STUDY.
 *
 * Three kinds, and the component branches on `type` rather than on position —
 * so re-ordering the data re-orders the page, which is what the future dynamic
 * route will do when a CMS hands it a different sequence.
 *
 *   prose   a label, a heading and paragraphs. No picture.
 *   figure  one picture at full measure with its heading and body under it.
 *   quote   the page's typographic pause: one line at display scale, on its own.
 *
 * EVERYTHING IS CONDITIONAL. A section renders exactly the fields it has — a
 * figure with no heading is a picture, a prose block with one paragraph is one
 * paragraph, a section with no index carries no marker. Nothing is filled in,
 * and no field is required except `type`.
 *
 * `slot` places the block in the 12-column field; the rules are in
 * `case-study.css`. A case study is a fixed, curated sequence, so hand-placing
 * each block is right here in a way it is not on the filterable /work archive,
 * where placement has to survive an arbitrary subset.
 */
export function CaseStudySection({
  section,
  priority = false,
}: {
  section: SectionData;
  priority?: boolean;
}) {
  const { type, index, label, heading, body, image, slot, source } = section;

  /* ---------------------------------------------------------------- *
   * THE PAUSE
   *
   * Not a `<blockquote>`: it is not a quotation from a person, and marking it
   * as one would imply an attributable speaker the deck does not have. It is a
   * heading, set large, with the origin of the phrase printed under it so a
   * reader can see it is the studio's own line and not a client's.
   * ---------------------------------------------------------------- */
  if (type === "quote") {
    return (
      <section className="cs-pause" data-cs-block="" data-slot={slot ?? "full"}>
        <p className="cs-pause__line">
          <span className="cs-pause__inner" data-cs-reveal="">
            {heading}
          </span>
        </p>
        {source && (
          <p className="cs-pause__source" data-cs-reveal="">
            {source}
          </p>
        )}
      </section>
    );
  }

  const headingId = heading ? `cs-${section.id}` : undefined;

  return (
    <section
      className="cs-section"
      data-cs-block=""
      data-type={type}
      data-slot={slot ?? "full"}
      aria-labelledby={headingId}
    >
      {(index ?? label) && (
        <p className="cs-section__marker" data-cs-reveal="">
          {index && <span className="cs-section__index">{index}</span>}
          {index && label && (
            <span className="cs-section__marker-rule" aria-hidden="true" />
          )}
          {label && <span className="cs-section__label">{label}</span>}
        </p>
      )}

      {/* The picture leads a figure block and the type follows it, because the
          work is the subject and the caption is the commentary. */}
      {type === "figure" && image && (
        <div
          className="cs-section__frame"
          data-cs-reveal=""
          style={{ aspectRatio: `${image.width} / ${image.height}` }}
        >
          <Image
            className="cs-section__image"
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(min-width: 1100px) 90vw, 88vw"
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        </div>
      )}

      {heading && (
        <h2 className="cs-section__heading" id={headingId}>
          <span className="cs-section__heading-inner" data-cs-reveal="">
            {heading}
          </span>
        </h2>
      )}

      {body?.map((paragraph) => (
        <p className="cs-section__body" key={paragraph} data-cs-reveal="">
          {paragraph}
        </p>
      ))}

      {/* Where a quoted paragraph came from. Present only where the body really
          is a quotation, so a reader can tell the studio's words from ours. */}
      {source && (
        <p className="cs-section__source" data-cs-reveal="">
          {source}
        </p>
      )}

      {image?.caption && type === "figure" && (
        <p className="cs-section__caption" data-cs-reveal="">
          {image.caption}
        </p>
      )}
    </section>
  );
}
