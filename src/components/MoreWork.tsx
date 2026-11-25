import { ArrowUpRight } from "lucide-react";
import { person, projects, type Project } from "../data/content";
import { ProjectMedia } from "./ProjectMedia";
import { cleanText } from "./RichText";
import { SectionHeader } from "./SectionHeader";

type Props = { onOpen: (project: Project) => void };

export function MoreWork({ onOpen }: Props) {
  const rest = projects.filter((project) => !project.featured);

  return (
    <section className="section section--tint" id="projects" aria-labelledby="projects-title">
      <div className="shell">
        <SectionHeader id="projects-title" label="More projects" title="Firmware, legged robots, and tools.">
          <p>
            Embedded control, robot learning, multi-agent simulation, and design tooling.{" "}
            <a className="link" href={person.githubUrl} target="_blank" rel="noreferrer noopener">
              All repositories
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </p>
        </SectionHeader>

        <ul className="cards">
          {rest.map((project) => {
            const external = project.links.demo;
            return (
              <li className="card reveal" key={project.id}>
                <button
                  type="button"
                  className="card__hit"
                  onClick={() => onOpen(project)}
                  aria-label={`Open case study: ${project.title}`}
                />
                <div className="card__media">
                  <ProjectMedia media={project.media} />
                </div>
                <div className="card__body">
                  <p className="card__context">{project.category}</p>
                  <h3 className="card__title">{project.title}</h3>
                  <p className="card__summary">{cleanText(project.summary)}</p>
                  <div className="card__foot">
                    <ul className="tags tags--small" aria-label="Stack">
                      {project.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                    {external ? (
                      <a
                        className="card__ext link"
                        href={external}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        Live
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
