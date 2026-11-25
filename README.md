# Vaibhav Vishwakarma — Robotics Portfolio

A fast, single-page robotics portfolio: an interactive robot-arm hero, four featured systems with real footage and spec figures, a grid of smaller projects, and case-study dialogs. Light and dark themes follow the visitor's system setting.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 (design tokens and custom components live in `src/index.css`)
- Lucide React icons
- Self-hosted Inter and JetBrains Mono fonts
- Canvas 2D trajectory visualisation, no 3D runtime
- GitHub Actions for Pages deployment, plus a Vercel config

No analytics, cookies, or third-party tracking scripts.

## Run locally

```bash
npm install
npm run dev
```

```bash
npm run build      # typecheck + production build
npm run preview    # preview the production build
npm run typecheck  # TypeScript only
```

## Deployment

### GitHub Pages

The workflow at `.github/workflows/deploy.yml` builds and deploys on pushes to `main`.

1. Push the repository to GitHub.
2. In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
3. Push to `main` or run the workflow manually.

`vite.config.ts` sets the base path to `/<repository-name>/` automatically when `GITHUB_ACTIONS=true`. The expected URL is:

`https://rubikscube05.github.io/robotics-portfolio/`

If you use a custom domain or Vercel, update the canonical/OG URLs in `index.html`, `src/data/content.ts` (`siteMeta`), `public/sitemap.xml`, and `public/robots.txt`.

### Vercel

Import the repository and use the included `vercel.json`. Build command: `npm run build`; output: `dist`.

## Editing content

All copy and links are in `src/data/content.ts`. Keep the following rules:

- Do not invent achievements, metrics, employers, dates, or awards.
- Leave unknown facts as `[ADD: ...]` placeholders; see `CONTENT_TODO.md`.
- Project case studies follow **Problem → My role → Approach & tech → Result → Links**.
- Prefer outcomes and evidence over buzzwords. Keep card copy to 3–5 lines.
- Replace `public/resume.pdf` with the real résumé before publishing.
- Project media slots accept a real image URL via `mediaUrl`; otherwise the built-in line-art placeholder is shown.

## Project structure

```text
src/
  App.tsx                  page composition and modal state
  data/content.ts          person, projects, specs, skills, timeline
  components/
    Header.tsx             sticky nav, mobile menu, theme toggle
    Hero.tsx               name, intro, CTAs, proof strip
    ArmCanvas.tsx          interactive 3-DoF arm (closed-form IK, pick and place)
    FeaturedWork.tsx       four featured systems
    MoreWork.tsx           smaller projects grid
    ProjectMedia.tsx       video / image / schematic media
    Schematic.tsx          theme-aware line drawings
    ProjectModal.tsx       native <dialog> case study
    About.tsx              story and working principles
    Skills.tsx             capability cards with icons
    Background.tsx         experience timeline, honours, education
    Contact.tsx, Footer.tsx
    SectionHeader.tsx, RichText.tsx (hides [ADD: …] tokens)
  hooks/
    useTheme.ts
    useActiveSection.ts
  index.css                tokens, layout, responsive, reduced motion
public/media/              self-hosted project footage and images
public/                    favicon, OG image, manifest, robots, sitemap, résumé
```

## Accessibility and privacy

- Semantic landmarks, one `h1`, skip link, visible focus states.
- All interactive targets are at least 44×44 CSS px at audited widths (375, 768, 1440).
- Native `<dialog>` handles focus trapping; focus returns to the opening card on close.
- `prefers-reduced-motion` disables the trajectory loop and CSS entrance motion.
- Theme preference is stored in `localStorage`; nothing is sent to a server.
- The contact form only composes a `mailto:` link; it does not submit to a backend.

## Verified

- `npm run build` passes with TypeScript clean.
- GitHub Pages base-path build rewrites JS, CSS, fonts, and public assets correctly.
- Lighthouse (mobile and desktop): **100 performance, 100 accessibility, 100 best practices, 100 SEO**.
- axe-core: **0 violations** in dark and light themes at 375/768/1440.
- No horizontal overflow at 320/375/768/1440/1920.
