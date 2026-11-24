"use client";

import { useEffect, useRef, useState } from "react";
import { heroSlides } from "@/lib/hero-slides";
import { Brand } from "./site-ui";

export function ContactSlideshow() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const images = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => setPlaying(!motion.matches);
    applyMotion();
    motion.addEventListener("change", applyMotion);
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(root.current!);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", applyMotion);
    };
  }, []);

  useEffect(() => {
    if (!playing || !visible) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      setActive((current) => {
        const next = (current + 1) % heroSlides.length;
        const image = images.current[next];
        return image?.complete && image.naturalWidth > 0 ? next : current;
      });
    }, 5500);
    return () => clearInterval(timer);
  }, [playing, visible]);

  return (
    <div className="contact-visual" ref={root}>
      {heroSlides.map(({ project, image }, index) => (
        <img
          key={project.id}
          ref={(node) => {
            images.current[index] = node;
          }}
          className={index === active ? "is-active" : ""}
          src={image.src}
          alt=""
          aria-hidden="true"
          width={image.width}
          height={image.height}
          loading="lazy"
          style={{ objectPosition: image.position }}
        />
      ))}
      <div className="contact-logo" aria-hidden="true">
        <Brand />
      </div>
      <button
        className="contact-slideshow-toggle"
        aria-label={
          playing ? "Pause contact slideshow" : "Play contact slideshow"
        }
        onClick={() => setPlaying((value) => !value)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path
            d={playing ? "M7 5h3v14H7zM14 5h3v14h-3z" : "m8 5 11 7-11 7z"}
          />
        </svg>
      </button>
    </div>
  );
}
