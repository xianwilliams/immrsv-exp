"use client";

import type { CmsProject, Homepage } from "@/lib/cms/types";
import { contentLines } from "./content-lines";
import "./project-gallery.css";

export function ProjectGallery({
  onOpen,
  projects,
  content,
}: {
  projects: CmsProject[];
  content: Homepage["work"];
  onOpen: (project: CmsProject) => void;
}) {
  return (
    <section className="work" id="work" aria-labelledby="work-title">
      <div className="work-stage">
        <div className="work-caption">
          <h2 id="work-title" className="work-title">
            {contentLines(content.title)}
            {content.emphasis && (
              <>
                {" "}
                <em>{contentLines(content.emphasis)}</em>
              </>
            )}
          </h2>
          <span className="mono">{content.eyebrow}</span>
        </div>
        <div className="work-grid">
          {projects.map((project) => (
            <button
              className="work-card"
              key={project.id}
              onClick={() => onOpen(project)}
            >
              <div className="work-card-image">
                <img
                  src={project.cover.src}
                  alt={
                    project.cover.alt || `${project.client}: ${project.title}`
                  }
                  width={project.cover.width}
                  height={project.cover.height}
                  loading="lazy"
                  style={{ objectPosition: project.cover.position }}
                />
                <span className="work-card-open" aria-hidden="true">
                  ↗
                </span>
              </div>
              <div className="work-card-label">
                <span>{project.client}</span>
                <span>
                  {project.title === project.client
                    ? project.category
                    : project.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
