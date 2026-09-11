import { ABOUT_METHODOLOGY } from "@/lib/about/content";
import { AboutMarker } from "./AboutMarker";

/**
 * 05 — METHODOLOGY
 *
 * The brand book's four stages, in its order, with the two paragraphs it gives
 * each of them. An ordered list, because it is genuinely a sequence.
 *
 * A vertical editorial sequence and nothing more: a number, a name, two
 * paragraphs, a rule between one stage and the next. No connecting spine, no
 * progress track, no numbered discs, no arrows, no icons — none of the
 * furniture that turns a way of working into a SaaS process diagram.
 *
 * Each stage is its own animation group, so a stage resolves as it arrives
 * rather than the section waiting on its own foot; and each is short enough to
 * be readable before the one below it has begun.
 */
export function Methodology() {
  return (
    <section className="ab-section ab-method" aria-labelledby="about-method-heading">
      <div data-about-group="">
        <AboutMarker index={ABOUT_METHODOLOGY.index} label={ABOUT_METHODOLOGY.marker} />

        <h2 className="ab-method__heading" id="about-method-heading">
          <span className="ab-heading__inner" data-about-reveal="">
            {ABOUT_METHODOLOGY.heading}
          </span>
        </h2>
      </div>

      <ol className="ab-method__list">
        {ABOUT_METHODOLOGY.stages.map((stage) => (
          <li className="ab-method__stage" key={stage.id} data-about-group="">
            <span className="ab-method__rule" aria-hidden="true" data-about-rule="" />

            {/* The stage's own position in the sequence. `aria-hidden` because
                the list element already conveys the ordering. */}
            <span className="ab-method__index" aria-hidden="true" data-about-reveal="">
              {stage.index}
            </span>

            <h3 className="ab-method__name" data-about-reveal="">
              {stage.name}
            </h3>

            <div className="ab-method__body">
              {stage.body.map((paragraph) => (
                <p className="ab-method__paragraph" key={paragraph} data-about-reveal="">
                  {paragraph}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
