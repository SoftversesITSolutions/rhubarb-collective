/**
 * /CONTACT — THE ENQUIRY
 * ======================
 *
 * The form's shape, its rules and its one submission seam, kept out of the
 * component so the renderer stays presentational and the route handler can
 * validate an incoming body with exactly the same function the browser used.
 * Nothing here imports React, and nothing here is client-only: the module is
 * pulled into both `components/contact/ContactForm` and `app/api/enquiry/route`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THERE IS STILL NO EMAIL SERVICE IN THIS REPOSITORY
 * ─────────────────────────────────────────────────────────────────────────────
 * The rest of the page was built on the rule that a form which silently
 * discards an enquiry is worse than an address that works. That rule has not
 * been relaxed — it has been paid for. `submitEnquiry` posts to a real route
 * handler; that handler forwards to `RHUBARB_ENQUIRY_ENDPOINT` when one is
 * configured, and answers `unconfigured` when one is not. The UI prints
 * whichever of those actually happened and never invents a third outcome, so
 * the form cannot claim to have sent something it did not send.
 *
 * `buildEnquiryMailto` is what makes the unconfigured state useful rather than
 * merely honest: it composes the same enquiry into the `mailto:` route the page
 * already carries, so a reader who fills the form in before the endpoint exists
 * still reaches somebody. It uses the address from `lib/contact/config` — there
 * is one copy of that value on the site and this is not a second one.
 *
 * WHAT IS AND IS NOT THE CLIENT'S. The seven field labels, the heading and the
 * option lists are this build's, written for the form; only the service names
 * are anchored to something supplied — see `SERVICE_OPTIONS`. No response time,
 * availability, rate card or turnaround is stated anywhere in this file.
 */

import { CONTACT_ROUTES } from "@/lib/contact/config";

/* ------------------------------------------------------------------ *
 * THE FIELDS
 * ------------------------------------------------------------------ */

export type EnquiryFieldName =
  | "name"
  | "email"
  | "organisation"
  | "subject"
  | "project"
  | "budget"
  | "timeline";

export type EnquiryValues = Record<EnquiryFieldName, string>;

export interface EnquiryField {
  name: EnquiryFieldName;
  /** The visible label. Always visible — no field on this form is placeholder-labelled. */
  label: string;
  kind: "text" | "email" | "select" | "textarea";
  required: boolean;
  /** Browser autofill hint. Omitted where no standard token describes the field. */
  autoComplete?: string;
  /**
   * An example, never an instruction. A select's placeholder is its unselected
   * option rather than ghost text.
   */
  placeholder?: string;
  options?: readonly string[];
  /**
   * Width on the wide tiers. "half" pairs with the next half; "full" spans the
   * column. Layout only — it changes nothing about the data.
   */
  width: "half" | "full";
}

/**
 * THE SERVICES, anchored to the six the site already publishes in
 * `lib/branches/config` — Branding Identity, Brand Communication, Social Media,
 * Website Development, Creative Photography and Consulting. The wording here is
 * the enquirer-facing phrasing of those same six, plus an escape hatch, because
 * a list that cannot describe the reader's problem makes them pick the wrong
 * one. No seventh discipline is invented.
 */
export const SERVICE_OPTIONS = [
  "Branding & Identity",
  "Brand Communication",
  "Social Media",
  "Website & SEO",
  "Photography & Video",
  "Consulting / Brand Audit",
  "Something else",
] as const;

/**
 * Bands, not a price list. They exist so a first conversation starts in roughly
 * the right place, which is the only thing this field is for — hence a select
 * rather than a number, and hence "Not sure yet" as a first-class answer rather
 * than a reason to leave the field blank. Rupees, because the registered entity
 * in `CONTACT_COLOPHON` is Indian and the digit grouping follows suit.
 */
export const BUDGET_OPTIONS = [
  "Under ₹1,00,000",
  "₹1,00,000 – ₹3,00,000",
  "₹3,00,000 – ₹7,50,000",
  "₹7,50,000 – ₹15,00,000",
  "Over ₹15,00,000",
  "Not sure yet",
] as const;

export const TIMELINE_OPTIONS = [
  "As soon as possible",
  "In the next 1–3 months",
  "In 3–6 months",
  "Later this year",
  "Still exploring",
] as const;

/**
 * SOURCE ORDER IS THE READING ORDER, and it is also the tab order, on every
 * tier. The wide tiers pair two fields onto a row rather than reordering, for
 * the same reason the routes above are placed by grid position: the visual
 * order must never diverge from the order a screen reader announces.
 *
 * THREE REQUIRED FIELDS AND NO MORE — who you are, where to answer, and what
 * the work is. Everything else sharpens the reply and none of it is worth
 * losing an enquiry over, so none of it blocks the button.
 */
export const ENQUIRY_FIELDS: readonly EnquiryField[] = [
  {
    name: "name",
    label: "Name",
    kind: "text",
    required: true,
    autoComplete: "name",
    placeholder: "Your name",
    width: "half",
  },
  {
    name: "email",
    label: "Email",
    kind: "email",
    required: true,
    autoComplete: "email",
    placeholder: "you@company.com",
    width: "half",
  },
  {
    name: "organisation",
    label: "Company / Organisation",
    kind: "text",
    required: false,
    autoComplete: "organization",
    placeholder: "Who you're writing on behalf of",
    width: "full",
  },
  {
    name: "subject",
    label: "What can we help you with?",
    kind: "select",
    required: false,
    options: SERVICE_OPTIONS,
    placeholder: "Select a discipline",
    width: "full",
  },
  {
    name: "project",
    label: "Tell us a little about your project",
    kind: "textarea",
    required: true,
    placeholder: "What you're building, and what's standing in the way.",
    width: "full",
  },
  {
    name: "budget",
    label: "Budget / Approximate investment",
    kind: "select",
    required: false,
    options: BUDGET_OPTIONS,
    placeholder: "Select a range",
    width: "half",
  },
  {
    name: "timeline",
    label: "Preferred timeline",
    kind: "select",
    required: false,
    options: TIMELINE_OPTIONS,
    placeholder: "Select a timeline",
    width: "half",
  },
];

export const EMPTY_ENQUIRY: EnquiryValues = {
  name: "",
  email: "",
  organisation: "",
  subject: "",
  project: "",
  budget: "",
  timeline: "",
};

/* ------------------------------------------------------------------ *
 * VALIDATION
 * ------------------------------------------------------------------ */

/**
 * Deliberately permissive. A contact form's email check exists to catch a typo
 * and a missing `@`, not to adjudicate RFC 5322 — every stricter pattern in
 * common use rejects addresses that are real, and rejecting a real address on a
 * contact page loses the enquiry outright. Something before an `@`, something
 * after it, a dot, and at least two characters past that.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type EnquiryErrors = Partial<Record<EnquiryFieldName, string>>;

/**
 * The single source of truth for "is this enquiry answerable". The browser runs
 * it to write the messages under the fields; the route handler runs the same
 * function on the parsed body, because client-side validation is a courtesy to
 * the reader and never a guarantee to the server.
 *
 * The messages are plain sentences rather than form-speak ("Name is required"),
 * and each one says what is needed and why, which is the whole of this page's
 * voice applied to the only part of it that can tell somebody they are wrong.
 */
export function validateEnquiry(values: EnquiryValues): EnquiryErrors {
  const errors: EnquiryErrors = {};

  if (!values.name.trim()) {
    errors.name = "We need a name to reply to.";
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = "We need an address to reply to.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "That doesn't look like an email address.";
  }

  if (!values.project.trim()) {
    errors.project = "A line or two is enough to start with.";
  }

  return errors;
}

/** Narrows an unknown request body to the seven strings, without trusting it. */
export function coerceEnquiry(body: unknown): EnquiryValues | null {
  if (typeof body !== "object" || body === null) return null;

  const record = body as Record<string, unknown>;
  const values = { ...EMPTY_ENQUIRY };

  for (const field of ENQUIRY_FIELDS) {
    const value = record[field.name];
    if (value === undefined || value === null) continue;
    if (typeof value !== "string") return null;
    // A ceiling, so a single request cannot be used to post a novel.
    values[field.name] = value.slice(0, 4000);
  }

  return values;
}

/* ------------------------------------------------------------------ *
 * SUBMISSION
 * ------------------------------------------------------------------ */

/**
 * What actually happened. There is no fifth member and no default: the UI
 * renders one of these four and nothing else, which is what stops the form
 * announcing a delivery that did not occur.
 *
 *   sent          the endpoint accepted it
 *   unconfigured  no endpoint is configured yet — nothing was delivered
 *   invalid       the server rejected the payload
 *   failed        the network or the endpoint failed
 */
export type EnquiryOutcome = "sent" | "unconfigured" | "invalid" | "failed";

export const ENQUIRY_PATH = "/api/enquiry";

export interface EnquiryResult {
  outcome: EnquiryOutcome;
  /** Server-side field errors, where the server is the one that found them. */
  errors?: EnquiryErrors;
}

/**
 * The one seam between the form and whatever eventually carries the mail.
 *
 * The component knows this function and nothing else — not the path, not the
 * status codes, not the payload shape — so connecting a real provider is a
 * change to the route handler and, at most, to this function. Anything thrown
 * on the way (offline, DNS, a non-JSON body from a proxy) resolves to "failed"
 * rather than propagating, because an unhandled rejection here would leave the
 * button spinning with nothing on screen to explain it.
 */
export async function submitEnquiry(values: EnquiryValues): Promise<EnquiryResult> {
  try {
    const response = await fetch(ENQUIRY_PATH, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload: unknown = await response.json().catch(() => null);
    const outcome =
      payload &&
      typeof payload === "object" &&
      "outcome" in payload &&
      typeof (payload as { outcome: unknown }).outcome === "string"
        ? ((payload as { outcome: string }).outcome as EnquiryOutcome)
        : null;

    if (outcome === "sent" || outcome === "unconfigured" || outcome === "invalid") {
      return {
        outcome,
        errors:
          payload && typeof payload === "object" && "errors" in payload
            ? ((payload as { errors?: EnquiryErrors }).errors ?? undefined)
            : undefined,
      };
    }

    return { outcome: response.ok ? "sent" : "failed" };
  } catch {
    return { outcome: "failed" };
  }
}

/* ------------------------------------------------------------------ *
 * THE FALLBACK THAT ALWAYS WORKS
 * ------------------------------------------------------------------ */

/**
 * The primary email, read from the routes the page already renders rather than
 * retyped. If it is ever missing the fallback is simply absent — a `mailto:`
 * built from a guessed address would be the invented destination this project
 * refuses everywhere else.
 */
const PRIMARY_EMAIL =
  CONTACT_ROUTES.find((route) => route.id === "email" && route.href)?.value ?? null;

/**
 * Composes the enquiry into the page's real `mailto:` route.
 *
 * This is what the unconfigured and failed states offer, and it is the reason
 * neither of them is a dead end: the reader's typing is not thrown away, it is
 * handed to a destination that has worked since the day the page shipped. Empty
 * optional fields are dropped rather than sent as blank headings.
 */
export function buildEnquiryMailto(values: EnquiryValues): string | null {
  if (!PRIMARY_EMAIL) return null;

  const lines: string[] = [];
  for (const field of ENQUIRY_FIELDS) {
    const value = values[field.name].trim();
    if (!value) continue;
    lines.push(`${field.label}`, value, "");
  }

  const subject = values.subject.trim()
    ? `Enquiry — ${values.subject.trim()}`
    : "Enquiry";

  return (
    `mailto:${PRIMARY_EMAIL}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(lines.join("\n").trimEnd())}`
  );
}
