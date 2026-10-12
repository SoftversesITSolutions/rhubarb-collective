"use client";

import { useId, useState, type FormEvent } from "react";
import {
  SUBSCRIBE_COPY,
  SUBSCRIBE_FALLBACK_EMAIL,
  isSubscriberEmail,
  submitSubscription,
  type SubscribeOutcome,
} from "@/lib/contact/subscribe";

type Status = "idle" | "sending" | SubscribeOutcome;

/**
 * The footer's subscription form: one labelled email field and one button.
 *
 * It prints the outcome the server actually returned (see lib/contact/subscribe)
 * — including "not open yet" while no destination is configured, with the
 * site's own address offered instead. Nothing is marked wrong before the
 * reader has tried to send, and the message is a live region so it is
 * announced, not only shown.
 */
export function FooterSubscribe() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    if (!isSubscriberEmail(email)) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    const outcome = await submitSubscription(email.trim());
    setStatus(outcome);
    if (outcome === "sent") setEmail("");
  };

  const message =
    status === "invalid" || status === "sent" || status === "unconfigured" || status === "failed"
      ? SUBSCRIBE_COPY[status]
      : "";
  const offerFallback =
    (status === "unconfigured" || status === "failed") && SUBSCRIBE_FALLBACK_EMAIL;

  return (
    <form className="footer-subscribe" onSubmit={onSubmit} noValidate>
      <label className="footer-subscribe__label" htmlFor={`${id}-email`}>
        {SUBSCRIBE_COPY.label}
        <span className="visually-hidden">: {SUBSCRIBE_COPY.field}</span>
      </label>
      <div className="footer-subscribe__row">
        <input
          id={`${id}-email`}
          className="footer-subscribe__input"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder={SUBSCRIBE_COPY.placeholder}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== "idle" && status !== "sending") setStatus("idle");
          }}
          aria-invalid={status === "invalid" ? true : undefined}
          aria-describedby={`${id}-status`}
          required
        />
        <button className="footer-subscribe__submit" type="submit" disabled={status === "sending"}>
          {status === "sending" ? SUBSCRIBE_COPY.sending : SUBSCRIBE_COPY.submit}
        </button>
      </div>
      <p
        id={`${id}-status`}
        className="footer-subscribe__status"
        data-status={status}
        role="status"
        aria-live="polite"
      >
        {message}
        {offerFallback && (
          <>
            {" "}
            <a className="footer-subscribe__fallback" href={`mailto:${SUBSCRIBE_FALLBACK_EMAIL}`}>
              {SUBSCRIBE_COPY.fallback}
            </a>
            .
          </>
        )}
      </p>
    </form>
  );
}
