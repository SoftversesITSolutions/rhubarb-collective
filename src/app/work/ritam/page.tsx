import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobalMenu } from "@/components/navigation/GlobalMenu";
import { ContactRoutes } from "@/components/home/contact/ContactRoutes";
import { CaseStudyMotion } from "@/components/work/CaseStudyMotion";
import { CaseStudy } from "@/components/work/CaseStudy";
import { getCaseStudy } from "@/lib/work/case-study";
import "@/components/work/case-study.css";

/**
 * /work/ritam
 *
 * The site's first case study, and the template for every one after it.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WRITTEN AS `/work/[slug]` WOULD BE, MOUNTED AS A STATIC SEGMENT
 * ─────────────────────────────────────────────────────────────────────────────
 * No backend, no CMS, no API and no dynamic segment is built — none was asked
 * for and none is stubbed. But nothing here is written in a way that will have
 * to be undone: the slug is a constant, the study is fetched through
 * `getCaseStudy`, the `notFound()` branch a dynamic route needs is already
 * here, and the metadata is derived from the study object rather than typed
 * into this file. `CaseStudy` renders whatever object it is handed and imports
 * no project.
 *
 * TO GO DYNAMIC: move this file to `app/work/[slug]/page.tsx`, read the slug
 * from `params` instead of the constant, and add
 * `generateStaticParams` over `caseStudySlugs()`. The component, the
 * stylesheet, the motion and the data shape are all unchanged. Replacing the
 * local registry with a CMS client is then a change to `lib/work/case-study`
 * alone.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY RITAM
 * ─────────────────────────────────────────────────────────────────────────────
 * It is the only client in the archive with two genuine assets and two
 * disciplines behind it, and pages 16–17 of Rhubarb's case-study deck give it
 * more of the studio's own writing than any other project has — including two
 * paragraphs that had never been transcribed into this repository. Every word
 * on the page is sourced; see the header of `lib/work/case-studies/ritam`.
 *
 * NO NETWORK ON THIS ROUTE. Nothing is imported, generated, measured or
 * continued from the homepage's organism — no canvas, no SVG field, no
 * procedural branches. The pictures are the visual argument.
 *
 * The footer is the site's own `ContactRoutes` in its default "section"
 * variant, and it stays outside `<main>` so it remains the document's
 * contentinfo landmark on this route as on every other.
 */

/** The one line a dynamic route replaces with `params.slug`. */
const SLUG = "ritam";

export function generateMetadata(): Metadata {
  const study = getCaseStudy(SLUG);
  if (!study) return {};
  return { title: study.meta.title, description: study.meta.description };
}

export default function RitamCaseStudy() {
  const study = getCaseStudy(SLUG);
  if (!study) notFound();

  return (
    <>
      <GlobalMenu />

      <CaseStudyMotion>
        <CaseStudy study={study} />
      </CaseStudyMotion>

      <ContactRoutes />
    </>
  );
}
