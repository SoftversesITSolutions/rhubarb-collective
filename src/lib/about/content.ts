/**
 * /ABOUT — THE WORDS
 * ==================
 *
 * Every string in this file is transcribed from the client's own supplied
 * material. Nothing is written for them, nothing is paraphrased into agency
 * prose, and no company history, person, award, statistic, client, location or
 * claim is added that is not in one of the three documents below.
 *
 * SOURCES, and how to tell them apart
 * ----------------------------------
 *   [DECK]   "Case Studies 2026 — Rhubarb Collectvie.pdf", pages 2–3. The
 *            deck's own ABOUT US / OUR INTRODUCTION spread. This is the most
 *            recent document in the bundle (2026) and it is where the hero
 *            positioning line comes from.
 *   [BRAND]  "Rhubarb Collective — Brand Guidlines & Brand Narative.pdf".
 *            Vision & Mission (p10), Our Voice & Values (p11–12), the brand
 *            voice (p9), Methodology (p17), the closing statement (p8).
 *   [COPY]   "Rhubarb Website Homepage Content.pages" — the client's approved
 *            section-by-section site copy. Its "Who We Are", "Our Approach" and
 *            "The Heart of Rhubarb Collective" blocks are used here.
 *
 * DIVISION OF LABOUR WITH THE HOMEPAGE. The homepage's Section 02 introduces
 * Rhubarb using the [BRAND] narrative ("Built to turn enduring ideas into
 * memorable experiences" / "Born from a shared obsession for innovation…").
 * This page deliberately does not repeat it: the deeper editorial version is
 * carried by the [COPY] document's own prose, which appears nowhere on the
 * homepage. The four brand-voice labels are the one deliberate overlap — the
 * homepage sets them as bare labels pinned into the network, and this page is
 * where they finally arrive with the supporting lines the brand book gives them.
 *
 * WHAT IS NOT HERE, and why. The brief mentions the collective emerging from
 * friends working across "design, web development, creative writing, film and
 * advertising", and an interest in "sustainability". Neither phrase exists in
 * any supplied document — every page of all three was decoded and searched. So
 * neither is asserted. What the documents *do* say about how the collective
 * came together is in `approach.body[1]` ("Our team isn't 'built', it is grown,
 * organically, consisting ideators, creatives, developers, and executors…") and
 * in `collective.intro` ("Friends first, with decades behind us…"), and those
 * are used instead of an invented version of the same idea.
 *
 * IMAGERY. Three pictures, all of them Rhubarb's OWN brand material from
 * `Image assets/` in the client bundle — the brand board, the business cards
 * and the April social posters. They are presented as what they are: the
 * studio's own work, on the studio's own page.
 *
 * NOT USED, deliberately: the five clients' case-study artwork. Putting a
 * client's work on an About page to fill space presents it as decoration and
 * misrepresents both the client and the engagement; it belongs to Selected Work
 * and stays there. No stock photography and no generated image appears here.
 *
 * STILL MISSING: team, studio and location photography. The bundle has none, so
 * no portrait is fabricated. Every person carries a portrait slot that is empty
 * until a real photograph exists — see `AboutCollective` and the shared
 * `image: null` field in `lib/collective/config`.
 */

/* ------------------------------------------------------------------ *
 * IMAGES
 * ------------------------------------------------------------------ */

/**
 * A picture on this page.
 *
 * `alt` describes what is visibly in the frame and never makes a claim about
 * the business — a screen-reader user gets the picture, not a second helping of
 * marketing copy. `caption` names the artefact, and each one is taken from the
 * supplied file's own name rather than written for it.
 *
 * `width`/`height` are the encoded pixel size. They drive both `next/image` and
 * the frame's `aspect-ratio`, so the space is reserved before the file arrives
 * and the page never shifts as pictures load.
 */
export interface AboutImage {
  /** Path under `public/`. */
  src: string;
  width: number;
  height: number;
  /** What is visibly in the frame. Never a claim. */
  alt: string;
  /** Names the artefact. Optional. */
  caption?: string;
  /** Rendered width at each tier, for the responsive srcset. */
  sizes: string;
}

/**
 * Source: `Image assets/Polaroid Mockup-Clean Style-009.png`, re-encoded to
 * webp at 1400px to match the repository's existing image pipeline.
 */
export const BRAND_BOARD: AboutImage = {
  src: "/assets/brand/moodboard.webp",
  width: 1400,
  height: 1050,
  alt: "Rhubarb Collective brand board: prints, posters and a business card taped to an ochre wall, with pressed leaves and a sunflower. One poster reads “We make businesses harder to ignore.”",
  caption: "Rhubarb brand board",
  sizes: "(min-width: 1100px) 42vw, (min-width: 700px) 62vw, 88vw",
};

/** Source: `Image assets/Business card mockup 1.png`. */
const BUSINESS_CARDS: AboutImage = {
  src: "/assets/brand/business-card.webp",
  width: 1500,
  height: 1000,
  alt: "Two Rhubarb Collective business cards in raking sunlight on black and ochre card, scattered with dried carnations. One card reads “We make businesses harder to ignore.”",
  caption: "Rhubarb business cards",
  sizes: "(min-width: 1100px) 32vw, (min-width: 700px) 52vw, 88vw",
};

/** Source: `Image assets/Rhubarb Socials - April (Posters).png`. */
export const SOCIAL_POSTERS: AboutImage = {
  src: "/assets/brand/socials-halftone.webp",
  width: 864,
  height: 1080,
  alt: "A grid of Rhubarb Collective social posters: botanical photographs reduced to a coarse halftone in cream on black.",
  caption: "Rhubarb social posters, April",
  sizes: "(min-width: 1100px) 32vw, (min-width: 700px) 46vw, 78vw",
};

/* ------------------------------------------------------------------ *
 * 00 — HERO                                                     [DECK]
 * ------------------------------------------------------------------ */

export const ABOUT_HERO = {
  eyebrow: "About us",
  /** The page's one meaningful H1. */
  title: "Rhubarb Collective",
  /**
   * The deck's positioning line, verbatim and unbroken.
   *
   * An earlier pass set it on three hand-chosen lines. That composes well at
   * 1440 and rags badly at 390 — every one of the three broke again and left an
   * orphan — so the break is left to a `ch` measure instead, which holds at
   * every width. Where a line break really is a composition decision on this
   * page it is one the copy itself makes (the client's two-line standfirst in
   * Our Approach), not one imposed on a sentence.
   */
  statement:
    "We are an independent, creative collective based out of the foothills of the Himalayas.",
} as const;

/* ------------------------------------------------------------------ *
 * 01 — OUR INTRODUCTION                                   [COPY, DECK]
 * ------------------------------------------------------------------ */

export const ABOUT_INTRODUCTION = {
  index: "01",
  marker: "Our introduction",
  /** The client's own sub-line for their "Who We Are" block. */
  heading: "Creative Agency, Simplified.",
  /** The three approved paragraphs, in the client's order and wording. */
  body: [
    "We are a no-nonsense creative studio simplified to our core. Our goal is to build brands that last beyond the season, that touch hearts and stimulate minds, and hopefully make the world a better place to inhabit. Allergic to shortcuts, passing trends, scroll-pasts, and unnecessary corporate structures, we make the lives of our clients, collaborators, and teams a little simpler everyday.",
    "Co-operation over competition is at the heart of our enterprise. We don’t work for, but with, we do not delegate, but share. With a decade of industry experience, having served prestigious clients across the spectrum, we still feel a bit odd blowing our own trumpet.",
    "In our space we nurture all our contradictions with clarity. We will give insights into our clients, active projects, old ones, services under the sun, and shed light on our work processes that deliver real results. Occasionally we shy away in the details, then we bask in the glory of our triumphs. We will evolve as Nature does, raw, organic, seemingly a bit awkward, but deeply felt. Dive right in.",
  ],
  /**
   * [DECK] page 3, the second half of the deck's own OUR INTRODUCTION spread.
   * Set as this section's closing declaration because that is exactly where the
   * client puts it — immediately after the "foothills of the Himalayas" line.
   * The missing full stop is theirs.
   */
  mission:
    "Our mission is to collaborate with platforms that offer creative alternatives to the dominant status-quo",
  /** Set `null` to take the picture out; the section composes either way. */
  image: BRAND_BOARD as AboutImage | null,
} as const;

/* ------------------------------------------------------------------ *
 * 02 — VISION & MISSION                                        [BRAND]
 * ------------------------------------------------------------------ */

export interface Declaration {
  label: string;
  /**
   * The statement, split only so the three words the brand book sets apart —
   * outthink, outcreate, outlast — can keep the emphasis they have there.
   * Concatenating every `text` in order reproduces the sentence exactly.
   */
  parts: { text: string; emphasis?: true }[];
  /** The whole sentence, for the accessible name and for anyone reading this file. */
  plain: string;
}

export const ABOUT_VISION_MISSION = {
  index: "02",
  marker: "Vision & mission",
  heading: "Vision & Mission",
  declarations: [
    {
      label: "Vision",
      parts: [
        { text: "To empower businesses to " },
        { text: "outthink", emphasis: true },
        { text: ", " },
        { text: "outcreate", emphasis: true },
        { text: ", and " },
        { text: "outlast", emphasis: true },
        { text: "—by blending innovation with effortless execution." },
      ],
      plain:
        "To empower businesses to outthink, outcreate, and outlast—by blending innovation with effortless execution.",
    },
    {
      label: "Mission",
      parts: [
        {
          text: "To redefine the creative standard—where bold ideas meet lasting impact. We envision a world where creativity isn’t just admired, but felt and lived.",
        },
      ],
      plain:
        "To redefine the creative standard—where bold ideas meet lasting impact. We envision a world where creativity isn’t just admired, but felt and lived.",
    },
  ] satisfies Declaration[],
} as const;

/* ------------------------------------------------------------------ *
 * 03 — OUR VOICE & VALUES                                      [BRAND]
 * ------------------------------------------------------------------ */

export interface Principle {
  id: string;
  /** The brand book's own label. Its trailing em dash is presentational and lives in the CSS. */
  label: string;
  body: string;
}

export const ABOUT_VALUES = {
  index: "03",
  marker: "Our voice & values",
  heading: "Our Voice & Values",

  /**
   * The brand voice — [BRAND] page 9. The client's own headline for it is
   * "We're the Rebels with a Blueprint", and the four characteristics are the
   * same four labels the homepage pins into its network, here with the
   * supporting lines the brand book gives them.
   */
  voiceHeading: "We’re the Rebels with a Blueprint",
  voice: [
    { id: "bold", label: "Bold, not brash", body: "We take risks, but always with intent." },
    { id: "warm", label: "Warmly irreverent", body: "Think sharp wit, not sarcasm." },
    { id: "curious", label: "Relentlessly curious", body: "We ask “why not?” everyday." },
    {
      id: "rooted",
      label: "Boldly modern, firmly rooted",
      body: "We’re rooted in history, soaring in the now.",
    },
  ] satisfies Principle[],

  /** The four values — [BRAND] page 11, labels and supporting text verbatim. */
  values: [
    {
      id: "courage",
      label: "Courage over comfort",
      body: "We push boundaries—for our clients and ourselves—even when it’s uncomfortable.",
    },
    {
      id: "empathy",
      label: "Empathy, engineered",
      body: "Creativity without humanity is just noise. We design and build with people, not for them.",
    },
    {
      id: "trends",
      label: "Transcending trends",
      body: "Trends come and go, accolades gather dust; impact lasts forever.",
    },
    {
      id: "wholesome",
      label: "Wholesome, part-by-part",
      body: "Our masterworks are created bit-by-bit, precise pixel-by-pixel, until the whole becomes greater than the sum of its parts.",
    },
  ] satisfies Principle[],

  /** [BRAND] page 12 — the section's own closing paragraph. */
  closing:
    "While others chase trends, we build them. We work with visionary leaders who reject \"good enough\" and demand creativity that moves markets (and hearts). By merging strategy-driven storytelling with novel aesthetics, we craft brands that aren’t just seen—they’re felt.",
} as const;

/* ------------------------------------------------------------------ *
 * 04 — OUR APPROACH                                             [COPY]
 * ------------------------------------------------------------------ */

export const ABOUT_APPROACH = {
  index: "04",
  marker: "How we work",
  heading: "Our Approach",
  /** The client sets their sub-line on two lines. Both are theirs. */
  standfirst: ["Simple by design", "In a complicated world"],
  body: [
    "It’s no newsflash that our industry is complex. Work processes entail a multitude of jargons and needless technicalities, teams are often fueled by ego and vanity, and clients get lost in a web of false-promises, fake results. We avoid these because we keep it simple.",
    "Our processes are linear and intuitive, we avoid bureaucratization like the plague. Our structures are lateral, born out of sharing, and caring. Our team isn’t “built”, it is grown, organically, consisting ideators, creatives, developers, and executors, all coming together for a shared vision: of doing real meaningful work with earnest effort.",
    "Perhaps a bit old-fashioned, but we value symbiosis and synthesis greatly over competition and unbridled growth.",
  ],
  image: BUSINESS_CARDS as AboutImage | null,
} as const;

/* ------------------------------------------------------------------ *
 * 05 — METHODOLOGY                                             [BRAND]
 * ------------------------------------------------------------------ */

export interface Stage {
  id: string;
  /** Position in the sequence, as the page prints it. */
  index: string;
  name: string;
  /** The two paragraphs the brand book gives each stage, in its order. */
  body: [string, string];
}

/**
 * [BRAND] page 17.
 *
 * The stage names are set there as four large drop capitals — D, I, D, L — each
 * shared by the two words beside it, so the page reads DIG & DEFINE, IMAGINE &
 * INVENT, DESIGN & DEVELOP, LAUNCH & LEVERAGE. That typography does not survive
 * being lifted out of the PDF (the shared capital is drawn once and the
 * remainders "IG &" / "EFINE" and so on are drawn separately), so the names are
 * reassembled here and set legibly rather than reproduced as drop caps. The
 * words themselves are unchanged and the pairing of each name to its two
 * paragraphs is the deck's own.
 */
export const ABOUT_METHODOLOGY = {
  index: "05",
  marker: "Methodology",
  heading: "Methodology.",
  stages: [
    {
      id: "define",
      index: "01",
      name: "Dig & Define",
      body: [
        "We start by immersing ourselves in your world. Through collaborative workshops, deep research, and sharp questioning, we uncover your truths, audience insights, and competitive edge.",
        "This phase ends with a crystal-clear brief that sets the foundation for everything that follows.",
      ],
    },
    {
      id: "invent",
      index: "02",
      name: "Imagine & Invent",
      body: [
        "Here’s where the spark turns into fire. We explore wide, ideate wild, and craft concept territories that are original yet rooted in strategy.",
        "Whether it’s a brand identity or a full-blown campaign, we prototype ideas that challenge norms and invite connection.",
      ],
    },
    {
      id: "design",
      index: "03",
      name: "Design & Develop",
      body: [
        "Once the idea’s chosen, we bring it to life—meticulously and meaningfully.",
        "From pixel-perfect designs to compelling copy and seamless user experiences, we build each component with craft, care, and collaboration.",
      ],
    },
    {
      id: "launch",
      index: "04",
      name: "Launch & Leverage",
      body: [
        "We don’t just hand over files—we help you land them with impact. We support rollouts, optimize for channels, and monitor performance.",
        "When needed, we pivot with agility. Because execution isn’t the end. It’s the beginning of resonance.",
      ],
    },
  ] satisfies Stage[],
} as const;

/* ------------------------------------------------------------------ *
 * 06 — THE COLLECTIVE                                           [COPY]
 * ------------------------------------------------------------------ */

/**
 * The people themselves are NOT redeclared here. They live in
 * `lib/collective/config` — one list, read by the homepage's Section 05 and by
 * this page — so a correction to a biography, or the arrival of the five
 * outstanding descriptions, is made once. This section only carries the framing
 * copy, which is the client's approved "The Heart of Rhubarb Collective" block.
 */
export const ABOUT_COLLECTIVE = {
  index: "06",
  marker: "The collective",
  heading: "The Heart of Rhubarb Collective",
  standfirst: "Experts—if you will",
  intro:
    "Every team needs a strong core, a solid foundation. This is us. Friends first, with decades behind us, workmates later, again with almost a decade of industry experience, and sometimes, when the going gets chaotic, we also become the directors of chaos.",
} as const;

/* ------------------------------------------------------------------ *
 * CODA — THE CLOSING STATEMENT                                 [BRAND]
 * ------------------------------------------------------------------ */

/**
 * [BRAND] page 8, and the deck's own sign-off wording for the eyebrow. The page
 * resolves rather than shouts: no second contact block, no form, no repeated
 * address, no new claim. The Contact / Routes footer is directly underneath and
 * already carries every real destination, which is where the link goes.
 *
 * Unnumbered, like the hero — the numbered sequence is 01 through 06, and the
 * footer's own 07 closes it.
 */
export const ABOUT_CLOSING = {
  /** The deck's closing question, [BRAND] page 21. */
  eyebrow: "Moving forward?",
  statement: "We are here to stay.",
  body: [
    "We're here to turn businesses into brands that can stand the test of our (messy, glorious) times.",
    "We're here to create impact that lasts beyond the season.",
    "We're here to tell stories that outlive trends.",
  ],
  image: SOCIAL_POSTERS as AboutImage | null,
  cta: {
    label: "Let’s work together",
    /**
     * The Contact page. This pointed at `#contact` — the footer at the foot of
     * this very page — while that was the only contact destination on the site.
     * Now that `/contact` exists, a "let's work together" link that scrolled the
     * reader two screens down instead of taking them there would be a defect,
     * so the destination is corrected. It is the only change to this page.
     */
    href: "/contact",
  },
} as const;
