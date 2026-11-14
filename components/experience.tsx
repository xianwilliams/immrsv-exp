"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Contact } from "./contact-dialog";
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
  const clients = [
    ["sundance.png", "Sundance Film Festival"],
    ["mcdonalds.svg", "McDonald’s"],
    ["nascar.svg", "NASCAR"],
    ["tictac.png", "Tic Tac"],
    ["drpepper.svg", "Dr Pepper"],
    ["fourloko.svg", "Four Loko"],
    ["rollingstones.svg", "The Rolling Stones"],
    ["keebler.png", "Keebler"],
  ];
  return (
    <div className="client-marks">
      {clients.map(([file, name]) => (
        <div className="client-mark" key={file}>
          <img
            src={`/media/logos/${file}`}
            alt={name}
            loading="lazy"
            width={200}
            height={100}
          />
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
  const [paused, setPaused] = useState(false);
  const [mediaPaused, setMediaPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [autoReviews, setAutoReviews] = useState(true);
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
      setAutoReviews(!motion.matches);
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
    if (!autoReviews || paused || contactOpen || selectedProject) return;
    const timer = setInterval(() => {
      const box = reviewsRef.current?.getBoundingClientRect();
      if (!document.hidden && box && box.top < innerHeight && box.bottom > 0)
        setReview((i) => (i + 1) % reviews.length);
    }, 7500);
    return () => clearInterval(timer);
  }, [autoReviews, paused, contactOpen, selectedProject]);

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
  function moveReview(delta: number) {
    setReview((i) => (i + delta + reviews.length) % reviews.length);
    setPaused(true);
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
            <a href="#friends">OUR FRIENDS</a>
          </div>
          <span className="nav-line">
            BRINGING YOUR BRAND INTO THE REAL WORLD.
          </span>
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
              ["OUR FRIENDS", "#friends"],
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

      <main>
        <section className="trust" aria-labelledby="trust-title">
          <h2 id="trust-title" data-reveal>
            TRUSTED BY SOME OF
            <br />
            THE BIGGEST COMPANIES
            <br />
            IN THE WORLD.
          </h2>
          <p className="trust-note" data-reveal>
            Big brands. Great partners. Shared ambition.
            <br />
            Experience supporting these brands alongside agency and production
            teams.
          </p>
          <ClientMarks />
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
          className="friends"
          id="friends"
          ref={reviewsRef}
          aria-labelledby="friends-heading"
          aria-roledescription="carousel"
        >
          <div
            className="review-stage"
            onMouseEnter={() => setPaused(true)}
            onFocus={() => setPaused(true)}
          >
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
            <div className="friends-heading">
              <h2 id="friends-heading">
                WHAT OUR
                <br />
                <em>FRIENDS SAY.</em>
              </h2>
            </div>

            <div
              className="review-content"
              aria-live={paused ? "polite" : "off"}
            >
              <span className="quote-mark" aria-hidden="true">
                “
              </span>
              <blockquote
                key={review}
                className={
                  reviews[review].quote.length > 220 ? "long-quote" : ""
                }
              >
                {reviews[review].quote}
              </blockquote>
              <div className="review-attribution">
                <strong>{reviews[review].name}</strong>
                <span>ON GOOGLE · {reviews[review].date}</span>
              </div>
            </div>
            <div className="review-footer">
              <span className="review-image-credit mono">
                FROM THE ARCHIVE / {reviews[review].project}
              </span>
              <div className="review-controls">
                <button
                  onClick={() => moveReview(-1)}
                  aria-label="Previous review"
                >
                  <span aria-hidden="true">←</span>
                </button>
                <button
                  onClick={() => {
                    setPaused(autoReviews && !paused);
                    setAutoReviews(true);
                  }}
                  aria-label={
                    paused || !autoReviews
                      ? "Resume review carousel"
                      : "Pause review carousel"
                  }
                >
                  {paused || !autoReviews ? "▷" : "Ⅱ"}
                </button>
                <button onClick={() => moveReview(1)} aria-label="Next review">
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="about" id="about">
          <div className="about-top" data-reveal>
            <span className="mono">BIG IDEAS. REAL-WORLD EXPERIENCES.</span>
            <p>
              We bring the right
              <br />
              <em>people together.</em>
            </p>
          </div>
          <div className="about-bottom" data-reveal>
            <span className="tiny-brand">
              <Brand />
            </span>
            <div>
              <h2>Your team, extended.</h2>
              <p>
                IMMRSV is Nick Wirsching and a collective of people who know how
                to make things happen. One production lead, a focused sprint, or
                a full supporting cast. We fit around what your project needs.
              </p>
              <p>
                Alongside your agency. Inside your brand team. From the first
                “what if” to the final load-out.
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

        <section className="closing">
          <p className="mono" data-reveal>
            FROM A QUICK GUT CHECK TO THE WHOLE THING.
          </p>
          <h2 data-reveal>
            LET’S MAKE
            <br />
            <em>SOMETHING HAPPEN.</em>
          </h2>
          <button className="button closing-cta" onClick={openContact}>
            WORK WITH US
            <Arrow diagonal />
          </button>
          <a href="mailto:nick@immrsv-exp.com" className="closing-email">
            nick@immrsv-exp.com
          </a>
        </section>
      </main>
      <footer>
        <div className="footer-top">
          <span>
            INDEPENDENT IN SPIRIT.
            <br />
            COLLECTIVE BY NATURE.
          </span>
          <div>
            <a
              href="https://www.linkedin.com/in/nick-wirsching/"
              target="_blank"
              rel="noreferrer"
            >
              LINKEDIN ↗
            </a>
            <a href="#home">BACK TO TOP ↑</a>
          </div>
          <span>© {new Date().getFullYear()} IMMRSV</span>
        </div>
        <Brand />
      </footer>
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
