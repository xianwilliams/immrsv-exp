"use client";
import { useEffect, useRef, useState } from "react";
import type { FeaturedSlide } from "@/lib/cms/types";
export function HeroCarousel({
  paused,
  slides,
}: {
  paused: boolean;
  slides: FeaturedSlide[];
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(true);
  const images = useRef<(HTMLImageElement | null)[]>([]);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPlaying(!media.matches);
    apply();
    media.addEventListener("change", apply);
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", apply);
    };
  }, []);
  useEffect(() => {
    if (!playing || paused || !visible || slides.length < 2) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      setActive((current) => {
        const next = (current + 1) % slides.length;
        return images.current[next]?.complete &&
          images.current[next]!.naturalWidth > 0
          ? next
          : current;
      });
    }, 5500);
    return () => clearInterval(timer);
  }, [playing, paused, visible, slides.length]);
  if (!slides.length) return null;
  const currentIndex = active % slides.length;
  const current = slides[currentIndex];
  return (
    <div
      className="hero-slideshow"
      ref={root}
      aria-roledescription="carousel"
      aria-label="Approved project highlights"
    >
      <div className="hero-slideshow-frame">
        {slides.map(({ image, project }, index) => (
          <img
            key={project.id}
            ref={(node) => {
              images.current[index] = node;
            }}
            src={image.src}
            alt={index === currentIndex ? image.alt : ""}
            aria-hidden={index !== currentIndex}
            className={index === currentIndex ? "active" : ""}
            width={image.width}
            height={image.height}
            style={{ objectPosition: image.position }}
            fetchPriority={index === 0 ? "high" : "auto"}
            loading={index < 2 ? "eager" : "lazy"}
          />
        ))}
      </div>
      {current && (
        <div className="hero-slideshow-footer mono">
          <p aria-live={playing ? "off" : "polite"}>
            <span>
              {String(currentIndex + 1).padStart(2, "0")} /{" "}
              {String(slides.length).padStart(2, "0")}
            </span>
            {current.project.client} — {current.project.title}
          </p>
          {slides.length > 1 && (
            <div className="hero-slideshow-controls">
              <button
                aria-label="Previous featured project"
                onClick={() => {
                  setPlaying(false);
                  setActive((i) => (i - 1 + slides.length) % slides.length);
                }}
              >
                ←
              </button>
              <button
                aria-label={
                  playing ? "Pause featured projects" : "Play featured projects"
                }
                onClick={() => setPlaying((value) => !value)}
              >
                {playing ? "PAUSE" : "PLAY"}
              </button>
              <button
                aria-label="Next featured project"
                onClick={() => {
                  setPlaying(false);
                  setActive((i) => (i + 1) % slides.length);
                }}
              >
                →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
