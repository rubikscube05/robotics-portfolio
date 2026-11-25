import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Download,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { person, type Theme } from "../data/content";
import { useActiveSection } from "../hooks/useActiveSection";


const NAV_ITEMS = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;

const SECTION_IDS = ["top", ...NAV_ITEMS.map((item) => item.id)];

type HeaderProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(SECTION_IDS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 900) setMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="site-header__inner">
        <a className="brand" href="#top" onClick={closeMenu}>
          <span className="brand__mark">VV</span>{" "}
          <span className="brand__name">Vaibhav Vishwakarma</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-link ${
                active === item.id ? "is-active" : ""
              }`.trim()}
              aria-current={active === item.id ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="icon-button"
            onClick={onToggleTheme}
            aria-label={
              theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            title={
              theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
          >
            {theme === "dark" ? (
              <Sun size={18} aria-hidden="true" />
            ) : (
              <Moon size={18} aria-hidden="true" />
            )}
          </button>

          <a
            className="btn btn--small btn--outline header-resume"
            href={person.resumeUrl}
            download
          >
            Résumé
            <Download size={14} aria-hidden="true" />
          </a>

          <button
            type="button"
            className="icon-button menu-button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="mobile-nav-wrap" id="mobile-nav">
          <nav className="mobile-nav" aria-label="Mobile primary">
            {NAV_ITEMS.map((item, index) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`mobile-nav__link ${
                  active === item.id ? "is-active" : ""
                }`.trim()}
                aria-current={active === item.id ? "location" : undefined}
                onClick={closeMenu}
              >
                <span className="mono">0{index + 1}</span>
                {item.label}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            ))}
            <a
              className="btn btn--primary mobile-nav__resume"
              href={person.resumeUrl}
              download
              onClick={closeMenu}
            >
              Download résumé
              <Download size={16} aria-hidden="true" />
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
