import Image from "next/image";
import { HERO_LOGO } from "./HeroLogo";

/**
 * The opening: the Rhubarb mark, large and centre-stage, before the seed.
 *
 * The client asked (Sep 2026 feedback, note 1) for the page to start with an
 * animated rendition of the logo. Only raster artwork exists, so this is a
 * reveal of the PNG rather than a drawn mark: a soft top-down wipe across the
 * letters, COLLECTIVE fading up beneath them, a hold, then the whole lockup
 * gliding into the corner where the small identity lives. The timeline in
 * lib/hero/animation.ts owns every movement; this file is only the DOM.
 *
 * Two copies of one image. The mark and its wordline are a single PNG but
 * animate differently, so each copy is clipped to its own band. The bands come
 * from the PNG's alpha channel: the three letter rows share stems and run
 * continuously from 1% to 87.8% of the height, and COLLECTIVE sits alone at
 * 92.6–99.1%. That is also why the mark gets one continuous wipe instead of a
 * wipe per row — a per-row cut would slice the b's ascenders mid-stem.
 *
 * It is aria-hidden throughout: the accessible logo is the lockup's, and this
 * one only repeats it visually. It is display:none without JavaScript (the
 * root layout's noscript) and under reduced motion (the timeline, backed by
 * the static-state rule in hero.css).
 */
export function HeroIntro() {
  return (
    <div className="hero-intro" data-hero="intro" aria-hidden="true">
      <div className="hero-intro__mark" data-hero="intro-mark">
        <Image
          className="hero-intro__img hero-intro__img--mark"
          data-hero="intro-img"
          src={HERO_LOGO.src}
          width={HERO_LOGO.width}
          height={HERO_LOGO.height}
          alt=""
          priority
        />
        <Image
          className="hero-intro__img hero-intro__img--wordline"
          data-hero="intro-wordline"
          src={HERO_LOGO.src}
          width={HERO_LOGO.width}
          height={HERO_LOGO.height}
          alt=""
          loading="eager"
        />
      </div>
    </div>
  );
}
