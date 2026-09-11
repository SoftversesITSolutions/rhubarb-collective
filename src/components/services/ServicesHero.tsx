import { SERVICES_HERO } from "@/lib/services/pageContent";

/**
 * THE SERVICES MASTHEAD
 *
 * An eyebrow, the word, a hairline, the client's standfirst and the client's
 * paragraph — and then the index starts. No network, no generated geometry, no
 * image and no full-viewport block: a reader should reach discipline 01 without
 * scrolling far.
 *
 * The paragraph is the only prose on the page, and it is the client's own
 * "What we do" copy. Everything below this block is a service name, a
 * capability term or a sentence quoted from the case-study deck — which is why
 * the page can be this dense with information and still claim nothing.
 *
 * Server-rendered; it has no state and never reaches the browser bundle.
 */
export function ServicesHero() {
  return (
    <header className="sv-hero" data-sv-block="">
      <p className="sv-hero__eyebrow" data-sv-reveal="">
        {SERVICES_HERO.eyebrow}
      </p>

      <h1 className="sv-hero__title">
        <span className="sv-hero__title-inner" data-sv-reveal="">
          {SERVICES_HERO.title}
        </span>
      </h1>

      <span className="sv-hero__rule" aria-hidden="true" data-sv-rule="" />

      {/* The client's standfirst. Set as the largest thing under the title,
          because it is the sentence the whole page is an index of. */}
      <p className="sv-hero__statement">
        <span className="sv-hero__statement-inner" data-sv-reveal="">
          {SERVICES_HERO.statement}
        </span>
      </p>

      <p className="sv-hero__body" data-sv-reveal="">
        {SERVICES_HERO.body}
      </p>
    </header>
  );
}
