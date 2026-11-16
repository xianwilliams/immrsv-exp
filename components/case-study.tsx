"use client";
import { SiteFooter } from "./site-footer";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/content";
import type { ProjectImage } from "@/lib/project-galleries";
import type { ProjectStory } from "@/lib/project-stories";
import { Contact } from "./contact-dialog";
import { Arrow, Brand } from "./site-ui";
import { ImageViewer } from "./image-viewer";
import { ThemeToggle } from "./theme-toggle";
import { ProjectBanner } from "./project-banner";
import "./case-study.css";

export function CaseStudy({
  project,
  story,
  images,
  next,
}: {
  project: Project;
  story: ProjectStory;
  images: ProjectImage[];
  next: Project;
}) {
  const [contact, setContact] = useState(false);
  const [image, setImage] = useState<number | null>(null);
  const contactOpener = useRef<HTMLElement | null>(null);
  const imageOpener = useRef<HTMLElement | null>(null);
  function openContact() {
    contactOpener.current = document.activeElement as HTMLElement;
    setContact(true);
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
      key={images[index].src}
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
        <Link className="case-back mono" href="/#work">
          <span aria-hidden="true">←</span> ALL WORK
        </Link>
        <Link className="case-brand" href="/" aria-label="IMMRSV home">
          <Brand />
        </Link>
        <div className="nav-actions">
          <ThemeToggle />
          <button className="button nav-cta" onClick={openContact}>
            WORK WITH US <Arrow diagonal />
          </button>
        </div>
      </header>
      <main>
        {photo(0, true)}
        <section className="case-story" id="project-story">
          <div className="case-title">
            <p className="mono">{story.eyebrow}</p>
            <h1>{project.title}</h1>
            <span className="case-client">{project.client}</span>
          </div>
          <div className="case-overview">
            <p>{story.summary}</p>
            <ul className="case-role-tags">
              {project.roles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </div>
        </section>
        <section className="case-scope" aria-labelledby="scope-title">
          <div>
            <span className="mono">
              {["starry", "crumbl"].includes(project.id)
                ? "A CLOSER LOOK"
                : "THE ROLE WE PLAYED"}
            </span>
            <h2 id="scope-title">
              {["starry", "crumbl"].includes(project.id)
                ? "Inside the experience."
                : "What we brought to it."}
            </h2>
          </div>
          <div className="case-scope-list">
            {story.scope.map((item, i) => (
              <article key={item.title}>
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          className="case-gallery"
          aria-label={`${project.client} full project gallery`}
        >
          {images.slice(1).map((_, i) => photo(i + 1))}
        </section>
        <div className="case-project-end">
          <Link className="text-button" href="/#work">
            ALL SELECTED WORK <Arrow />
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
        <ProjectBanner onContact={openContact} />
        <Link className="case-next" href={`/work/${next.id}`}>
          <div>
            <span className="mono">NEXT EXPERIENCE</span>
            <h2>{next.client}</h2>
            <p>{next.title}</p>
            <Arrow diagonal />
          </div>
          <img
            src={next.image}
            alt={next.client}
            width={800}
            height={530}
            loading="lazy"
          />
        </Link>
      </main>
      <SiteFooter />
      <Contact
        open={contact}
        onOpenChange={setContact}
        onRestoreFocus={(event) => {
          event.preventDefault();
          contactOpener.current?.focus({ preventScroll: true });
        }}
      />
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
