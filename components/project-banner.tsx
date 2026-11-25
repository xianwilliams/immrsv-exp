"use client";
import { TypedHeading } from "./typed-heading";

import { useEffect, useRef, useState } from "react";
import type { FeaturedSlide, SiteSettings } from "@/lib/cms/types";
import { contentLines } from "./content-lines";
import { Arrow } from "./site-ui";
import "./project-banner.css";

export function ProjectBanner({
  onContact,
  settings,
  slides,
}: {
  onContact: () => void;
  settings: SiteSettings;
  slides: FeaturedSlide[];
}) {
  const root = useRef<HTMLElement>(null);
  const photos = useRef<(HTMLImageElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const currentIndex = slides.length ? active % slides.length : 0;
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => setPlaying(!reduced.matches);
    const applyVisibility = () => setPageVisible(!document.hidden);
    applyMotion();
    applyVisibility();
    reduced.addEventListener("change", applyMotion);
    document.addEventListener("visibilitychange", applyVisibility);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(root.current!);
    return () => {
      reduced.removeEventListener("change", applyMotion);
      document.removeEventListener("visibilitychange", applyVisibility);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!playing || !visible || !pageVisible || focused || slides.length < 2)
      return;
    const timer = setInterval(() => {
      setActive((current) => {
        const next = (current + 1) % slides.length;
        const photo = photos.current[next];
        return photo?.complete && photo.naturalWidth > 0 ? next : current;
      });
    }, 5500);
    return () => clearInterval(timer);
  }, [playing, visible, pageVisible, focused, slides.length]);

  return (
    <section
      ref={root}
      className="case-contact"
      aria-labelledby="case-contact-title"
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div className="case-contact-photos" aria-hidden="true">
        {slides.map(({ project, image }, index) => (
          <img
            key={project.id}
            ref={(element) => {
              photos.current[index] = element;
            }}
            data-project={project.id}
            className={index === currentIndex ? "is-active" : ""}
            src={image.src}
            alt=""
            width={image.width}
            height={image.height}
            style={{ objectPosition: image.position }}
            loading="lazy"
          />
        ))}
      </div>
      <div className="case-contact-content">
        {settings.banner.eyebrow && (
          <p className="mono">{settings.banner.eyebrow}</p>
        )}
        <h2 id="case-contact-title">
          <TypedHeading>
            {contentLines(settings.banner.title)}
            {settings.banner.emphasis && (
              <>
                <br />
                <em>{contentLines(settings.banner.emphasis)}</em>
              </>
            )}
          </TypedHeading>
        </h2>
        <p>{contentLines(settings.banner.description)}</p>
        <button className="button" onClick={onContact}>
          {settings.contactButton} <Arrow diagonal />
        </button>
      </div>
      {slides.length > 1 && (
        <button
          className="case-contact-play mono"
          aria-label={
            playing ? "Pause banner slideshow" : "Play banner slideshow"
          }
          aria-pressed={playing}
          onClick={() => {
            setPlaying((value) => !value);
            setFocused(false);
          }}
        >
          <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span>
          {playing ? "PAUSE" : "PLAY"}
        </button>
      )}
    </section>
  );
}
