"use client";
import { TypedHeading } from "./typed-heading";
import { SiteFooter } from "./site-footer";
import PixelBlast from "./PixelBlast";

import { useCallback, useEffect, useRef, useState, Fragment } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ContactSection } from "./contact-section";
import { Arrow, Brand, Close } from "./site-ui";
import Link from "next/link";
import { ProjectGallery } from "./project-gallery";
import { ProjectPhotos } from "./project-photos";
import { HeroCarousel } from "./hero-carousel";
import { Services } from "./services";
import { ThemeToggle } from "./theme-toggle";
import {
  featuredSlides,
  type ClientLogo,
  type CmsProject,
  type SiteContent,
} from "@/lib/cms/types";
import { contentLines } from "./content-lines";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./home-revision.css";

gsap.registerPlugin(ScrollTrigger);

function ProjectDialog({
  project,
  onClose,
  onContact,
  onRestoreFocus,
  contactLabel,
  contactAvailable,
}: {
  project: CmsProject | null;
  contactLabel: string;
  contactAvailable: boolean;
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
              {project.popupGallery.length ? (
                <ProjectPhotos
                  key={project.id}
                  images={project.popupGallery}
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
                      {project.roles.map((role, index) => (
                        <li key={`${role}-${index}`}>{role}</li>
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
                  {contactAvailable && (
                    <button
                      className="button"
                      onClick={() => {
                        onClose();
                        onContact();
                      }}
                    >
                      {contactLabel}
                      <Arrow diagonal />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ClientMarks({ clients }: { clients: ClientLogo[] }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className="client-marks">
      {clients.map((client, index) => {
        const images = (
          <>
            <img
              className="client-logo-mono"
              src={client.monochromeLogo || client.logo}
              alt=""
              width={200}
              height={100}
              loading="lazy"
            />
            <img
              className="client-logo-color"
              src={client.logo}
              alt=""
              width={200}
              height={100}
              loading="lazy"
            />
          </>
        );
        const label = client.previewTitle
          ? `${client.name}: ${client.previewTitle}`
          : client.name;
        return (
          <div
            className={`client-mark ${active === client.id ? "is-previewing" : ""}`}
            key={client.id}
            data-brand={client.projectId || client.id}
            onMouseEnter={() => setActive(client.id)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(client.id)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                setActive(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setActive(null);
            }}
          >
            {client.projectId ? (
              <Link
                href={`/work/${client.projectId}`}
                className="client-logo-button"
                aria-label={label}
                aria-controls={
                  client.previewImage ? `brand-preview-${index}` : undefined
                }
              >
                {images}
              </Link>
            ) : (
              <span
                className="client-logo-button"
                role="img"
                aria-label={label}
                tabIndex={client.previewImage ? 0 : undefined}
              >
                {images}
              </span>
            )}
            {client.previewImage && (
              <div
                className="client-event-preview"
                id={`brand-preview-${index}`}
                aria-hidden={active !== client.id}
              >
                <img
                  src={client.previewImage.src}
                  alt=""
                  width={320}
                  height={320}
                  loading="lazy"
                  style={{ objectPosition: client.previewImage.position }}
                />
                {client.previewTitle && <p>{client.previewTitle}</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Experience({ content }: { content: SiteContent }) {
  const { home, settings } = content;
  const sections = home.sections.filter((section) => section.enabled);
  const contactAvailable = sections.some(
    (section) => section.section === "contact",
  );
  const navigation = settings.navigation.filter((item) =>
    sections.some((section) => section.section === item.section),
  );
  const slides = featuredSlides(content);
  const projects = home.work.featuredProjects.flatMap((id) => {
    const project = content.projects.find((entry) => entry.id === id);
    return project ? [project] : [];
  });
  const root = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const dialogOpener = useRef<HTMLElement | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const selectedProject =
    content.projects.find((project) => project.id === selectedProjectId) ||
    null;
  const [menuOpen, setMenuOpen] = useState(false);

  // Refresh reveal positions when a published section is reordered or edited.
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
        if (home.heroProjects.length)
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
        if (root.current?.querySelector(".client-mark"))
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
  }, [content]);

  function openContact() {
    setSelectedProjectId(null);
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
  const openProject = useCallback((project: CmsProject) => {
    dialogOpener.current = document.activeElement as HTMLElement;
    setSelectedProjectId(project.id);
  }, []);

  return (
    <div ref={root} className="home-revision">
      <a
        className="skip-link"
        href={sections.length ? `#${sections[0].section}` : "#home"}
      >
        Skip to content
      </a>
      <div ref={intro} className="intro" aria-hidden="true">
        <div className="intro-mark block-brand">
          <Brand />
        </div>
      </div>
      <header
        className={`hero${slides.length ? "" : " hero--no-media"}`}
        id="home"
      >
        <nav className="hero-nav" aria-label="Main navigation">
          <a
            href="#home"
            className="header-brand block-brand"
            aria-label="IMMRSV home"
          >
            <Brand />
          </a>
          <div className="nav-links">
            {navigation.map((item) => (
              <a key={item.section} href={`#${item.section}`}>
                {item.label}
              </a>
            ))}
          </div>
          <div className="nav-actions">
            <ThemeToggle />
            {contactAvailable && (
              <a className="button nav-cta" href="#contact">
                <span>{settings.contactButton}</span>
                <Arrow diagonal />
              </a>
            )}
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
            {navigation.map(({ label, section }) => (
              <a
                key={section}
                href={`#${section}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
                <Arrow diagonal />
              </a>
            ))}
            {contactAvailable &&
              !navigation.some((item) => item.section === "contact") && (
                <a href="#contact" onClick={() => setMenuOpen(false)}>
                  {settings.contactButton}
                  <Arrow diagonal />
                </a>
              )}
          </nav>
        )}
        <h1 className="sr-only">{settings.seoTitle}</h1>
        <HeroCarousel
          key={slides.map((slide) => slide.project.id).join("|")}
          slides={slides}
          paused={!!selectedProject}
        />
      </header>
      <main className="home-content">
        {sections.map(({ section }) => (
          <Fragment key={section}>
            {section === "about" && (
              <section
                className="about"
                id="about"
                aria-labelledby="about-title"
              >
                <div
                  className={`about-layout${home.about.photos.length ? "" : " about-layout--text-only"}`}
                  data-reveal
                >
                  <h2 id="about-title">
                    <TypedHeading>
                      {contentLines(home.about.title)}
                      {home.about.emphasis && (
                        <>
                          <br />
                          <em>{contentLines(home.about.emphasis)}</em>
                        </>
                      )}
                    </TypedHeading>
                  </h2>
                  {home.about.photos.length > 0 && (
                    <figure className="about-photos">
                      <div
                        className="about-people"
                        style={{
                          gridTemplateColumns: `repeat(${Math.min(home.about.photos.length, 3)}, minmax(0, 1fr))`,
                        }}
                      >
                        {home.about.photos.map((image, index) => (
                          <img
                            key={`${image.src}-${index}`}
                            src={image.src}
                            alt={image.alt}
                            width={image.width}
                            height={image.height}
                            loading="lazy"
                            style={{ objectPosition: image.position }}
                          />
                        ))}
                      </div>
                      {home.about.caption && (
                        <figcaption className="mono">
                          {home.about.caption}
                        </figcaption>
                      )}
                    </figure>
                  )}
                  <div className="about-copy">
                    {home.about.paragraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </section>
            )}
            {section === "services" && <Services content={home.services} />}
            {section === "clients" && (
              <section
                className="trust"
                id="clients"
                aria-labelledby="trust-title"
              >
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
                    {contentLines(home.clients.title)}
                    {home.clients.emphasis && (
                      <>
                        {" "}
                        <em>{contentLines(home.clients.emphasis)}</em>
                      </>
                    )}
                  </h2>
                  <ClientMarks clients={home.clients.logos} />
                </div>
              </section>
            )}
            {section === "work" && (
              <ProjectGallery
                projects={projects}
                content={home.work}
                onOpen={openProject}
              />
            )}
            {section === "contact" && (
              <ContactSection
                content={home.contact}
                settings={settings}
                slides={slides}
              />
            )}
          </Fragment>
        ))}
      </main>
      <SiteFooter settings={settings} />
      <ProjectDialog
        contactLabel={settings.contactButton}
        contactAvailable={contactAvailable}
        project={selectedProject}
        onClose={() => setSelectedProjectId(null)}
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
