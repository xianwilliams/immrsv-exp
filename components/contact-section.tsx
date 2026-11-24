"use client";
import { useRef, useState, type FormEvent } from "react";
import { submitInquiry } from "@/lib/inquiry";
import { Arrow } from "./site-ui";
import { ContactSlideshow } from "./contact-slideshow";
import "./contact-section.css";

export function ContactSection() {
  // Web3Forms' submission key is public by design; it identifies the recipient.
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim() || "";
  const emailDeliveryEnabled = Boolean(accessKey);
  const submitting = useRef(false);
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "draft" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [mail, setMail] = useState("mailto:nick@immrsv-exp.com");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const data = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    setMail(
      `mailto:nick@immrsv-exp.com?subject=${encodeURIComponent(String(data.subject))}&body=${encodeURIComponent(`${data.message}\n\n${data.name}\n${data.email}`)}`,
    );
    if (!emailDeliveryEnabled) {
      setStatus("draft");
      return;
    }
    submitting.current = true;
    setStatus("sending");
    setError("");
    try {
      await submitInquiry(data, accessKey);
      setStatus("sent");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Please send your message by email.",
      );
      setStatus("error");
    } finally {
      submitting.current = false;
    }
  }
  return (
    <section
      className="embedded-contact"
      id="contact"
      aria-labelledby="contact-title"
    >
      <ContactSlideshow />
      <div className="embedded-contact-form contact-form">
        <span className="mono">WORK WITH US</span>
        <h2 id="contact-title">
          What are you
          <br />
          thinking?
        </h2>
        <p>A first idea. A full brief. An extra set of hands.</p>
        {status === "sent" ? (
          <div className="form-success" role="status">
            <h3>Thanks for reaching out.</h3>
            <p>Your message has been sent. We’ll be in touch.</p>
          </div>
        ) : (
          <form onSubmit={submit} aria-busy={status === "sending"}>
            <div className="field-row">
              <label>
                Name <span>*</span>
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={120}
                  placeholder="Your name"
                />
              </label>
              <label>
                Email address <span>*</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="you@company.com"
                />
              </label>
            </div>
            <label>
              Subject <span>*</span>
              <input
                name="subject"
                required
                maxLength={200}
                placeholder="What can we help with?"
              />
            </label>
            <label>
              What’s up? <span>*</span>
              <textarea
                name="message"
                required
                maxLength={5000}
                rows={4}
                placeholder="Tell us about the idea, the project, or what you need."
              />
            </label>
            <div className="honeypot" aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            {status === "error" && (
              <div className="form-error" role="alert">
                <p>{error}</p>
                <a href={mail}>
                  SEND DIRECTLY BY EMAIL <Arrow diagonal />
                </a>
              </div>
            )}
            {status === "draft" && (
              <div className="email-draft" role="status">
                <p>
                  Your draft is ready. Open it in your email app, then send it
                  to Nick.
                </p>
                <a className="button" href={mail}>
                  OPEN EMAIL DRAFT <Arrow diagonal />
                </a>
                <span>Your message has not been sent yet.</span>
              </div>
            )}
            <button
              className="button submit-button"
              disabled={status === "sending"}
            >
              {status === "sending"
                ? "SENDING…"
                : emailDeliveryEnabled
                  ? "SEND MESSAGE"
                  : status === "draft"
                    ? "UPDATE EMAIL DRAFT"
                    : "PREPARE EMAIL"}
              <Arrow diagonal />
            </button>
            {!emailDeliveryEnabled && status !== "draft" && (
              <p className="contact-delivery-note">
                Prepare a draft to send from your email app.
              </p>
            )}
          </form>
        )}
        <a className="contact-email" href="mailto:nick@immrsv-exp.com">
          nick@immrsv-exp.com
        </a>
      </div>
    </section>
  );
}
