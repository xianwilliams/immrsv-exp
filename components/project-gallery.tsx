"use client";

import { projects, type Project } from "@/lib/content";
import { projectCoverPositions } from "@/lib/project-galleries";
import "./project-gallery.css";

export function ProjectGallery({
  onOpen,
}: {
  onOpen: (project: Project) => void;
}) {
  return (
    <section className="work" id="work" aria-labelledby="work-title">
      <div className="work-stage">
        <div className="work-caption">
          <h2 id="work-title" className="work-title">
            CASE <em>STUDIES</em>
          </h2>
          <span className="mono">SELECTED EXPERIENCES</span>
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
                  src={project.image}
                  alt={`${project.client}: ${project.title}`}
                  width={1200}
                  height={754}
                  loading="lazy"
                  style={{ objectPosition: projectCoverPositions[project.id] }}
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
