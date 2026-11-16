"use client";

import PixelBlast from "./PixelBlast";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, type Project } from "@/lib/content";
import { projectCoverPositions } from "@/lib/project-galleries";
import "./project-gallery.css";

gsap.registerPlugin(ScrollTrigger);

export function ProjectGallery({
  onOpen,
}: {
  onOpen: (project: Project) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const revealRef = useRef<() => void>(() => {});
  useEffect(() => {
    const section = sectionRef.current!;
    const media = gsap.matchMedia();
    media.add(
      "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
      () => {
        let cancelled = false;
        let ribbon:
          | ReturnType<
              typeof import("@/lib/project-ribbon").createProjectRibbon
            >
          | undefined;
        let trigger: ScrollTrigger | undefined;
        const layoutObserver = new ResizeObserver(() =>
          ScrollTrigger.refresh(),
        );
        if (section.previousElementSibling)
          layoutObserver.observe(section.previousElementSibling);
        section.dataset.enhanced = "true";
        const grid = section.querySelector<HTMLElement>(".work-grid")!;
        grid.inert = true;
        const load = async () => {
          observer.disconnect();
          try {
            const { createProjectRibbon } =
              await import("@/lib/project-ribbon");
            if (cancelled) return;
            ribbon = createProjectRibbon(section, projects, onOpen);
            trigger = ScrollTrigger.create({
              trigger: section,
              start: "top 75%",
              end: "bottom bottom",
              onUpdate: (self) => ribbon?.setProgress(self.progress),
              onRefresh: (self) => ribbon?.setProgress(self.progress, true),
            });
            ribbon.setProgress(trigger.progress, true);
            revealRef.current = () => {
              window.scrollTo({
                top: trigger!.start + (trigger!.end - trigger!.start) * 0.91,
                behavior: "instant",
              });
              trigger!.update();
              ribbon!.setProgress(0.91, true);
            };
          } catch {
            // A working HTML portfolio remains available when WebGL is unavailable.
            ribbon?.dispose();
            grid.inert = false;
            delete section.dataset.enhanced;
            ScrollTrigger.refresh();
          }
        };
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) void load();
          },
          { rootMargin: "1600px" },
        );
        observer.observe(section);
        return () => {
          cancelled = true;
          observer.disconnect();
          layoutObserver.disconnect();
          trigger?.kill();
          ribbon?.dispose();
          grid.inert = false;
          revealRef.current = () => {};
          delete section.dataset.enhanced;
        };
      },
    );
    return () => media.revert();
  }, [onOpen]);

  function revealWork() {
    revealRef.current();
    requestAnimationFrame(() =>
      sectionRef.current
        ?.querySelector<HTMLButtonElement>(".work-card")
        ?.focus({ preventScroll: true }),
    );
  }

  return (
    <section
      className="work"
      id="work"
      aria-labelledby="work-title"
      ref={sectionRef}
    >
      <div className="work-stage">
        <div className="work-pixels" aria-hidden="true">
          <PixelBlast
            color="#777777"
            accentColor="#777777"
            pixelSize={3}
            patternDensity={0.9}
            speed={0.2}
            drift={0.15}
            glow={0.15}
            twinkle={0.1}
            edgeFade={0.2}
            enableRipples={false}
            hoverEffect="none"
            dpr={1}
          />
        </div>
        <h2 className="work-title" id="work-title">
          <span className="building">
            <span>BUILDING</span>
          </span>
          <span className="experiences">
            <span>EXPERIENCES</span>
          </span>
        </h2>
        <p className="work-intro-note mono">
          THINGS YOU CAN STEP INTO.
          <br />
          MOMENTS YOU TAKE WITH YOU.
        </p>
        <div className="work-caption mono">
          <span>SELECTED EXPERIENCES</span>
          <span>IDEAS, OUT IN THE WORLD.</span>
        </div>
        <canvas className="work-canvas" aria-hidden="true" />
        <button className="work-view-button text-button" onClick={revealWork}>
          EXPLORE SELECTED WORK <span aria-hidden="true">↓</span>
        </button>
        <div className="work-grid">
          {projects.map((project) => (
            <button
              className="work-card"
              key={project.id}
              onClick={() => onOpen(project)}
            >
              <div className="work-card-image">
                <img
                  src={project.image}
                  alt={`${project.client}: ${project.category}`}
                  width={800}
                  height={503}
                  loading="lazy"
                  style={{ objectPosition: projectCoverPositions[project.id] }}
                />
                <span className="work-card-open" aria-hidden="true">
                  ↗
                </span>
              </div>
              <div className="work-card-label">
                <span>{project.client}</span>
                <span>{project.category}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
