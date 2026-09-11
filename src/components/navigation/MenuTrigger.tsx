import { forwardRef } from "react";
import { NAV_COPY } from "@/lib/navigation/config";

interface MenuTriggerProps {
  open: boolean;
  onToggle: () => void;
  /** Id of the overlay this controls. */
  controls: string;
  /** The two hairlines, handed up so the timeline can cross them. */
  barsRef: React.RefObject<HTMLSpanElement[]>;
}

/**
 * The one persistent control on the site.
 *
 * Fixed top-right, above the overlay as well as the page, so it is the close
 * control too — the icon crosses in place rather than a second button appearing
 * somewhere else, which is the whole reason it never moves.
 *
 * A real `<button>`, so Enter, Space and focus all work without being
 * reimplemented. `aria-expanded` carries the state and `aria-controls` names the
 * overlay, so the visible word stays the accessible name — no `aria-label`
 * silently overriding the text a voice-control user would actually say.
 *
 * The mark is two hairlines, drawn in the same weight as the network's own
 * strokes. No pill, no circle, no border box, no icon font, no library.
 */
export const MenuTrigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(
  function MenuTrigger({ open, onToggle, controls, barsRef }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className="menu-trigger"
        data-open={open ? "" : undefined}
        aria-expanded={open}
        aria-controls={controls}
        onClick={onToggle}
      >
        <span className="menu-trigger__label">
          {open ? NAV_COPY.close : NAV_COPY.open}
        </span>

        <span className="menu-trigger__mark" aria-hidden="true">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="menu-trigger__bar"
              ref={(el) => {
                if (el) barsRef.current[i] = el;
              }}
            />
          ))}
        </span>
      </button>
    );
  },
);
