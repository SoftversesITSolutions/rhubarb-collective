"use client";

import { useId, useRef, useState } from "react";
import {
  ENQUIRY_FIELDS,
  EMPTY_ENQUIRY,
  buildEnquiryMailto,
  submitEnquiry,
  validateEnquiry,
  type EnquiryErrors,
  type EnquiryField,
  type EnquiryFieldName,
  type EnquiryOutcome,
  type EnquiryValues,
} from "@/lib/contact/enquiry";
import { CONTACT_PAGE_FORM, CONTACT_PAGE_FORM_STATES } from "@/lib/contact/pageContent";

/**
 * 02 — THE ENQUIRY FORM
 *
 * The page's only interactive block, and the only client component under
 * `ContactPageMotion` that carries state.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IT IS BUILT FROM THE PAGE'S FOUR TOOLS, NOT FROM A FORM LIBRARY'S
 * ─────────────────────────────────────────────────────────────────────────────
 * Type, rule, space and the field's edges — the same four the routes above are
 * drawn with. So: no card, no panel, no box, no fill, no radius, no shadow, no
 * gradient, no glass, no icon, no pill, and no container around the fields. A
 * field is a label, the value you type, and the hairline underneath it, which is
 * precisely how a route is a label, a destination and the hairline above it. The
 * form is not a widget sitting on the contact page; it is another section of it.
 *
 * The one mark that is not type or a straight rule is the select's caret, and it
 * is two 1px hairlines rotated 45° — the menu trigger's own vocabulary, drawn at
 * the weight the network draws its strokes.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IT NEVER CLAIMS TO HAVE SENT ANYTHING
 * ─────────────────────────────────────────────────────────────────────────────
 * `submitEnquiry` resolves to one of four outcomes and this component renders
 * the message for whichever it got. With no `RHUBARB_ENQUIRY_ENDPOINT`
 * configured that outcome is `unconfigured`, and the panel says so in as many
 * words — then offers the composed `mailto:`, so the reader's typing reaches the
 * address the page has carried since it shipped rather than evaporating behind a
 * tick. See the header of `lib/contact/enquiry`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * MOTION: THE HEADING PARTICIPATES, THE FIELDS DO NOT
 * ─────────────────────────────────────────────────────────────────────────────
 * The intro column carries `data-cp-reveal` and the section's hairline carries
 * `data-cp-rule`, so this block enters with the same scrubbed gesture as every
 * other block on the page. NOTHING IS ADDED FOR THE FORM ITSELF, and the fields
 * are deliberately left out of the reveal rather than overlooked: that animation
 * resolves by leaving an inline `clip-path: inset(0% 0% 0% 0%)` on each revealed
 * element, a clip-path clips a descendant for hit-testing as well as for paint,
 * and the focus ring this site draws sits 2–4px OUTSIDE the element's box. A
 * revealed field would therefore ship a focus indicator its own parent crops —
 * which is a worse trade than a field that simply arrives with its section.
 * `contact-page.css` records the same finding for the route links above.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * VALIDATION IS QUIET AND LATE
 * ─────────────────────────────────────────────────────────────────────────────
 * Nothing is marked wrong before the reader has tried to send: a field that
 * turns red while it is still being typed into is telling somebody off for not
 * having finished. After the first attempt, errors clear as each field is
 * corrected and are re-checked on blur, so the form gets quieter as it is filled
 * rather than louder. `noValidate` suppresses the browser's own bubbles — the
 * `required` attributes stay on the controls, so assistive technology still
 * hears them — and the first unanswered field takes focus, which is what makes
 * the failure navigable from the keyboard instead of merely visible.
 */

/** The three states the panel below the button can be in. */
type FormStatus = "idle" | "submitting" | EnquiryOutcome;

export function ContactForm() {
  const headingId = useId();
  const fieldPrefix = useId();

  const [values, setValues] = useState<EnquiryValues>(EMPTY_ENQUIRY);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  /** Whether the reader has tried to send yet. Gates every error message. */
  const [attempted, setAttempted] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const submitting = status === "submitting";
  const sent = status === "sent";

  function update(name: EnquiryFieldName, value: string) {
    setValues((current) => ({ ...current, [name]: value }));

    // Clear this field's message as soon as it is answered; never add one here.
    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
    }
  }

  /* Blur fires after the render that carried the keystroke, so `values` in this
     closure is already current — no updater, and nothing derived inside one. */
  function revalidate(name: EnquiryFieldName) {
    if (!attempted) return;
    const found = validateEnquiry(values)[name];
    setErrors((existing) => {
      const next = { ...existing };
      if (found) next[name] = found;
      else delete next[name];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setAttempted(true);

    const found = validateEnquiry(values);
    setErrors(found);

    const firstInvalid = ENQUIRY_FIELDS.find((field) => found[field.name]);
    if (firstInvalid) {
      setStatus("invalid");
      formRef.current
        ?.querySelector<HTMLElement>(`#${CSS.escape(`${fieldPrefix}-${firstInvalid.name}`)}`)
        ?.focus();
      return;
    }

    setStatus("submitting");
    const result = await submitEnquiry(values);

    if (result.errors) setErrors(result.errors);
    setStatus(result.outcome);
  }

  /* The composed fallback, built from what is on screen right now. Offered by
     the two states that did not deliver, and by neither of the two that did or
     could not have. */
  const mailto =
    status === "unconfigured" || status === "failed" ? buildEnquiryMailto(values) : null;

  return (
    <section className="cp-form" aria-labelledby={headingId} data-cp-block="">
      <span className="cp-form__rule" aria-hidden="true" data-cp-rule="" />

      {/* ---- the intro column ---- */}
      <div className="cp-form__intro">
        <p className="cp-form__eyebrow" data-cp-reveal="">
          {CONTACT_PAGE_FORM.eyebrow}
        </p>

        <h2 className="cp-form__heading" id={headingId}>
          {CONTACT_PAGE_FORM.headingLines.map((line) => (
            <span className="cp-form__heading-line" key={line} data-cp-reveal="">
              {line}
            </span>
          ))}
        </h2>

        <p className="cp-form__note" data-cp-reveal="">
          {CONTACT_PAGE_FORM.note}
        </p>
      </div>

      {/* ---- the fields ---- */}
      <div className="cp-form__body">
        <form
          className="cp-form__form"
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          data-sent={sent ? "" : undefined}
        >
          <div className="cp-form__fields">
            {ENQUIRY_FIELDS.map((field) => (
              <Field
                key={field.name}
                field={field}
                id={`${fieldPrefix}-${field.name}`}
                value={values[field.name]}
                error={attempted ? errors[field.name] : undefined}
                disabled={submitting || sent}
                onChange={update}
                onBlur={revalidate}
              />
            ))}
          </div>

          <div className="cp-form__foot">
            <button
              className="cp-form__submit"
              type="submit"
              disabled={submitting || sent}
              data-submitting={submitting ? "" : undefined}
            >
              {submitting ? CONTACT_PAGE_FORM.submitting : CONTACT_PAGE_FORM.submit}
              {/* The sending state is the word plus a moving rule, not a
                  spinner: the page has no circles on it. */}
              <span className="cp-form__submit-rule" aria-hidden="true" />
            </button>
          </div>

          {/*
           * No `action` and no `method`. With JavaScript the submit is handled
           * above; without it, a form that posted somewhere would land the
           * reader on a raw JSON response, and one that fell back to a GET
           * would reload /contact with their answers in the address bar. Both
           * are worse than saying so — and the four routes above are ordinary
           * links that never needed scripting in the first place.
           */}
          <noscript>
            <p className="cp-form__status-line cp-form__noscript">
              {CONTACT_PAGE_FORM_STATES.noscript}
            </p>
          </noscript>

          {/*
           * One live region for every outcome, so a change of state is announced
           * once rather than four regions each announcing their own emptiness.
           * `polite`, because nothing here interrupts anything.
           */}
          <div className="cp-form__status" role="status" aria-live="polite">
            {status === "invalid" && !sent && (
              <p className="cp-form__status-line">{CONTACT_PAGE_FORM_STATES.incomplete}</p>
            )}

            {(status === "sent" || status === "unconfigured" || status === "failed") && (
              <div className="cp-form__outcome" data-outcome={status}>
                <p className="cp-form__outcome-heading">
                  {CONTACT_PAGE_FORM_STATES[status].heading}
                </p>
                <p className="cp-form__outcome-body">
                  {CONTACT_PAGE_FORM_STATES[status].body}
                </p>

                {mailto && (
                  <a className="cp-form__outcome-link" href={mailto}>
                    {CONTACT_PAGE_FORM_STATES.mailto}
                  </a>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * ONE FIELD
 * ------------------------------------------------------------------ */

interface FieldProps {
  field: EnquiryField;
  id: string;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (name: EnquiryFieldName, value: string) => void;
  onBlur: (name: EnquiryFieldName) => void;
}

/**
 * A label, a control and the hairline under it — the route's anatomy, inverted.
 *
 * The label is a real `<label htmlFor>`, always visible and never replaced by a
 * placeholder: a placeholder disappears the moment it is needed most, which is
 * while the field is being filled in. The placeholder that remains is an
 * example of an answer, and the select's is its unselected option rather than
 * ghost text, because an option is what a select can actually hold.
 *
 * `aria-describedby` is wired only when a message exists, so the control is not
 * left pointing at an empty node, and `aria-invalid` carries the state the
 * hairline's weight carries visually — the error is never colour alone.
 */
function Field({ field, id, value, error, disabled, onChange, onBlur }: FieldProps) {
  const errorId = `${id}-error`;

  const shared = {
    id,
    name: field.name,
    value,
    disabled,
    required: field.required || undefined,
    autoComplete: field.autoComplete,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": error ? errorId : undefined,
    onBlur: () => onBlur(field.name),
  };

  return (
    <div
      className="cp-field"
      data-width={field.width}
      data-kind={field.kind}
      data-invalid={error ? "" : undefined}
    >
      <label className="cp-field__label" htmlFor={id}>
        {field.label}
        {!field.required && (
          <span className="cp-field__optional">{CONTACT_PAGE_FORM.optionalNote}</span>
        )}
      </label>

      <span className="cp-field__control">
        {field.kind === "textarea" ? (
          <textarea
            {...shared}
            className="cp-field__input cp-field__textarea"
            rows={5}
            placeholder={field.placeholder}
            onChange={(event) => onChange(field.name, event.target.value)}
          />
        ) : field.kind === "select" ? (
          <>
            <select
              {...shared}
              className="cp-field__input cp-field__select"
              /* Drives the placeholder colour. A `:has()` selector would do the
                 same, but the value is already state here. */
              data-empty={value ? undefined : ""}
              onChange={(event) => onChange(field.name, event.target.value)}
            >
              <option value="">{field.placeholder}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="cp-field__caret" aria-hidden="true" />
          </>
        ) : (
          <input
            {...shared}
            className="cp-field__input"
            type={field.kind === "email" ? "email" : "text"}
            inputMode={field.kind === "email" ? "email" : undefined}
            placeholder={field.placeholder}
            onChange={(event) => onChange(field.name, event.target.value)}
          />
        )}
      </span>

      {error && (
        <p className="cp-field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
