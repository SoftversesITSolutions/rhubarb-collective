import Link from "next/link";
import { isCurrentRoute, navHref, type NavItem } from "@/lib/navigation/config";

interface MenuLinkProps {
  item: NavItem;
  /** The route currently being read, so the item can resolve its own href. */
  pathname: string;
  /** Registers the moving inner span with the timeline. */
  register: (el: HTMLElement | null) => void;
  /** A destination inside this document: close, then scroll to it. */
  onScrollTo: (hash: string) => void;
  /** A destination on another route: close, and let the router take it. */
  onLeave: () => void;
}

/**
 * One destination.
 *
 * A real link, so it works with the keyboard, with a middle click, with "copy
 * link address", and with JavaScript switched off entirely. The two kinds
 * behave the way their href says they will:
 *
 *   "#work"        → in this document. The handler intercepts a plain left
 *                    click only to close the overlay first and scroll smoothly.
 *   "/about"       → another route. `next/link` navigates; the handler closes
 *                    the overlay and gets out of the way.
 *
 * Either way anything that is not a plain left click belongs to the browser.
 *
 * The moving part is the inner span, not the anchor: it travels inside a
 * clipped line box, so the label rises into view from behind its own edge
 * rather than sliding across the field. That is what makes the sequence read as
 * type setting itself rather than as a list fading in.
 */
export function MenuLink({ item, pathname, register, onScrollTo, onLeave }: MenuLinkProps) {
  const href = navHref(item, pathname);
  const inDocument = href.startsWith("#");
  const current = isCurrentRoute(item, pathname);

  const body = (
    <>
      {/* That destination's own on-page marker. Absent for the hero and for
          About us, neither of which is a numbered section anywhere. */}
      {item.index && (
        <span className="menu-nav__index" aria-hidden="true">
          {item.index}
        </span>
      )}

      <span className="menu-nav__line">
        <span className="menu-nav__label" ref={register}>
          {item.label}
        </span>
      </span>
    </>
  );

  /** True for a plain left click — anything else is the browser's to handle. */
  const isPlainClick = (event: React.MouseEvent) =>
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    event.button === 0;

  return (
    <li className="menu-nav__item">
      {inDocument ? (
        <a
          className="menu-nav__link"
          href={href}
          aria-current={current ? "page" : undefined}
          onClick={(event) => {
            if (!isPlainClick(event)) return;
            event.preventDefault();
            onScrollTo(href);
          }}
        >
          {body}
        </a>
      ) : (
        <Link
          className="menu-nav__link"
          href={href}
          aria-current={current ? "page" : undefined}
          onClick={(event) => {
            if (!isPlainClick(event)) return;
            // Not prevented: the router still navigates. This only releases the
            // scroll lock and reverses the overlay on the way out.
            onLeave();
          }}
        >
          {body}
        </Link>
      )}
    </li>
  );
}
