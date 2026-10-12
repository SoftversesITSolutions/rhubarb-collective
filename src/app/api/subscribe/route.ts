import { isSubscriberEmail } from "@/lib/contact/subscribe";

/**
 * POST /api/subscribe
 * ===================
 *
 * The footer subscription form's server side. The same thin seam as
 * `/api/enquiry`, and the same promise: it does not run a mailing list and it
 * does not pretend to. `RHUBARB_SUBSCRIBE_ENDPOINT` names an HTTPS endpoint
 * that receives the address as JSON — a list provider's inbound URL, a
 * webhook, a function. Unset, this handler answers `unconfigured` with a 503
 * and the form says so on screen.
 *
 * It never returns `sent` for an address that was not delivered, and it
 * neither stores nor logs the address.
 */

function endpoint(): string | null {
  const value = process.env.RHUBARB_SUBSCRIBE_ENDPOINT?.trim();
  return value ? value : null;
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ outcome: "invalid" }, { status: 400 });
  }

  const email =
    body && typeof body === "object" && "email" in body
      ? (body as { email: unknown }).email
      : null;
  if (!isSubscriberEmail(email)) {
    return Response.json({ outcome: "invalid" }, { status: 422 });
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
        ...(process.env.RHUBARB_SUBSCRIBE_TOKEN
          ? { authorization: `Bearer ${process.env.RHUBARB_SUBSCRIBE_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        source: "rhubarbcollective.com/footer",
        receivedAt: new Date().toISOString(),
        email: email.trim(),
      }),
    });

    if (!forwarded.ok) {
      console.error(`[subscribe] destination responded ${forwarded.status}`);
      return Response.json({ outcome: "failed" }, { status: 502 });
    }

    return Response.json({ outcome: "sent" });
  } catch (error) {
    console.error("[subscribe] destination unreachable", error);
    return Response.json({ outcome: "failed" }, { status: 502 });
  }
}
