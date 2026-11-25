"use client";
import { SiteFooter } from "./site-footer";

import { useRef, useState } from "react";
import Link from "next/link";
import type { CmsProject, FeaturedSlide, SiteSettings } from "@/lib/cms/types";
import type { ProjectImage } from "@/lib/project-galleries";
import { Arrow, Brand } from "./site-ui";
import { ImageViewer } from "./image-viewer";
import { ThemeToggle } from "./theme-toggle";
import { ProjectBanner } from "./project-banner";
import "./case-study.css";

export function CaseStudy({
  project,
  images,
  next,
  settings,
  bannerSlides,
  contactAvailable = true,
  workAvailable = true,
}: {
  project: CmsProject;
  settings: SiteSettings;
  bannerSlides: FeaturedSlide[];
  contactAvailable?: boolean;
  workAvailable?: boolean;
  images: ProjectImage[];
  next: CmsProject | null;
}) {
  const [image, setImage] = useState<number | null>(null);
  const imageOpener = useRef<HTMLElement | null>(null);
  function openContact() {
    window.location.assign("/#contact");
  }
  function openImage(index: number) {
    imageOpener.current = document.activeElement as HTMLElement;
    setImage(index);
  }
  const photo = (index: number, lead = false) => (
    <figure
      className={
        lead
          ? "case-lead"
          : `case-photo${index % 3 === 1 && images[index].width / images[index].height > 1.2 ? " case-photo-wide" : ""}`
      }
      key={`${images[index].src}-${index}`}
    >
      <button
        onClick={() => openImage(index)}
        aria-label={`Enlarge project image ${index + 1}: ${images[index].caption}`}
      >
        <img
          src={images[index].src}
          alt={images[index].alt}
          width={images[index].width}
          height={images[index].height}
          loading={lead ? "eager" : "lazy"}
          fetchPriority={lead ? "high" : "auto"}
        />
        <span className="case-enlarge" aria-hidden="true">
          ↗
        </span>
      </button>
      <figcaption>
        <span className="mono">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(images.length).padStart(2, "0")}
        </span>
        {images[index].caption}
      </figcaption>
    </figure>
  );
  return (
    <div className="case-study">
      <a className="skip-link" href="#project-story">
        Skip to project details
      </a>
      <header className="case-header">
        <Link className="case-back mono" href={workAvailable ? "/#work" : "/"}>
          <span aria-hidden="true">←</span>{" "}
          {workAvailable ? "ALL WORK" : "HOME"}
        </Link>
        <Link className="case-brand" href="/" aria-label="IMMRSV home">
          <Brand />
        </Link>
        <div className="nav-actions">
          <ThemeToggle />
          {contactAvailable && (
            <button className="button nav-cta" onClick={openContact}>
              {settings.contactButton} <Arrow diagonal />
            </button>
          )}
        </div>
      </header>
      <main>
        {images.length > 0 && photo(0, true)}
        <section className="case-story" id="project-story">
          <div className="case-title">
            <p className="mono">{project.category}</p>
            <h1>{project.title}</h1>
            <span className="case-client">{project.client}</span>
          </div>
          <div className="case-overview">
            <p>{project.description}</p>
            {project.body.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {project.roles.length > 0 && (
              <ul className="case-role-tags">
                {project.roles.map((role, index) => (
                  <li key={`${role}-${index}`}>{role}</li>
                ))}
              </ul>
            )}
            {project.credit && <p className="case-credit">{project.credit}</p>}
          </div>
        </section>
        <section
          className="case-gallery"
          aria-label={`${project.client} full project gallery`}
        >
          {images.slice(1).map((_, i) => photo(i + 1))}
        </section>
        <div className="case-project-end">
          <Link className="text-button" href={workAvailable ? "/#work" : "/"}>
            {workAvailable ? "ALL SELECTED WORK" : "BACK TO HOME"} <Arrow />
          </Link>
          {project.link && (
            <a
              className="mono"
              href={project.link}
              target="_blank"
              rel="noreferrer"
            >
              PROJECT SOURCE ↗
            </a>
          )}
        </div>
        {contactAvailable && (
          <ProjectBanner
            key={bannerSlides.map((slide) => slide.project.id).join("|")}
            onContact={openContact}
            settings={settings}
            slides={bannerSlides}
          />
        )}
        {next && (
          <Link className="case-next" href={`/work/${next.id}`}>
            <div>
              <span className="mono">NEXT EXPERIENCE</span>
              <h2>{next.client}</h2>
              <p>{next.title}</p>
              <Arrow diagonal />
            </div>
            <img
              src={next.cover.src}
              alt={next.cover.alt || next.client}
              width={next.cover.width}
              height={next.cover.height}
              style={{ objectPosition: next.cover.position }}
              loading="lazy"
            />
          </Link>
        )}
      </main>
      <SiteFooter settings={settings} />
      <ImageViewer
        images={images}
        index={image}
        client={project.client}
        onChange={setImage}
        onClose={() => setImage(null)}
        onRestoreFocus={(event) => {
          event.preventDefault();
          imageOpener.current?.focus({ preventScroll: true });
        }}
      />
    </div>
  );
}
