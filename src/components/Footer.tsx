import { ArrowUp, Github, Linkedin, Mail } from "lucide-react";
import { contact, person } from "../data/content";
import { isPlaceholder } from "./RichText";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Capabilities" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

export function Footer() {
  const hasEmail = !isPlaceholder(contact.email);

  return (
    <footer className="footer">
      <div className="shell footer__grid">
        <div className="footer__brand">
          <span className="brand__mark" aria-hidden="true">
            VV
          </span>
          <div>
            <p className="footer__name">{person.name}</p>
            <p>
              {person.role} · {person.location}
            </p>
          </div>
        </div>

        <nav className="footer__nav" aria-label="Footer">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="footer__social">
          {hasEmail ? (
            <a className="icon-btn icon-btn--dark" href={`mailto:${contact.email}`} aria-label="Email">
              <Mail size={18} aria-hidden="true" />
            </a>
          ) : null}
          <a
            className="icon-btn icon-btn--dark"
            href={contact.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="LinkedIn"
          >
            <Linkedin size={18} aria-hidden="true" />
          </a>
          <a
            className="icon-btn icon-btn--dark"
            href={contact.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
          >
            <Github size={18} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="shell footer__bottom">
        <p>
          © {new Date().getFullYear()} {person.name}. Built with React, TypeScript, and Canvas. No
          tracking.
        </p>
        <a className="link" href="#top">
          Back to top
          <ArrowUp size={14} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
