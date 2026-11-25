import { useState } from "react";
import { About } from "./components/About";
import { Background } from "./components/Background";
import { Contact } from "./components/Contact";
import { FeaturedWork } from "./components/FeaturedWork";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { MoreWork } from "./components/MoreWork";
import { ProjectModal } from "./components/ProjectModal";
import { Skills } from "./components/Skills";
import type { Project } from "./data/content";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main id="main">
        <Hero />
        <FeaturedWork onOpen={setActiveProject} />
        <About />
        <MoreWork onOpen={setActiveProject} />
        <Skills />
        <Background />
        <Contact />
      </main>

      <Footer />

      {activeProject ? (
        <ProjectModal
          key={activeProject.id}
          project={activeProject}
          onClose={() => setActiveProject(null)}
        />
      ) : null}
    </>
  );
}
