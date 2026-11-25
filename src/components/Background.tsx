import { ArrowUpRight } from "lucide-react";
import { education, experience, honors } from "../data/content";
import { SectionHeader } from "./SectionHeader";

export function Background() {
  return (
    <section className="section section--tint" id="experience" aria-labelledby="experience-title">
      <div className="shell">
        <SectionHeader id="experience-title" label="Experience" title="Leading a team, shipping on hardware." />

        <dl className="honors">
          {honors.map((honor) => (
            <div className="reveal" key={honor.label}>
              <dt>{honor.value}</dt>
              <dd>
                <strong>{honor.label}</strong>
                <span>{honor.detail}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="background__cols">
          <ol className="timeline">
            {experience.map((item) => (
              <li className="reveal" key={item.title}>
                <p className="timeline__period">{item.period}</p>
                <div>
                  <h3>{item.title}</h3>
                  <p className="timeline__org">{item.org}</p>
                  <ul className="timeline__points">
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  {item.links ? (
                    <p className="timeline__links">
                      {item.links.map((link) => (
                        <a
                          key={link.href}
                          className="link"
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {link.label}
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </a>
                      ))}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>

          <aside className="edu">
            <p className="label">Education</p>
            <h3>{education.org}</h3>
            <p className="edu__title">{education.title}</p>
            <p className="edu__period">
              {education.period} · {education.location}
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
