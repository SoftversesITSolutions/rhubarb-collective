import { INSIGHTS_HERO } from "@/lib/insights/pageContent";

/**
 * THE INSIGHTS MASTHEAD
 *
 * A publication's front matter: the section's name, the word, a rule, the
 * client's standfirst, their paragraph, and the note they wrote to set the tone
 * of the space.
 *
 * THIS IS THE ONE INNER PAGE WHOSE MASTHEAD CARRIES REAL PROSE, and that is the
 * distinction the page is built on. /work opens with a title and one line
 * because its pictures are the argument; /services opens with a title and one
 * paragraph because its index is; this page is about what the collective is
 * thinking, so the thinking is set at the top at reading size rather than
 * compressed into a standfirst.
 *
 * The note is given its own block under the paragraph, set off by a rule. It is
 * the client's sharpest sentence anywhere in the supplied material — "not
 * SEO-friendly blogs, enter if you're comfortable exploring non-linear
 * narratives and curveballs disguised as insights" — and burying it inside the
 * paragraph would waste the one line that tells a reader what kind of
 * publication this is.
 *
 * Server-rendered; no state, and it never reaches the browser bundle.
 */
export function InsightsHero() {
  return (
    <header className="in-hero" data-in-block="">
      <p className="in-hero__eyebrow" data-in-reveal="">
        {INSIGHTS_HERO.eyebrow}
      </p>

      <h1 className="in-hero__title">
        <span className="in-hero__title-inner" data-in-reveal="">
          {INSIGHTS_HERO.title}
        </span>
      </h1>

      <span className="in-hero__rule" aria-hidden="true" data-in-rule="" />

      <p className="in-hero__statement">
        <span className="in-hero__statement-inner" data-in-reveal="">
          {INSIGHTS_HERO.statement}
        </span>
      </p>

      <p className="in-hero__body" data-in-reveal="">
        {INSIGHTS_HERO.body}
      </p>

      {/* The client's own note. Set smaller than the paragraph and marked off
          by a rule — an aside in a publication, which is what it is. */}
      <p className="in-hero__note" data-in-reveal="">
        {INSIGHTS_HERO.note}
      </p>
    </header>
  );
}
