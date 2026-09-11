import { coerceEnquiry, validateEnquiry, type EnquiryValues } from "@/lib/contact/enquiry";

/**
 * POST /api/enquiry
 * =================
 *
 * The contact form's server side, and the only one the project has. It is
 * deliberately thin: parse, validate, forward, answer.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IT DOES NOT SEND EMAIL, AND IT DOES NOT PRETEND TO
 * ─────────────────────────────────────────────────────────────────────────────
 * No mail provider is installed, no SDK is added, no account exists and no
 * third-party service is introduced — those were all explicitly out of scope.
 * What exists instead is the seam: one environment variable naming an HTTPS
 * endpoint that receives the enquiry as JSON. Point `RHUBARB_ENQUIRY_ENDPOINT`
 * at a mail function, a CRM webhook, a queue or a provider's own inbound URL and
 * the form is live; leave it unset and this handler answers `unconfigured` with
 * a 503, which the browser prints as exactly that.
 *
 * The one thing it will never do is return `sent` for an enquiry that was not
 * delivered. That is the whole reason the endpoint is a variable rather than a
 * `console.log` and a 200.
 *
 * NOTHING IS PERSISTED AND NOTHING IS LOGGED. The body is somebody's name,
 * address and description of unreleased work; it is forwarded to the configured
 * destination and dropped. On failure the upstream status is recorded on the
 * server console without the payload, so a misconfiguration is debuggable
 * without writing an enquirer's details into a log aggregator.
 *
 * Route handlers are not cached for POST, so there is no cache directive here
 * and none is needed.
 */

/** The configured destination, or null. Read per request so a redeploy is not
 *  required to notice a changed environment. */
function endpoint(): string | null {
  const value = process.env.RHUBARB_ENQUIRY_ENDPOINT?.trim();
  return value ? value : null;
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ outcome: "invalid" }, { status: 400 });
  }

  const values = coerceEnquiry(body);
  if (!values) {
    return Response.json({ outcome: "invalid" }, { status: 400 });
  }

  /* The same function the browser ran. Client-side validation is a courtesy to
     the reader; this is the one that counts. */
  const errors = validateEnquiry(values);
  if (Object.keys(errors).length > 0) {
    return Response.json({ outcome: "invalid", errors }, { status: 422 });
  }

  const destination = endpoint();
  if (!destination) {
    return Response.json({ outcome: "unconfigured" }, { status: 503 });
  }

  try {
    const forwarded = await fetch(destination, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        /* Sent only when configured. A destination that needs no credential
           simply never sees the header. */
        ...(process.env.RHUBARB_ENQUIRY_TOKEN
          ? { authorization: `Bearer ${process.env.RHUBARB_ENQUIRY_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(payload(values)),
    });

    if (!forwarded.ok) {
      console.error(`[enquiry] destination responded ${forwarded.status}`);
      return Response.json({ outcome: "failed" }, { status: 502 });
    }

    return Response.json({ outcome: "sent" });
  } catch (error) {
    console.error("[enquiry] destination unreachable", error);
    return Response.json({ outcome: "failed" }, { status: 502 });
  }
}

/**
 * What the destination receives. Trimmed, flat, and stamped — a shape any
 * webhook, mail function or CRM can read without knowing anything about this
 * site.
 */
function payload(values: EnquiryValues) {
  return {
    source: "rhubarbcollective.com/contact",
    receivedAt: new Date().toISOString(),
    name: values.name.trim(),
    email: values.email.trim(),
    organisation: values.organisation.trim(),
    subject: values.subject.trim(),
    project: values.project.trim(),
    budget: values.budget.trim(),
    timeline: values.timeline.trim(),
  };
}
