"use client";
import { TypedHeading } from "./typed-heading";
import { services } from "@/lib/content";
import "./services.css";

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

export function Services() {
  // Preserve the original service icon order after arranging the text-only list.
  const iconOrder = [0, 2, 4, 1, 3, 5];
  return (
    <section
      className="services"
      id="services"
      aria-labelledby="services-title"
    >
      <div className="services-heading" data-reveal>
        <span className="mono">HOW WE CAN HELP</span>
        <h2 id="services-title">
          <TypedHeading>
            BUILT AROUND <br />
            WHAT YOUR <br />
            <em>PROJECT NEEDS.</em>
          </TypedHeading>
        </h2>
      </div>
      <div className="service-details" data-reveal>
        {services.map((service, index) => (
          <details key={service.title} name="services" open={index === 0}>
            <summary>
              <span className="service-label">
                {service.title}
                <span className="service-divider" aria-hidden="true">
                  |
                </span>
                <ServiceIcon index={iconOrder[index]} />
              </span>
              <span className="service-expand" aria-hidden="true">
                +
              </span>
            </summary>
            <p>{service.text}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
