/**
 * A section marker — the 01 / 02 / 03 header the whole site uses.
 *
 * Identical in structure to the homepage's markers (`fg__marker`,
 * `journal__marker`, `contact__marker`) so the two pages count in the same
 * voice, and the numbering here is continuous with the footer's: 01 through 06
 * on this page, and Contact / Routes closes it at 07 exactly as it closes the
 * homepage. The hero and the closing coda are unnumbered, as the homepage's
 * hero is.
 */
export function AboutMarker({ index, label }: { index: string; label: string }) {
  return (
    <p className="ab-marker" data-about-reveal="">
      <span className="ab-marker__index">{index}</span>
      <span className="ab-marker__rule" aria-hidden="true" />
      <span className="ab-marker__label">{label}</span>
    </p>
  );
}
