import Image from "next/image";
import { JOURNAL_COPY, type JournalPosition } from "@/lib/journal/config";

interface JournalItemProps {
  position: JournalPosition;
  /** 1-based place in the field. Structural, never presented as a piece's number. */
  ordinal: number;
}

/**
 * One place in the editorial field — filled or waiting.
 *
 * THE PIECE IS THE VISUAL OBJECT when one exists: its title takes the display
 * face and the largest step in the block, with the strand and date as restrained
 * metadata above it, and its image — if it has one — is left to be the image
 * rather than being dressed as a card.
 *
 * WHEN NO PIECE EXISTS the position renders as what it is: an empty place in the
 * composition, carrying its position in the field and the word "Unwritten". No
 * title is invented, no date is invented, no strand is claimed, no image stands
 * in and no link is offered. That switch is the whole point of `data-state` —
 * and it is the same grammar Section 5 uses for its unexposed portrait plates
 * and Section 6 for its quote-less relationships.
 *
 * Everything renders conditionally and independently, so every shape the data
 * can take is supported: title only; title + strand; with or without a date, an
 * excerpt or an image; linked or not. A piece whose route does not exist yet
 * renders as plain type rather than as a link to a 404 — see `JournalEntry.href`.
 *
 * All of it is real DOM text and all of it is in the server render. Nothing
 * about a piece depends on SVG, on script, or on animation.
 */
export function JournalItem({ position, ordinal }: JournalItemProps) {
  const { entry } = position;
  const place = String(ordinal).padStart(2, "0");

  /* ---------------------------------------------------------------- *
   * WAITING — no piece exists for this position yet.
   *
   * Deliberately not an <article> and deliberately without a heading: an
   * empty place in a layout is not a document, and giving it a heading
   * would put a fictitious article into the document outline and into
   * every screen reader's list of headings.
   * ---------------------------------------------------------------- */
  if (!entry) {
    return (
      <div
        className="journal-item"
        data-journal-item=""
        data-slot={position.slot}
        data-size={position.size}
        data-state="waiting"
      >
        <span className="journal-item__place" aria-hidden="true">
          {place}
        </span>
        <span className="journal-item__rule" data-journal-rule="" aria-hidden="true" />
        <p className="journal-item__state" data-journal-reveal="">
          {JOURNAL_COPY.unwritten}
        </p>

        {/*
          DEVELOPMENT-STATE SLOT. Marks a position waiting on real editorial, so
          the gap is impossible to miss while building and impossible to ship: it
          is compiled out of the production bundle entirely. It is taken out of
          flow so that dev and production lay out identically — the generated
          network is a function of the measured composition, and a marker that
          changed the field height would change the geometry along with it.
        */}
        {process.env.NODE_ENV !== "production" && (
          <p className="journal-item__pending" data-journal-pending="">
            Editorial content required
          </p>
        )}
      </div>
    );
  }

  const { title, category, date, excerpt, image, href } = entry;
  const hasMeta = Boolean(category ?? date);

  const heading = (
    <h3 className="journal-item__title" data-journal-reveal="">
      {href ? (
        <a className="journal-item__link" href={href}>
          {title}
        </a>
      ) : (
        title
      )}
    </h3>
  );

  return (
    <article
      className="journal-item"
      data-journal-item=""
      data-slot={position.slot}
      data-size={position.size}
      data-state="published"
      data-linked={href ? "" : undefined}
    >
      {/* A supplied editorial image — artwork, a documentary still, a
          photograph. Optional by design: the field is composed to work without
          one, and no stock image ever stands in. */}
      {image && (
        <figure
          className="journal-item__image"
          data-journal-reveal=""
          style={{
            aspectRatio: image.ratio
              ? `${image.ratio[0]} / ${image.ratio[1]}`
              : `${image.width} / ${image.height}`,
          }}
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            sizes="(min-width: 1100px) 40vw, (min-width: 700px) 55vw, 85vw"
          />
        </figure>
      )}

      {hasMeta && (
        <p className="journal-item__meta" data-journal-meta="">
          {category && <span className="journal-item__category">{category}</span>}
          {category && date && (
            <span className="journal-item__separator" aria-hidden="true" />
          )}
          {date && (
            <span className="journal-item__date">
              {date}
            </span>
          )}
        </p>
      )}

      <span className="journal-item__rule" data-journal-rule="" aria-hidden="true" />

      {heading}

      {excerpt && (
        <p className="journal-item__excerpt" data-journal-reveal="">
          {excerpt}
        </p>
      )}
    </article>
  );
}
