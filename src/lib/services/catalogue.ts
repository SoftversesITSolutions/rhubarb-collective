/**
 * /SERVICES — THE CATALOGUE
 * =========================
 *
 * The six disciplines, and everything the supplied material actually says about
 * each one. This file is the page's whole data layer; nothing in the renderers
 * decides what a discipline covers or where it has been practised.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THREE SOURCES, AND NOTHING ELSE
 * ─────────────────────────────────────────────────────────────────────────────
 *  [LIST]  The client's approved homepage copy, "What we do" — the six service
 *          lines exactly as they are written there. Read from
 *          `lib/branches/config`, which the homepage's Section 04 already
 *          renders, so there is one copy of the six names on the site.
 *  [PARA]  The paragraph directly above that list, also approved copy: "…we
 *          take care of the entire execution of our plans, end-to-end, from
 *          design and animation, photoshoots, to performance marketing, website
 *          development, and social media management." Every capability it names
 *          is attached below to the discipline it belongs to.
 *  [DECK]  Rhubarb's own case-study deck, transcribed per client in
 *          `lib/proof/config` with the source page recorded. The engagements
 *          are read from there, never retyped.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT IS DELIBERATELY MISSING
 * ─────────────────────────────────────────────────────────────────────────────
 * NO PER-SERVICE PROSE WAS WRITTEN. The client supplied six lines and one
 * paragraph about what they do; they did not supply a description of each
 * discipline, and a paragraph invented for "Brand Communication" would be a
 * claim about a capability rather than a report of one. So each entry is built
 * from terms and evidence that already exist, and the page's only prose is the
 * client's own.
 *
 * TWO DISCIPLINES CARRY NO ENGAGEMENT, and that is the honest state of the
 * material rather than an oversight:
 *
 *   02 Brand Communication — the deck describes no campaign and no PR
 *      engagement for any of the five clients. Ritam's packaging and print
 *      collateral was considered and rejected: this discipline's own descriptor
 *      is "Campaigns & PR", and filing packaging under it to fill the entry
 *      would be quietly redefining the service the client named.
 *   05 Creative Photography & Video Production — no photography or film
 *      engagement is described anywhere in the deck, and the bundle contains no
 *      video or motion asset at all.
 *
 * Both still carry the capabilities [PARA] names for them, so neither is empty.
 * When the client supplies a campaign or a shoot, adding it is one entry in
 * `ENGAGEMENTS` below and nothing else changes.
 *
 * NO DELIVERABLES LISTS, NO TIMELINES, NO PRICES, NO PROCESS PROMISES, NO
 * "we'll get back to you within" — none of that exists in any supplied file.
 */

import { SERVICES } from "@/lib/branches/config";
import { PROOF_ITEMS } from "@/lib/proof/config";

/* ------------------------------------------------------------------ *
 * WHAT EACH DISCIPLINE COVERS
 * ------------------------------------------------------------------ */

/**
 * A capability, with the document it came from carried alongside it so the
 * provenance survives a copy-edit.
 *
 *  "list" — from the discipline's own line in the approved service list. These
 *           are the client's own decomposition: "Branding Identity: Research &
 *           Design" says this discipline is research and design.
 *  "para" — from the approved paragraph above that list, which names the things
 *           Rhubarb executes end-to-end. Attached to the discipline it plainly
 *           belongs to and to no other.
 */
export interface Capability {
  term: string;
  source: "list" | "para";
}

/**
 * Keyed by the service index, because the index is what `lib/branches/config`
 * and the page both use, and it is stable in a way a title is not.
 *
 * EVERY "para" TERM IS PLACED ONCE. The paragraph names design, animation,
 * photoshoots, performance marketing, website development and social media
 * management; "design" is already the client's own word for 01 and is not
 * repeated, and "creative strategy" — which the paragraph gives as the
 * collective's stated expertise rather than as one of the executed services —
 * is attached to Consulting, the discipline that sells strategy on its own.
 */
const CAPABILITIES: Record<string, Capability[]> = {
  "01": [
    { term: "Research", source: "list" },
    { term: "Design", source: "list" },
  ],
  "02": [
    { term: "Campaigns", source: "list" },
    { term: "PR", source: "list" },
    { term: "Performance marketing", source: "para" },
  ],
  "03": [
    { term: "Strategy", source: "list" },
    { term: "Management", source: "list" },
  ],
  "04": [
    { term: "Development", source: "list" },
    { term: "SEO", source: "list" },
  ],
  "05": [
    { term: "Photography", source: "list" },
    { term: "Video production", source: "list" },
    { term: "Photoshoots", source: "para" },
    { term: "Animation", source: "para" },
  ],
  "06": [
    { term: "Consulting", source: "list" },
    { term: "Brand audits", source: "list" },
    { term: "Creative strategy", source: "para" },
  ],
};

/* ------------------------------------------------------------------ *
 * ONE CORRECTION AGAINST THE APPROVED COPY
 * ------------------------------------------------------------------ */

/**
 * `lib/branches/config` splits each service line into a title and the rest of
 * the line, so that title + descriptor reassembles the client's own sentence:
 *
 *   "Creative Photography"  +  "& Video Production"   ✓
 *   "Consulting"            +  "& Brand Audits"       ✓
 *   "Website Development"   +  "Development & SEO"    ✗
 *
 * The approved copy reads "Website development & SEO". The homepage's split
 * repeats the word, so setting the two lines under each other there prints
 * "Website Development / Development & SEO". That is a transcription slip in
 * the homepage's data, and it is left alone: Section 04 is approved and closed,
 * and quietly editing its data from this page is how two sources of truth
 * start. This page carries the correction for its own rendering only, in the
 * one place a reader of this file will find it.
 */
const DESCRIPTOR_FIX: Record<string, string> = {
  "04": "& SEO",
};

/* ------------------------------------------------------------------ *
 * WHERE EACH DISCIPLINE HAS BEEN PRACTISED
 * ------------------------------------------------------------------ */

/**
 * One engagement, filed under one discipline.
 *
 * `phrase` is the fragment of the deck's own sentence that puts this client
 * under this discipline, quoted rather than summarised — so a reader sees the
 * evidence itself and can judge the filing, and so no mapping here can quietly
 * become a claim the deck does not make. The full sentence each fragment is cut
 * from is in `lib/proof/config`, with its page number.
 */
export interface Engagement {
  /** Client id in `lib/proof/config`. */
  clientId: string;
  /** The deck's own words for the part of that engagement this discipline did. */
  phrase: string;
}

const ENGAGEMENTS: Record<string, Engagement[]> = {
  "01": [
    { clientId: "kismat", phrase: "a logo revamp with a fresh colour palette, and a design and typography system to carry it" },
    { clientId: "ritam", phrase: "a hand-drawn logo style and symbol system" },
    { clientId: "dietxp", phrase: "brand identity" },
    { clientId: "sitar", phrase: "their branding" },
  ],
  // 02 — see the file header. The deck describes no campaign and no PR work.
  "03": [
    { clientId: "dietxp", phrase: "a social media ecosystem" },
  ],
  "04": [
    { clientId: "embassy", phrase: "complete website redesign, and a full revamp of the Membership & Language Student portal" },
    { clientId: "sitar", phrase: "their portfolio website" },
    { clientId: "dietxp", phrase: "the landing page experience" },
    { clientId: "ritam", phrase: "ongoing work across packaging, print collateral, digital assets and the website" },
  ],
  // 05 — see the file header. No shoot or film engagement is described anywhere.
  "06": [
    { clientId: "sitar", phrase: "the creative brainstorming that became the Gurukul itself" },
  ],
};

/* ------------------------------------------------------------------ *
 * THE ENTRIES
 * ------------------------------------------------------------------ */

export interface ServiceEngagement extends Engagement {
  /** The client's name, from `lib/proof/config`. Never retyped. */
  client: string;
}

export interface ServiceEntry {
  index: string;
  /** The discipline's name, exactly as the approved list writes it. */
  title: string;
  /** The line under it, exactly as the approved list writes it. */
  descriptor: string;
  capabilities: Capability[];
  engagements: ServiceEngagement[];
  /**
   * The other disciplines this one has shared a single engagement with —
   * DERIVED from `ENGAGEMENTS`, never authored. This is the page's evidence
   * that the six are not silos: they overlap because real projects made them
   * overlap, and if a future engagement joins two more, the line updates itself.
   */
  sharesWith: string[];
  /**
   * Placement token. The six are fixed — there is no filter on this page — so
   * the composition is art-directed per entry, exactly as the homepage's own
   * Section 04 places its six cards. These map to the rules in
   * `services-page.css`.
   */
  slot: "a" | "b" | "c" | "d" | "e" | "f";
}

const CLIENT_NAME = new Map(PROOF_ITEMS.map((item) => [item.id, item.client]));

/**
 * For each discipline, the other disciplines that appear on at least one of the
 * same clients. Computed from the engagement table above and nothing else.
 */
function sharedWith(index: string): string[] {
  const mine = new Set((ENGAGEMENTS[index] ?? []).map((e) => e.clientId));
  if (!mine.size) return [];

  return Object.entries(ENGAGEMENTS)
    .filter(([other, list]) => other !== index && list.some((e) => mine.has(e.clientId)))
    .map(([other]) => other)
    .sort();
}

export const SERVICE_ENTRIES: ServiceEntry[] = SERVICES.map((service) => ({
  index: service.index,
  title: service.title,
  descriptor: DESCRIPTOR_FIX[service.index] ?? service.detail,
  capabilities: CAPABILITIES[service.index] ?? [],
  engagements: (ENGAGEMENTS[service.index] ?? []).map((engagement) => ({
    ...engagement,
    client: CLIENT_NAME.get(engagement.clientId) ?? engagement.clientId,
  })),
  sharesWith: sharedWith(service.index),
  slot: service.slot,
}));

/**
 * The archive route, for the one cross-reference this page makes off itself.
 * Every client named in an engagement above has work on /work.
 */
export const ARCHIVE_HREF = "/work";
