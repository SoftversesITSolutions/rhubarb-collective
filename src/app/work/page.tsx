import type { Metadata } from "next";
import { GlobalMenu } from "@/components/navigation/GlobalMenu";
import { ContactRoutes } from "@/components/home/contact/ContactRoutes";
import { WorkPageMotion } from "@/components/work/WorkPageMotion";
import { WorkPageHero } from "@/components/work/WorkPageHero";
import { WorkArchive } from "@/components/work/WorkArchive";
import "@/components/work/work-page.css";

/**
 * The title is the destination's own name plus the collective's. The
 * description states what the page holds and the industries it is filed under,
 * every one of which is derived from real client work in `lib/work/archive` —
 * no capability, result, award or client claim appears here that the page
 * itself does not evidence, and nothing is repeated to pad it.
 */
export const metadata: Metadata = {
  title: "Work — Rhubarb Collective",
  description:
    "The Rhubarb Collective archive: brand identity, creative direction, social, packaging and web work for clients in food and drink, culture and education, and health and wellness.",
};

/**
 * /WORK
 *
 * The fourth route, and the most functional. The homepage is one continuous
 * organism, the About page is a document and the Contact page is a door; this
 * is an index — a title, a filter and the work itself, in that order and
 * nothing between them.
 *
 * NO NETWORK ON THIS ROUTE. Nothing is imported, generated, measured or
 * continued from the homepage's organism: no canvas, no SVG field, no procedural
 * branches, no keep-out geometry and no seam reader. The experimental behaviour
 * belongs to "/" and stays there, and this page is deliberately calmer and more
 * usable than the section it takes its name from.
 *
 * IT DOES NOT REPLACE THE HOMEPAGE'S SELECTED WORK, and that section is
 * untouched. The two show the same six pieces from the same `lib/work/config`
 * for different reasons: on the homepage the work is discovered inside the
 * network, in a hand-placed composition that is part of a longer argument; here
 * it is an archive a reader can sort. The only edit outside this route is the
 * menu's Works item, which now names this page instead of that section.
 *
 * `WorkPageMotion` and `WorkArchive` are the only client components; the hero is
 * server-rendered markup passed through as a child and never reaches the browser
 * bundle.
 *
 * The footer is the site's own `ContactRoutes` in its default "section" variant —
 * the full Contact / Routes block, exactly as "/" and "/about" render it. It is
 * NOT given the "colophon" variant that /contact uses: that suppression exists
 * because the Contact page would otherwise state its own routes twice inside one
 * viewport, and this page states them nowhere. It stays outside `<main>`, so it
 * remains the document's contentinfo landmark on this route as on the others.
 */
export default function Work() {
  return (
    <>
      <GlobalMenu />

      <WorkPageMotion>
        <WorkPageHero />
        <WorkArchive />
      </WorkPageMotion>

      <ContactRoutes />
    </>
  );
}
