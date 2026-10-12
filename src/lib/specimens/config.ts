/**
 * SPECIMENS — the 3D flowers and mushrooms in the homepage's open space
 * =====================================================================
 *
 * Client round 2, priority 5: "In the void space or free space of certain
 * sections we can add some 3D flower images" — the client then sent Sketchfab
 * links to the models they wanted, "some small, some bigger".
 *
 * Seven of those thirteen are here. Each is pre-rendered ONCE, offline
 * (`tools/model-frames`), into a short run of transparent frames that the
 * page scrubs against scroll: no 3D runtime ships, and a frame index is
 * exactly reversible. The other six are not used: two have downloads disabled
 * by their author, two are paid store models, one exports without its
 * textures and one read as dull beside the rest.
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
  "fly-agaric": {
    id: "fly-agaric",
    alt: "A red-capped mushroom with pale spots.",
    credit: {
      title: "Fly Agaric Mushroom",
      author: "Timothy Hsu",
      href: model("d6c3876f091b4de49a38553a177bab0f"),
    },
  },
  amanita: {
    id: "amanita",
    alt: "A slender mushroom with a flat orange cap.",
    credit: {
      title: "Amanita muscaria mushroom",
      author: "JevinJones",
      href: model("fc4ad155dc954025886425388f714135"),
    },
  },
  "mushroom-cluster": {
    id: "mushroom-cluster",
    alt: "A cluster of brown bell-capped mushrooms.",
    credit: {
      title: "Realistic Mushroom - 01",
      author: "SanForge Studio",
      href: model("aededce1ec0f48f8b0f50cc1762a3f86"),
    },
  },
  bolete: {
    id: "bolete",
    alt: "A stout brown mushroom leaning to one side.",
    credit: {
      title: "Mushroom",
      author: "Evan",
      href: model("ade09b61de8b4a7d9e850b710d3eb151"),
    },
  },
  "sunflower-stem": {
    id: "sunflower-stem",
    alt: "A sunflower on its stem, with leaves.",
    credit: {
      title: "Late-Bloom Golden Sunflower _Ti",
      author: "Galaxy Abundant",
      href: model("c82da276c90646a58dec849e43635f63"),
    },
  },
  "spider-lily": {
    id: "spider-lily",
    alt: "A red spider lily on a single stem.",
    credit: {
      title: "Flowers",
      author: "Hippocrocaduck",
      href: model("e9e8b1ca9d3640f8be00b760e1fad170"),
    },
  },
  "orange-flowers": {
    id: "orange-flowers",
    alt: "Orange flowers rising out of a tuft of grass.",
    credit: {
      title: "flower",
      author: "tojamerlin",
      href: model("0fa50cf622f44f2ba59eff6c11cb8fbd"),
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
}

/**
 * Some large, some small, as the client asked. Order matters within a
 * section: earlier placements choose their space first.
 */
export const SPECIMEN_PLACEMENTS: SpecimenPlacement[] = [
  { specimen: "fly-agaric", section: "#work", prefer: { x: 0.12, y: 0.1 }, min: 110, max: 400 },
  { specimen: "amanita", section: "#work", prefer: { x: 0.12, y: 0.72 }, min: 110, max: 280 },
  { specimen: "mushroom-cluster", section: "#services", prefer: { x: 0.8, y: 0.2 }, min: 110, max: 420 },
  { specimen: "spider-lily", section: ".collective", prefer: { x: 0.82, y: 0.12 }, min: 110, max: 240 },
  { specimen: "orange-flowers", section: ".collective", prefer: { x: 0.4, y: 0.76 }, min: 110, max: 230 },
  { specimen: "sunflower-stem", section: ".proof", prefer: { x: 0.68, y: 0.2 }, min: 120, max: 460 },
  { specimen: "bolete", section: "#insights", prefer: { x: 0.12, y: 0.78 }, min: 110, max: 320 },
];

/** The models actually placed, once each, for the footer's credit line. */
export const SPECIMEN_CREDITS: Specimen[] = Array.from(
  new Set(SPECIMEN_PLACEMENTS.map((placement) => placement.specimen)),
).map((id) => SPECIMENS[id]);
