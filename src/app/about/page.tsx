import type { Metadata } from "next";
import { GlobalMenu } from "@/components/navigation/GlobalMenu";
import { ContactRoutes } from "@/components/home/contact/ContactRoutes";
import { AboutMotion } from "@/components/about/AboutMotion";
import { AboutHero } from "@/components/about/AboutHero";
import { Introduction } from "@/components/about/Introduction";
import { VisionMission } from "@/components/about/VisionMission";
import { Values } from "@/components/about/Values";
import { Approach } from "@/components/about/Approach";
import { Methodology } from "@/components/about/Methodology";
import { AboutCollective } from "@/components/about/AboutCollective";
import { AboutClosing } from "@/components/about/AboutClosing";
import "@/components/about/about.css";

/**
 * Both strings are drawn from the client's own material — the title from the
 * requested page name, the description from the deck's positioning line and its
 * mission statement, condensed but not embellished. No claim, statistic,
 * location or credential appears here that is not on the page itself.
 */
export const metadata: Metadata = {
  title: "About Us — Rhubarb Collective",
  description:
    "Rhubarb Collective is an independent, creative collective based out of the foothills of the Himalayas, collaborating with platforms that offer creative alternatives to the dominant status-quo.",
};

/**
 * /ABOUT
 *
 * The same brand in a quieter register. Where the homepage is one continuous
 * organism — eight fields, each growing out of the last — this is a document:
 * a masthead, six numbered sections, a coda, and the site's footer. Nothing
 * from the homepage's network system is imported, generated or continued here,
 * and there is no procedural drawing on this route at all.
 *
 * THE SHELL IS THE HOMEPAGE'S, deliberately and without a copy of anything:
 *
 *   • `GlobalMenu` is the same component the homepage mounts — one navigation
 *     system for the site. Its "About us" destination now resolves to this
 *     route (see `lib/navigation/config`), and the fixed trigger stays in the
 *     top right here exactly as it does there.
 *
 *   • `ContactRoutes` is the site's footer, unmodified. It is `<footer>` and
 *     sits outside `<main>` so it remains the document's contentinfo landmark
 *     on this route too, and its 07 closes this page's 01–06 exactly as it
 *     closes the homepage's.
 *
 *     It carries a network on the homepage, grown from Journal & Culture's real
 *     exits. That section is not on this route, so `readJournalExits` finds
 *     nothing to continue and the footer renders with no network — which is the
 *     behaviour it was already written for ("inventing a root would be exactly
 *     the orphan geometry this system avoids"), not a special case added for
 *     this page. Nothing in that component was changed to make it work here.
 *
 * `AboutMotion` is the one client component: the sections below it are all
 * server-rendered markup and never reach the browser bundle.
 */
export default function About() {
  return (
    <>
      <GlobalMenu />

      <AboutMotion>
        <AboutHero />
        <Introduction />
        <VisionMission />
        <Values />
        <Approach />
        <Methodology />
        <AboutCollective />
        <AboutClosing />
      </AboutMotion>

      <ContactRoutes />
    </>
  );
}
