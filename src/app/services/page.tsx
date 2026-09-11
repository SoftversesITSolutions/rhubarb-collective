import type { Metadata } from "next";
import { GlobalMenu } from "@/components/navigation/GlobalMenu";
import { ContactRoutes } from "@/components/home/contact/ContactRoutes";
import { ServicesPageMotion } from "@/components/services/ServicesPageMotion";
import { ServicesHero } from "@/components/services/ServicesHero";
import { ServiceIndex } from "@/components/services/ServiceIndex";
import { ServicesClosing } from "@/components/services/ServicesClosing";
import "@/components/services/services-page.css";

/**
 * The description is the client's own standfirst for this section plus the six
 * disciplines they name, and nothing else. No capability the approved copy does
 * not list, no result, no award, no client claim and no keyword padding.
 */
export const metadata: Metadata = {
  title: "Services — Rhubarb Collective",
  description:
    "Everything that needs to be done: branding identity, brand communication, social media, website development and SEO, creative photography and video, and consulting and brand audits.",
};

/**
 * /SERVICES
 *
 * The fifth route. The homepage is one continuous organism, /about is a
 * document, /contact is a door and /work is an archive; this is a catalogue —
 * a masthead, six numbered disciplines on one thread, and a way out.
 *
 * NO NETWORK ON THIS ROUTE. Nothing is imported, generated, measured or
 * continued from the homepage's organism: no canvas, no SVG field, no
 * procedural branches, no keep-out geometry and no seam reader. The one
 * graphic mark on the page is a single straight 1px rule running down the
 * index, which is the same idea stated in the simplest language the site has.
 *
 * IT DOES NOT REPLACE THE HOMEPAGE'S SECTION 04, and that section is untouched.
 * Both read the six service lines from the same `lib/branches/config`; there
 * they are six cards discovered inside the network, here they are six entries a
 * reader can open. The only edit outside this route is the menu's Services item,
 * which now names this page instead of that section — the same move Works and
 * Contact us made when their pages shipped.
 *
 * EVERY WORD ON THE PAGE IS SOURCED. The prose is the client's approved "What
 * we do" copy; the six names and their descriptors are the approved service
 * list; the capabilities inside each entry are the client's own decomposition
 * plus the capabilities their paragraph names; the engagements quote the
 * case-study deck. The two closing lines are the only author-written copy, and
 * they claim nothing. See `lib/services/catalogue` and
 * `lib/services/pageContent`.
 *
 * `ServicesPageMotion` and `ServiceIndex` are the only client components; the
 * hero and the closing are server-rendered markup passed through as children.
 *
 * The footer is the site's own `ContactRoutes` in its default "section"
 * variant, exactly as "/", "/about" and "/work" render it, and it stays outside
 * `<main>` so it remains the document's contentinfo landmark on this route too.
 */
export default function Services() {
  return (
    <>
      <GlobalMenu />

      <ServicesPageMotion>
        <ServicesHero />
        <ServiceIndex />
        <ServicesClosing />
      </ServicesPageMotion>

      <ContactRoutes />
    </>
  );
}
