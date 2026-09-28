import Image from "next/image";

/**
 * The Rhubarb identity inside the hero composition.
 *
 * Only this file knows which asset backs the mark. The client has not supplied
 * vector artwork yet, so the supplied cream PNG is used at its native
 * proportions. When `/assets/brand/rhubarb-logo.svg` lands, change HERO_LOGO
 * and nothing else — no layout, animation or composition code depends on the
 * format. The mark is never recoloured, restretched or filtered.
 *
 * HERO_LOGO is exported for the opening (./HeroIntro), which shows the same
 * asset large before it glides into this lockup; the two must always agree.
 */
export const HERO_LOGO = {
  src: "/assets/brand/rhubarb-logo.png",
  width: 724,
  height: 1000,
} as const;

export function HeroLogo() {
  return (
    <div className="hero-logo" data-hero="logo" data-reveal="">
      <Image
        className="hero-logo__mark"
        data-hero="logo-mark"
        src={HERO_LOGO.src}
        width={HERO_LOGO.width}
        height={HERO_LOGO.height}
        alt="Rhubarb Collective"
        priority
      />
    </div>
  );
}
