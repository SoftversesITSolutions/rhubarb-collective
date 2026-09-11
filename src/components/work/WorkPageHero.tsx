import { WORK_PAGE_HERO } from "@/lib/work/pageContent";

/**
 * THE WORK MASTHEAD
 *
 * Three lines and a hairline, and then the archive starts. The homepage hero
 * germinates a network across a full viewport and the About hero is a masthead
 * with a positioning statement under it; this one is a title page, and its whole
 * job is to be finished quickly — the first picture should be on screen, or
 * nearly on screen, without scrolling.
 *
 * So: no network, no generated geometry, no image, no full-viewport block, and
 * no second paragraph. WORK is set at the page's largest size and carries the
 * composition on its own.
 *
 * The H1 is the word "Work" rather than the collective's name, because unlike
 * /about this page is not about Rhubarb — it is the index of what Rhubarb made,
 * and "Work" is what the menu calls the destination.
 *
 * Server-rendered. It has no state and never reaches the browser bundle.
 */
export function WorkPageHero() {
  return (
    <header className="wk-hero">
      <p className="wk-hero__eyebrow" data-wk-intro="">
        {WORK_PAGE_HERO.eyebrow}
      </p>

      <h1 className="wk-hero__title">
        <span className="wk-hero__title-inner" data-wk-intro="">
          {WORK_PAGE_HERO.title}
        </span>
      </h1>

      <span className="wk-hero__rule" aria-hidden="true" data-wk-rule="" />

      <p className="wk-hero__statement">
        <span className="wk-hero__statement-inner" data-wk-intro="">
          {WORK_PAGE_HERO.statement}
        </span>
      </p>
    </header>
  );
}
