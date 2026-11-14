"use client";

// Adapted from the React Bits AccordionGallery source supplied with the brief.
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import type { ProjectImage } from "@/lib/project-galleries";
import "./accordion-gallery.css";

export function AccordionGallery({
  images,
  active,
  onActiveChange,
  onSelect,
  labels,
  icons,
  progress,
  adaptToImage = false,
}: {
  images: ProjectImage[];
  active: number;
  onActiveChange: (index: number) => void;
  onSelect: (index: number) => void;
  labels?: string[];
  icons?: ReactNode[];
  progress?: ReactNode;
  adaptToImage?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);
  useEffect(() => {
    const element = root.current!;
    const panels = [
      ...element.querySelectorAll<HTMLButtonElement>(".ag-panel"),
    ];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timeline: gsap.core.Timeline;
    const layout = () => {
      const vertical = window.matchMedia("(max-width: 599px)").matches;
      const total = vertical ? element.clientHeight : element.clientWidth;
      const usable = Math.max(total - 8 * (images.length - 1), 120);
      const imageAspect = images[active].width / images[active].height;
      const desiredSize = vertical
        ? element.clientWidth / imageAspect
        : element.clientHeight * imageAspect;
      const ratio = adaptToImage
        ? Math.min(
            vertical ? 0.76 : 0.72,
            Math.max(vertical ? 0.55 : 0.36, desiredSize / usable),
          )
        : vertical
          ? 0.58
          : 0.64;
      element.style.setProperty("--ag-media-size", `${usable * ratio}px`);
      timeline?.kill();
      timeline = gsap.timeline();
      const duration = firstRun.current || reduced.matches ? 0 : 0.65;
      panels.forEach((panel, i) => {
        const selected = i === active;
        const media = panel.querySelector(".ag-panel__media");
        const label = panel.querySelector(".ag-panel__label");
        const rotation = selected ? 0 : i < active ? 8 : -8;
        timeline.to(
          panel,
          {
            flexGrow: selected
              ? (ratio * (images.length - 1)) / (1 - ratio)
              : 1,
            rotateY: vertical ? 0 : rotation,
            duration,
            ease: "power3.out",
          },
          0,
        );
        const drift =
          Math.max(-1.5, Math.min(1.5, active - i)) *
          0.5 *
          usable *
          ratio *
          0.06;
        timeline.to(
          media,
          {
            xPercent: -50,
            yPercent: -50,
            x: adaptToImage || vertical || selected ? 0 : drift,
            y: !adaptToImage && vertical && !selected ? drift : 0,
            filter: selected ? "grayscale(0)" : "grayscale(1)",
            duration,
            ease: "power3.out",
          },
          0,
        );
        timeline.to(
          label,
          {
            opacity: selected ? 1 : 0,
            x: selected ? 0 : -14,
            duration,
            ease: "power3.out",
          },
          0,
        );
      });
      firstRun.current = false;
    };
    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(element);
    reduced.addEventListener("change", layout);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", layout);
      timeline?.kill();
    };
  }, [active, images, adaptToImage]);
  return (
    <div
      ref={root}
      className="accordion-gallery"
      role="group"
      aria-label={
        labels ? "Explore IMMRSV services" : "Project image accordion"
      }
    >
      {images.map((image, i) => (
        <button
          key={image.src}
          className={`ag-panel${i === active ? " ag-panel--active" : ""}`}
          aria-label={
            labels
              ? `Explore service: ${labels[i]}`
              : `Enlarge image ${i + 1}: ${image.caption}`
          }
          aria-current={i === active ? "true" : undefined}
          onMouseEnter={() => onActiveChange(i)}
          onFocus={() => onActiveChange(i)}
          onClick={() => onSelect(i)}
          onKeyDown={(event) => {
            if (
              ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(
                event.key,
              )
            ) {
              event.preventDefault();
              const next =
                (i +
                  (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) +
                  images.length) %
                images.length;
              onActiveChange(next);
              root.current
                ?.querySelectorAll<HTMLButtonElement>(".ag-panel")
                [next]?.focus({ preventScroll: true });
            }
          }}
        >
          <span className="ag-panel__frame">
            <span className="ag-panel__media">
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                style={{
                  objectPosition: image.position,
                  transform: image.previewScale
                    ? `scale(${image.previewScale})`
                    : undefined,
                }}
                draggable={false}
              />
            </span>
            <span className="ag-panel__overlay" />
          </span>
          <span className="ag-panel__label" aria-hidden="true">
            {!labels && <span className="ag-panel__bar" />}
            <span>
              {labels ? (
                <span className="service-label">
                  {labels[i]} <span className="service-divider">|</span>{" "}
                  {icons?.[i]}
                </span>
              ) : (
                <>
                  {String(i + 1).padStart(2, "0")}{" "}
                  <span className="ag-enlarge">↗</span>
                </>
              )}
            </span>
          </span>
          {labels && (
            <span className="ag-service-name" aria-hidden="true">
              {labels[i]} <span className="service-divider">|</span>{" "}
              {icons?.[i]}
            </span>
          )}
          {i === active && progress}
        </button>
      ))}
    </div>
  );
}
