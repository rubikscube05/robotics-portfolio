import { ArrowDownRight, Download, Github, Linkedin } from "lucide-react";
import { heroStats, person, proof } from "../data/content";
import { ArmCanvas } from "./ArmCanvas";

export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="shell hero__grid">
        <div className="hero__copy">
          <p className="label label--on-dark">
            {person.role} · {person.affiliation}
          </p>
          <h1 id="hero-title" className="hero__name">
            <span>{person.firstName}</span>
            <span>{person.lastName}</span>
          </h1>
          <p className="hero__headline">{person.headline}</p>
          <p className="hero__intro">{person.intro}</p>

          <div className="hero__actions">
            <a className="btn btn--primary" href="#work">
              See the work
              <ArrowDownRight size={17} aria-hidden="true" />
            </a>
            <a className="btn btn--ghost-dark" href={person.resumeUrl} download>
              Résumé
              <Download size={16} aria-hidden="true" />
            </a>
            <a
              className="icon-btn icon-btn--dark"
              href={person.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub profile"
            >
              <Github size={18} aria-hidden="true" />
            </a>
            <a
              className="icon-btn icon-btn--dark"
              href={person.linkedinUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LinkedIn profile"
            >
              <Linkedin size={18} aria-hidden="true" />
            </a>
          </div>
        </div>

        <ArmCanvas />
      </div>

      <div className="shell">
        <dl className="hero__stats">
          {heroStats.map((stat) => (
            <div key={stat.label}>
              <dt>
                {stat.value}
                {stat.unit ? <small>{stat.unit}</small> : null}
              </dt>
              <dd>{stat.label}</dd>
            </div>
          ))}
        </dl>
        <div className="proof">
          <p className="proof__label">Competed and contributed at</p>
          <ul className="proof__list">
            {proof.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
