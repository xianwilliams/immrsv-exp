"use client";
import { useRef, useState, type FormEvent } from "react";
import { submitInquiry } from "@/lib/inquiry";
import { Arrow } from "./site-ui";
import { ContactSlideshow } from "./contact-slideshow";
import "./contact-section.css";
import type { FeaturedSlide, Homepage, SiteSettings } from "@/lib/cms/types";
import { contentLines } from "./content-lines";

export function ContactSection({
  content,
  settings,
  slides,
}: {
  content: Homepage["contact"];
  settings: SiteSettings;
  slides: FeaturedSlide[];
}) {
  // Web3Forms' submission key is public by design; it identifies the recipient.
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim() || "";
  const submitting = useRef(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const data = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    submitting.current = true;
    setStatus("sending");
    setError("");
    try {
      await submitInquiry(data, accessKey);
      setStatus("sent");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Your message wasn’t sent. Please try again.",
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
      <ContactSlideshow
        key={slides.map((slide) => slide.project.id).join("|")}
        slides={slides}
      />
      <div className="embedded-contact-form contact-form">
        <span className="mono">{content.eyebrow}</span>
        <h2 id="contact-title">{contentLines(content.title)}</h2>
        <p>{content.description}</p>
        {status === "sent" ? (
          <div className="form-success" role="status">
            <h3>{content.successTitle}</h3>
            <p>{content.successMessage}</p>
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
              </div>
            )}
            <button
              type="submit"
              className="button submit-button"
              disabled={status === "sending"}
            >
              {status === "sending" ? "SENDING…" : "SEND MESSAGE"}
              <Arrow diagonal />
            </button>
          </form>
        )}
        <a className="contact-email" href={`mailto:${settings.contactEmail}`}>
          {settings.contactEmail}
        </a>
      </div>
    </section>
  );
}
