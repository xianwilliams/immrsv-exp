"use client";
import { TypedHeading } from "./typed-heading";
import { SiteFooter } from "./site-footer";
import PixelBlast from "./PixelBlast";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ContactSection } from "./contact-section";
import { Arrow, Brand, Close } from "./site-ui";
import Link from "next/link";
import { ProjectGallery } from "./project-gallery";
import { ProjectPhotos } from "./project-photos";
import { HeroCarousel } from "./hero-carousel";
import { Services } from "./services";
import { ThemeToggle } from "./theme-toggle";
import { projectPreviews } from "@/lib/project-previews";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type Project } from "@/lib/content";
import "./home-revision.css";

gsap.registerPlugin(ScrollTrigger);

function ProjectDialog({
  project,
  onClose,
  onContact,
  onRestoreFocus,
}: {
  project: Project | null;
  onClose: () => void;
  onContact: () => void;
  onRestoreFocus: (event: Event) => void;
}) {
  return (
    <Dialog.Root
      open={!!project}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="project-dialog"
          onCloseAutoFocus={onRestoreFocus}
        >
          <Close />
          {project && (
            <>
              {projectPreviews[project.id]?.length ? (
                <ProjectPhotos
                  key={project.id}
                  images={projectPreviews[project.id]}
                  client={project.client}
                />
              ) : (
                <div className="project-detail-type">
                  <span>{project.client}</span>
                  <p>{project.category}</p>
                </div>
              )}
              <div className="project-detail-body">
                <span className="mono">
                  {project.client} / {project.category}
                </span>
                <Dialog.Title>{project.title}</Dialog.Title>
                <Dialog.Description>{project.description}</Dialog.Description>
                {project.roles.length > 0 && (
                  <div className="project-roles">
                    <span className="mono">OUR INVOLVEMENT</span>
                    <ul>
                      {project.roles.map((role) => (
                        <li key={role}>{role}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {project.credit && (
                  <p className="project-credit">{project.credit}</p>
                )}
                <div className="project-actions">
                  <Link className="text-button" href={`/work/${project.id}`}>
                    EXPLORE THE FULL PROJECT <Arrow diagonal />
                  </Link>
                  <button
                    className="button"
                    onClick={() => {
                      onClose();
                      onContact();
                    }}
                  >
                    WORK WITH US
                    <Arrow diagonal />
                  </button>
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ClientMarks() {
  const [active, setActive] = useState<string | null>(null);
  const clients = [
    [
      "starry.svg",
      "Starry",
      "starry",
      "Starry NBA All-Star Branding & Operations",
    ],
    ["crumbl.svg", "Crumbl", "crumbl", "Crumbl HQ Build Out & Branding"],
    ["pandora.svg", "Pandora", "pandora-las-vegas", "Pandora Las Vegas Launch"],
    [
      "brandless.png",
      "Brandless",
      "brandless-summit",
      "Brandless Consumer Summit",
    ],
    [
      "maison-margiela.svg",
      "Maison Margiela",
      "maison-margiela",
      "Maison Margiela REPLICA Summer Experience",
    ],
    [
      "comfort-cases.png",
      "Comfort Cases",
      "comfort-cases",
      "Comfort Cases × Lisa Barlow",
    ],
  ];
  return (
    <div className="client-marks">
      {clients.map(([file, name, project, title], index) => (
        <div
          className={`client-mark ${active === file ? "is-previewing" : ""}`}
          key={file}
          data-brand={project}
          onMouseEnter={() => setActive(file)}
          onMouseLeave={() => setActive(null)}
          onFocus={() => setActive(file)}
          onBlur={() => setActive(null)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setActive(null);
          }}
        >
          <Link
            href={"/work/" + project}
            className="client-logo-button"
            aria-label={name + ": " + title}
            aria-controls={`brand-preview-${index}`}
          >
            <img
              className="client-logo-mono"
              src={`/media/brands/${file === "comfort-cases.png" ? "comfort-cases-white.png" : file}`}
              alt=""
              width={200}
              height={100}
              loading="lazy"
            />
            <img
              className="client-logo-color"
              src={`/media/brands/${file}`}
              alt=""
              width={200}
              height={100}
              loading="lazy"
            />
          </Link>
          <div
            className="client-event-preview"
            id={`brand-preview-${index}`}
            aria-hidden={active !== file}
          >
            <img
              src={projectPreviews[project][0].src}
              alt=""
              width={320}
              height={320}
              loading="lazy"
              style={{ objectPosition: projectPreviews[project][0].position }}
            />
            <p>{title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Experience() {
  const root = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const dialogOpener = useRef<HTMLElement | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let seen = false;
        try {
          seen = !!sessionStorage.getItem("immrsv-intro");
        } catch {}
        if (!seen && !window.location.hash) {
          const target = root
            .current!.querySelector(".header-brand")!
            .getBoundingClientRect();
          gsap.set(intro.current, { display: "grid", autoAlpha: 1 });
          gsap
            .timeline({
              onComplete: () => {
                try {
                  sessionStorage.setItem("immrsv-intro", "seen");
                } catch {}
                gsap.set(intro.current, { display: "none" });
              },
            })
            .fromTo(
              ".intro-mark",
              { autoAlpha: 0, scale: 0.96 },
              { autoAlpha: 1, scale: 1, duration: 0.35, force3D: false },
            )
            .to(
              ".intro-mark",
              {
                x: target.left + target.width / 2 - innerWidth / 2,
                y: target.top + target.height / 2 - innerHeight / 2,
                width: target.width,
                duration: 0.8,
                ease: "power3.inOut",
                force3D: false,
              },
              0.6,
            )
            .to(intro.current, { autoAlpha: 0, duration: 0.3 }, 1.35);
        }
        ScrollTrigger.create({
          trigger: ".hero",
          start: "top top",
          end: () =>
            "+=" +
            root.current!.querySelector<HTMLElement>(".hero")!.offsetHeight,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          gsap.from(element, {
            y: 24,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 94%", once: true },
          });
        });
        gsap.from(".client-mark", {
          y: 20,
          opacity: 0,
          stagger: 0.06,
          duration: 0.65,
          scrollTrigger: {
            trigger: ".client-marks",
            start: "top 90%",
            once: true,
          },
        });
      });
      return () => mm.revert();
    }, root);
    // Restore a case-study anchor after the hero pin and local fonts settle.
    // ScrollTrigger's initial refresh can otherwise reset the browser's jump.
    let cancelled = false;
    let anchorFrame = 0;
    const initialHash = window.location.hash;
    if (initialHash) {
      void document.fonts.ready.then(() => {
        if (cancelled) return;
        anchorFrame = requestAnimationFrame(() => {
          if (window.location.hash !== initialHash) return;
          const target = document.getElementById(initialHash.slice(1));
          if (!target || !root.current?.contains(target)) return;
          ScrollTrigger.refresh();
          target.scrollIntoView({ behavior: "instant", block: "start" });
          if (initialHash === "#contact") {
            target
              .querySelector<HTMLInputElement>('input[name="name"]')
              ?.focus({ preventScroll: true });
          }
        });
      });
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(anchorFrame);
      ctx.revert();
    };
  }, []);

  function openContact() {
    setSelectedProject(null);
    requestAnimationFrame(() => {
      document.getElementById("contact")?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
      document
        .querySelector<HTMLInputElement>('#contact input[name="name"]')
        ?.focus({ preventScroll: true });
    });
  }
  const openProject = useCallback((project: Project) => {
    dialogOpener.current = document.activeElement as HTMLElement;
    setSelectedProject(project);
  }, []);

  return (
    <div ref={root} className="home-revision">
      <a className="skip-link" href="#about">
        Skip to content
      </a>
      <div ref={intro} className="intro" aria-hidden="true">
        <div className="intro-mark block-brand">
          <Brand />
        </div>
      </div>
      <header className="hero" id="home">
        <nav className="hero-nav" aria-label="Main navigation">
          <a
            href="#home"
            className="header-brand block-brand"
            aria-label="IMMRSV home"
          >
            <Brand />
          </a>
          <div className="nav-links">
            <a href="#about">ABOUT</a>
            <a href="#services">SERVICES</a>
            <a href="#clients">CLIENTS</a>
            <a href="#work">WORK</a>
          </div>
          <div className="nav-actions">
            <ThemeToggle />
            <a className="button nav-cta" href="#contact">
              <span>WORK WITH US</span>
              <Arrow diagonal />
            </a>
          </div>
          <button
            className="mobile-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            {menuOpen ? "CLOSE" : "MENU"}
          </button>
        </nav>
        {menuOpen && (
          <nav className="mobile-menu" aria-label="Mobile navigation">
            {[
              ["ABOUT", "#about"],
              ["SERVICES", "#services"],
              ["CLIENTS", "#clients"],
              ["WORK", "#work"],
              ["CONTACT", "#contact"],
            ].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>
                {label}
                <Arrow diagonal />
              </a>
            ))}
          </nav>
        )}
        <h1 className="sr-only">
          IMMRSV. Independent experiential production.
        </h1>
        <HeroCarousel paused={!!selectedProject} />
      </header>
      <main className="home-content">
        <section className="about" id="about" aria-labelledby="about-title">
          <div className="about-layout" data-reveal>
            <h2 id="about-title">
              <TypedHeading>
                YOUR PROJECT.
                <br />
                <em>THE RIGHT SUPPORT.</em>
              </TypedHeading>
            </h2>
            <figure className="about-photos">
              <div className="about-people">
                <img
                  src="/media/people/installation.jpg"
                  alt="The team at an outdoor mirrored installation"
                  width={1094}
                  height={1375}
                  loading="lazy"
                />
                <img
                  src="/media/people/prop-build.png"
                  alt="Oversized sculptural props taking shape in the workshop"
                  width={1218}
                  height={1180}
                  loading="lazy"
                />
                <img
                  src="/media/people/workshop.png"
                  alt="The team beside a colorful octopus sculpture during fabrication"
                  width={1206}
                  height={1108}
                  loading="lazy"
                />
              </div>
              <figcaption className="mono">
                BIG IDEAS. REAL-WORLD EXPERIENCES.
              </figcaption>
            </figure>
            <div className="about-copy">
              <p>
                IMMRSV is an independent experiential production partner based
                in Salt Lake City and working around the world. One production
                lead, a short planning sprint, or a full team—we fit around your
                project.
              </p>
              <p>
                Led by Nick Wirsching, we work alongside agencies, brand teams,
                and creative partners, bringing the people and resources needed
                for one part of a project or the whole production.
              </p>
            </div>
          </div>
        </section>
        <Services />
        <section className="trust" id="clients" aria-labelledby="trust-title">
          <div className="trust-pixels" aria-hidden="true">
            <PixelBlast
              color="#888888"
              accentColor="#888888"
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
          <div className="trust-proof">
            <h2 id="trust-title" data-reveal>
              WHO WE’VE <em>WORKED WITH.</em>
            </h2>
            <ClientMarks />
          </div>
        </section>
        <ProjectGallery onOpen={openProject} />
        <ContactSection />
      </main>
      <SiteFooter />
      <ProjectDialog
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onContact={openContact}
        onRestoreFocus={(event) => {
          event.preventDefault();
          if (!document.activeElement?.closest("#contact"))
            dialogOpener.current?.focus({ preventScroll: true });
        }}
      />
    </div>
  );
}
