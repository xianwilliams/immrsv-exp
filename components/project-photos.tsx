"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectImage } from "@/lib/project-galleries";
import { AccordionGallery } from "./accordion-gallery";
import { ImageViewer } from "./image-viewer";
import "./project-photos.css";

export function ProjectPhotos({
  images,
  client,
}: {
  images: ProjectImage[];
  client: string;
}) {
  const [active, setActive] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPlaying(!media.matches);
    apply();
    media.addEventListener("change", apply);
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (root.current) observer.observe(root.current);
    return () => {
      media.removeEventListener("change", apply);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (
      !playing ||
      hovered ||
      focused ||
      !visible ||
      viewer !== null ||
      images.length < 2
    )
      return;
    const timer = setInterval(() => {
      if (!document.hidden) setActive((i) => (i + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [playing, hovered, focused, visible, viewer, images.length]);
  function open(index: number) {
    opener.current = document.activeElement as HTMLElement;
    setActive(index);
    setViewer(index);
  }
  if (!images.length) return null;
  const current = Math.min(active, images.length - 1);
  return (
    <div
      className={`project-photos${images.every((image) => image.height > image.width) ? " project-photos--portrait" : ""}`}
      ref={root}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <AccordionGallery
        images={images}
        active={current}
        onActiveChange={setActive}
        onSelect={open}
        adaptToImage
      />
      <div className="project-photo-caption">
        <span className="mono">
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(images.length).padStart(2, "0")}
        </span>
        <p aria-live={playing ? "off" : "polite"}>{images[current].caption}</p>
        {images.length > 1 && (
          <div className="accordion-controls">
            <button
              aria-label="Previous accordion image"
              onClick={() => {
                setPlaying(false);
                setActive((i) => (i - 1 + images.length) % images.length);
              }}
            >
              ←
            </button>
            <button
              aria-label={
                playing ? "Pause project slideshow" : "Play project slideshow"
              }
              aria-pressed={playing}
              onClick={() => {
                if (!playing) {
                  setHovered(false);
                  setFocused(false);
                }
                setPlaying((value) => !value);
              }}
            >
              {playing ? "Ⅱ" : "▷"}
            </button>
            <button
              aria-label="Next accordion image"
              onClick={() => {
                setPlaying(false);
                setActive((i) => (i + 1) % images.length);
              }}
            >
              →
            </button>
          </div>
        )}
      </div>
      <ImageViewer
        images={images}
        index={viewer}
        client={client}
        onChange={(index) => {
          setViewer(index);
          setActive(index);
        }}
        onClose={() => setViewer(null)}
        onRestoreFocus={(event) => {
          event.preventDefault();
          opener.current?.focus({ preventScroll: true });
        }}
      />
    </div>
  );
}
