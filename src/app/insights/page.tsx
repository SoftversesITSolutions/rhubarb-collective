import type { Metadata } from "next";
import { GlobalMenu } from "@/components/navigation/GlobalMenu";
import { ContactRoutes } from "@/components/home/contact/ContactRoutes";
import { InsightsPageMotion } from "@/components/insights/InsightsPageMotion";
import { InsightsHero } from "@/components/insights/InsightsHero";
import { InsightsArchive } from "@/components/insights/InsightsArchive";
import { InsightsColophon } from "@/components/insights/InsightsColophon";
import "@/components/insights/insights-page.css";

/**
 * Both strings are drawn from the client's own approved copy for this space —
 * the standfirst and the subjects their paragraph names. Nothing here claims a
 * published piece, a cadence or a readership, because the archive is empty and
 * a description that promised articles would be the first lie on the page.
 */
export const metadata: Metadata = {
  title: "Insights — Rhubarb Collective",
  description:
    "Stories, insights and musings from Rhubarb Collective: origin stories, philosophical musings, uncomfortable political stances and real-world insights.",
};

/**
 * /INSIGHTS
 *
 * The sixth route, and the site's editorial archive. /work answers what the
 * collective has made and /services what it can do; this one answers what it is
 * thinking about — which is why it is the one inner page whose masthead carries
 * prose at reading size rather than a single line.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE ARCHIVE IS EMPTY, AND THAT IS THE PAGE'S MOST IMPORTANT FACT
 * ─────────────────────────────────────────────────────────────────────────────
 * Not one article, title, byline, date, excerpt, image or URL exists in any
 * supplied file — the approved homepage copy, the case-study deck, the brand
 * guidelines and the project plan were each read for them, and `public/assets`
 * holds only client work and Rhubarb's own brand material. So no piece is
 * invented, no placeholder headline is set, no stock photograph stands in and
 * no article route is faked.
 *
 * What is built instead is the thing the client's plan actually asks for.
 * Section 10 lists the eight strands as "potential future content areas" and
 * says the initial site should "establish a flexible foundation so these areas
 * can be incorporated in future phases without requiring a complete redesign".
 * This page is that foundation, complete and working: the card, the asymmetric
 * grid, the strand filter, the ordering, the reveal and the responsive
 * composition are all real and all driven from `JOURNAL_ENTRIES`. Publishing
 * one entry there promotes the page out of its empty state and fills the
 * homepage's editorial section at the same time.
 *
 * NO NETWORK ON THIS ROUTE. Nothing is imported, generated, measured or
 * continued from the homepage's organism — no canvas, no SVG field, no
 * procedural branches. The homepage owns the experimental behaviour.
 *
 * The only edit outside this route is the menu's Insights item, which now names
 * this page instead of the homepage section — the same move Contact us, Works
 * and Services made — plus two optional fields added to the shared
 * `JournalEntry` (a byline and a machine-readable date) and the wiring that
 * makes the homepage's four editorial positions read from the same list this
 * archive does, so the two can never drift. With the list empty, that section
 * renders exactly as it did before.
 *
 * `InsightsPageMotion` and `InsightsArchive` are the only client components.
 */
export default function Insights() {
  return (
    <>
      <GlobalMenu />

      <InsightsPageMotion>
        <InsightsHero />
        <InsightsArchive />
        <InsightsColophon />
      </InsightsPageMotion>

      <ContactRoutes />
    </>
  );
}
