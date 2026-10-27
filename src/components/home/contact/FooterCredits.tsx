"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BLOOM } from "@/lib/contact/config";
import { SPECIMEN_LICENCE, type Specimen } from "@/lib/specimens/config";

interface FooterCreditsProps {
  /** The turning sunflower's attribution, wherever the bloom is shown. */
  bloom: boolean;
  /** The homepage's 3D specimens, when there are any. */
  specimens?: readonly Specimen[];
}

/**
 * The model attributions, behind one quiet "Credits" link (client round 3).
 *
 * The attributions are a condition of the CC BY licences, so they stay in the
 * page and in the server HTML; they are only folded away. The panel opens
 * ABOVE the link and floats: the footer's network is grown against the
 * footer's own height and regrows when it changes, so a panel that pushed
 * the page longer would regrow every strand on each click.
 */
export function FooterCredits({ bloom, specimens = [] }: FooterCreditsProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  if (!bloom && specimens.length === 0) return null;

  return (
    <div className="footer-credits" ref={rootRef} data-open={open ? "" : undefined}>
      <button
        ref={toggleRef}
        type="button"
        className="footer-credits__toggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        Credits
        <span className="footer-credits__sign" aria-hidden="true" />
      </button>

      <div className="footer-credits__panel" id={id} inert={!open}>
        {bloom && (
          <p className="footer-credits__line">
            <span>{BLOOM.credit.label}: </span>
            <a className="contact__credit-link" href={BLOOM.credit.modelHref} rel="noopener">
              “{BLOOM.credit.title}”
            </a>
            <span> by </span>
            <a className="contact__credit-link" href={BLOOM.credit.authorHref} rel="noopener">
              {BLOOM.credit.author}
            </a>
            <span>, </span>
            <a className="contact__credit-link" href={BLOOM.credit.licenceHref} rel="noopener license">
              {BLOOM.credit.licence}
            </a>
          </p>
        )}

        {specimens.length > 0 && (
          <p className="footer-credits__line">
            <span>3D models: </span>
            {specimens.map((specimen, i) => (
              <span key={specimen.id}>
                {i > 0 && "; "}
                <a className="contact__credit-link" href={specimen.credit.href} rel="noopener">
                  “{specimen.credit.title}”
                </a>
                <span> by {specimen.credit.author}</span>
              </span>
            ))}
            <span>. All </span>
            <a className="contact__credit-link" href={SPECIMEN_LICENCE.href} rel="noopener license">
              {SPECIMEN_LICENCE.label}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
