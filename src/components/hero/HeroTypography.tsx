import { HeroLogo } from "./HeroLogo";

/**
 * The hero's typographic composition.
 *
 * Every word is real, selectable HTML in a correct heading order — the display
 * treatment is CSS only, so the sentence a crawler or a screen reader receives
 * is the sentence the studio wrote. Uppercase is a `text-transform`, never
 * baked into the copy.
 *
 * The four headline lines below are the desktop setting. They are authored as
 * separate blocks because the stagger and the network's keep-out zones are both
 * built around these breaks; on narrow screens each block wraps internally at
 * its own hyphen or space, which is where the six-line mobile setting comes
 * from. The generator's keep-out rectangles in lib/hero/config.ts mirror these
 * lines — move one and the other should follow.
 */
const HEADLINE_LINES = [
  "We are a",
  "forward-thinking,",
  "no-nonsense",
  "creative studio.",
];

export function HeroTypography() {
  return (
    <div className="hero-copy">
      {/* PHASE 05 + 06 — identity and positioning share one lockup. */}
      <div className="hero-lockup">
        <HeroLogo />
        <span className="hero-lockup__rule" data-hero="rule" aria-hidden="true" />
        <p className="hero-eyebrow" data-hero="eyebrow" data-reveal="">
          Creative agency. Simplified.
        </p>
      </div>

      {/* PHASE 07 — the dominant statement. */}
      <h1 className="hero-headline">
        {HEADLINE_LINES.map((line, i) => (
          <span className="hero-headline__line" key={line} data-line={i + 1}>
            <span
              className="hero-headline__inner"
              data-hero="headline-line"
              data-reveal=""
            >
              {line}
            </span>
          </span>
        ))}
      </h1>

      {/* PHASE 09 — supporting message, deliberately subordinate. */}
      <p className="hero-support" data-hero="support-line" data-reveal="">
        <span className="hero-support__tick" aria-hidden="true" />
        built to turn enduring ideas into memorable experiences.
      </p>

      {/*
        The one instruction on the page. It reads as the entry point to the
        whole experience, so it says which way to go rather than only that
        there is somewhere to go: the word sits above a vertical rule with a
        single mark travelling down it. The rule is the same hairline the
        network is drawn in, so the cue belongs to the system rather than
        arriving as interface.
      */}
      <p className="hero-cue" data-hero="cue" aria-hidden="true">
        <span className="hero-cue__word">Scroll</span>
        <span className="hero-cue__track">
          <span className="hero-cue__mark" data-hero="cue-mark" />
        </span>
      </p>
    </div>
  );
}
