import Image from "next/image";

/**
 * The Rhubarb identity inside the hero composition.
 *
 * Only this file knows which asset backs the mark. The client has not supplied
 * vector artwork yet, so the supplied cream PNG is used at its native
 * proportions. When `/assets/brand/rhubarb-logo.svg` lands, change LOGO_SRC and
 * nothing else — no layout, animation or composition code depends on the
 * format. The mark is never recoloured, restretched or filtered.
 */
const LOGO_SRC = "/assets/brand/rhubarb-logo.png";
const LOGO_INTRINSIC = { width: 724, height: 1000 };

export function HeroLogo() {
  return (
    <div className="hero-logo" data-hero="logo" data-reveal="">
      <Image
        className="hero-logo__mark"
        src={LOGO_SRC}
        width={LOGO_INTRINSIC.width}
        height={LOGO_INTRINSIC.height}
        alt="Rhubarb Collective"
        priority
      />
    </div>
  );
}
