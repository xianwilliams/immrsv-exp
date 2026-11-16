"use client";
import { TypedHeading } from "./typed-heading";

import { useEffect, useRef, useState } from "react";
import { projectBannerImages } from "@/lib/project-previews";
import { Arrow } from "./site-ui";
import "./project-banner.css";

export function ProjectBanner({
  onContact,
  home = false,
}: {
  onContact: () => void;
  home?: boolean;
}) {
  const root = useRef<HTMLElement>(null);
  const photos = useRef<(HTMLImageElement | null)[]>([]);
  const [active, setActive] = useState(0);
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
    if (!playing || !visible || !pageVisible || focused) return;
    const timer = setInterval(() => {
      setActive((current) => {
        const next = (current + 1) % projectBannerImages.length;
        const photo = photos.current[next];
        return photo?.complete && photo.naturalWidth > 0 ? next : current;
      });
    }, 5500);
    return () => clearInterval(timer);
  }, [playing, visible, pageVisible, focused]);

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
        {projectBannerImages.map(({ project, image, position }, index) => (
          <img
            key={project}
            ref={(element) => {
              photos.current[index] = element;
            }}
            data-project={project}
            className={index === active ? "is-active" : ""}
            src={image.src}
            alt=""
            width={image.width}
            height={image.height}
            style={{ objectPosition: position }}
            loading="lazy"
          />
        ))}
      </div>
      <div className="case-contact-content">
        <p className="mono">
          {home
            ? "FROM A QUICK GUT CHECK TO THE WHOLE THING."
            : "YOUR TEAM, EXTENDED."}
        </p>
        <h2 id="case-contact-title">
          <TypedHeading>
            {home ? "LET’S MAKE" : "YOUR NEXT IDEA."}
            <br />
            <em>{home ? "SOMETHING HAPPEN." : "OUT IN THE WORLD."}</em>
          </TypedHeading>
        </h2>
        <p>
          A few days of support or the whole production.
          <br />
          Bring us in wherever your team needs us.
        </p>
        <button className="button" onClick={onContact}>
          WORK WITH US <Arrow diagonal />
        </button>
      </div>
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
    </section>
  );
}
