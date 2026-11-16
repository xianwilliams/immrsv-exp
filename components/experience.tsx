"use client";
import { TypedHeading } from "./typed-heading";
import { SiteFooter } from "./site-footer";
import PixelBlast from "./PixelBlast";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Contact } from "./contact-dialog";
import { Arrow, Brand, Close } from "./site-ui";
import Link from "next/link";
import { ProjectGallery } from "./project-gallery";
import { ProjectPhotos } from "./project-photos";
import { HeroCarousel } from "./hero-carousel";
import { ProjectBanner } from "./project-banner";
import { Services } from "./services";
import { ThemeToggle } from "./theme-toggle";
import { projectPreviews } from "@/lib/project-previews";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { recentProjects, reviews, type Project } from "@/lib/content";

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
                <div className="project-roles">
                  <span className="mono">OUR INVOLVEMENT</span>
                  <ul>
                    {project.roles.map((role) => (
                      <li key={role}>{role}</li>
                    ))}
                  </ul>
                </div>
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
      "sundance.png",
      "Sundance Film Festival",
      "sundance",
      "Sundance Film Festival 2024–2026",
    ],
    [
      "mcdonalds.svg",
      "McDonald’s",
      "wcdonalds",
      "McDonald’s WcDonald’s Immersive Dining Experience",
    ],
    [
      "nascar.svg",
      "NASCAR",
      "nascar-billboard",
      "NASCAR — World’s Loudest Billboard",
    ],
    [
      "tictac.png",
      "Tic Tac",
      "tictac",
      "Tic Tac × Dr Pepper Vibe Refresh Squad",
    ],
    [
      "drpepper.svg",
      "Dr Pepper",
      "tictac",
      "Tic Tac × Dr Pepper Vibe Refresh Squad",
    ],
    [
      "fourloko.svg",
      "Four Loko",
      "fourloko",
      "Four Loko Party Store — Live Nation Festival Circuit",
    ],
    [
      "rollingstones.svg",
      "The Rolling Stones",
      "stones",
      "NASCAR × The Rolling Stones",
    ],
    ["keebler.png", "Keebler", "keebler", "Keebler Butterbeer Pop-Up"],
  ];
  return (
    <div className="client-marks">
      {clients.map(([file, name, project, title], index) => (
        <div
          className={`client-mark ${active === file ? "is-previewing" : ""}`}
          key={file}
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
              src={`/media/logos/${file}`}
              alt=""
              width={200}
              height={100}
              loading="lazy"
            />
            <img
              className="client-logo-color"
              src={`/media/logos/color/${file}`}
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
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [review, setReview] = useState(0);
  const [mediaPaused, setMediaPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reviewsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!sessionStorage.getItem("immrsv-intro")) {
          gsap.set(intro.current, { display: "grid", autoAlpha: 1 });
          const mark = document.querySelector(".intro-box");
          const palette = getComputedStyle(document.documentElement);
          const target = document
            .querySelector(".hero-film")!
            .getBoundingClientRect();
          const logoWidth =
            window.innerWidth * (window.innerWidth < 600 ? 0.92 : 0.84);
          const y =
            target.top +
            (logoWidth * (190 / 1087)) / 2 -
            window.innerHeight / 2;
          gsap
            .timeline({
              onComplete: () => {
                sessionStorage.setItem("immrsv-intro", "seen");
                gsap.set(intro.current, { display: "none" });
              },
            })
            .fromTo(
              mark,
              { autoAlpha: 0, scale: 0.94 },
              { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power2.out" },
            )
            .to(
              ".intro-box",
              {
                backgroundColor: palette.getPropertyValue("--paper").trim(),
                duration: 0.25,
              },
              0.6,
            )
            .to(
              ".intro-box .brand",
              {
                backgroundColor: palette.getPropertyValue("--ink").trim(),
                duration: 0.25,
              },
              0.6,
            )
            .to(
              mark,
              {
                y,
                width: logoWidth,
                padding: 0,
                duration: 1.05,
                ease: "power4.inOut",
              },
              0.95,
            )
            .to(intro.current, { autoAlpha: 0, duration: 0.45 }, 2);
        }
        ScrollTrigger.create({
          trigger: ".hero",
          start: "top top",
          end: () =>
            "+=" + document.querySelector<HTMLElement>(".hero")!.offsetHeight,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
        gsap.from(".hero-nav > *", {
          y: -14,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
          delay: sessionStorage.getItem("immrsv-intro") ? 0 : 1.6,
        });
        gsap.from(".hero-line", {
          y: 18,
          opacity: 0,
          duration: 1,
          delay: sessionStorage.getItem("immrsv-intro") ? 0.2 : 2,
        });
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) =>
          gsap.from(element, {
            y: 36,
            opacity: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 90%", once: true },
          }),
        );
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
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => {
      if (motion.matches) {
        setMediaPaused(true);
      }
    };
    applyMotion();
    motion.addEventListener("change", applyMotion);
    return () => {
      ctx.revert();
      motion.removeEventListener("change", applyMotion);
    };
  }, []);

  useEffect(() => {
    if (contactOpen || selectedProject) return;
    const timer = setInterval(() => {
      const box = reviewsRef.current?.getBoundingClientRect();
      if (!document.hidden && box && box.top < innerHeight && box.bottom > 0)
        setReview((i) => (i + 1) % reviews.length);
    }, 7500);
    return () => clearInterval(timer);
  }, [contactOpen, selectedProject]);

  function openContact() {
    if (!selectedProject)
      dialogOpener.current = document.activeElement as HTMLElement;
    setContactOpen(true);
  }
  const openProject = useCallback((project: Project) => {
    dialogOpener.current = document.activeElement as HTMLElement;
    setSelectedProject(project);
  }, []);
  function restoreFocus(event: Event) {
    event.preventDefault();
    dialogOpener.current?.focus({ preventScroll: true });
  }
  function toggleHeroMedia() {
    setMediaPaused((paused) => !paused);
  }

  return (
    <div ref={root}>
      <a className="skip-link" href="#about">
        Skip to content
      </a>
      <div ref={intro} className="intro" aria-hidden="true">
        <div className="intro-box">
          <Brand />
        </div>
      </div>
      <header className="hero" id="home">
        <nav className="hero-nav" aria-label="Main navigation">
          <div className="nav-links">
            <a href="#work">WORK</a>
            <a href="#about">ABOUT</a>
            <a href="#services">SERVICES</a>
            <a href="#clients">OUR CLIENTS</a>
          </div>
          <span className="nav-line">YOUR TEAM. OUR PRODUCTION SUPPORT.</span>
          <div className="nav-actions">
            <ThemeToggle />
            <button className="button nav-cta" onClick={openContact}>
              <span>WORK WITH US</span>
              <Arrow diagonal />
            </button>
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
              ["WORK", "#work"],
              ["ABOUT", "#about"],
              ["SERVICES", "#services"],
              ["OUR CLIENTS", "#clients"],
            ].map(([title, href]) => (
              <a href={href} key={href} onClick={() => setMenuOpen(false)}>
                {title}
                <Arrow diagonal />
              </a>
            ))}
          </nav>
        )}
        <h1 className="sr-only">
          IMMRSV. Creating one-of-a-kind experiences since 2016.
        </h1>
        <HeroCarousel
          paused={mediaPaused || contactOpen || !!selectedProject}
        />
        <div className="hero-bottom">
          <p className="hero-line">
            CREATING <strong>ONE-OF-A-KIND EXPERIENCES</strong> SINCE 2016
          </p>
          <button
            className="video-control"
            onClick={toggleHeroMedia}
            aria-label={
              mediaPaused ? "Play project carousel" : "Pause project carousel"
            }
          >
            {mediaPaused ? "PLAY" : "PAUSE"}
            <span aria-hidden="true">{mediaPaused ? "▷" : "Ⅱ"}</span>
          </button>
        </div>
      </header>

      <main className="home-content">
        <section className="trust" aria-labelledby="support-title">
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
          <div className="partner-intro">
            <div data-reveal>
              <p className="mono partner-kicker">
                INDEPENDENT EXPERIENTIAL PRODUCTION
              </p>
              <h2 id="support-title">
                <TypedHeading>
                  YOUR PROJECT.
                  <br />
                  <em>THE RIGHT SUPPORT.</em>
                </TypedHeading>
              </h2>
            </div>
            <div className="partner-copy" data-reveal>
              <p>
                Independent experiential production, built around what your
                project needs. One production lead, a short planning sprint, or
                a full team—from the first idea to the final load-out.
              </p>
              <p>
                We work alongside agencies, internal brand teams, and creative
                partners. Bring us in for the piece you need—or the whole
                production.
              </p>
              <button className="button partner-cta" onClick={openContact}>
                TELL US WHAT YOU NEED <Arrow diagonal />
              </button>
            </div>
          </div>
          <div
            className="trust-proof"
            role="group"
            aria-labelledby="trust-title"
          >
            <div className="trust-proof-heading" data-reveal>
              <h2 id="trust-title">
                BIG BRANDS.
                <br />
                <em>SHARED EFFORT.</em>
              </h2>
              <p className="trust-note">
                Selected brands and experiences supported alongside agency,
                creative, and production partners. Roles vary by project;
                explore the case studies for the details.
              </p>
            </div>
            <ClientMarks />
          </div>
        </section>

        <Services onContact={openContact} />

        <ProjectGallery onOpen={openProject} />

        <section className="recent-work">
          <div className="recent-heading" data-reveal>
            <span className="mono">A FEW RECENT COLLABORATIONS</span>
            <p>
              Different scales.
              <br />
              Same commitment.
            </p>
          </div>
          <div className="project-list">
            {recentProjects.map((p, i) => (
              <button
                className="project-row"
                key={p.id}
                onClick={() => openProject(p)}
              >
                <span className="project-row-client">{p.client}</span>
                <span className="project-row-title">
                  {p.id === "wcdonalds"
                    ? "WcDonald’s immersive dining experience"
                    : p.title}
                </span>
                <span className="project-row-role">
                  {p.roles.slice(0, 2).join(" / ")}
                </span>
                <Arrow diagonal />
              </button>
            ))}
          </div>
        </section>

        <section
          className="clients"
          id="clients"
          ref={reviewsRef}
          aria-labelledby="clients-heading"
          aria-roledescription="carousel"
        >
          <div className="review-stage">
            {reviews.map((r, i) => (
              <div
                key={r.name}
                className={`review-background ${review === i ? "active" : ""}`}
                aria-hidden="true"
              >
                <img
                  src={r.image}
                  alt=""
                  width={1600}
                  height={1000}
                  loading="lazy"
                  style={{ objectPosition: r.position }}
                />
              </div>
            ))}
            <div className="review-scrim" />
            <div className="clients-heading">
              <h2 id="clients-heading">
                <TypedHeading>
                  WHAT OUR
                  <br />
                  <em>CLIENTS SAY.</em>
                </TypedHeading>
              </h2>
            </div>

            <div className="review-content" aria-live="off">
              {reviews.map((item, index) => (
                <div
                  key={item.name}
                  className={`review-slide ${review === index ? "is-active" : ""}`}
                  aria-hidden={review !== index}
                >
                  <blockquote
                    className={item.quote.length > 220 ? "long-quote" : ""}
                  >
                    {item.quote}
                  </blockquote>
                  <div className="review-attribution">
                    <strong>{item.name}</strong>
                    <span>ON GOOGLE · {item.date}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="review-footer">
              <span className="review-image-credit mono">
                FROM THE ARCHIVE / {reviews[review].project}
              </span>
            </div>
          </div>
        </section>

        <section className="about" id="about">
          <div className="about-top" data-reveal>
            <span className="mono">BIG IDEAS. REAL-WORLD EXPERIENCES.</span>
            <p>
              <TypedHeading>
                WE BRING THE RIGHT
                <br />
                <em>PEOPLE TOGETHER.</em>
              </TypedHeading>
            </p>
          </div>
          <div className="about-bottom" data-reveal>
            <div
              className="about-people"
              aria-label="People and production from the project archive"
            >
              <img
                src="/media/people/installation.jpg"
                alt="Three people standing among a mirrored outdoor installation"
                width={1094}
                height={1375}
                loading="lazy"
              />
              <img
                src="/media/people/prop-build.png"
                alt="Two people beside oversized sculptural props in a workshop"
                width={1218}
                height={1180}
                loading="lazy"
              />
              <img
                src="/media/people/workshop.png"
                alt="Two people beside a colorful octopus sculpture during fabrication"
                width={1206}
                height={1108}
                loading="lazy"
              />
            </div>
            <div>
              <h2>Your team, extended.</h2>
              <p>
                IMMRSV is Nick Wirsching, an independent production lead with a
                trusted network of creative specialists, fabricators, and event
                professionals. Work directly with Nick or let him assemble the
                right people around your brief. Less agency overhead means
                quicker responses, faster delivery, and competitive rates.
              </p>
              <p>
                Based in Salt Lake City, with production partners across the
                country and the flexibility to work around the world. We can
                slot into your existing team, lead a specific workstream, or
                coordinate production from concept through execution. We don’t
                need to be the agency of record to be a partner you count on.
              </p>
            </div>
            <button
              className="circle-link"
              onClick={openContact}
              aria-label="Work with IMMRSV"
            >
              <Arrow diagonal />
            </button>
          </div>
        </section>

        <ProjectBanner onContact={openContact} home />
      </main>
      <SiteFooter />
      <Contact
        open={contactOpen}
        onOpenChange={setContactOpen}
        onRestoreFocus={restoreFocus}
      />
      <ProjectDialog
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onContact={openContact}
        onRestoreFocus={(event) => {
          event.preventDefault();
          if (!contactOpen)
            dialogOpener.current?.focus({ preventScroll: true });
        }}
      />
    </div>
  );
}
