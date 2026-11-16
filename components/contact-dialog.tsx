"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Arrow, Brand, Close } from "./site-ui";

export function Contact({
  open,
  onOpenChange,
  onRestoreFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestoreFocus: (event: Event) => void;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const [videoPaused, setVideoPaused] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (open) {
      setStatus("idle");
      setError("");
      setVideoPaused(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    }
  }, [open]);
  function toggleContactVideo() {
    const video = videoRef.current;
    if (!video) return;
    if (videoPaused) video.play().catch(() => {});
    else video.pause();
    setVideoPaused(!videoPaused);
  }
  const [mail, setMail] = useState("mailto:nick@immrsv-exp.com");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.entries());
    setMail(
      `mailto:nick@immrsv-exp.com?subject=${encodeURIComponent(String(data.subject))}&body=${encodeURIComponent(`${data.message}\n\n${data.name}\n${data.email}`)}`,
    );
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "Please try again or send your message by email.",
        );
      setStatus("sent");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Please send your message by email.",
      );
      setStatus("error");
    }
  }
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="contact-dialog"
          onCloseAutoFocus={onRestoreFocus}
        >
          <Close />
          <div className="contact-visual">
            <video
              ref={videoRef}
              autoPlay={!videoPaused}
              muted
              loop
              playsInline
              poster="/media/contact-reel-poster.jpg"
              aria-hidden="true"
            >
              <source src="/media/contact-reel.mp4" type="video/mp4" />
            </video>
            <div className="contact-logo">
              <Brand />
            </div>
            <p>
              GOOD THINGS
              <br />
              START WITH A CONVERSATION.
            </p>
            <button
              type="button"
              className="contact-video-control"
              onClick={toggleContactVideo}
              aria-label={
                videoPaused ? "Play contact video" : "Pause contact video"
              }
            >
              {videoPaused ? "▷" : "Ⅱ"}
            </button>
          </div>
          <div className="contact-form">
            <span className="mono">WORK WITH US</span>
            <Dialog.Title>
              What are you
              <br />
              thinking?
            </Dialog.Title>
            <Dialog.Description>
              A first idea. A full brief. An extra set of hands.
              <br />
              We’re here for all of it.
            </Dialog.Description>
            {status === "sent" ? (
              <div className="form-success" role="status">
                <span className="success-mark">↗</span>
                <h3>You’re on our radar.</h3>
                <p>
                  Your message has been sent. Thanks for bringing us into the
                  conversation.
                </p>
                <button
                  className="text-button"
                  onClick={() => onOpenChange(false)}
                >
                  BACK TO THE EXPERIENCE <Arrow />
                </button>
              </div>
            ) : (
              <form onSubmit={submit} method="post" action="/api/inquiry">
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
                    rows={3}
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
                <button
                  className="button submit-button"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? "SENDING…" : "LET’S TALK"}
                  <Arrow diagonal />
                </button>
                <a className="contact-email" href="mailto:nick@immrsv-exp.com">
                  nick@immrsv-exp.com
                </a>
              </form>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
