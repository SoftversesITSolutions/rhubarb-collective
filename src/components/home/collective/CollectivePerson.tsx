import Image from "next/image";
import type { Person } from "@/lib/collective/config";

interface CollectivePersonProps {
  person: Person;
}

/**
 * One person, as a destination in the network.
 *
 * The frame is a plain editorial rectangle — no radius, no shadow, no card, no
 * circular crop. Where a real photograph exists it fills the frame; where the
 * client has not supplied one yet the frame stays an unexposed plate, holding
 * the composition open at exactly the size and position the picture will take.
 *
 * All of the person's information is real DOM content and is present in the
 * server render, so nothing about who they are depends on SVG or animation. A
 * role and a biography are only rendered where the client has actually written
 * one; nobody is given a plausible-sounding title to fill the gap.
 */
export function CollectivePerson({ person }: CollectivePersonProps) {
  const { image, ratio } = person;
  const aspect = image ? `${image.width} / ${image.height}` : `${ratio[0]} / ${ratio[1]}`;

  return (
    <figure
      className="collective-person"
      data-collective-person=""
      data-slot={person.slot}
      data-size={person.size}
      data-portrait={image ? "asset" : "pending"}
    >
      <div
        className="collective-person__frame"
        data-collective-frame=""
        style={{ aspectRatio: aspect }}
      >
        {image ? (
          <Image
            className="collective-person__portrait"
            data-collective-portrait=""
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            sizes="(min-width: 1100px) 40vw, (min-width: 700px) 55vw, 80vw"
          />
        ) : (
          /* Unexposed plate. Decorative only — the person's identity is in the
             caption below, never in this element. */
          <span className="collective-person__plate" aria-hidden="true" />
        )}
      </div>

      <figcaption className="collective-person__meta" data-collective-meta="">
        <h3 className="collective-person__name">{person.name}</h3>
        {person.role && <p className="collective-person__role">{person.role}</p>}
        {person.epithet && (
          <p className="collective-person__epithet">{person.epithet}</p>
        )}
        {person.bio && <p className="collective-person__bio">{person.bio}</p>}
      </figcaption>
    </figure>
  );
}
