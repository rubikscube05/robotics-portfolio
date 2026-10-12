import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Code2,
  Github,
  Menu,
  MonitorPlay,
  Play,
  Settings2,
  X,
} from "lucide-react";
import {
  RoboticsScene,
  MissionSelector,
  TelemetryPanel,
  FlightRecorder,
  ProjectCaseStudy,
  PROJECTS,
  FALLBACK_MISSIONS,
  interpolateTelemetry,
  getProject,
  makeMission,
} from "./robotics_mission_control";
import type { AppState, DataSource, MissionData, Project } from "./robotics_mission_control";

const NAV_ITEMS: [string, string][] = [
  ["HOME", "hero"],
  ["MISSIONS", "missions"],
  ["ROBOTS", "robots"],
  ["PROJECTS", "projects"],
  ["STACK", "stack"],
  ["ABOUT", "about"],
];

const STACK = [
  ["Robotics", ["ROS 2", "Three.js", "Gazebo", "ArduPilot / PX4"]],
  ["Programming", ["C++", "Python", "TypeScript"]],
  ["Simulation", ["Mission Replay", "Telemetry Playback", "3D Visualization"]],
  ["Design", ["CAD", "3D Models", "Engineering Prototypes"]],
  ["Perception", ["Computer Vision", "Telemetry", "Sensor Data"]],
  ["Workflow", ["Git", "Linux", "Data-driven UI"]],
];

const SIMULATION_ASSETS = [
  ["UAV-01", "Quadrotor", "SIMULATION READY"],
  ["SQUID-01", "3-Leg Crawler", "SIMULATION READY"],
  ["ROVER-01", "Planetary Platform", "SIMULATION READY"],
];

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mb-7 border-b border-slate-800 pb-4">
          <div className="text-[10px] font-bold tracking-widest text-orange-400">{eyebrow}</div>
          <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
        </div>
        {children}
      </motion.div>
    </section>
  );
}

function App() {
  const [missions, setMissions] =
    useState<ReturnType<typeof makeMission>[]>(FALLBACK_MISSIONS);
  const [selectedMission, setSelectedMission] =
    useState<ReturnType<typeof makeMission> | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [engineeringMode, setEngineeringMode] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [view, setView] = useState<"SCROLL" | "MISSION_VIEW" | "CASE_STUDY">("SCROLL");

  useEffect(() => {
    let cancelled = false;

    async function loadRealData() {
      const loaded = await Promise.all(
        FALLBACK_MISSIONS.map(async (fallback, index) => {
          const fileName = `${fallback.projectId}.json`;
          try {
            const response = await fetch(`${import.meta.env.BASE_URL}data/${fileName}`, { cache: "no-store" });
            if (!response.ok) return fallback;
            const json = (await response.json()) as Partial<MissionData>;

            if (!json.telemetry || !Array.isArray(json.telemetry) || json.telemetry.length === 0)
              return fallback;

            const source: DataSource =
              json.dataSource === "real_flight" || json.dataSource === "rosbag"
                ? json.dataSource
                : "demo";

            return makeMission(index, {
              mission: fallback.id,
              robot: json.robot ?? fallback.robot,
              dataSource: source,
              duration: Number(json.duration ?? fallback.duration),
              telemetry: json.telemetry,
            });
          } catch {
            return fallback;
          }
        })
      );

      if (!cancelled) setMissions(loaded);
    }

    loadRealData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = view === "SCROLL" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [view]);

  const activeTelemetry = useMemo(
    () => (selectedMission ? interpolateTelemetry(selectedMission.telemetry, time) : null),
    [selectedMission, time]
  );

  const scrollToId = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenu(false);
  }, []);

  const openMission = useCallback((mission: ReturnType<typeof makeMission>) => {
    setSelectedMission(mission);
    setSelectedProject(PROJECTS.find((p) => p.id === mission.projectId) ?? null);
    setTime(0);
    setIsPlaying(true);
    setEngineeringMode(false);
    setView("MISSION_VIEW");
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (!isPlaying || !selectedMission) return;

    let raf = 0;
    let last = performance.now();
    let accumulator = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      accumulator += dt;

      if (accumulator >= 1 / 20) {
        accumulator = 0;
        setTime((previous) => {
          const next = previous + dt * 20;
          if (next >= selectedMission.duration) {
            setIsPlaying(false);
            return selectedMission.duration;
          }
          return next;
        });
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, selectedMission]);

  const projectForMission = getProject(selectedMission);

  const sceneState: AppState =
    view === "MISSION_VIEW" ? "MISSION_VIEW" : view === "CASE_STUDY" ? "CASE_STUDY" : "HERO";

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white selection:bg-orange-500/30">
      <div className="fixed inset-0 z-0">
        <RoboticsScene
          appState={sceneState}
          mission={selectedMission}
          time={time}
          engineeringMode={engineeringMode}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/80" />
      </div>

      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/5 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <button onClick={() => scrollToId("hero")} className="flex items-center gap-3 text-left">
            <span className="h-3 w-3 animate-pulse rounded-full bg-orange-500" />
            <span className="text-xs font-bold tracking-[0.18em] sm:text-sm">
              ROBOTICS / MISSION CONTROL
            </span>
          </button>

          <nav className="hidden items-center gap-5 text-xs font-bold tracking-wider text-slate-300 md:flex">
            {NAV_ITEMS.map(([label, id]) => (
              <button key={id} onClick={() => scrollToId(id)} className="hover:text-orange-400">
                {label}
              </button>
            ))}
          </nav>

          <button
            aria-label="Open navigation"
            onClick={() => setMobileMenu((v) => !v)}
            className="rounded-lg border border-white/10 bg-black/45 p-2 md:hidden"
          >
            {mobileMenu ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-3 mb-3 rounded-xl border border-slate-800 bg-black/90 p-3 shadow-2xl backdrop-blur-xl md:hidden"
            >
              {NAV_ITEMS.map(([label, id]) => (
                <button
                  key={id}
                  onClick={() => scrollToId(id)}
                  className="block w-full rounded-lg px-3 py-3 text-left text-xs font-bold tracking-wider text-slate-200 hover:bg-slate-800"
                >
                  {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10">
        <section
          id="hero"
          className="flex min-h-[86vh] scroll-mt-20 items-center justify-center px-5 pb-16 pt-28"
        >
          <div className="max-w-5xl text-center">
            <div className="mb-4 text-[10px] font-bold tracking-[0.28em] text-orange-300 sm:text-xs">
              OUTDOOR ROBOTICS TEST FIELD // DEMO SIMULATION
            </div>
            <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white drop-shadow-2xl sm:text-6xl lg:text-7xl">
              I BUILD MACHINES
              <br />
              <span className="text-orange-500">THAT MOVE.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
              A robotics engineering portfolio built around machines, mission replay, telemetry,
              simulation, and physical systems.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => scrollToId("missions")}
                className="flex items-center justify-center gap-3 rounded-lg bg-orange-600 px-6 py-3.5 text-sm font-bold tracking-wider shadow-lg shadow-orange-950/40 hover:bg-orange-500"
              >
                <MonitorPlay size={18} /> ENTER MISSION CONTROL
              </button>
              <button
                onClick={() => openMission(missions[0])}
                className="flex items-center justify-center gap-3 rounded-lg border border-white/15 bg-black/45 px-6 py-3.5 text-sm font-bold tracking-wider backdrop-blur hover:bg-black/65"
              >
                <Play size={18} /> QUICK LAUNCH
              </button>
            </div>
          </div>
        </section>

        <Section id="missions" eyebrow="MISSION CONTROL" title="MISSIONS">
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="rounded-2xl border border-slate-800 bg-black/80 p-5 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider">
                <Settings2 size={17} className="text-orange-400" /> SIMULATION ASSETS
              </div>
              <div className="space-y-2">
                {SIMULATION_ASSETS.map(([id, type, status]) => (
                  <div
                    key={id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/70 p-3"
                  >
                    <div>
                      <div className="text-sm font-bold">{id}</div>
                      <div className="text-[10px] text-slate-500">{type}</div>
                    </div>
                    <span className="text-[10px] text-orange-300">{status}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[10px] font-bold text-amber-300">
                STATUS: DEMO SIMULATION
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-black/80 p-5 backdrop-blur-xl">
              <div className="mb-3 text-[10px] font-bold tracking-wider text-slate-400">
                FLIGHT LOGS
              </div>
              <MissionSelector
                missions={missions}
                selectedMission={selectedMission}
                onSelect={openMission}
              />
            </div>
          </div>
        </Section>

        <Section id="robots" eyebrow="ENGINEERING PLATFORMS" title="ROBOTS">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.filter((p) => p.model).map((project) => {
              const mission = missions.find((m) => m.projectId === project.id);
              return (
                <div
                  key={project.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-800 bg-black/80 p-5 backdrop-blur-xl transition hover:border-orange-500/60"
                >
                  <div>
                    <div className="mb-2 text-[10px] font-bold tracking-wider text-orange-400">
                      {project.category}
                    </div>
                    <h3 className="text-lg font-bold">{project.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{project.description}</p>
                  </div>
                  {mission && (
                    <button
                      onClick={() => openMission(mission)}
                      className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-slate-800 py-2.5 text-xs font-bold hover:bg-orange-600"
                    >
                      <MonitorPlay size={15} /> LAUNCH MISSION
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        <Section id="projects" eyebrow="PROJECT ARCHIVE" title="CASE STUDIES">
          <div className="grid gap-4 md:grid-cols-2">
            {PROJECTS.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  setSelectedProject(project);
                  setSelectedMission(
                    missions.find((m) => m.projectId === project.id) ?? null
                  );
                  setView("CASE_STUDY");
                  window.scrollTo({ top: 0, behavior: "auto" });
                }}
                className="rounded-xl border border-slate-800 bg-black/80 p-5 text-left backdrop-blur-xl transition hover:border-orange-500/60"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold tracking-wider text-orange-400">
                    {project.category}
                  </span>
                  <span className="text-[10px] text-cyan-300">{project.status}</span>
                </div>
                <h3 className="mt-2 text-xl font-bold">{project.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{project.description}</p>
              </button>
            ))}
          </div>
        </Section>

        <Section id="stack" eyebrow="ENGINEERING TOOLCHAIN" title="STACK">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STACK.map(([name, items]) => (
              <div
                key={String(name)}
                className="rounded-xl border border-slate-800 bg-black/80 p-5 backdrop-blur-xl"
              >
                <h3 className="mb-4 text-sm font-bold text-orange-400">{name}</h3>
                <div className="flex flex-wrap gap-2">
                  {(items as string[]).map((item) => (
                    <span
                      key={item}
                      className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-cyan-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="about" eyebrow="WORKFLOW" title="FROM MODEL TO MACHINE">
          <div className="space-y-5 rounded-2xl border border-slate-800 bg-black/80 p-6 text-sm leading-7 text-slate-300 backdrop-blur-xl">
            <p className="text-lg font-medium text-white">
              The portfolio is organized around machines rather than generic software-project cards.
            </p>
            <div className="grid gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-5 font-mono text-sm text-cyan-300 sm:grid-cols-5">
              <span>DESIGN</span>
              <span className="hidden sm:block">→</span>
              <span>SIMULATION</span>
              <span className="hidden sm:block">→</span>
              <span>HARDWARE / DATA</span>
            </div>
            <p>
              Mission playback is data-driven. Demo telemetry is kept visibly separate from future
              real-flight and ROS 2 recordings, so the visualization can become a genuine
              engineering portfolio as actual logs and models are added.
            </p>
          </div>
        </Section>

        <footer className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 sm:flex-row">
            <span className="text-xs text-slate-500">
              Vaibhav Vishwakarma — Robotics, autonomous systems, aerial robotics.
            </span>
            <div className="flex items-center gap-4 text-xs font-bold">
              <a
                href="https://github.com/rubikscube05"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-orange-400"
              >
                <Github size={16} /> GITHUB
              </a>
              <a
                href="https://www.thingiverse.com/vaibhavh24/designs"
                target="_blank"
                rel="noreferrer"
                className="text-slate-300 hover:text-orange-400"
              >
                THINGIVERSE
              </a>
            </div>
          </div>
          <p className="mt-4 text-center text-[10px] leading-relaxed text-slate-600 sm:text-left">
            Landing-scene 3D credit: &ldquo;ODIN Win Hit &mdash; QUAD FPV Tailsitter interceptor&rdquo; by
            FLIGHTCLUB (@flightclubua), licensed under CC BY 4.0.
          </p>
        </footer>
      </main>

      <AnimatePresence>
        {view === "MISSION_VIEW" && selectedMission && (
          <motion.div
            key="mission-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-30"
          >
            <div className="pointer-events-auto absolute right-3 top-20 z-20 flex max-w-[calc(100%-1.5rem)] flex-wrap justify-end gap-2 sm:right-6">
              <button
                onClick={() => setEngineeringMode((v) => !v)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold backdrop-blur ${
                  engineeringMode
                    ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300"
                    : "border-slate-700 bg-black/55 text-slate-300"
                }`}
              >
                <Code2 size={15} /> ENG VIEW {engineeringMode ? "ON" : "OFF"}
              </button>
              <button
                onClick={() => {
                  setSelectedProject(projectForMission);
                  setIsPlaying(false);
                  setView("CASE_STUDY");
                }}
                className="flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-xs font-bold hover:bg-orange-500"
              >
                <Activity size={15} /> VIEW PROJECT
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setView("SCROLL");
                }}
                className="rounded-lg border border-slate-700 bg-black/55 px-3 py-2 text-xs font-bold text-slate-200 backdrop-blur"
              >
                EXIT
              </button>
            </div>

            {engineeringMode && (
              <div className="pointer-events-auto absolute left-3 top-20 z-20 sm:left-6">
                <div className="rounded-lg border border-cyan-500/30 bg-slate-950/80 px-3 py-2 text-[10px] font-mono backdrop-blur">
                  <div className="font-bold tracking-wider text-cyan-300">ENGINEERING VIEW</div>
                  <div className="mt-1 text-slate-400">
                    X / Y / Z frame • trajectory • robot orientation
                  </div>
                </div>
              </div>
            )}

            <div className="pointer-events-auto absolute right-3 top-36 z-20 w-[calc(100%-1.5rem)] max-w-xs sm:right-6 sm:w-72">
              <TelemetryPanel mission={selectedMission} sample={activeTelemetry} time={time} />
            </div>

            <div className="pointer-events-auto absolute bottom-3 left-1/2 z-20 flex w-[calc(100%-1rem)] -translate-x-1/2 justify-center sm:bottom-6 sm:w-[calc(100%-3rem)]">
              <FlightRecorder
                mission={selectedMission}
                time={time}
                setTime={setTime}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
              />
            </div>
          </motion.div>
        )}

        {view === "CASE_STUDY" && selectedProject && (
          <ProjectCaseStudy
            key="case-study"
            project={selectedProject}
            mission={selectedMission}
            onClose={() => setView(selectedMission ? "MISSION_VIEW" : "SCROLL")}
            onLaunch={() => selectedMission && openMission(selectedMission)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
