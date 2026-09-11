/**
 * GLOBAL NAVIGATION
 *
 * Every destination here is somewhere that really exists. No route is invented,
 * no placeholder page is created, and nothing points at a document that is not
 * mounted: a `path` is a real route under `app/`, and a `hash` is the `id` of a
 * section that is actually rendered on it.
 *
 * The site began as one page and is now two. A destination is described by the
 * pair rather than by a bare fragment, so the same menu resolves correctly from
 * either route:
 *
 *   path "/",        hash "#work"  → a section of the homepage
 *   path "/about",   hash null     → a page of its own
 *   path "/contact", hash null     → likewise
 *
 * Contact us pointed at `#contact` — the footer, which is on every route —
 * while that footer was the only contact destination the site had. It now has a
 * page, so the menu names the page. The footer keeps its `#contact` id, which
 * nothing else in the menu depends on. Works moved the same way when /work
 * shipped: it named the homepage's Selected Work section while that was the
 * only archive on the site, and it now names the route. That section is
 * unchanged and keeps its own `#work` id.
 *
 * `index` is that destination's OWN on-page marker — the same 01 / 02 / 03
 * numbers the sections print in their headers — never a number invented for the
 * menu. The hero is unnumbered on the page, so it is unnumbered here; About us
 * and Contact us name whole pages rather than numbered sections, so they are
 * unnumbered too.
 *
 * The labels are the client's requested wording for the menu. They deliberately
 * differ from the headings on the page (WORKS against "Selected Work", SERVICES
 * against "What We Do", INSIGHTS against "Journal & Culture") because a menu
 * names a destination in the shortest words that identify it, while a section
 * titles itself. `section` records what each one actually points at, so the
 * mapping is legible from this file alone.
 */

export interface NavItem {
  /** Menu wording. */
  label: string;
  /**
   * The route the destination lives on, or `null` when it is on every route.
   * Must be a real path under `app/`.
   */
  path: string | null;
  /** Fragment of a section that is really rendered on that route, where the
   *  destination is a section rather than a page. */
  hash: string | null;
  /**
   * Whether this item names a whole page rather than a section of one. Only a
   * page-level item can be the reader's current page: pointing at four sections
   * of the homepage does not make four items `aria-current="page"`.
   */
  page: boolean;
  /** That destination's own on-page marker, where it has one. */
  index: string | null;
  /** What it points at, for whoever reads this file next. */
  section: string;
}

export const NAV_ITEMS: NavItem[] = [
  // The homepage. Its hash is the hero, which is simply the top of it.
  { label: "Home", path: "/", hash: "#home", page: true, index: null, section: "Hero" },
  {
    label: "About us",
    path: "/about",
    hash: null,
    page: true,
    index: null,
    section: "About us",
  },
  {
    // Works named the homepage's Selected Work section while that section was
    // the only work destination the site had. It now has a page, so the menu
    // names the page — the same move Contact us made when /contact shipped.
    // The homepage section keeps its `#work` id; nothing in the menu depends
    // on it any more. `index` goes to null because this names a whole route
    // rather than a numbered section, as About us and Contact us do.
    label: "Works",
    path: "/work",
    hash: null,
    page: true,
    index: null,
    section: "Work",
  },
  {
    // Services named the homepage's Section 04 while that section was the only
    // account of the disciplines the site had. It now has a page, so the menu
    // names the page — the same move Contact us and Works made when their
    // routes shipped. The homepage section is unchanged and keeps its own
    // `#services` id; nothing in the menu depends on it any more. `index` goes
    // to null because this names a whole route rather than a numbered section.
    label: "Services",
    path: "/services",
    hash: null,
    page: true,
    index: null,
    section: "Services",
  },
  {
    // Insights named the homepage's Journal & Culture section while that was the
    // only editorial destination on the site. It now has a page — the archive
    // and that section read the same `JOURNAL_ENTRIES` list — so the menu names
    // the page. The same move Contact us, Works and Services made. The homepage
    // section keeps its own `#insights` id; nothing in the menu depends on it.
    label: "Insights",
    path: "/insights",
    hash: null,
    page: true,
    index: null,
    section: "Insights",
  },
  {
    label: "Contact us",
    path: "/contact",
    hash: null,
    page: true,
    index: null,
    section: "Contact",
  },
];

/**
 * Where a menu item points from the route currently being read.
 *
 * Pure, and derived from the pathname rather than from the DOM, so the server
 * and the client agree on every `href` and hydration never has to correct one.
 * A fragment on its own means "this document", which is what tells the menu it
 * can scroll instead of navigate.
 */
export function navHref(item: NavItem, pathname: string): string {
  if (item.path === null) return item.hash ?? "/";
  if (item.path === pathname) return item.hash ?? item.path;
  return `${item.path}${item.hash ?? ""}`;
}

/**
 * Whether this item names the page currently being read.
 *
 * Page-level items only. Works, Services and Insights all live at "/" and
 * marking all three `aria-current="page"` while reading the homepage would tell
 * a screen-reader user they are on four pages at once.
 */
export function isCurrentRoute(item: NavItem, pathname: string): boolean {
  return item.page && item.path === pathname;
}

/**
 * The one line of supporting information in the overlay.
 *
 * Both strings are the client's own, already used elsewhere on the site — the
 * studio's location from the supplied address and the primary email from the
 * approved footer copy. Nothing is added here that the Contact section does not
 * already say, and nothing from it is repeated at length: no GSTIN, no postal
 * address, no second email, no social row.
 */
export const NAV_FOOTNOTE = {
  place: "Dehradun, India",
  email: "wearerhubarb@gmail.com",
} as const;

export const NAV_COPY = {
  /** Accessible name for the overlay itself. */
  title: "Site navigation",
  open: "Menu",
  close: "Close",
} as const;
