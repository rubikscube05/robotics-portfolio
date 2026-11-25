import { ArrowUpRight, Download, Github, Linkedin, Mail } from "lucide-react";
import { contact, person } from "../data/content";
import { isPlaceholder } from "./RichText";

export function Contact() {
  const hasEmail = !isPlaceholder(contact.email);

  return (
    <section className="contact" id="contact" aria-labelledby="contact-title">
      <div className="shell contact__inner">
        <div className="reveal">
          <p className="label label--on-dark">Contact</p>
          <h2 id="contact-title" className="contact__title">
            Building something that has to move on its own?
          </h2>
          <p className="contact__lead">
            I am open to robotics roles, internships, and research work in autonomy, manipulation,
            and robot learning.
          </p>
          <div className="contact__cta">
            {hasEmail ? (
              <a className="btn btn--primary btn--large" href={`mailto:${contact.email}`}>
                <Mail size={18} aria-hidden="true" />
                Email me
              </a>
            ) : null}
            <a className="btn btn--ghost-dark btn--large" href={contact.resume} download>
              <Download size={18} aria-hidden="true" />
              Download résumé
            </a>
          </div>
          {hasEmail ? (
            <p className="contact__email">
              <span>Or copy the address:</span> <span className="mono">{contact.email}</span>
            </p>
          ) : null}
        </div>

        <ul className="contact__links reveal">
          <li>
            <a href={contact.linkedin} target="_blank" rel="noreferrer noopener">
              <Linkedin size={18} aria-hidden="true" />
              <span>LinkedIn</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </li>
          <li>
            <a href={contact.github} target="_blank" rel="noreferrer noopener">
              <Github size={18} aria-hidden="true" />
              <span>github.com/{person.githubUsername}</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </li>
          <li>
            <a href="https://github.com/ArduPilot/ardupilot/pulls?q=author%3Arubikscube05" target="_blank" rel="noreferrer noopener">
              <Github size={18} aria-hidden="true" />
              <span>ArduPilot contributions</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
