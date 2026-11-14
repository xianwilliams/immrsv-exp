"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { projectGalleries } from "@/lib/project-galleries";

const heroImages = [
  projectGalleries.wcdonalds[1],
  projectGalleries["nascar-billboard"][0],
  projectGalleries.starry[0],
  projectGalleries.crumbl[0],
  projectGalleries.stones[0],
  projectGalleries.tictac[0],
  projectGalleries.keebler[0],
];

export function HeroCarousel({ paused }: { paused: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(root.current!);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      className="hero-film"
      ref={root}
      aria-label="Selected IMMRSV project photography"
    >
      <div
        className="hero-photo-track"
        style={{
          animationPlayState: paused || !visible ? "paused" : "running",
        }}
      >
        {[0, 1].map((copy) => (
          <div
            className="hero-photo-group"
            key={copy}
            aria-hidden={copy === 1 || undefined}
          >
            {heroImages.map((image, i) => (
              <div
                className="hero-photo"
                key={image.src}
                style={
                  {
                    "--photo-aspect": `${image.width}/${image.height}`,
                  } as CSSProperties
                }
              >
                <img
                  src={image.src}
                  alt={copy ? "" : image.alt}
                  width={image.width}
                  height={image.height}
                  loading="eager"
                  fetchPriority={i === 0 && copy === 0 ? "high" : "auto"}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
