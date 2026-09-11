/**
 * CASE STUDY — RITAM
 * ==================
 *
 * Organic honey and beekeeping. Chosen as the site's first case study because
 * it is the only client in the archive with two genuine assets and two
 * disciplines behind it, and because pages 16–17 of the case-study deck give it
 * more of the studio's own writing than any other project has.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHERE EVERY SENTENCE CAME FROM
 * ─────────────────────────────────────────────────────────────────────────────
 *  [DECK 17]  Rhubarb's own case-study deck, page 17. Two paragraphs, decoded
 *             from the PDF and quoted verbatim. They had not been transcribed
 *             into this repository before — the page's Canva font subsets have
 *             to be decoded per font against their own /ToUnicode tables, and a
 *             cmap merged across the page's fonts yields nonsense.
 *  [PROOF]    `lib/proof/config`, where the engagement was transcribed from the
 *             same deck in an earlier pass, with its source page recorded. Read
 *             from there rather than retyped.
 *  [WORK]     `lib/work/config` — both images, their intrinsic sizes, their alt
 *             text and their disciplines. Read from there rather than retyped.
 *
 * PAGE 16 OF THE DECK IS UNRECOVERABLE and nothing is guessed from it. Its body
 * is set in three Canva subsets whose /ToUnicode tables map 17, 9 and 2 glyphs
 * respectively, so the paragraphs decode to consonant soup ("T wst wr s urrty
 * urwy") with no way to tell which vowels were dropped. Only its two headings
 * survive — the client name and "Organic honey & beekeeping" — and both were
 * already in the repository. If the client supplies the deck's source file, that
 * page is where a stated challenge would come from.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT IS NOT HERE
 * ─────────────────────────────────────────────────────────────────────────────
 * NO YEAR. The deck dates no individual project; its own title says 2026, which
 * is the deck's year and not this engagement's. So the overview carries a
 * status the deck does state — the work is ongoing — instead of a date it does
 * not.
 *
 * NO LOCATION, NO TEAM, NO BUDGET, NO DURATION. None is stated for Ritam. (The
 * Embassy engagement is the only one in the whole deck with a stated timeframe.)
 *
 * NO RESULTS OF ANY KIND. No metric, percentage, sales figure, follower count,
 * award or client quote exists for this or any other Rhubarb client. The
 * outcome below is qualitative and is the deck's own sentence about where the
 * work stands.
 *
 * ONE CORRECTION, RECORDED. The deck's page 17 spells it "pallete". That is a
 * typing slip rather than a stylistic choice — unlike the client's capitalised
 * "Brand" on /contact, which is kept — so it is set as "palette" here. The
 * options were to reproduce a visible misspelling on a client's own case study
 * or to change a word silently; this does neither.
 */

import { PROOF_ITEMS } from "@/lib/proof/config";
import { WORK_ITEMS } from "@/lib/work/config";
import type { CaseStudy, CaseStudyImage } from "../case-study";

/* ---- the two pictures, read from the archive's own records ---- */

function picture(id: string, caption: string | null = null): CaseStudyImage {
  const item = WORK_ITEMS.find((w) => w.id === id);
  if (!item) throw new Error(`[case-study/ritam] "${id}" is not in WORK_ITEMS`);
  return {
    src: item.src,
    width: item.width,
    height: item.height,
    alt: item.alt,
    caption,
  };
}

const KEEPER = picture("ritam");
const PACKAGING = picture("ritam-pack");

/* ---- the engagement, read from where it was transcribed ---- */

const PROOF = PROOF_ITEMS.find((p) => p.id === "ritam");

/** "Organic honey & beekeeping" — the deck's own descriptor for the client. */
const DESCRIPTOR = PROOF?.descriptor ?? "Organic honey & beekeeping";

/**
 * "A hand-drawn logo style and symbol system, and ongoing work across
 * packaging, print collateral, digital assets and the website." [PROOF]
 */
const ENGAGEMENT = PROOF?.relationship ?? "";

/** The two disciplines the archive files Ritam's pieces under. [WORK] */
const DISCIPLINES = WORK_ITEMS.filter((w) => w.project === "Ritam")
  .map((w) => w.discipline)
  .join(" · ");

export const RITAM: CaseStudy = {
  slug: "ritam",
  client: "Ritam",
  /* The client and the project are the same word here, so the eyebrow names the
     kind of page rather than repeating the title one size down. See `eyebrow`
     in `../case-study`. */
  eyebrow: "Case study",
  title: "Ritam",
  descriptor: DESCRIPTOR,

  /**
   * Only facts the project really has. There is no Year row because the deck
   * states no date, and no Location row because it states no place — an
   * overview rail with an em dash in it is a rail advertising what it does not
   * know.
   */
  facts: [
    { label: "Client", value: "Ritam" },
    { label: "Sector", value: DESCRIPTOR },
    { label: "Disciplines", value: DISCIPLINES },
    // Stated in the deck's present tense: "We are in the process of helping
    // Ritam…". It is a fact about the engagement, not a projection.
    { label: "Status", value: "Ongoing" },
  ],

  /**
   * What the project is and what Rhubarb's role is — assembled from the
   * engagement sentence and the deck's description of the client as new. No
   * sentence here says anything the two sources do not.
   */
  summary:
    "Ritam is a new organic honey and beekeeping company. Rhubarb built its identity from a hand-drawn logo style and symbol system, and continues to work across the range it needs to reach a shelf — packaging, print collateral, digital assets and the website.",

  hero: KEEPER,

  sections: [
    /* -------------------------------------------------------------- *
     * 01 — THE CONTEXT
     *
     * Not "the challenge". The deck states no problem, no brief and no
     * business objective for Ritam, and writing one would be inventing the
     * part of a case study that is easiest to invent. What it does state is
     * the situation: a new company, in a specific trade, needing everything.
     * -------------------------------------------------------------- */
    {
      id: "context",
      type: "prose",
      index: "01",
      label: "The context",
      heading: "A new company, and everything it needed to be one.",
      body: [
        "Ritam came to the collective as a new organic honey and beekeeping company — a name and a trade, without the system that turns either into a brand a shopper recognises on a shelf.",
        ENGAGEMENT,
      ],
      slot: "narrow-left",
    },

    /* -------------------------------------------------------------- *
     * 02 — VISUAL DIRECTION
     *
     * The heading is the deck's own, from page 17, and the paragraph under it
     * is that page's first sentence quoted verbatim. It is the closest thing
     * to a design rationale in any supplied file, which is why it carries this
     * section on its own rather than being paraphrased into three.
     * -------------------------------------------------------------- */
    {
      id: "direction",
      type: "prose",
      index: "02",
      label: "The approach",
      heading: "Visual direction",
      body: [
        "The visual direction includes earthy tones, humane imagery, slightly irregular patterns, and a warm palette to reflect the vibrant world of beekeeping.",
      ],
      source: "Rhubarb Collective, case-study deck, page 17",
      slot: "wide-right",
    },

    /* -------------------------------------------------------------- *
     * 03 — THE PAUSE
     *
     * The page's one typographic break. Five words from the deck's closing
     * sentence about this project — a statement of intent, not a result and
     * not a slogan written for the page. The whole sentence it is cut from is
     * set two sections below, so the phrase is never read out of context.
     * -------------------------------------------------------------- */
    {
      id: "statement",
      type: "quote",
      heading: "Memorable for the seasons.",
      source: "From the deck's own account of the work",
      slot: "full",
    },

    /* -------------------------------------------------------------- *
     * 04 — THE PACKAGING
     *
     * The second and last genuine asset. Given the whole measure rather than
     * paired with something, because there is nothing genuine to pair it with
     * and a case study padded with a cropped duplicate of its own picture is
     * a case study with one picture and a trick.
     * -------------------------------------------------------------- */
    {
      id: "range",
      type: "figure",
      index: "03",
      label: "The work",
      heading: "The range",
      body: [
        "A honey jar, kraft cartons, swing tags and stationery, carrying the hand-drawn mark and the palette across every surface the product is met on.",
      ],
      image: PACKAGING,
      slot: "full",
    },
  ],

  /**
   * Qualitative, and the deck's own words. "We are in the process of helping"
   * is the present tense the client wrote in, and it is why this reads as a
   * position rather than a conclusion.
   */
  outcome: {
    label: "Where it stands",
    body: [
      "We are in the process of helping Ritam with their packaging, print collaterals, digital assets, and all kinds of artworks to make this new company truly memorable for the seasons.",
      "The work is ongoing.",
    ],
  },

  /**
   * The nearest neighbour in the archive: the other food-and-drink client, and
   * the other identity built from a mark and a system. It points at /work
   * rather than at /work/kismat, because that page does not exist and a link
   * to it would be the 404 this project refuses everywhere.
   */
  next: {
    label: "Next work",
    client: "Cakes by Kismat",
    discipline: "Brand Identity",
    href: "/work",
  },

  meta: {
    title: "Ritam — Rhubarb Collective",
    description:
      "Identity, packaging and collateral for Ritam, a new organic honey and beekeeping company: a hand-drawn logo style and symbol system, earthy tones and a warm palette.",
  },
};
