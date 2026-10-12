/**
 * THE FOOTER SUBSCRIPTION
 * =======================
 *
 * The email form in the global footer (client round 2, priority 9): its one
 * rule, its copy and its submission seam, shared by the component and by
 * `app/api/subscribe/route`.
 *
 * It follows the enquiry form's contract exactly (see ./enquiry). There is no
 * mailing-list service in this repository and none was introduced, so the
 * route forwards an address to `RHUBARB_SUBSCRIBE_ENDPOINT` when one is
 * configured and answers `unconfigured` when one is not — and the form prints
 * whichever of those happened. It never says "subscribed" for an address that
 * went nowhere.
 *
 * The words here are this build's, written for the form. They promise no
 * newsletter, frequency or content: the client has not described one.
 */

import { CONTACT_ROUTES } from "@/lib/contact/config";
import { EMAIL_PATTERN } from "@/lib/contact/enquiry";

export type SubscribeOutcome = "sent" | "unconfigured" | "invalid" | "failed";

export const SUBSCRIBE_PATH = "/api/subscribe";

/** The address a reader is pointed to when the form cannot take theirs. */
export const SUBSCRIBE_FALLBACK_EMAIL =
  CONTACT_ROUTES.find((route) => route.href?.startsWith("mailto:"))?.href?.slice(7) ?? null;

export const SUBSCRIBE_COPY = {
  label: "Subscribe",
  field: "Email address",
  placeholder: "you@example.com",
  submit: "Subscribe",
  sending: "Sending",
  invalid: "Enter a valid email address.",
  sent: "Thank you. Your address has been received.",
  unconfigured: "Subscriptions are not open yet.",
  failed: "That did not go through. Please try again.",
  fallback: "Write to us instead",
} as const;

/** The same check in the browser and in the route handler. */
export function isSubscriberEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && EMAIL_PATTERN.test(value.trim());
}

/**
 * Post an address to the route handler and report what actually happened.
 * A network failure is caught and returned as `failed`, never thrown.
 */
export async function submitSubscription(email: string): Promise<SubscribeOutcome> {
  try {
    const response = await fetch(SUBSCRIBE_PATH, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload: unknown = await response.json().catch(() => null);
    const outcome =
      payload && typeof payload === "object" && "outcome" in payload
        ? (payload as { outcome: unknown }).outcome
        : null;
    if (outcome === "sent" || outcome === "unconfigured" || outcome === "invalid") {
      return outcome;
    }
    return "failed";
  } catch {
    return "failed";
  }
}
