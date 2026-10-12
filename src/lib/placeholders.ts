/**
 * PLACEHOLDER CONTENT — ONE SWITCH
 * ================================
 *
 * The client has not yet supplied team photographs, five people's roles and
 * biographies, any client testimonial, or any journal piece. Until Oct 2026
 * those places rendered honestly empty. Akhil asked for them to be filled so
 * the homepage can be seen and reviewed "in full" before the real material
 * arrives — so this file fills them, and only this file.
 *
 * Two rules keep that safe:
 *
 *   1. EVERYTHING HERE READS AS A PLACEHOLDER. No invented job title is
 *      attached to a real person, no invented praise is put in a real client's
 *      mouth, no article is given a believable headline. The words say what
 *      they are standing in for. A reviewer sees the layout full; nobody can
 *      mistake it for fact.
 *   2. IT IS ONE BOOLEAN. Set `SHOW_PLACEHOLDERS` to false and every place
 *      below goes back to its honest empty state — nothing else needs editing.
 *      Real content always wins: each consumer uses the real value when one
 *      exists and reaches for a placeholder only when it does not.
 *
 * SET THIS TO FALSE BEFORE THE SITE GOES LIVE unless every placeholder has
 * been replaced by then.
 */
export const SHOW_PLACEHOLDERS = true;

/** People named in the client's copy whose role and biography are still to come. */
export const PLACEHOLDER_PERSON = {
  role: "Role to be confirmed",
  bio: "Placeholder biography. Two or three sentences about this member of the collective — their background, what they do here and how they work — will replace this text once it is supplied.",
} as const;

/** Stand-in testimonials. Three lengths, so the field shows its range. */
export const PLACEHOLDER_QUOTES = [
  "Placeholder testimonial. The client’s own words about working with Rhubarb Collective will replace this line.",
  "Placeholder testimonial — a short statement from the client goes here.",
  "Placeholder testimonial. This space is held for two or three sentences in the client’s own voice: what the work set out to do, and what it was like to make it together.",
] as const;

export const PLACEHOLDER_ATTRIBUTION = {
  person: "Client name",
  role: "Role, organisation",
} as const;

/** Stand-in journal pieces for the homepage's four positions. */
export const PLACEHOLDER_JOURNAL = [
  {
    title: "Placeholder title for a feature piece",
    excerpt:
      "Placeholder excerpt. A sentence or two introducing the piece will sit here once the first editorial is written.",
  },
  {
    title: "Placeholder title for a second piece",
    excerpt: "Placeholder excerpt for the second position in the field.",
  },
  { title: "Placeholder title, shorter", excerpt: null },
  { title: "Placeholder title for a fourth piece", excerpt: null },
] as const;

export const PLACEHOLDER_JOURNAL_DATE = "Date to come";
