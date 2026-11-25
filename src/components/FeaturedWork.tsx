import { ArrowUpRight, Github } from "lucide-react";
import { projects, type Project } from "../data/content";
import { ProjectMedia } from "./ProjectMedia";
import { cleanText } from "./RichText";
import { SectionHeader } from "./SectionHeader";

type Props = { onOpen: (project: Project) => void };

export function FeaturedWork({ onOpen }: Props) {
  const featured = projects.filter((project) => project.featured);

  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="shell">
        <SectionHeader id="work-title" label="Selected work" title="Four systems, perception to actuation.">
          <p>
            Two competitions, a space-robotics internship, and a robot-learning project, validated
            in simulation and, where it counts, on hardware.
          </p>
        </SectionHeader>

        <div className="features">
          {featured.map((project, index) => (
            <article
              className={`feature reveal ${index % 2 ? "feature--flip" : ""}`.trim()}
              key={project.id}
              aria-labelledby={`${project.id}-title`}
            >
              <div className="feature__media">
                <ProjectMedia media={project.media} eager={index === 0} />
              </div>

              <div className="feature__body">
                <p className="feature__context">
                  {project.context} · {project.period}
                </p>
                <h3 id={`${project.id}-title`} className="feature__title">
                  {project.title}
                </h3>
                <p className="feature__summary">{cleanText(project.summary)}</p>

                <dl className="specs">
                  {project.specs.map((spec) => (
                    <div key={spec.label}>
                      <dt>
                        {spec.value}
                        {spec.unit ? <small>{spec.unit}</small> : null}
                      </dt>
                      <dd>{spec.label}</dd>
                    </div>
                  ))}
                </dl>

                <ul className="tags" aria-label="Stack">
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>

                <div className="feature__actions">
                  <button type="button" className="btn btn--solid" onClick={() => onOpen(project)}>
                    Read case study
                  </button>
                  {project.links.github ? (
                    <a
                      className="link"
                      href={project.links.github}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <Github size={16} aria-hidden="true" />
                      Code
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  ) : null}
                  {project.links.upstream ? (
                    <a
                      className="link"
                      href={project.links.upstream}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {project.id === "iron-squid" ? "ROS 2 baseline" : "Upstream"}
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
