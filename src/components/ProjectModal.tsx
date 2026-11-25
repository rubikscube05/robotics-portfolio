import { useEffect, useRef, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Github, X } from "lucide-react";
import type { Project } from "../data/content";
import { ProjectMedia } from "./ProjectMedia";
import { cleanText } from "./RichText";

type ProjectModalProps = {
  project: Project;
  onClose: () => void;
};

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
      trigger?.focus();
    };
  }, []);

  const onBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const sections = [
    { title: "Problem", text: project.problem },
    { title: "My role", text: project.role },
    { title: "Approach", text: project.approach },
    { title: "Result", text: project.result },
  ]
    .map((section) => ({ ...section, text: cleanText(section.text) }))
    .filter((section) => section.text.length > 0);

  const links = [
    project.links.github && { href: project.links.github, label: "Repository", icon: true },
    project.links.upstream && {
      href: project.links.upstream,
      label: project.id === "iron-squid" ? "ROS 2 baseline" : "Upstream",
      icon: false,
    },
    project.links.demo && { href: project.links.demo, label: "Live demo", icon: false },
  ].filter(Boolean) as { href: string; label: string; icon: boolean }[];

  return createPortal(
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby={`dialog-${project.id}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={onBackdrop}
    >
      <div className="dialog__panel">
        <header className="dialog__head">
          <div>
            <p className="label">
              {project.context} · {project.period}
            </p>
            <h2 id={`dialog-${project.id}`}>{project.title}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close case study"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {project.gallery?.length ? null : (
          <div className="dialog__media">
            <ProjectMedia media={project.media} eager />
          </div>
        )}

        {project.gallery?.length ? (
          <div className="gallery">
            {project.gallery.map((item) => (
              <figure key={item.src}>
                <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
                <figcaption>{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        ) : null}

        <dl className="specs specs--dialog">
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

        <div className="dialog__body">
          <div className="dialog__text">
            {sections.map((section) => (
              <section key={section.title}>
                <h3>{section.title}</h3>
                <p>{section.text}</p>
              </section>
            ))}
          </div>

          <aside className="dialog__aside">
            <h3>Pipeline</h3>
            <ol className="pipeline">
              {project.pipeline.map((step) => (
                <li key={step}>{cleanText(step)}</li>
              ))}
            </ol>

            {links.length ? (
              <>
                <h3>Links</h3>
                <ul className="dialog__links">
                  {links.map((link) => (
                    <li key={link.href}>
                      <a className="link" href={link.href} target="_blank" rel="noreferrer noopener">
                        {link.icon ? <Github size={15} aria-hidden="true" /> : null}
                        {link.label}
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </aside>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
