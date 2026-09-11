import Image from "next/image";
import { PEOPLE, type Person } from "@/lib/collective/config";
import { ABOUT_COLLECTIVE } from "@/lib/about/content";
import { AboutMarker } from "./AboutMarker";

/**
 * 06 — THE COLLECTIVE
 *
 * The same eight people as the homepage, read from the same list
 * (`lib/collective/config`) so there is one place to correct a biography, add a
 * portrait, or fill in the five descriptions the client says are still to come.
 * Nothing about anybody is written here.
 *
 * WHAT THIS IS NOT. The homepage sets these eight as an art-directed field of
 * portrait plates threaded onto the network. None of that is repeated: this is
 * a roster — portrait, name, role, biography, ruled off from the next — and it
 * is deliberately the plainest treatment of the people anywhere on the site.
 *
 * THE PORTRAIT SLOT. Every entry has one, and it takes its shape from the
 * person's own `image` when a photograph exists and from their `ratio` when it
 * does not. The client bundle contains no team or studio photography, so today
 * every slot is an unexposed plate — the same quiet held space the homepage
 * uses, not a broken image, not a silhouette, not a stock headshot, and never
 * an avatar generated from initials. Dropping a file into
 * `public/assets/collective/` and filling in `image` on that person is the
 * entire change; no component, stylesheet or layout rule moves.
 *
 * WHO GETS A FULL ENTRY. Anyone the client has actually written something
 * about, or supplied a photograph of. The rest are named and unclaimed — no
 * invented role, no invented biography, no label editorialising about why their
 * entry is shorter. A portrait arriving before a biography is enough to promote
 * someone, so a supplied photograph is never left unused.
 */
function hasContent(person: Person): boolean {
  return Boolean(person.role || person.bio || person.image);
}

export function AboutCollective() {
  const described = PEOPLE.filter(hasContent);
  const named = PEOPLE.filter((person) => !hasContent(person));

  return (
    <section
      className="ab-section ab-collective"
      aria-labelledby="about-collective-heading"
    >
      <div data-about-group="">
        <AboutMarker index={ABOUT_COLLECTIVE.index} label={ABOUT_COLLECTIVE.marker} />

        <h2 className="ab-collective__heading" id="about-collective-heading">
          <span className="ab-heading__inner" data-about-reveal="">
            {ABOUT_COLLECTIVE.heading}
          </span>
        </h2>

        <p className="ab-collective__standfirst" data-about-reveal="">
          {ABOUT_COLLECTIVE.standfirst}
        </p>

        <p className="ab-collective__intro" data-about-reveal="">
          {ABOUT_COLLECTIVE.intro}
        </p>
      </div>

      <ul className="ab-collective__roster">
        {described.map((person) => {
          const { image, ratio } = person;
          const aspect = image
            ? `${image.width} / ${image.height}`
            : `${ratio[0]} / ${ratio[1]}`;

          return (
            <li
              className="ab-collective__person"
              key={person.id}
              data-portrait={image ? "asset" : "pending"}
              data-about-group=""
            >
              <span className="ab-collective__rule" aria-hidden="true" data-about-rule="" />

              <div
                className="ab-collective__portrait"
                style={{ aspectRatio: aspect }}
                data-about-reveal=""
              >
                {image ? (
                  <Image
                    className="ab-collective__photo"
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    sizes="(min-width: 1100px) 24vw, (min-width: 700px) 34vw, 62vw"
                    loading="lazy"
                  />
                ) : (
                  <>
                    {/* Unexposed plate. Decorative only — the person's identity
                        is in the text beside it, never in this element. */}
                    <span className="ab-collective__plate" aria-hidden="true" />

                    {/*
                      DEVELOPMENT-STATE SLOT. Marks a portrait waiting on a real
                      photograph, so the gap is impossible to miss while building
                      and impossible to ship: it is compiled out of the production
                      bundle entirely. It lives inside the plate and out of flow,
                      which is the only place that is empty at every width — the
                      row's own corners are copy at one tier or another.
                    */}
                    {process.env.NODE_ENV !== "production" && (
                      <span className="ab-collective__pending">Portrait required</span>
                    )}
                  </>
                )}
              </div>

              <h3 className="ab-collective__name" data-about-reveal="">
                {person.name}
              </h3>

              <div className="ab-collective__text">
                {person.role && (
                  <p className="ab-collective__role" data-about-reveal="">
                    {person.role}
                  </p>
                )}
                {person.epithet && (
                  <p className="ab-collective__epithet" data-about-reveal="">
                    {person.epithet}
                  </p>
                )}
                {person.bio && (
                  <p className="ab-collective__bio" data-about-reveal="">
                    {person.bio}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Named in the client's copy, descriptions still to come. Set as names
          alone rather than as entries with something plausible filled in. */}
      {named.length > 0 && (
        <ul className="ab-collective__named" data-about-group="">
          {named.map((person) => (
            <li className="ab-collective__named-item" key={person.id} data-about-reveal="">
              {person.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
