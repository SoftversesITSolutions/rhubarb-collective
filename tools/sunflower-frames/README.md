# Sunflower frames

The turning sunflower in the contact section (client note 8) is a run of 41
pre-rendered frames in `public/assets/brand/sunflower/`, not a 3D scene in the
page. This folder re-renders them.

- **Model:** "Sunflower" by Polygonal Miniatures, CC BY 4.0 —
  <https://sketchfab.com/3d-models/sunflower-569a71ccf4d94c1585c9573521fb998f>.
  A photoscan of a real flower head. Not committed; download the glTF from that
  page (a free Sketchfab account is required) into any folder.
- **Credit:** the licence requires attribution. It is rendered in the contact
  section's colophon from `BLOOM.credit` in `src/lib/contact/config.ts`.
- **Run:** `node tools/sunflower-frames/render.mjs <model-dir>`. Nothing is
  installed: three.js is loaded from a CDN inside headless Chrome, which is the
  puppeteer cache binary named in `cdp.mjs`.
- **Parameters** (yaw range, pitch, size, quality) live at the top of
  `render.mjs` and must agree with `BLOOM` in the config.
