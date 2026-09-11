import { BRAND_VALUES, type Annotation } from "@/lib/first-growth/annotations";

interface FirstGrowthContentProps {
  annotations: Annotation[];
  /** Desktop and tablet pin each value to a node; mobile reads them as a list. */
  anchored: boolean;
}

/**
 * First Growth — the words.
 *
 * All client copy, verbatim. The primary statement is the studio's own
 * proposition, set here as the section's dominant voice; it appeared once in
 * the hero as a quiet aside, and this is the same sentence taking the floor.
 *
 * The four brand-voice values are a real list in the document and are always
 * rendered, so the copy is in the server HTML whether or not the network has
 * been generated yet. Once it has, each item is moved onto the junction the
 * generator chose for it and joined to that junction by a leader drawn in the
 * SVG. That is the "collective" idea stated structurally rather than announced:
 * separate elements, connected, forming one system.
 */

const STATEMENT_LINES = [
  "Built to turn enduring",
  "ideas into memorable",
  "experiences.",
];

const NARRATIVE =
  "Born from a shared obsession for innovation, we fuse cutting-edge creativity with strategic rigor to help brands thrive in a cluttered, noisy world. We’re not just designers, strategists, or storytellers—we’re crafters of connection.";

export function FirstGrowthContent({ annotations, anchored }: FirstGrowthContentProps) {
  return (
    <div className="fg-copy">
      <p className="fg-marker" data-fg="marker" data-fg-reveal="">
        <span className="fg-marker__index">01</span>
        <span className="fg-marker__rule" aria-hidden="true" />
        <span className="fg-marker__label">Who we are</span>
      </p>

      <h2 className="fg-statement" id="fg-heading">
        {STATEMENT_LINES.map((line, i) => (
          <span className="fg-statement__line" key={line} data-line={i + 1}>
            <span
              className="fg-statement__inner"
              data-fg="statement-line"
              data-fg-reveal=""
            >
              {line}
            </span>
          </span>
        ))}
      </h2>

      <ul className="fg-values" data-anchored={anchored ? "" : undefined}>
        {BRAND_VALUES.map((label, i) => {
          const annotation = anchored ? annotations[i] : undefined;
          return (
            <li
              key={label}
              className="fg-values__item"
              data-fg="value"
              data-fg-reveal=""
              data-side={annotation?.side ?? "right"}
              /*
                Anchored to the node by whichever edge faces it, never by a
                percentage transform: the timeline owns `transform` on these
                elements, so any translate set in CSS would be overwritten the
                moment GSAP touched them.
              */
              style={
                annotation
                  ? annotation.side === "left"
                    ? {
                        right: `${(1 - annotation.x) * 100}%`,
                        top: `${annotation.y * 100}%`,
                      }
                    : {
                        left: `${annotation.x * 100}%`,
                        top: `${annotation.y * 100}%`,
                      }
                  : undefined
              }
            >
              {label}
            </li>
          );
        })}
      </ul>

      <p className="fg-narrative" data-fg="narrative" data-fg-reveal="">
        {NARRATIVE}
      </p>
    </div>
  );
}
