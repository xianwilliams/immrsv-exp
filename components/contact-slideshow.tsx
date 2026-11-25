"use client";

import { useEffect, useRef, useState } from "react";
import type { FeaturedSlide } from "@/lib/cms/types";
import { Brand } from "./site-ui";

export function ContactSlideshow({ slides }: { slides: FeaturedSlide[] }) {
  const [active, setActive] = useState(0);
  const currentIndex = slides.length ? active % slides.length : 0;
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
    if (!playing || !visible || slides.length < 2) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      setActive((current) => {
        const next = (current + 1) % slides.length;
        const image = images.current[next];
        return image?.complete && image.naturalWidth > 0 ? next : current;
      });
    }, 5500);
    return () => clearInterval(timer);
  }, [playing, visible, slides.length]);

  return (
    <div className="contact-visual" ref={root}>
      {slides.map(({ project, image }, index) => (
        <img
          key={project.id}
          ref={(node) => {
            images.current[index] = node;
          }}
          className={index === currentIndex ? "is-active" : ""}
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
      {slides.length > 1 && (
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
      )}
    </div>
  );
}
