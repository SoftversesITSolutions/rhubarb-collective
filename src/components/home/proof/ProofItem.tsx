import Image from "next/image";
import type { ProofItem as ProofItemData } from "@/lib/proof/config";

interface ProofItemProps {
  item: ProofItemData;
}

/**
 * One relationship, as a node in the network.
 *
 * THE QUOTE IS THE VISUAL OBJECT. Where the client has supplied a statement it
 * takes the display face and the largest step in the block, and the client name
 * steps down to a label above it. Where none exists yet the client identity
 * carries the block instead, at that same display weight — so the composition is
 * complete today and reorganises itself around a real quote the moment one is
 * added, without a component or a stylesheet changing. That switch is the whole
 * point of `data-voice`.
 *
 * Everything renders conditionally and independently, so the four shapes the
 * data can take are all supported: quote only; quote + client; quote + person +
 * role; and — the state the client is actually in right now — client and
 * relationship with no quote at all. Logos and images are the same: supported,
 * optional, and absent rather than substituted.
 *
 * All of it is real DOM text and all of it is in the server render. Nothing
 * about who a client is depends on SVG, on script, or on animation.
 */
export function ProofItem({ item }: ProofItemProps) {
  const { logo, image, quote } = item;
  const hasQuote = Boolean(quote);
  const attributed = Boolean(item.person ?? item.role);

  return (
    <article
      className="proof-item"
      data-proof-item=""
      data-slot={item.slot}
      data-size={item.size}
      data-voice={hasQuote ? "quote" : "identity"}
    >
      {/* A supplied client mark, at its own proportions. When one exists it
          carries the identity visually and the heading below stays in the
          document as the accessible name, rather than being set twice. */}
      {logo && (
        <div className="proof-item__logo" data-proof-reveal="">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            loading="lazy"
            sizes="(min-width: 1100px) 14vw, 30vw"
          />
        </div>
      )}

      <h3
        className={`proof-item__client${logo ? " visually-hidden" : ""}`}
        {...(logo ? {} : { "data-proof-reveal": "" })}
      >
        {item.client}
      </h3>

      {item.descriptor && (
        <p className="proof-item__descriptor" data-proof-reveal="">
          {item.descriptor}
        </p>
      )}

      {/* A supplied photograph — a portrait, a collaboration shot, a brand
          artifact. Optional by design: the field is composed to work without
          one, and no stock image ever stands in. */}
      {image && (
        <figure
          className="proof-item__image"
          data-proof-reveal=""
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
            sizes="(min-width: 1100px) 32vw, (min-width: 700px) 50vw, 80vw"
          />
        </figure>
      )}

      {quote && (
        <blockquote className="proof-item__quote" data-proof-reveal="">
          <p className="proof-item__quote-text">{quote}</p>
          {attributed && (
            <footer className="proof-item__attribution">
              {item.person && (
                <cite className="proof-item__person">{item.person}</cite>
              )}
              {item.role && <span className="proof-item__role">{item.role}</span>}
            </footer>
          )}
        </blockquote>
      )}

      <div className="proof-item__terms" data-proof-meta="">
        <span className="proof-item__rule" data-proof-rule="" aria-hidden="true" />
        {item.relationship && (
          <p className="proof-item__relationship">{item.relationship}</p>
        )}
        {item.term && <p className="proof-item__term">{item.term}</p>}
      </div>

      {/*
        DEVELOPMENT-STATE SLOT. Marks a relationship that is waiting on a real
        client statement, so the gap is impossible to miss while building and
        impossible to ship: it is compiled out of the production bundle
        entirely. It is taken out of flow so that dev and production lay out
        identically — the generated network is a function of the measured
        composition, and a marker that changed the field height would change the
        geometry along with it.
      */}
      {process.env.NODE_ENV !== "production" && !hasQuote && (
        <p className="proof-item__pending" data-proof-pending="">
          Client testimonial required
        </p>
      )}
    </article>
  );
}
