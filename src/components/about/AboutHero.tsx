import { ABOUT_HERO } from "@/lib/about/content";

/**
 * THE ABOUT HERO
 *
 * Deliberately the quietest opening on the site. The homepage hero is a seed
 * germinating into a network across a full viewport; this one is a masthead —
 * an eyebrow, the name, and the client's own positioning sentence — and a
 * reader should know within a second that they are on a page rather than back
 * inside the experience.
 *
 * So there is no network here, no procedural growth, no scroll choreography and
 * nothing generated: it is type, a hairline, and space. The only motion is the
 * same short lift every other block on the page gets.
 *
 * The H1 is the collective's name rather than the word "About", because that is
 * what the page is about and it is the only H1 in the document.
 */
export function AboutHero() {
  return (
    <header className="ab-hero" data-about-group="">
      <p className="ab-hero__eyebrow" data-about-reveal="">
        {ABOUT_HERO.eyebrow}
      </p>

      <h1 className="ab-hero__title">
        <span className="ab-hero__title-inner" data-about-reveal="">
          {ABOUT_HERO.title}
        </span>
      </h1>

      <span className="ab-hero__rule" aria-hidden="true" data-about-rule="" />

      {/* The client's sentence, unbroken. Where it turns is a `ch` measure in
          about.css, so it composes at 390 as well as at 1440. */}
      <p className="ab-hero__statement">
        <span className="ab-hero__statement-inner" data-about-reveal="">
          {ABOUT_HERO.statement}
        </span>
      </p>
    </header>
  );
}
