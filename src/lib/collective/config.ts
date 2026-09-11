/**
 * SECTION 05 — THE COLLECTIVE
 *
 * The people behind the work. Every word below is transcribed from the client's
 * own approved homepage copy ("Rhubarb Website Homepage Content", section "The
 * Heart of Rhubarb Collective"). Nothing is written for them: no invented
 * roles, no invented biographies, no metrics, no awards.
 *
 * Five of the eight people are named in that document with the note that their
 * descriptions will follow later. They are represented here exactly as that —
 * named, present in the ecosystem, with no role or biography asserted on their
 * behalf. When the client supplies the missing copy it is added to the data
 * below and the composition absorbs it without a component changing.
 *
 * PORTRAITS. The client bundle contains no team or studio photography — only
 * client case-study artwork (used by Section 3) and Rhubarb's own brand mockups.
 * No portrait is therefore fabricated, generated or sourced from stock. Each
 * person carries an `image` slot that is currently `null`, and the section
 * renders the composition at its intended sizes with the frames unexposed. To
 * go live, drop the files into `public/assets/collective/` and fill in the slot;
 * no component, stylesheet or animation needs to be touched.
 */

/** A real photograph, once one exists. */
export interface PortraitAsset {
  /** Path under `public/`. */
  src: string;
  /** Intrinsic pixel size — drives the frame's aspect ratio and next/image. */
  width: number;
  height: number;
  /** Describes what is visibly in the frame. Never a claim about the person. */
  alt: string;
}

/**
 * Placement token. The composition is art-directed per person rather than
 * generated; these names map to the rules in collective.css. There is
 * deliberately no repeating pattern — a rule that placed all eight the same way
 * would rebuild the team grid this section exists to avoid.
 */
export type PersonSlot =
  | "lead"
  | "counter"
  | "under"
  | "drift-a"
  | "drift-b"
  | "drift-c"
  | "drift-d"
  | "drift-e";

/** Weight in the composition. Drives frame width, not styling. */
export type PersonSize = "lead" | "major" | "minor";

export interface Person {
  id: string;
  /** As the client's copy spells it. */
  name: string;
  /** Job title. Absent where the client has not supplied one yet. */
  role?: string;
  /**
   * The client's own epithet for the person — their words, split off the title
   * at the dash purely so the two can be typeset on separate lines.
   */
  epithet?: string;
  /** Verbatim biography. Absent where the client has not supplied one yet. */
  bio?: string;
  /** Null until real photography exists. See the file header. */
  image: PortraitAsset | null;
  slot: PersonSlot;
  size: PersonSize;
  /**
   * Frame proportion used while the slot is unexposed. A real asset's own
   * intrinsic ratio takes over the moment one is supplied.
   */
  ratio: [number, number];
  /**
   * Whether this person may take a short connective strand from the nearest
   * real junction in the network. Never a leader line: the strand only exists
   * when a junction has genuinely grown within reach of the frame.
   */
  networkNode: boolean;
}

export const PEOPLE: Person[] = [
  {
    id: "jasleen",
    name: "Jasleen Kaur",
    role: "Marketing Director / Chaos Coordinator",
    epithet: "The One Who Makes It Travel",
    bio: "Jasleen brings 8+ years of experience in marketing across BFSI, hospitality, consumer brands, and startups. Having worked across the AU Pacific region, she has led projects with cross-cultural teams and diverse stakeholders. Known for her clarity-first thinking, she questions assumptions, cuts through noise, and turns complex ideas into simple, audience-driven marketing that delivers results.",
    image: null,
    slot: "lead",
    size: "lead",
    ratio: [4, 5],
    networkNode: true,
  },
  {
    id: "mukul",
    name: "Mukul",
    role: "Creative Director / Sense Maker",
    epithet: "The One Who Makes It Better",
    bio: "Mukul comes with 7+ years of experience as a 21st century Creative, working on projects across diverse categories and contexts, from global development organisations like UNICEF and WWF to FMCG giants such as Nestlé, Perfetti, Dabur, and Hindustan Unilever. Mukul has a knack for turning vague briefs into sharp ideas. He moves between the global and the local with equal ease.",
    image: null,
    slot: "counter",
    size: "major",
    ratio: [3, 4],
    networkNode: true,
  },
  {
    id: "kunal",
    name: "Kunal Kumar",
    role: "Executive Director / Professional Multitasker",
    epithet: "The One Who Makes It Look Right",
    bio: "Kunal comes with 7+ years as an art director working across spaces as diverse as Theatre, Tech Development, Restaurants, FMCG, International Relations & Communication, NGOs, and others. He feels most at home in the precise intersection of Business & Aesthetics, and believes that good design should feel inevitable, not loud.",
    image: null,
    slot: "under",
    size: "major",
    ratio: [5, 4],
    networkNode: true,
  },

  /*
   * Named in the client's copy, descriptions still to come. Deliberately given
   * no role and no biography rather than a plausible-sounding guess.
   */
  {
    id: "nitika",
    name: "Nitika",
    image: null,
    slot: "drift-a",
    size: "minor",
    ratio: [4, 5],
    networkNode: true,
  },
  {
    id: "shivani",
    name: "Shivani",
    image: null,
    slot: "drift-b",
    size: "minor",
    ratio: [1, 1],
    networkNode: false,
  },
  {
    id: "anshul",
    name: "Anshul",
    image: null,
    slot: "drift-c",
    size: "minor",
    ratio: [5, 6],
    networkNode: true,
  },
  {
    id: "vipin",
    name: "Vipin",
    image: null,
    slot: "drift-d",
    size: "minor",
    ratio: [1, 1],
    networkNode: false,
  },
  {
    id: "atul",
    name: "Atul",
    image: null,
    slot: "drift-e",
    size: "minor",
    ratio: [4, 5],
    networkNode: true,
  },
];

/**
 * The section's words, isolated from every renderer so they can be replaced
 * without opening a component. All of it is the client's approved copy.
 */
export const COLLECTIVE_COPY = {
  /** Continues the site's 01 / 02 / 03 marker sequence. */
  index: "04",
  marker: "The collective",
  heading: "The Heart of Rhubarb Collective",
  /** The client's own subtitle for this section. */
  standfirst: "Experts—if you will",
  intro:
    "Every team needs a strong core, a solid foundation. This is us. Friends first, with decades behind us, workmates later, again with almost a decade of industry experience, and sometimes, when the going gets chaotic, we also become the directors of chaos.",
} as const;

/**
 * Growth shape per tier.
 *
 * Calmer than Section 4 at every tier: fewer offshoots, longer unbranched runs
 * and a lighter stroke. This section is about the people, so the network carries
 * them rather than competing with them.
 */
export interface CollectiveShape {
  /** Fractions of the field width a single lateral run travels. */
  runLength: [number, number];
  stepLength: number;
  offshootChance: number;
  baseWidth: number;
  /** Headroom above the stages needed to reach the foot of the field. */
  segmentHeadroom: number;
  /** How firmly the portraits push growth aside, 0..1. */
  portraitStrength: number;
  /**
   * Furthest a junction may sit from a frame and still be connected to it, in
   * CSS pixels. Beyond this the person simply has no strand — inventing one
   * would be the leader line this system refuses to draw.
   */
  anchorReach: number;
}

export const COLLECTIVE_SHAPE: Record<"desktop" | "tablet" | "mobile", CollectiveShape> =
  {
    desktop: {
      runLength: [0.24, 0.34],
      stepLength: 28,
      offshootChance: 0.22,
      baseWidth: 1.15,
      segmentHeadroom: 16,
      portraitStrength: 0.34,
      anchorReach: 170,
    },
    tablet: {
      runLength: [0.24, 0.34],
      stepLength: 26,
      offshootChance: 0.2,
      baseWidth: 1.15,
      segmentHeadroom: 13,
      portraitStrength: 0.32,
      anchorReach: 140,
    },
    mobile: {
      runLength: [0.4, 0.56],
      stepLength: 22,
      offshootChance: 0.14,
      baseWidth: 1.25,
      segmentHeadroom: 8,
      portraitStrength: 0.26,
      anchorReach: 110,
    },
  };

/** Radians below horizontal a lateral run descends at. Shallower than Section 4. */
// Steepened from [0.48, 0.74]: the arrivals from The Turn's descents should
// keep FALLING through the heading band before they spread — this is the
// section where the lateral journey resolves back into downward growth.
export const COLLECTIVE_DESCENT: [number, number] = [0.7, 0.98];

/**
 * Ceiling on a portrait's repulsion radius, in CSS pixels.
 *
 * Sections 3 and 4 derive influence from the destination's own size, which is
 * safe there because a card or a work image never gets very large. A portrait
 * does: at 1920 the lead frame is 736 × 920, and an uncapped `min(w, h) × 0.5`
 * gives it a 368px field. Measured against the real 1920 layout, that turned
 * the eight portraits into walls and stalled the trunks at 59% of the field
 * height — growth spent its stages being pushed sideways instead of descending.
 * Capping the radius restores the intended behaviour (prefer the negative
 * space, still able to cross behind a frame) and the trunks reach the foot at
 * every tier: measured reach 1.012 at 1920, 1.014 at 1440, 1.007 at 834 and
 * 1.011 at 390.
 */
export const PORTRAIT_INFLUENCE_CAP = 160;

/**
 * Fewest entry points this field will open with.
 *
 * Section 4 does not always send three well-spaced trunks across its foot — at
 * 1920 its two deepest exits land 0.009 of the width apart, so the spacing rule
 * that stops strands arriving as a bundle leaves a single inlet, and a 1920 ×
 * 4032 field entered from one point grows thin (measured: 21 paths, against 54
 * from three). Where that happens the set is topped up from the next-deepest
 * real trunks of the same Section 4 network — its own geometry, never an
 * invented root.
 */
export const MIN_INLETS = 3;

/**
 * Most entry points a field of each width will open with.
 *
 * A 390px column entered from four trunks that left Section 4 within 120px of
 * each other is not four routes into the field, it is a bundle — measured at
 * 161 strands against Section 4's own 43, which is busier than the section it
 * is supposed to calm down from. Wide fields have the room to use all four.
 */
export const MAX_INLETS: Record<"desktop" | "tablet" | "mobile", number> = {
  // Exactly the three descents The Turn resolves into. Taking a fourth pulled
  // in the turn's own mid-air segment tip as an entry — a strand hanging 171px
  // above the seam.
  desktop: 3,
  tablet: 3,
  mobile: 3,
};
