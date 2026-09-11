import { ABOUT_VALUES } from "@/lib/about/content";
import { AboutMarker } from "./AboutMarker";

/**
 * 03 — OUR VOICE & VALUES
 *
 * The section reads in the order its own title does: the voice first, then the
 * values, then the client's closing paragraph. Two different treatments, so the
 * page does not become a list of lists.
 *
 * THE VOICE is a compact ledger — four short pairs, body face, set at reading
 * size. These four labels are the same ones the homepage pins into its network
 * as bare phrases; this is where they finally arrive with the lines the brand
 * book gives them, which is the point of an About page.
 *
 * THE VALUES are the opposite: each is a full-width row, the principle in the
 * display face at statement scale with its supporting text in a column beside
 * it, and a hairline ruled across the top. They are principles, so they are
 * given the room principles need. Not one of them is an icon, a tile, a pill or
 * a card, and they alternate nothing — the rhythm comes from the rules and the
 * space between them.
 */
export function Values() {
  return (
    <section className="ab-section ab-values" aria-labelledby="about-values-heading">
      <div data-about-group="">
        <AboutMarker index={ABOUT_VALUES.index} label={ABOUT_VALUES.marker} />

        <h2 className="ab-values__heading" id="about-values-heading">
          <span className="ab-heading__inner" data-about-reveal="">
            {ABOUT_VALUES.heading}
          </span>
        </h2>
      </div>

      {/* ---- the voice ---- */}
      <div className="ab-voice" data-about-group="">
        <h3 className="ab-voice__heading" data-about-reveal="">
          {ABOUT_VALUES.voiceHeading}
        </h3>

        <ul className="ab-voice__list">
          {ABOUT_VALUES.voice.map((trait) => (
            <li className="ab-voice__item" key={trait.id} data-about-reveal="">
              <span className="ab-voice__label">{trait.label}</span>
              <span className="ab-voice__body">{trait.body}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ---- the values ---- */}
      <ol className="ab-values__list">
        {ABOUT_VALUES.values.map((value) => (
          <li className="ab-values__item" key={value.id} data-about-group="">
            <span className="ab-values__rule" aria-hidden="true" data-about-rule="" />

            <h3 className="ab-values__label" data-about-reveal="">
              {value.label}
            </h3>

            <p className="ab-values__body" data-about-reveal="">
              {value.body}
            </p>
          </li>
        ))}
      </ol>

      <p className="ab-values__closing" data-about-reveal="">
        {ABOUT_VALUES.closing}
      </p>
    </section>
  );
}
