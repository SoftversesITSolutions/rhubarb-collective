import Link from "next/link";
import { ARCHIVE_HREF, type ServiceEntry as ServiceEntryData } from "@/lib/services/catalogue";
import { SERVICES_INDEX } from "@/lib/services/pageContent";

interface ServiceEntryProps {
  entry: ServiceEntryData;
  open: boolean;
  onToggle: (index: string) => void;
  /** Titles of the disciplines named in `sharesWith`, resolved by the index. */
  shares: { index: string; title: string }[];
}

/**
 * ONE DISCIPLINE, AS AN INDEX ENTRY.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IT IS A DISCLOSURE, NOT A HOVER
 * ─────────────────────────────────────────────────────────────────────────────
 * The whole head of the entry — number, title and descriptor — is one real
 * `<button>`, so it opens with a click, with Enter, with Space and with a tap,
 * on every device, with no key handling written for it. `aria-expanded` carries
 * the state and `aria-controls` names the panel.
 *
 * NOTHING IS BEHIND HOVER. Hover changes the colour of the number and extends a
 * rule; it reveals no content at all, so a touch reader and a keyboard reader
 * lose nothing. And at rest the entry still says what the client's own approved
 * list says — name and descriptor — so a reader who opens nothing has read the
 * same six lines the homepage gives them. Opening adds the annotation.
 *
 * THE MARK IS THE MENU TRIGGER'S. Two 1px hairlines crossed into a plus, which
 * rotates to a minus when the entry opens. Not an icon and not a chevron: it is
 * the same two rules the site's one persistent control is drawn with, at the
 * weight the network draws its strokes. It is `aria-hidden` — `aria-expanded`
 * on the button is what actually carries the state.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE PANEL IS ALWAYS IN THE DOCUMENT
 * ─────────────────────────────────────────────────────────────────────────────
 * It is collapsed with `grid-template-rows: 0fr` and `visibility: hidden`
 * rather than unmounted, so the page's whole content is in the server HTML and
 * in the document for a reader who is searching the page, and so the open and
 * close transitions are symmetrical. `visibility` is what keeps a collapsed
 * panel's links out of the tab order — a zero-height panel whose contents are
 * still focusable is the classic accordion bug.
 *
 * THREE LAYERS, AND ONLY WHAT IS REAL:
 *
 *   Covers ....... the client's own decomposition of this discipline
 *   Practised on . engagements, each quoting the case-study deck's own words
 *   Runs with .... the other disciplines that share one of those engagements —
 *                  derived, never authored. This is the page's connective
 *                  device: the six overlap because real projects made them
 *                  overlap.
 *
 * The last two are simply absent on a discipline that has no engagement, which
 * is why the six entries are different heights. See the header of
 * `lib/services/catalogue` for which two, and why nothing is invented to fill
 * them.
 */
export function ServiceEntry({ entry, open, onToggle, shares }: ServiceEntryProps) {
  const panelId = `sv-panel-${entry.index}`;
  const headId = `sv-head-${entry.index}`;

  return (
    <li className="sv-entry" data-slot={entry.slot} data-open={open ? "" : undefined}>
      {/*
        The heading is outside the button and the button is inside it, so the
        entry is a real H3 in the document outline while the whole head stays
        one control. A button wrapping a heading would take the heading out of
        the outline; a heading wrapping a button keeps both.
      */}
      <h3 className="sv-entry__heading" id={headId}>
        <button
          type="button"
          className="sv-entry__head"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onToggle(entry.index)}
        >
          <span className="sv-entry__index" data-sv-reveal="">
            {entry.index}
          </span>

          <span className="sv-entry__title" data-sv-reveal="">
            {entry.title}
          </span>

          <span className="sv-entry__descriptor" data-sv-reveal="">
            {entry.descriptor}
          </span>

          {/* The site's own open/close mark. State is on the button. */}
          <span className="sv-entry__mark" aria-hidden="true">
            <span className="sv-entry__bar" />
            <span className="sv-entry__bar" />
          </span>
        </button>
      </h3>

      <div className="sv-entry__panel" id={panelId} role="region" aria-labelledby={headId}>
        <div className="sv-entry__panel-inner">
          <div className="sv-entry__layer">
            <p className="sv-entry__layer-label">{SERVICES_INDEX.coversLabel}</p>
            <ul className="sv-entry__covers">
              {entry.capabilities.map((capability) => (
                <li className="sv-entry__capability" key={capability.term}>
                  {capability.term}
                </li>
              ))}
            </ul>
          </div>

          {entry.engagements.length > 0 && (
            <div className="sv-entry__layer">
              <p className="sv-entry__layer-label">{SERVICES_INDEX.practiceLabel}</p>

              <ul className="sv-entry__engagements">
                {entry.engagements.map((engagement) => (
                  <li className="sv-entry__engagement" key={engagement.clientId}>
                    <span className="sv-entry__client">{engagement.client}</span>
                    {/* The deck's own words for what this discipline did on that
                        engagement, quoted rather than summarised. */}
                    <span className="sv-entry__phrase">{engagement.phrase}</span>
                  </li>
                ))}
              </ul>

              <p className="sv-entry__archive">
                <Link className="sv-entry__archive-link" href={ARCHIVE_HREF}>
                  {SERVICES_INDEX.archiveLabel}
                </Link>
              </p>
            </div>
          )}

          {shares.length > 0 && (
            <div className="sv-entry__layer sv-entry__layer--shares">
              <p className="sv-entry__layer-label">{SERVICES_INDEX.sharesLabel}</p>
              <ul className="sv-entry__shares">
                {shares.map((share) => (
                  <li className="sv-entry__share" key={share.index}>
                    <span className="sv-entry__share-index">{share.index}</span>
                    <span className="sv-entry__share-title">{share.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
