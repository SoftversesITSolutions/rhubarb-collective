import { INSIGHTS_COLOPHON } from "@/lib/insights/pageContent";

/**
 * THE COLOPHON — what closes the page.
 *
 * The eight strands from section 10 of the client's project plan, in the plan's
 * own words and order, under the plan's own tense. The plan calls them
 * "potential future content areas" for later phases, so the label says the space
 * is *being built to carry* them: nothing here is a live section, nothing
 * carries a count, nothing is a link, and nothing implies a single piece of
 * music or film exists behind any of them today.
 *
 * NOT A CALL TO ACTION. A publication ends with a colophon, not a sales block —
 * and the site's three real invitations already live on /about, /services and
 * /contact. The footer directly beneath carries every contact route the site
 * has, so a fourth invitation here would be furniture.
 *
 * A plain `<ul>`, because eight names in a stated order is a list. No links, no
 * chips, no boxes.
 */
export function InsightsColophon() {
  return (
    <section
      className="in-colophon"
      aria-labelledby="in-colophon-label"
      data-in-block=""
    >
      <span className="in-colophon__rule" aria-hidden="true" data-in-rule="" />

      <p className="in-colophon__label" id="in-colophon-label" data-in-reveal="">
        {INSIGHTS_COLOPHON.label}
      </p>

      <ul className="in-colophon__strands">
        {INSIGHTS_COLOPHON.strands.map((strand) => (
          <li className="in-colophon__strand" key={strand} data-in-reveal="">
            {strand}
          </li>
        ))}
      </ul>
    </section>
  );
}
