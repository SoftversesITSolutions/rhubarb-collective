/**
 * SPECIMENS — the 3D plants in the homepage's open space
 * =====================================================================
 *
 * Client round 2, priority 5: "In the void space or free space of certain
 * sections we can add some 3D flower images" — the client then sent Sketchfab
 * links to the models they wanted, "some small, some bigger".
 *
 * Round 2 used seven of those thirteen; round 3 removed all but the
 * sunflower and added five the client chose (see SPECIMEN_PLACEMENTS). Each
 * is pre-rendered ONCE, offline
 * (`tools/model-frames`), into a short run of transparent frames that the
 * page scrubs against scroll: no 3D runtime ships, and a frame index is
 * exactly reversible. Six of round 2's thirteen were never used: two have
 * downloads disabled by their author, two are paid store models, one exports
 * without its textures and one read as dull beside the rest.
 *
 * Every model is CC BY 4.0, so every one carries a credit, rendered in the
 * homepage footer from the list below. Do not add a model here without its
 * author, source and licence.
 *
 * Where a specimen sits is not written down: `placements` names a section, a
 * preferred corner of it and a size range, and `lib/specimens/place` finds
 * real empty space near that corner in the layout as it actually is, at
 * whatever width. A specimen that has no room is simply not shown.
 */

/** Frames per model. Must agree with `frames` in tools/model-frames/models.json. */
export const SPECIMEN_FRAMES = 21;
/** Frame edge, px. Square, transparent. */
export const SPECIMEN_SIZE = 560;

export interface Specimen {
  id: string;
  /** What is visibly in the frame. */
  alt: string;
  credit: {
    title: string;
    author: string;
    href: string;
  };
}

export const SPECIMEN_LICENCE = {
  label: "CC BY 4.0",
  href: "https://creativecommons.org/licenses/by/4.0/",
} as const;

const model = (uid: string) => `https://sketchfab.com/3d-models/${uid}`;

export const SPECIMENS = {
  "sunflower-stem": {
    id: "sunflower-stem",
    alt: "A sunflower on its stem, with leaves.",
    credit: {
      title: "Late-Bloom Golden Sunflower _Ti",
      author: "Galaxy Abundant",
      href: model("c82da276c90646a58dec849e43635f63"),
    },
  },
  // Round 3 (Oct 2026): the client's picks from the licence-checked shortlist.
  lilies: {
    id: "lilies",
    alt: "A spray of pink-and-white lilies.",
    credit: {
      title: "Lilies",
      author: "sligocreatures",
      href: model("45755df496804cb7a36f6f32305b57a7"),
    },
  },
  fern: {
    id: "fern",
    alt: "A low, spreading green fern.",
    credit: {
      title: "3D Fern - 01",
      author: "SanForge Studio",
      href: model("165f3870237f488885faf406d9deddc0"),
    },
  },
  orchid: {
    id: "orchid",
    alt: "A stem of pale violet orchid flowers.",
    credit: {
      title: "Orchid flower",
      author: "Lassi Kaukonen",
      href: model("75d19624c0d04b65975e011a04ae77a0"),
    },
  },
  rose: {
    id: "rose",
    alt: "A single red rose on its stem.",
    credit: {
      title: "Rose",
      author: "Heliona",
      href: model("6281bf3703584323bb4d8326f1f1b59d"),
    },
  },
  "pink-lotus": {
    id: "pink-lotus",
    alt: "Two pink lotus flowers above their round leaves.",
    credit: {
      title: "GA Free_301_Pink Lotus Twin Bloom",
      author: "Galaxy Abundant",
      href: model("54cf6843761f49069e40bbd127ffb29f"),
    },
  },
} as const satisfies Record<string, Specimen>;

export type SpecimenId = keyof typeof SPECIMENS;

export const specimenFrame = (id: SpecimenId, index: number) =>
  `/assets/brand/specimens/${id}/t-${String(index).padStart(2, "0")}.webp`;

export interface SpecimenPlacement {
  specimen: SpecimenId;
  /** The section it grows in. */
  section: string;
  /** The corner of the section it would like, as fractions of its box. */
  prefer: { x: number; y: number };
  /** Size range, px. Below `min` it is not shown at all. */
  min: number;
  max: number;
  /** Only the part of the section before the first element this matches. */
  above?: string;
}

/**
 * Some large, some small, as the client asked. Order matters within a
 * section: earlier placements choose their space first.
 *
 * Client round 3 (Oct 2026): every mushroom is gone ("not blending with the
 * design"), and so are the round-2 flowers — the red lily and the yellow-
 * orange tuft between the team photographs; nothing is placed between the
 * photographs now. The sunflowers stay: the stem sunflower fills the open
 * space to the left of the service cards (note 9) on The Turn's sliding
 * track, so it travels with them. The others are the client's picks from a
 * licence-checked shortlist, each larger than what it replaced (note 7).
 */
export const SPECIMEN_PLACEMENTS: SpecimenPlacement[] = [
  { specimen: "lilies", section: "#work", prefer: { x: 0.12, y: 0.1 }, min: 120, max: 460 },
  { specimen: "fern", section: "#work", prefer: { x: 0.12, y: 0.72 }, min: 120, max: 440 },
  {
    specimen: "sunflower-stem",
    section: "[data-branches-track]",
    prefer: { x: 0, y: 0.5 },
    min: 140,
    max: 560,
  },
  // In the opening only: the client asked for nothing between the people.
  {
    specimen: "orchid",
    section: ".collective",
    prefer: { x: 0.82, y: 0.12 },
    min: 120,
    max: 320,
    above: "[data-collective-person]",
  },
  { specimen: "rose", section: ".proof", prefer: { x: 0.68, y: 0.2 }, min: 120, max: 520 },
  { specimen: "pink-lotus", section: "#insights", prefer: { x: 0.12, y: 0.78 }, min: 120, max: 400 },
];

/** The models actually placed, once each, for the footer's credit line. */
export const SPECIMEN_CREDITS: Specimen[] = Array.from(
  new Set(SPECIMEN_PLACEMENTS.map((placement) => placement.specimen)),
).map((id) => SPECIMENS[id]);
