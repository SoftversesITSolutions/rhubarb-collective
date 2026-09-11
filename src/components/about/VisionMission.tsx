import { ABOUT_VISION_MISSION } from "@/lib/about/content";
import { AboutMarker } from "./AboutMarker";

/**
 * 02 — VISION & MISSION
 *
 * Two declarations, not two cards. There is no box, no border, no fill and no
 * shared grid cell: each is a label, a hairline and a statement in the display
 * face, and they are told apart by scale, by weight and by which side of the
 * field they sit on — the vision holds the left, the mission steps right and
 * sets a size smaller. That asymmetry is the whole design.
 *
 * `outthink`, `outcreate` and `outlast` keep the emphasis the brand book gives
 * them, carried in the data rather than hard-coded here; concatenating the
 * parts reproduces the client's sentence exactly.
 */
export function VisionMission() {
  return (
    <section className="ab-section ab-vm" aria-labelledby="about-vm-heading">
      <div data-about-group="">
        <AboutMarker
          index={ABOUT_VISION_MISSION.index}
          label={ABOUT_VISION_MISSION.marker}
        />
        <h2 className="visually-hidden" id="about-vm-heading">
          {ABOUT_VISION_MISSION.heading}
        </h2>
      </div>

      {ABOUT_VISION_MISSION.declarations.map((declaration) => (
        <article
          className="ab-vm__item"
          key={declaration.label}
          data-declaration={declaration.label.toLowerCase()}
          data-about-group=""
        >
          <h3 className="ab-vm__label" data-about-reveal="">
            {declaration.label}
          </h3>

          <span className="ab-vm__rule" aria-hidden="true" data-about-rule="" />

          <p className="ab-vm__statement" data-about-reveal="">
            {declaration.parts.map((part, i) =>
              part.emphasis ? (
                <em className="ab-vm__emphasis" key={i}>
                  {part.text}
                </em>
              ) : (
                <span key={i}>{part.text}</span>
              ),
            )}
          </p>
        </article>
      ))}
    </section>
  );
}
