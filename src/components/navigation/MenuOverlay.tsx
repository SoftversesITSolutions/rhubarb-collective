import { forwardRef } from "react";
import { usePathname } from "next/navigation";
import { NAV_COPY, NAV_FOOTNOTE, NAV_ITEMS } from "@/lib/navigation/config";
import { MenuLink } from "./MenuLink";

interface MenuOverlayProps {
  id: string;
  panelRef: React.RefObject<HTMLDivElement | null>;
  navRef: React.RefObject<HTMLUListElement | null>;
  labelsRef: React.RefObject<HTMLElement[]>;
  tailRef: React.RefObject<HTMLElement[]>;
  /** A destination inside this document. */
  onScrollTo: (hash: string) => void;
  /** A destination on another route. */
  onLeave: () => void;
}

/**
 * The full-screen field.
 *
 * A modal dialog in the accessibility tree — `role="dialog"`, `aria-modal`, and
 * a name of its own — because that is what it behaves like: the page is still
 * there underneath and comes back untouched.
 *
 * Visually it is the opposite of the homepage: no network, no images, no field
 * of competing objects. Six lines of type in a black field. The brief allows a
 * decorative continuation of the organic language here and this deliberately
 * declines it — after seven sections of growth the menu's job is to be the rest
 * in the composition.
 */
export const MenuOverlay = forwardRef<HTMLDivElement, MenuOverlayProps>(
  function MenuOverlay({ id, panelRef, navRef, labelsRef, tailRef, onScrollTo, onLeave }, ref) {
    // The menu is the same six destinations on every route; only where each one
    // points changes with the page being read.
    const pathname = usePathname();

    return (
      <div
        ref={ref}
        id={id}
        className="menu-overlay"
        role="dialog"
        aria-modal="true"
        aria-label={NAV_COPY.title}
      >
        <div className="menu-overlay__panel" ref={panelRef}>
          <nav className="menu-nav" aria-label={NAV_COPY.title}>
            <ul className="menu-nav__list" ref={navRef}>
              {NAV_ITEMS.map((item, i) => (
                <MenuLink
                  key={item.label}
                  item={item}
                  pathname={pathname}
                  onScrollTo={onScrollTo}
                  onLeave={onLeave}
                  register={(el) => {
                    if (el) labelsRef.current[i] = el;
                  }}
                />
              ))}
            </ul>
          </nav>

          {/* One quiet line. The studio's place and its primary address, both
              already on the page — not a second copy of the Contact section. */}
          <div className="menu-overlay__footnote">
            <span
              className="menu-overlay__place"
              ref={(el) => {
                if (el) tailRef.current[0] = el;
              }}
            >
              {NAV_FOOTNOTE.place}
            </span>
            <a
              className="menu-overlay__email"
              href={`mailto:${NAV_FOOTNOTE.email}`}
              ref={(el) => {
                if (el) tailRef.current[1] = el;
              }}
            >
              {NAV_FOOTNOTE.email}
            </a>
          </div>
        </div>
      </div>
    );
  },
);
