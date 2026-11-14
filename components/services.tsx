"use client";

import { useEffect, useRef, useState } from "react";
import { services } from "@/lib/content";
import { AccordionGallery } from "./accordion-gallery";
import { Arrow } from "./site-ui";
import "./services.css";

const images = services.map((service) => ({
  src: service.image,
  alt: service.alt,
  width: service.width,
  height: service.height,
  caption: service.title,
}));
const labels = services.map((service) => service.title);
function ServiceIcon({ index }: { index: number }) {
  const paths = [
    "M5 3h14v18H5z M8 7l1 1 2-2 M13 7h3 M8 12l1 1 2-2 M13 12h3 M8 17h8",
    "M3 5h11v12H3z M14 9h4l3 4v4h-7 M5 17v3h4v-3 M16 17v3h4v-3",
    "M9 18h6 M9 21h6 M9 15c0-3-4-3-4-7a7 7 0 0 1 14 0c0 4-4 4-4 7 M12 11v4",
    "M8 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6 M16 4a3 3 0 0 1 0 6 M2 21v-5a6 6 0 0 1 12 0v5 M17 13a5 5 0 0 1 5 5v3",
    "M3 21 14 10 M11 5l5-3 6 6-3 5-8-8z M3 3l4 1 2 4-3 3-4-4z M13 14l7 7 2-2-7-7",
    "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z",
  ];
  return (
    <svg
      className="service-icon"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d={paths[index]}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
const icons = services.map((_, index) => (
  <ServiceIcon key={index} index={index} />
));

export function Services({ onContact }: { onContact: () => void }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const root = useRef<HTMLElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const clock = useRef<Animation | null>(null);
  const running = playing && visible && !hovered && !focused && pageVisible;
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setPlaying(!reduced.matches);
    const visibility = () => setPageVisible(!document.hidden);
    motion();
    visibility();
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(root.current!);
    reduced.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", motion);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    const animation = progress.current!.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: 6000, fill: "forwards", easing: "linear" },
    );
    animation.pause();
    animation.onfinish = () =>
      setActive((index) => (index + 1) % services.length);
    clock.current = animation;
    return () => {
      animation.cancel();
    };
  }, [active]);
  useEffect(() => {
    if (running) clock.current?.play();
    else clock.current?.pause();
  }, [running, active]);
  const service = services[active];
  return (
    <section
      className="services"
      id="services"
      aria-labelledby="services-title"
      ref={root}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div className="services-heading" data-reveal>
        <span className="mono">HOW WE CAN HELP</span>
        <h2 id="services-title">
          BUILT AROUND
          <br />
          WHAT YOUR
          <br />
          <em>PROJECT NEEDS.</em>
        </h2>
        <p>
          One production lead. A few extra hands. The whole experience.
          <br />
          Explore where we can fit into your team.
        </p>
      </div>
      <div
        className="service-accordion"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <AccordionGallery
          images={images}
          labels={labels}
          icons={icons}
          progress={
            <span className="service-progress" aria-hidden="true">
              <span ref={progress} />
            </span>
          }
          active={active}
          onActiveChange={setActive}
          onSelect={setActive}
        />
      </div>
      <div className="service-selection" aria-live={running ? "off" : "polite"}>
        <div className="service-selection-heading">
          <div className="service-playback">
            <span className="mono">
              {String(active + 1).padStart(2, "0")} / 06
            </span>
            <button
              className="service-play-button"
              aria-label={
                playing ? "Pause services slideshow" : "Play services slideshow"
              }
              aria-pressed={playing}
              onClick={() => {
                setPlaying(!playing);
                setFocused(false);
              }}
            >
              {playing ? "PAUSE Ⅱ" : "PLAY ▷"}
            </button>
          </div>
          <h3 key={active}>
            {service.title}{" "}
            <span className="service-divider" aria-hidden="true">
              |
            </span>{" "}
            <ServiceIcon index={active} />
          </h3>
        </div>
        <div className="service-guide">
          <div>
            <span className="mono">WHEN TO CALL</span>
            <p>{service.when}</p>
          </div>
          <div>
            <span className="mono">WHAT WE HANDLE</span>
            <p>{service.text}</p>
            <ul>
              {service.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <button className="text-button" onClick={onContact}>
          WORK WITH US <Arrow diagonal />
        </button>
      </div>
    </section>
  );
}
