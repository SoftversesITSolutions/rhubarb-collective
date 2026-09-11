import type { Metadata } from "next";
import { GlobalMenu } from "@/components/navigation/GlobalMenu";
import { ContactRoutes } from "@/components/home/contact/ContactRoutes";
import { ContactPageMotion } from "@/components/contact/ContactPageMotion";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactRoutesList } from "@/components/contact/ContactRoutesList";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactClosing } from "@/components/contact/ContactClosing";
import "@/components/contact/contact-page.css";

/**
 * Both strings come from the client's own material — the title from the
 * requested page name, the description from their approved footer statement and
 * the supplied location. No claim, credential, response time or opening hour
 * appears here that is not on the page itself.
 */
export const metadata: Metadata = {
  title: "Contact — Rhubarb Collective",
  description:
    "We make brands harder to ignore. Reach Rhubarb Collective by email or phone, or find us in Dehradun, Uttarakhand, India.",
};

/**
 * /CONTACT
 *
 * The simplest of the three routes. The homepage is one continuous organism and
 * the About page is a document; this is a door — a statement, four
 * destinations, an enquiry, a sign-off. No network is imported, generated or
 * continued here, and there is no procedural drawing on this route at all.
 *
 * THE ROUTES COME FIRST AND THE FORM SECOND, which is the whole of the
 * placement argument. Somebody who already knows what they want should reach an
 * address without passing through seven fields; somebody with a brief to give
 * should not have to compose it into an empty mail window. So the four routes
 * keep the top of the page at the size they have always been set, and the form
 * sits between them and the closing, where it reads as the considered option
 * rather than the only one. Nothing was removed to make room for it.
 *
 * THE FORM DOES NOT PRETEND. It posts to a real route handler, which forwards
 * to `RHUBARB_ENQUIRY_ENDPOINT` when one is configured and answers
 * `unconfigured` when one is not — and the panel under the button prints
 * whichever of those actually happened. The rule this page was built on is
 * intact: a form that silently discards an enquiry is worse than an address
 * that works, so this one does not silently discard anything. See
 * `lib/contact/enquiry`.
 *
 * THE FOOTER IS THE PAGE'S COMPANY BLOCK, and that is deliberate rather than a
 * shortcut. `ContactRoutes` *is* the site's Contact / Routes section: on every
 * other route it carries the statement, the invitation, all four routes and the
 * registered entity. Rendered here unchanged it would restate this entire page
 * directly beneath it, inside one viewport. So it takes `variant="colophon"` —
 * a suppression, not a redesign, and one that leaves it rendering exactly the
 * block that belongs in a contentinfo landmark anyway: the company, its postal
 * address and its GSTIN, in the same markup with the same rules it already had.
 * `variant` defaults to "section", so "/" and "/about" are untouched.
 *
 * It stays outside `<main>`, so it remains the document's contentinfo landmark
 * on this route as on the others.
 *
 * `GlobalMenu` is the same component every route mounts — one navigation system
 * for the site, whose CONTACT US destination now resolves here.
 *
 * `ContactPageMotion` and `ContactForm` are the only client components on the
 * route; the hero, the routes and the closing are server-rendered markup and
 * never reach the browser bundle.
 */
export default function Contact() {
  return (
    <>
      <GlobalMenu />

      <ContactPageMotion>
        <ContactHero />
        <ContactRoutesList />
        <ContactForm />
        <ContactClosing />
      </ContactPageMotion>

      <ContactRoutes variant="colophon" />
    </>
  );
}
