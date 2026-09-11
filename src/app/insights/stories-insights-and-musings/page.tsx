import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobalMenu } from "@/components/navigation/GlobalMenu";
import { ContactRoutes } from "@/components/home/contact/ContactRoutes";
import { InsightArticleMotion } from "@/components/insights/InsightArticleMotion";
import { InsightArticle } from "@/components/insights/InsightArticle";
import { getInsight } from "@/lib/insights/article";
import "@/components/insights/insight-article.css";

/**
 * /insights/stories-insights-and-musings
 *
 * The site's first insight detail page, and the template for every piece after
 * it. Where /insights is the editorial archive, this is the reading
 * environment: the quietest and most literary route on the site.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WRITTEN AS `/insights/[slug]` WOULD BE, MOUNTED AS A STATIC SEGMENT
 * ─────────────────────────────────────────────────────────────────────────────
 * No backend, no CMS, no API, no admin and no dynamic segment is built — none
 * was asked for and none is stubbed. But nothing here is written in a way that
 * will have to be undone: the slug is a constant, the piece is fetched through
 * `getInsight`, the `notFound()` branch a dynamic route needs is already here,
 * and the metadata is derived from the piece rather than typed into this file.
 * `InsightArticle` renders whatever object it is handed and imports no piece.
 *
 * TO GO DYNAMIC: move this file to `app/insights/[slug]/page.tsx`, read the
 * slug from `params` instead of the constant, and add `generateStaticParams`
 * over `insightSlugs()`. The component, the block renderer, the stylesheet, the
 * motion and the data shape are all unchanged. Replacing the local registry
 * with a CMS client is then a change to `lib/insights/article` alone.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS PIECE, AND WHAT IT IS
 * ─────────────────────────────────────────────────────────────────────────────
 * No article exists in any supplied file — re-verified against the approved
 * homepage copy, the case-study deck, the brand guidelines and the project
 * plan, which is why `JOURNAL_ENTRIES` is empty and /insights ships its empty
 * state. So no article is invented for this route. What is set instead is the
 * one genuinely written piece of Rhubarb editorial that does exist: the
 * client's own approved copy for this space, read from `JOURNAL_COPY` rather
 * than retyped, with the project plan's eight strands under it. Every word a
 * reader meets is theirs. See the header of
 * `lib/insights/articles/stories-insights-and-musings` for the provenance of
 * each one, and for what is deliberately absent — there is no byline, no date
 * and no invented pull quote.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS ROUTE CHANGES NOTHING ELSE
 * ─────────────────────────────────────────────────────────────────────────────
 * `JOURNAL_ENTRIES` is untouched and still empty, so /insights keeps its empty
 * state and the homepage's Section 07 keeps its four waiting positions. Neither
 * page claims a publication it has not made, and neither renders one pixel
 * differently than before. The page is reachable at its own URL and is linked
 * from nothing; publishing one entry to that list is what connects it, and the
 * seam for doing so is documented on the piece.
 *
 * NO NETWORK ON THIS ROUTE. Nothing is imported, generated, measured or
 * continued from the homepage's organism — no canvas, no SVG field, no
 * procedural branches, no mycelium. The homepage owns the experimental
 * behaviour; this page is for reading.
 *
 * The footer is the site's own `ContactRoutes` in its default "section"
 * variant, and it stays outside `<main>` so it remains the document's
 * contentinfo landmark on this route as on every other. `InsightArticleMotion`
 * is the only client component.
 */

/** The one line a dynamic route replaces with `params.slug`. */
const SLUG = "stories-insights-and-musings";

/**
 * Derived from the piece, so the dynamic route needs no change here either.
 *
 * `openGraph.type` is "article" and carries no `publishedTime` or `authors`,
 * because this piece has neither — an `article:published_time` invented for the
 * tag would be the fabricated date the page itself refuses to print. No image
 * is declared: an OG image has to be an absolute URL, `metadataBase` needs a
 * public origin this project has not been given, and a relative one silently
 * resolves against localhost. The field joins the moment that origin exists.
 */
export function generateMetadata(): Metadata {
  const piece = getInsight(SLUG);
  if (!piece) return {};

  return {
    title: piece.meta.title,
    description: piece.meta.description,
    openGraph: {
      type: "article",
      title: piece.meta.title,
      description: piece.meta.description,
    },
  };
}

export default function StoriesInsightsAndMusings() {
  const piece = getInsight(SLUG);
  if (!piece) notFound();

  return (
    <>
      <GlobalMenu />

      <InsightArticleMotion>
        <InsightArticle piece={piece} />
      </InsightArticleMotion>

      <ContactRoutes />
    </>
  );
}
