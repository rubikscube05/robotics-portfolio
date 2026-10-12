import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  Box,
  ChevronRight,
  Code2,
  Crosshair,
  Github,
  Layers,
  Menu,
  MonitorPlay,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  X,
} from "lucide-react";

// Vite serves public/ under the configured base path (e.g. /robotics-portfolio/).
// Prefixing keeps /models and /data URLs working in dev, preview and the deployed site.
const assetUrl = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, "")}`;

/* ==========================================================================
   ROBOTICS MISSION CONTROL — DROP-IN SINGLE FILE
   - Demo telemetry is explicitly labeled DEMO SIMULATION.
   - Real JSON/ROS 2 data can replace demo data without changing the renderer.
   - Local GLB/GLTF models are loaded when present; engineering placeholders
     remain clearly marked when they are not.
   ========================================================================== */

export type AppState =
  | "HERO"
  | "MISSION_CONTROL"
  | "MISSION_VIEW"
  | "CASE_STUDY"
  | "ROBOT_GALLERY"
  | "PROJECTS_LIST"
  | "STACK"
  | "ABOUT";

export type DataSource = "demo" | "real_flight" | "rosbag";

export interface TelemetryPoint {
  time: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  altitude?: number;
  velocity?: number;
  heading?: number;
  state?: string;
  joints?: Record<string, number>;
}

export interface MissionData {
  mission: string;
  robot: string;
  dataSource: DataSource;
  duration: number;
  telemetry: TelemetryPoint[];
}

interface ProjectMedia {
  images?: string[];
  videos?: string[];
  cad?: string[];
  diagrams?: string[];
}

interface ProjectLinks {
  github?: string;
  thingiverse?: string;
  docs?: string;
  video?: string;
  report?: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  status: string;
  objective?: string;
  hardware?: string;
  sensors?: string;
  software?: string;
  control?: string;
  simulation?: string;
  challenges?: string;
  media?: ProjectMedia;
  links?: ProjectLinks;
  model?: "drone" | "squid" | "rover";
}

const DATA_NOT_PROVIDED = "DATA NOT PROVIDED";

const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  demo: "DEMO SIMULATION",
  real_flight: "REAL FLIGHT DATA",
  rosbag: "ROS 2 BAG RECORDING",
};

/*
 * The old file contained generated engineering claims and example GitHub URLs.
 * They are deliberately not repeated here. Replace DATA NOT PROVIDED fields
 * with verified project information and real links when supplied.
 */
export const PROJECTS: Project[] = [
  {
    id: "squid-robot",
    title: "IRON-SQUID — Triradial Tendon-Driven Robot",
    category: "Bio-Inspired Robotics",
    status: "Simulation / Prototype",
    description:
      "ROS 2 + Gazebo framework for a triradial, tendon-driven robotic platform with three flexible tendon-actuated arms, custom inverse kinematics and Central Pattern Generator locomotion.",
    objective:
      "Investigate biomimetic omnidirectional locomotion using three flexible tendon-driven arms instead of conventional rigid robotic legs.",
    hardware:
      "Triradial platform: 3 radial arms × 20 sections, 120 controlled joints, 3 tendons per arm (9 tendon commands); fully parametric OpenSCAD geometry.",
    sensors: DATA_NOT_PROVIDED,
    software:
      "ROS 2 Jazzy, Gazebo Harmonic, procedural Python URDF generator, ros2_control (gz_ros2_control), OpenSCAD.",
    control:
      "Central Pattern Generator gait generator: /cmd_vel (geometry_msgs/Twist) → CPG → arm bending → tendon IK → 9 tendon commands; 30 Hz control loop, 1 Hz stroke.",
    simulation:
      "Gazebo Harmonic physics with separate single-arm and full-robot launch modes.",
    challenges: DATA_NOT_PROVIDED,
    model: "squid",
    links: {
      github: "https://github.com/rubikscube05/iron-squid",
    },
    media: {},
  },
  {
    id: "autonomous-landing",
    title: "IRoC-U26 — Autonomous Mars Precision Landing",
    category: "Aerial Robotics",
    status: "Simulation",
    description:
      "Autonomous marker-based precision landing system built for the ISRO Robotics Challenge (IRoC-U 2026), landing a UAV on a simulated Martian surface using ArUco detection.",
    objective:
      "Achieve autonomous, vision-based precision landing on a designated marker from a moving aerial approach over Martian terrain.",
    hardware:
      "Iris quadrotor with a downward-facing gimbal camera; portable Docker-based simulation stack.",
    sensors:
      "Downward-facing gimbal camera feeding OpenCV-based ArUco marker detection for relative pose estimation.",
    software:
      "ROS 2 Humble, Gazebo Harmonic, ArduPilot SITL, MAVROS, ros_gz bridge, OpenCV, Docker.",
    control:
      "Adaptive PID precision-landing controller that converts detected marker pose into velocity setpoints streamed through MAVROS.",
    simulation:
      "Gazebo Harmonic Mars world with ArduPilot SITL and the Iris airframe.",
    challenges: DATA_NOT_PROVIDED,
    model: "drone",
    links: {
      github: "https://github.com/rubikscube05/IRoC-U-26-precision-landing",
    },
    media: {},
  },
  {
    id: "gps-drone",
    title: "GPS-Denied Autonomous Navigation",
    category: "Autonomous Systems",
    status: "Simulation",
    description:
      "Simulation environment for GPS-denied autonomous navigation of a multi-agent drone fleet using a wireless mesh topology and vision-based perception.",
    objective:
      "Test autonomous multi-agent drone navigation without satellite positioning, relying on mesh communication and localized, camera-based perception.",
    hardware:
      "Three distinct simulated airframes (Marky, DeeDee, Joey) each carrying a Raspberry Pi Camera V2 payload.",
    sensors:
      "Raspberry Pi Camera Module V2 (forward/downward) plus simulated range sensing for relative localization.",
    software:
      "ROS 2 Jazzy, Gazebo Harmonic, ArduPilot SITL, MAVROS, ros_gz bridge, custom robofest ROS 2 package.",
    control:
      "Multi-MAVROS swarm launch with GPS_TYPE disabled in QGroundControl to force GPS-denied operation.",
    simulation:
      "robofest.sdf Gazebo world with an automated run_sim.sh boot sequence.",
    challenges: DATA_NOT_PROVIDED,
    model: "drone",
    links: {
      github: "https://github.com/rubikscube05/GPS-denied",
    },
    media: {},
  },
  {
    id: "swarm-coordination",
    title: "Multi-Drone Coordination / Drone Swarm",
    category: "Multi-Robot Systems",
    status: "Simulation",
    description:
      "Multi-UAV coordination project presented as a mission-level formation and trajectory replay across a mesh-networked fleet.",
    objective:
      "Explore coordinated multi-agent behaviour and mesh-topology communication across a fleet of simulated UAVs.",
    hardware: "Fleet of simulated airframes sharing a wireless mesh topology.",
    sensors: DATA_NOT_PROVIDED,
    software: "ROS 2 Jazzy, Gazebo Harmonic, ArduPilot SITL, MAVROS, ros_gz bridge.",
    control: "Coordinated multi-agent launch and formation control across the fleet.",
    simulation: "Shared Gazebo world with the multi-agent fleet.",
    challenges: DATA_NOT_PROVIDED,
    model: "drone",
    links: {
      github: "https://github.com/rubikscube05/GPS-denied",
    },
    media: {},
  },
  {
    id: "gesture-drone",
    title: "Gesture-Controlled UAV",
    category: "Human-Robot Interaction",
    status: "Prototype",
    description:
      "UAV interaction project in which computer-vision gesture input can be represented through recorded mission states.",
    objective: DATA_NOT_PROVIDED,
    hardware: DATA_NOT_PROVIDED,
    sensors: DATA_NOT_PROVIDED,
    software: DATA_NOT_PROVIDED,
    control: DATA_NOT_PROVIDED,
    simulation: DATA_NOT_PROVIDED,
    challenges: DATA_NOT_PROVIDED,
    model: "drone",
    links: {},
    media: {},
  },
  {
    id: "mars-rover",
    title: "Mars Autonomous Exploration Robot",
    category: "Planetary Robotics",
    status: "Simulation",
    description:
      "Planetary robotics project presented through a terrain-traversal mission replay.",
    objective: DATA_NOT_PROVIDED,
    hardware: DATA_NOT_PROVIDED,
    sensors: DATA_NOT_PROVIDED,
    software: DATA_NOT_PROVIDED,
    control: DATA_NOT_PROVIDED,
    simulation: DATA_NOT_PROVIDED,
    challenges: DATA_NOT_PROVIDED,
    model: "rover",
    links: {},
    media: {},
  },
  {
    id: "wall-writing-uav",
    title: "Wall-Writing UAV",
    category: "Aerial Manipulation",
    status: "Experimental",
    description:
      "Aerial manipulation concept for controlled interaction between a UAV and a vertical surface.",
    objective: DATA_NOT_PROVIDED,
    hardware: DATA_NOT_PROVIDED,
    sensors: DATA_NOT_PROVIDED,
    software: DATA_NOT_PROVIDED,
    control: DATA_NOT_PROVIDED,
    simulation: DATA_NOT_PROVIDED,
    challenges: DATA_NOT_PROVIDED,
    model: "drone",
    links: {},
    media: {},
  },
  {
    id: "mine-detection-uav",
    title: "Mine Detection UAV",
    category: "Aerial Survey Robotics",
    status: "Simulation / Development",
    description:
      "UAV survey concept represented through a replayable grid-scanning mission.",
    objective: DATA_NOT_PROVIDED,
    hardware: DATA_NOT_PROVIDED,
    sensors: DATA_NOT_PROVIDED,
    software: DATA_NOT_PROVIDED,
    control: DATA_NOT_PROVIDED,
    simulation: DATA_NOT_PROVIDED,
    challenges: DATA_NOT_PROVIDED,
    model: "drone",
    links: {},
    media: {},
  },
  {
    id: "stratviz",
    title: "StratViz — F1 Visual Analytics",
    category: "Data Visualization",
    status: "Completed",
    description:
      "Backend-free browser visual analytics app for Formula 1 data, with an interactive race replay, telemetry charts and season analysis powered by in-browser SQL.",
    objective:
      "Build a visual analytics web app that lets users explore F1 race and telemetry data entirely in the browser, without a backend server.",
    hardware: "Runs fully client-side in a modern web browser.",
    sensors: DATA_NOT_PROVIDED,
    software: "JavaScript, DuckDB-WASM for in-browser SQL, D3 charts, HTML canvas rendering.",
    control: DATA_NOT_PROVIDED,
    simulation:
      "Interactive replay and analysis over historical F1 Parquet datasets loaded client-side.",
    challenges: DATA_NOT_PROVIDED,
    links: {
      github: "https://github.com/rubikscube05/StratViz",
    },
    media: {},
  },
  {
    id: "compressive-strength-predictor",
    title: "Concrete Compressive Strength Predictor",
    category: "Machine Learning",
    status: "Completed",
    description:
      "Machine-learning application that predicts concrete compressive strength from mix ingredients and curing age, implementing the algorithms from scratch.",
    objective:
      "Predict concrete compressive strength from composition and age, and compare from-scratch ML models through an interactive desktop interface.",
    hardware: "Desktop application with a live graphical interface.",
    sensors: DATA_NOT_PROVIDED,
    software: "Python, NumPy, Pandas, Matplotlib and Tkinter — neural network, KNN and linear regression built from scratch.",
    control: DATA_NOT_PROVIDED,
    simulation:
      "Trains and evaluates models on the UCI concrete compressive strength dataset with real-time input prediction.",
    challenges: DATA_NOT_PROVIDED,
    links: {
      github: "https://github.com/rubikscube05/Compressive-Strength-Predictor",
    },
    media: {},
  },
  {
    id: "long-distance-uav",
    title: "Intelligent Long-Distance UAVs",
    category: "Aerial Robotics",
    status: "Design / Prototype",
    objective:
      "Design a compact, foldable, backpack-portable long-range UAV that combines centimetre-level RTK precision with high-speed obstacle avoidance and GPS-denied navigation.",
    description:
      "3D-printable hardware design for a long-endurance autonomous UAV platform blending RTK precision, 360° LiDAR obstacle avoidance and GPS-denied SLAM on a compact foldable frame.",
    hardware:
      "Compact foldable frame with high-tension arm locking to damp resonance; H7-class flight controller; 4S2P Li-ion pack (~5600–9000 mAh across eight high-discharge cells).",
    sensors:
      "M10 RTK GPS for centimetre accuracy, 360° 2D LiDAR (LD19 / RPLIDAR class) and Time-of-Flight sensors for obstacle avoidance and SLAM.",
    software:
      "ArduPilot or PX4 flight stack on an H7 flight controller, with SLAM for GPS-denied operation.",
    control:
      "PID control loops tuned to handle the increased inertia of the battery and LiDAR payload for precise autonomous braking and collision-free cruising.",
    simulation: DATA_NOT_PROVIDED,
    challenges:
      "Balancing high energy density against real-time spatial processing while keeping the frame foldable and free of mechanical resonance.",
    model: "drone",
    links: {
      thingiverse: "https://www.thingiverse.com/thing:7344739",
    },
    media: {},
  },
];

/* Explicit projectId mapping — no name matching hacks. */
const DEMO_MISSIONS: MissionData[] = [
  {
    mission: "mission-01",
    robot: "UAV-01",
    dataSource: "demo",
    duration: 20,
    telemetry: [
      { time: 0, position: [0, 0.2, 0], rotation: [0, 0, 0], altitude: 0, velocity: 0, heading: 0, state: "GROUND IDLE" },
      { time: 2, position: [0, 0.2, 0], rotation: [0, 0, 0], altitude: 0, velocity: 0, heading: 0, state: "ARMING" },
      { time: 4, position: [0, 5, 0], rotation: [0, 0, 0], altitude: 5, velocity: 2.5, heading: 0, state: "TAKEOFF" },
      { time: 7, position: [10, 8, -5], rotation: [0, -Math.PI / 4, 0], altitude: 8, velocity: 4.2, heading: 45, state: "WAYPOINT REACHED" },
      { time: 10, position: [20, 10, -15], rotation: [0, -Math.PI / 4, 0], altitude: 10, velocity: 5.1, heading: 45, state: "APPROACH" },
      { time: 14, position: [15, 6, -25], rotation: [0, Math.PI / 2, 0], altitude: 6, velocity: 3, heading: 90, state: "TARGET DETECTED" },
      { time: 17, position: [15, 2, -25], rotation: [0, Math.PI / 2, 0], altitude: 2, velocity: 1.5, heading: 90, state: "DESCENDING" },
      { time: 20, position: [15, 0.2, -25], rotation: [0, Math.PI / 2, 0], altitude: 0, velocity: 0, heading: 90, state: "LANDING COMPLETE" },
    ],
  },
  {
    mission: "mission-02",
    robot: "SQUID-01",
    dataSource: "demo",
    duration: 18,
    telemetry: [
      { time: 0, position: [-5, 0.3, 5], rotation: [0, Math.PI / 2, 0], altitude: 0, velocity: 0, heading: 90, state: "INITIALIZE" },
      { time: 3, position: [-3, 0.3, 5], rotation: [0, Math.PI / 2, 0], altitude: 0, velocity: 0.5, heading: 90, state: "GAIT START" },
      { time: 6, position: [0, 0.3, 5], rotation: [0, Math.PI / 2, 0], altitude: 0, velocity: 0.8, heading: 90, state: "WALK" },
      { time: 10, position: [4, 0.3, 3], rotation: [0, Math.PI / 4, 0], altitude: 0, velocity: 0.7, heading: 45, state: "TURN" },
      { time: 15, position: [8, 0.3, 0], rotation: [0, Math.PI / 4, 0], altitude: 0, velocity: 0.9, heading: 45, state: "WALK" },
      { time: 18, position: [10, 0.3, -2], rotation: [0, Math.PI / 4, 0], altitude: 0, velocity: 0, heading: 45, state: "STOP" },
    ],
  },
  {
    mission: "mission-03",
    robot: "UAV-01",
    dataSource: "demo",
    duration: 15,
    telemetry: [
      { time: 0, position: [0, 0.2, 0], rotation: [0, 0, 0], altitude: 0, velocity: 0, heading: 0, state: "GROUND IDLE" },
      { time: 3, position: [0, 12, 0], rotation: [0, 0, 0], altitude: 12, velocity: 3, heading: 0, state: "TAKEOFF" },
      { time: 8, position: [-15, 12, -20], rotation: [0, Math.PI, 0], altitude: 12, velocity: 6, heading: 180, state: "WAYPOINT 01" },
      { time: 12, position: [-25, 12, 10], rotation: [0, -Math.PI / 2, 0], altitude: 12, velocity: 5.5, heading: 270, state: "WAYPOINT 02" },
      { time: 15, position: [0, 0.2, 0], rotation: [0, 0, 0], altitude: 0, velocity: 0, heading: 0, state: "RTL LAND" },
    ],
  },
  {
    mission: "mission-04",
    robot: "UAV-01",
    dataSource: "demo",
    duration: 16,
    telemetry: [
      { time: 0, position: [0, 0.2, 0], rotation: [0, 0, 0], altitude: 0, velocity: 0, heading: 0, state: "STANDBY" },
      { time: 4, position: [0, 8, 0], rotation: [0, 0, 0], altitude: 8, velocity: 2, heading: 0, state: "SWARM LAUNCH" },
      { time: 10, position: [12, 8, -12], rotation: [0, Math.PI / 3, 0], altitude: 8, velocity: 4, heading: 60, state: "FORMATION SHIFT" },
      { time: 16, position: [0, 0.2, 0], rotation: [0, 0, 0], altitude: 0, velocity: 0, heading: 0, state: "SWARM LAND" },
    ],
  },
  {
    mission: "mission-05",
    robot: "UAV-01",
    dataSource: "demo",
    duration: 12,
    telemetry: [
      { time: 0, position: [0, 0.2, 0], rotation: [0, 0, 0], altitude: 0, velocity: 0, heading: 0, state: "DISARMED" },
      { time: 3, position: [0, 3, 0], rotation: [0, 0, 0], altitude: 3, velocity: 1, heading: 0, state: "HOVER" },
      { time: 8, position: [5, 4, 2], rotation: [0, Math.PI / 6, 0], altitude: 4, velocity: 2.2, heading: 30, state: "GESTURE FOLLOW" },
      { time: 12, position: [0, 0.2, 0], rotation: [0, 0, 0], altitude: 0, velocity: 0, heading: 0, state: "LANDED" },
    ],
  },
  {
    mission: "mission-06",
    robot: "ROVER-01",
    dataSource: "demo",
    duration: 15,
    telemetry: [
      { time: 0, position: [-10, 0.5, -10], rotation: [0, 0, 0], altitude: 0, velocity: 0, heading: 0, state: "INITIALIZE" },
      { time: 5, position: [-5, 0.8, -5], rotation: [0, Math.PI / 4, 0], altitude: 0, velocity: 0.4, heading: 45, state: "TRAVERSE" },
      { time: 10, position: [2, 1.2, 2], rotation: [0, Math.PI / 2, 0], altitude: 0, velocity: 0.6, heading: 90, state: "HAZARD MAPPING" },
      { time: 15, position: [10, 1, 10], rotation: [0, Math.PI, 0], altitude: 0, velocity: 0, heading: 180, state: "MISSION HALT" },
    ],
  },
  {
    mission: "mission-07",
    robot: "UAV-01",
    dataSource: "demo",
    duration: 14,
    telemetry: [
      { time: 0, position: [0, 0.2, 0], rotation: [0, 0, 0], altitude: 0, velocity: 0, heading: 0, state: "GROUND IDLE" },
      { time: 3, position: [5, 5, -18], rotation: [0, Math.PI / 2, 0], altitude: 5, velocity: 2, heading: 90, state: "APPROACH" },
      { time: 9, position: [5, 5, -20], rotation: [0, Math.PI / 2, 0], altitude: 5, velocity: 0.3, heading: 90, state: "SURFACE CONTACT" },
      { time: 14, position: [0, 0.2, 0], rotation: [0, 0, 0], altitude: 0, velocity: 0, heading: 0, state: "RETRACT & LAND" },
    ],
  },
  {
    mission: "mission-08",
    robot: "UAV-01",
    dataSource: "demo",
    duration: 18,
    telemetry: [
      { time: 0, position: [0, 0.2, 0], rotation: [0, 0, 0], altitude: 0, velocity: 0, heading: 0, state: "STANDBY" },
      { time: 4, position: [0, 4, 0], rotation: [0, 0, 0], altitude: 4, velocity: 2, heading: 0, state: "TAKEOFF" },
      { time: 10, position: [-12, 3.5, 12], rotation: [0, Math.PI, 0], altitude: 3.5, velocity: 3.5, heading: 180, state: "GRID SCAN" },
      { time: 18, position: [0, 0.2, 0], rotation: [0, 0, 0], altitude: 0, velocity: 0, heading: 0, state: "RETURN & LAND" },
    ],
  },
];

const MISSION_META = [
  ["mission-01", "AUTONOMOUS LANDING", "autonomous-landing", "UAV-01"],
  ["mission-02", "SQUID LOCOMOTION", "squid-robot", "SQUID-01"],
  ["mission-03", "GPS AUTONOMOUS FLIGHT", "gps-drone", "UAV-01"],
  ["mission-04", "MULTI-DRONE COORDINATION", "swarm-coordination", "UAV-01"],
  ["mission-05", "GESTURE-CONTROLLED UAV", "gesture-drone", "UAV-01"],
  ["mission-06", "MARS EXPLORATION", "mars-rover", "ROVER-01"],
  ["mission-07", "WALL-WRITING UAV", "wall-writing-uav", "UAV-01"],
  ["mission-08", "MINE DETECTION UAV", "mine-detection-uav", "UAV-01"],
] as const;

export function makeMission(index: number, demo: MissionData): MissionData & {
  id: string;
  title: string;
  projectId: string;
  description: string;
} {
  const [id, title, projectId, robot] = MISSION_META[index];
  return {
    ...demo,
    mission: id,
    robot,
    id,
    title: `MISSION ${String(index + 1).padStart(2, "0")} — ${title}`,
    projectId,
    description: `Replayable ${title.toLowerCase()} mission. Data provenance is shown explicitly.`,
  };
}

export const FALLBACK_MISSIONS = DEMO_MISSIONS.map((m, i) => makeMission(i, m));

export function interpolateTelemetry(data: TelemetryPoint[], time: number): TelemetryPoint | null {
  if (!data.length) return null;
  if (time <= data[0].time) return data[0];
  if (time >= data[data.length - 1].time) return data[data.length - 1];

  for (let i = 0; i < data.length - 1; i += 1) {
    const a = data[i];
    const b = data[i + 1];
    if (time >= a.time && time < b.time) {
      const t = (time - a.time) / Math.max(b.time - a.time, 0.0001);
      const lerpArray = (x?: number[], y?: number[]) =>
        x && y ? x.map((v, j) => v + (y[j] - v) * t) : undefined;

      return {
        time,
        position: lerpArray(a.position, b.position) as [number, number, number] | undefined,
        rotation: lerpArray(a.rotation, b.rotation) as [number, number, number] | undefined,
        altitude:
          a.altitude !== undefined && b.altitude !== undefined
            ? a.altitude + (b.altitude - a.altitude) * t
            : a.altitude,
        velocity:
          a.velocity !== undefined && b.velocity !== undefined
            ? a.velocity + (b.velocity - a.velocity) * t
            : a.velocity,
        heading:
          a.heading !== undefined && b.heading !== undefined
            ? a.heading + (b.heading - a.heading) * t
            : a.heading,
        state: a.state,
        joints: a.joints,
      };
    }
  }
  return data[0];
}

function sourceLabel(source: DataSource) {
  return DATA_SOURCE_LABELS[source];
}

/* ==========================================================================
   THREE.JS HELPERS
   ========================================================================== */

function disposeObject(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();

    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach((m) => m.dispose());
    else material?.dispose();
  });
}

/* --------------------------------------------------------------------------
   Procedural textures (canvas-based, no external assets required)
   -------------------------------------------------------------------------- */

function makeCanvas(size: number, height = size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext("2d")! };
}

function createGlowTexture() {
  const { canvas, ctx } = makeCanvas(128);
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.25, "rgba(255,255,255,0.7)");
  gradient.addColorStop(0.6, "rgba(255,255,255,0.18)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createGroundTexture() {
  const { canvas, ctx } = makeCanvas(512);
  ctx.fillStyle = "#2f5a33";
  ctx.fillRect(0, 0, 512, 512);

  // Broad patches of drier / darker grass for large-scale variation.
  for (let i = 0; i < 90; i += 1) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 24 + Math.random() * 70;
    const dry = Math.random() > 0.5;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    if (dry) {
      gradient.addColorStop(0, "rgba(150,140,74,0.28)");
      gradient.addColorStop(1, "rgba(150,140,74,0)");
    } else {
      gradient.addColorStop(0, "rgba(20,46,26,0.32)");
      gradient.addColorStop(1, "rgba(20,46,26,0)");
    }
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine blade speckle.
  for (let i = 0; i < 6000; i += 1) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 0.5 + Math.random() * 2.6;
    const g = Math.random();
    ctx.fillStyle = `rgba(${28 + g * 45}, ${74 + g * 80}, ${32 + g * 34}, 0.34)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pebbles / bare soil dots.
  for (let i = 0; i < 380; i += 1) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 0.8 + Math.random() * 2.2;
    const s = 90 + Math.random() * 70;
    ctx.fillStyle = `rgba(${s}, ${s - 8}, ${s - 22}, 0.5)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(22, 22);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createGroundNormalTexture() {
  const size = 256;
  const { canvas, ctx } = makeCanvas(size);

  // Fractal value noise used as a height field for the ground bumps.
  const cells = 24;
  const grid: number[][] = [];
  for (let i = 0; i <= cells; i += 1) {
    grid[i] = [];
    for (let j = 0; j <= cells; j += 1) grid[i][j] = Math.random();
  }
  const sample = (u: number, v: number) => {
    const mod = (n: number, m: number) => ((n % m) + m) % m;
    const gx = u * cells;
    const gy = v * cells;
    const x0 = mod(Math.floor(gx), cells);
    const y0 = mod(Math.floor(gy), cells);
    const x1 = mod(x0 + 1, cells);
    const y1 = mod(y0 + 1, cells);
    const fx = gx - Math.floor(gx);
    const fy = gy - Math.floor(gy);
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = grid[x0][y0];
    const b = grid[x1][y0];
    const c = grid[x0][y1];
    const d = grid[x1][y1];
    return (a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy;
  };
  const height = (u: number, v: number) =>
    sample(u, v) * 0.6 + sample(u * 2.3, v * 2.3) * 0.28 + sample(u * 4.9, v * 4.9) * 0.12;

  const image = ctx.createImageData(size, size);
  const strength = 1.6;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;
      const l = height((x - 1) / size, v);
      const r = height((x + 1) / size, v);
      const d = height(u, (y - 1) / size);
      const t = height(u, (y + 1) / size);
      let nx = (l - r) * strength;
      let ny = (d - t) * strength;
      let nz = 1;
      const len = Math.hypot(nx, ny, nz);
      nx /= len;
      ny /= len;
      nz /= len;
      const idx = (y * size + x) * 4;
      image.data[idx] = (nx * 0.5 + 0.5) * 255;
      image.data[idx + 1] = (ny * 0.5 + 0.5) * 255;
      image.data[idx + 2] = (nz * 0.5 + 0.5) * 255;
      image.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(22, 22);
  texture.anisotropy = 4;
  return texture;
}

function createGrassBladeTexture() {
  const { canvas, ctx } = makeCanvas(64, 128);
  ctx.clearRect(0, 0, 64, 128);

  const drawBlade = (cx: number, w: number, h: number, hue: number) => {
    const gradient = ctx.createLinearGradient(0, 128, 0, 128 - h);
    gradient.addColorStop(0, `hsl(${hue}, 48%, 16%)`);
    gradient.addColorStop(0.6, `hsl(${hue}, 58%, 34%)`);
    gradient.addColorStop(1, `hsl(${hue}, 62%, 54%)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(cx, 128);
    ctx.quadraticCurveTo(cx - w, 128 - h * 0.5, cx - w * 0.3, 128 - h);
    ctx.lineTo(cx + w * 0.3, 128 - h);
    ctx.quadraticCurveTo(cx + w, 128 - h * 0.5, cx, 128);
    ctx.closePath();
    ctx.fill();
  };

  drawBlade(18, 9, 108, 104);
  drawBlade(34, 11, 126, 112);
  drawBlade(49, 8, 98, 96);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createGrassTuftGeometry() {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const planes = 3;
  const width = 0.16;
  const height = 0.5;

  for (let p = 0; p < planes; p += 1) {
    const angle = (p / planes) * Math.PI;
    const dx = (Math.cos(angle) * width) / 2;
    const dz = (Math.sin(angle) * width) / 2;
    const base = positions.length / 3;
    positions.push(-dx, 0, -dz, dx, 0, dz, dx, height, dz, -dx, height, -dz);
    uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createBarkTexture() {
  const { canvas, ctx } = makeCanvas(64, 128);
  ctx.fillStyle = "#8a6a44";
  ctx.fillRect(0, 0, 64, 128);

  for (let i = 0; i < 90; i += 1) {
    const dark = Math.random() > 0.5;
    ctx.strokeStyle = dark
      ? `rgba(${52 + Math.random() * 34}, ${34 + Math.random() * 24}, ${16 + Math.random() * 14}, 0.6)`
      : `rgba(${150 + Math.random() * 60}, ${116 + Math.random() * 40}, ${70 + Math.random() * 30}, 0.35)`;
    ctx.lineWidth = 0.8 + Math.random() * 2.4;
    const x = Math.random() * 64;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(
      x + (Math.random() - 0.5) * 12,
      42,
      x + (Math.random() - 0.5) * 12,
      88,
      x + (Math.random() - 0.5) * 8,
      128
    );
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createFoliageTexture() {
  const { canvas, ctx } = makeCanvas(128);
  ctx.fillStyle = "#4f8f3a";
  ctx.fillRect(0, 0, 128, 128);

  for (let i = 0; i < 2600; i += 1) {
    const g = Math.random();
    ctx.fillStyle = `rgba(${44 + g * 70}, ${104 + g * 100}, ${38 + g * 50}, 0.5)`;
    ctx.beginPath();
    ctx.arc(Math.random() * 128, Math.random() * 128, 0.8 + Math.random() * 2.8, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createCarbonTexture() {
  const { canvas, ctx } = makeCanvas(64);
  ctx.fillStyle = "#15181d";
  ctx.fillRect(0, 0, 64, 64);

  for (let y = 0; y < 64; y += 8) {
    for (let x = 0; x < 64; x += 8) {
      ctx.fillStyle = (x / 8 + y / 8) % 2 === 0 ? "#262b32" : "#0d0f12";
      ctx.fillRect(x, y, 8, 8);
    }
  }
  for (let i = 0; i < 1600; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * 64, Math.random() * 64, 1, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createSunTexture() {
  const { canvas, ctx } = makeCanvas(256);
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(255,247,216,1)");
  gradient.addColorStop(0.22, "rgba(255,224,150,0.95)");
  gradient.addColorStop(0.5, "rgba(255,186,96,0.34)");
  gradient.addColorStop(1, "rgba(255,170,80,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createGradientSky() {
  const geometry = new THREE.SphereGeometry(220, 40, 20);
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color("#3a3f77") },
      middle: { value: new THREE.Color("#ff8f5a") },
      horizon: { value: new THREE.Color("#ffc46b") },
      ground: { value: new THREE.Color("#4a2e24") },
      sunDir: { value: new THREE.Vector3(-65, 22, -110).normalize() },
      sunColor: { value: new THREE.Color("#ffd28a") },
    },
    vertexShader: `
      varying vec3 vWorld;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorld = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 top;
      uniform vec3 middle;
      uniform vec3 horizon;
      uniform vec3 ground;
      uniform vec3 sunDir;
      uniform vec3 sunColor;
      varying vec3 vWorld;

      float hash(vec2 p) {
        return fract(sin(dot(floor(p), vec2(12.9898, 78.233))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main() {
        vec3 dir = normalize(vWorld);
        float h = dir.y;
        vec3 c = mix(horizon, middle, smoothstep(-0.08, 0.30, h));
        c = mix(c, top, smoothstep(0.28, 0.92, h));
        c = mix(ground, c, smoothstep(-0.22, -0.02, h));

        // Sun disc and its broad atmospheric scattering glow.
        float sun = max(dot(dir, normalize(sunDir)), 0.0);
        c += sunColor * pow(sun, 220.0) * 1.6;
        c += sunColor * pow(sun, 8.0) * 0.32;
        c += sunColor * pow(sun, 2.0) * 0.06;

        // Layered haze so the sky is not a flat gradient.
        float cloudBand = noise(dir.xz * 4.0 + dir.y * 3.0);
        c += (cloudBand - 0.5) * 0.03 * smoothstep(0.02, 0.45, h);
        float band = sin(h * 46.0 + vWorld.x * 0.02) * 0.5 + 0.5;
        c += (band - 0.5) * 0.010 * smoothstep(0.0, 0.4, h);
        gl_FragColor = vec4(c, 1.0);
      }
    `,
  });
  return new THREE.Mesh(geometry, material);
}

function createCloudTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.filter = "blur(9px)";

  // Stacked cumulus lobes, brighter on top, shaded underneath.
  const lobes = [
    [60, 74, 30], [92, 60, 38], [126, 54, 34], [158, 62, 36], [192, 72, 30],
    [78, 82, 26], [110, 84, 30], [146, 82, 28], [178, 84, 24],
  ];
  lobes.forEach(([x, y, r], i) => {
    const shade = i < 5 ? 0.9 : 0.78;
    ctx.fillStyle = `rgba(255,255,255,${shade})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Brighter sunlit highlights on the upper edges.
  ctx.filter = "blur(6px)";
  [[92, 46, 20], [126, 42, 18], [158, 48, 18]].forEach(([x, y, r]) => {
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createSun(scene: THREE.Scene) {
  const position = new THREE.Vector3(150, 18, -95);

  const geometry = new THREE.SphereGeometry(5, 32, 20);
  const material = new THREE.MeshBasicMaterial({ color: 0xffa94d });
  const sun = new THREE.Mesh(geometry, material);
  sun.position.copy(position);
  scene.add(sun);

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createSunTexture(),
      color: 0xffc078,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    })
  );
  glow.position.copy(position);
  glow.scale.set(46, 46, 1);
  scene.add(glow);

  return sun;
}

const LANDING_PAD = { x: 15, z: -25 };

function baseTerrain(x: number, z: number) {
  return (
    Math.sin(x * 0.03) * Math.cos(z * 0.035) * 0.62 +
    Math.sin(x * 0.08 + z * 0.04) * 0.26 +
    Math.cos(z * 0.1 - x * 0.02) * 0.17 +
    Math.sin(x * 0.22) * Math.cos(z * 0.19) * 0.05
  );
}

// Flattens the ground around the landing pad so it stays level.
function terrainHeight(x: number, z: number) {
  const padHeight = baseTerrain(LANDING_PAD.x, LANDING_PAD.z);
  const distance = Math.hypot(x - LANDING_PAD.x, z - LANDING_PAD.z);
  const blend = THREE.MathUtils.smoothstep(distance, 2.6, 7.5);
  return THREE.MathUtils.lerp(padHeight, baseTerrain(x, z), blend);
}

function createGrass(scene: THREE.Scene) {
  const geometry = createGrassTuftGeometry();
  const material = new THREE.MeshStandardMaterial({
    color: 0x8fae64,
    map: createGrassBladeTexture(),
    alphaTest: 0.45,
    side: THREE.DoubleSide,
    roughness: 1,
    metalness: 0,
  });
  const count = 3200;
  const grass = new THREE.InstancedMesh(geometry, material, count);
  const dummy = new THREE.Object3D();
  const tint = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    const x = (Math.random() - 0.5) * 150;
    const z = (Math.random() - 0.5) * 150;
    const scale = 0.7 + Math.random() * 1.3;
    dummy.position.set(x, terrainHeight(x, z) - 0.02, z);
    dummy.rotation.y = Math.random() * Math.PI;
    dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.5), scale);
    dummy.updateMatrix();
    grass.setMatrixAt(i, dummy.matrix);
    tint.setHSL(0.24 + Math.random() * 0.06, 0.34, 0.30 + Math.random() * 0.14);
    grass.setColorAt(i, tint);
  }
  grass.instanceMatrix.needsUpdate = true;
  if (grass.instanceColor) grass.instanceColor.needsUpdate = true;
  grass.receiveShadow = true;
  grass.castShadow = false;
  scene.add(grass);
  return grass;
}

function createStars(scene: THREE.Scene) {
  const count = 1100;
  const positions = new Float32Array(count * 3);
  const radius = 190;

  for (let i = 0; i < count; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.85 + 0.1);
    const r = radius * (0.82 + Math.random() * 0.18);
    const sinPhi = Math.sin(phi);
    positions[i * 3] = r * sinPhi * Math.cos(theta);
    positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 18;
    positions[i * 3 + 2] = r * sinPhi * Math.sin(theta);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.7,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    fog: false,
  });
  const stars = new THREE.Points(geometry, material);
  stars.name = "stars";
  scene.add(stars);
  return stars;
}

function createTreeVariant() {
  const group = new THREE.Group();
  const barkMat = new THREE.MeshStandardMaterial({
    color: 0x8a6a4a,
    map: createBarkTexture(),
    roughness: 0.95,
  });
  const foliageColors = [0x3f6b34, 0x467536, 0x365c2d];
  const foliageMat = new THREE.MeshStandardMaterial({
    color: foliageColors[Math.floor(Math.random() * foliageColors.length)],
    map: createFoliageTexture(),
    roughness: 0.92,
    metalness: 0,
  });

  const trunkHeight = 3.6;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.36, trunkHeight, 9), barkMat);
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  const up = new THREE.Vector3(0, 1, 0);
  const branchCount = 6;
  for (let i = 0; i < branchCount; i += 1) {
    const angle = (i / branchCount) * Math.PI * 2 + Math.random() * 0.6;
    const baseY = trunkHeight * (0.5 + Math.random() * 0.42);
    const length = 1.3 + Math.random() * 1.1;
    const dir = new THREE.Vector3(Math.cos(angle), 0.55 + Math.random() * 0.5, Math.sin(angle)).normalize();

    const branchGeo = new THREE.CylinderGeometry(0.045, 0.1, length, 6);
    branchGeo.translate(0, length / 2, 0);
    const branch = new THREE.Mesh(branchGeo, barkMat);
    branch.quaternion.setFromUnitVectors(up, dir);
    branch.position.set(Math.cos(angle) * 0.08, baseY, Math.sin(angle) * 0.08);
    branch.castShadow = true;
    group.add(branch);

    const tip = branch.position.clone().add(dir.multiplyScalar(length));
    const blob = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.62 + Math.random() * 0.4, 1),
      foliageMat
    );
    blob.position.copy(tip);
    blob.castShadow = true;
    blob.receiveShadow = true;
    group.add(blob);
  }

  // Rounded canopy crown.
  for (let i = 0; i < 4; i += 1) {
    const blob = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.9 + Math.random() * 0.55, 1),
      foliageMat
    );
    blob.position.set(
      (Math.random() - 0.5) * 1.0,
      trunkHeight * 0.92 + Math.random() * 1.0,
      (Math.random() - 0.5) * 1.0
    );
    blob.castShadow = true;
    blob.receiveShadow = true;
    group.add(blob);
  }

  return group;
}

function createTrees(scene: THREE.Scene) {
  const variants = [createTreeVariant(), createTreeVariant(), createTreeVariant()];
  const group = new THREE.Group();

  const count = 24;
  let placed = 0;
  let guard = 0;

  while (placed < count && guard < count * 30) {
    guard += 1;
    const angle = Math.random() * Math.PI * 2;
    const dist = 26 + Math.random() * 55;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    if (Math.hypot(x - LANDING_PAD.x, z - LANDING_PAD.z) < 8) continue;

    const tree = variants[placed % variants.length].clone();
    const scale = 0.85 + Math.random() * 1.15;
    tree.scale.setScalar(scale);
    tree.rotation.y = Math.random() * Math.PI * 2;
    tree.position.set(x, terrainHeight(x, z) - 0.05, z);
    group.add(tree);
    placed += 1;
  }

  scene.add(group);
  return { group };
}

function createField(scene: THREE.Scene) {
  const geometry = new THREE.PlaneGeometry(180, 180, 130, 130);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const lx = pos.getX(i);
    const ly = pos.getY(i);
    // After the -90deg X rotation, local y maps to world -z.
    pos.setZ(i, terrainHeight(lx, -ly));
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0x5c854b,
    map: createGroundTexture(),
    normalMap: createGroundNormalTexture(),
    normalScale: new THREE.Vector2(0.8, 0.8),
    roughness: 0.96,
    metalness: 0,
  });
  const field = new THREE.Mesh(geometry, material);
  field.rotation.x = -Math.PI / 2;
  field.receiveShadow = true;
  scene.add(field);
  return field;
}

function createLandingPad(scene: THREE.Scene) {
  const group = new THREE.Group();
  group.position.set(LANDING_PAD.x, terrainHeight(LANDING_PAD.x, LANDING_PAD.z) + 0.06, LANDING_PAD.z);

  const outer = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.2, 0.08, 48),
    new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.72 })
  );
  outer.castShadow = true;
  outer.receiveShadow = true;
  group.add(outer);

  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(1.7, 1.7, 0.085, 48),
    new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.55 })
  );
  inner.position.y = 0.01;
  group.add(inner);

  const mark = new THREE.Mesh(
    new THREE.RingGeometry(0.72, 0.95, 32),
    new THREE.MeshStandardMaterial({ color: 0xd97706, side: THREE.DoubleSide })
  );
  mark.rotation.x = -Math.PI / 2;
  mark.position.y = 0.055;
  group.add(mark);

  scene.add(group);
  return group;
}

function createPlaceholderDrone() {
  const group = new THREE.Group();

  const carbon = createCarbonTexture();
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x2a2f37,
    map: carbon,
    metalness: 0.55,
    roughness: 0.42,
  });
  const motorMat = new THREE.MeshStandardMaterial({ color: 0xb7c0cb, metalness: 0.92, roughness: 0.26 });
  const motorTopMat = new THREE.MeshStandardMaterial({ color: 0x40464e, metalness: 0.85, roughness: 0.34 });
  const propMat = new THREE.MeshStandardMaterial({
    color: 0xd7dde3,
    transparent: true,
    opacity: 0.62,
    roughness: 0.4,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  const caseMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.35, roughness: 0.55 });
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x0b0f14, metalness: 0.7, roughness: 0.12 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x22303d,
    metalness: 0.4,
    roughness: 0.05,
    emissive: 0x0b1a26,
    emissiveIntensity: 0.5,
  });
  const navGreenMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x22c55e,
    emissiveIntensity: 1.3,
    roughness: 0.4,
  });
  const navRedMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 1.3,
    roughness: 0.4,
  });
  const strobeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.4,
    roughness: 0.3,
  });
  const glowTexture = createGlowTexture();
  const makeGlow = (color: number, size: number) => {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    sprite.scale.setScalar(size);
    return sprite;
  };

  // Bottom and top carbon plates.
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.62), frameMat);
  bottom.position.y = -0.02;
  bottom.castShadow = true;
  bottom.receiveShadow = true;
  group.add(bottom);

  const top = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 0.46), frameMat);
  top.position.set(0, 0.12, -0.03);
  top.castShadow = true;
  group.add(top);

  // Four arms, motors and tri-blade props in an X frame.
  const props: THREE.Object3D[] = [];
  const corners: [number, number][] = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ];

  corners.forEach(([sx, sz]) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.028, 0.06), frameMat);
    arm.position.set(sx * 0.21, 0.02, sz * 0.21);
    arm.rotation.y = Math.atan2(-sz, sx);
    arm.castShadow = true;
    group.add(arm);

    const mx = sx * 0.44;
    const mz = sz * 0.44;

    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.064, 0.09, 20), motorMat);
    motor.position.set(mx, 0.06, mz);
    motor.castShadow = true;
    group.add(motor);

    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.028, 20), motorTopMat);
    bell.position.set(mx, 0.115, mz);
    group.add(bell);

    const prop = new THREE.Group();
    for (let b = 0; b < 3; b += 1) {
      const holder = new THREE.Group();
      holder.rotation.y = (b / 3) * Math.PI * 2;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.006, 0.05), propMat);
      blade.position.set(0.14, 0, 0);
      blade.rotation.z = 0.22;
      holder.add(blade);
      prop.add(holder);
    }
    prop.position.set(mx, 0.135, mz);
    group.add(prop);
    props.push(prop);

    // Navigation lights: green to starboard (+x), red to port (-x).
    const navMat = sx > 0 ? navGreenMat : navRedMat;
    const navColor = sx > 0 ? 0x22c55e : 0xef4444;
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.016, 0.02), navMat);
    led.position.set(sx * 0.2, 0.035, sz * 0.2);
    group.add(led);

    const ledGlow = makeGlow(navColor, 0.34);
    ledGlow.position.copy(led.position);
    group.add(ledGlow);
  });

  // FPV camera at the front (+z), tilted slightly upward.
  const camMount = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.13, 0.06), frameMat);
  camMount.position.set(0, 0.07, 0.2);
  camMount.castShadow = true;
  group.add(camMount);

  const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.05), lensMat);
  camBody.position.set(0, 0.08, 0.26);
  camBody.rotation.x = -0.4;
  group.add(camBody);

  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.05, 20), glassMat);
  lens.rotation.x = Math.PI / 2 - 0.4;
  lens.position.set(0, 0.095, 0.3);
  group.add(lens);

  // Li-ion battery pack and strap on top.
  const battery = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.11, 0.36), caseMat);
  battery.position.set(0, 0.2, -0.06);
  battery.castShadow = true;
  group.add(battery);

  const strap = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.05), frameMat);
  strap.position.set(0, 0.2, 0.02);
  group.add(strap);

  // Rear VTX antenna.
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 10), caseMat);
  antenna.position.set(0, 0.31, -0.18);
  antenna.rotation.x = 0.45;
  group.add(antenna);
  const antennaTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.024, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 })
  );
  antennaTip.position.set(0, 0.395, -0.23);
  group.add(antennaTip);

  // Landing skids.
  [-1, 1].forEach((sx) => {
    const skid = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.52), frameMat);
    skid.position.set(sx * 0.12, -0.075, -0.02);
    skid.castShadow = true;
    group.add(skid);
  });

  // Anti-collision beacon on the battery with a soft glow.
  const strobe = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), strobeMat);
  strobe.position.set(0, 0.28, -0.06);
  group.add(strobe);
  const strobeGlow = makeGlow(0xffffff, 0.5);
  strobeGlow.position.copy(strobe.position);
  group.add(strobeGlow);

  // Navigation lights: green to starboard, red to port (real point lights so
  // the frame and ground pick up the colour too).
  const greenLight = new THREE.PointLight(0x22c55e, 1.4, 4.5, 2);
  greenLight.position.set(0.3, 0.08, 0);
  group.add(greenLight);
  const redLight = new THREE.PointLight(0xef4444, 1.4, 4.5, 2);
  redLight.position.set(-0.3, 0.08, 0);
  group.add(redLight);

  return { group, props, leds: { navGreenMat, navRedMat, strobeMat } };
}

function createPlaceholderSquid() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.55, 0.35, 12),
    new THREE.MeshStandardMaterial({ color: 0x6b7280, metalness: 0.25, roughness: 0.52 })
  );
  body.position.y = 0.7;
  body.castShadow = true;
  group.add(body);

  const pivots: { hip: THREE.Group; knee: THREE.Group }[] = [];

  for (let i = 0; i < 3; i += 1) {
    const angle = i * ((Math.PI * 2) / 3) + Math.PI / 2;
    const hip = new THREE.Group();
    hip.position.set(0, 0.65, 0);
    hip.rotation.y = angle;

    const upper = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.13, 0.85),
      new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.45 })
    );
    upper.position.z = 0.42;
    upper.castShadow = true;
    hip.add(upper);

    const knee = new THREE.Group();
    knee.position.z = 0.84;
    hip.add(knee);

    const lower = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.11, 0.72),
      new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.5 })
    );
    lower.position.set(0, -0.2, 0.34);
    lower.rotation.x = 0.62;
    lower.castShadow = true;
    knee.add(lower);

    group.add(hip);
    pivots.push({ hip, knee });
  }

  return { group, pivots };
}

function createPlaceholderRover() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.42, 1.0),
    new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.7, metalness: 0.2 })
  );
  body.position.y = 0.55;
  body.castShadow = true;
  group.add(body);

  const wheels: THREE.Mesh[] = [];
  [-0.52, 0, 0.52].forEach((x) => {
    [-0.58, 0.58].forEach((z) => {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.16, 16),
        new THREE.MeshStandardMaterial({ color: 0x252525, roughness: 0.8 })
      );
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, 0.32, z);
      wheel.castShadow = true;
      group.add(wheel);
      wheels.push(wheel);
    });
  });

  return { group, wheels };
}

function createUGV() {
  const group = new THREE.Group();

  const hullMat = new THREE.MeshStandardMaterial({ color: 0x5b6b4a, metalness: 0.35, roughness: 0.6 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b303a, metalness: 0.6, roughness: 0.4 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.4, roughness: 0.5 });
  const ledMat = new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x34d399, emissiveIntensity: 1.2 });

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.34, 1.7), hullMat);
  chassis.position.y = 0.5;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  group.add(chassis);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 1.2), darkMat);
  deck.position.set(0, 0.72, -0.1);
  group.add(deck);

  // Sensor mast with spinning lidar drum.
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.55, 10), darkMat);
  mast.position.set(0, 1.02, 0.45);
  group.add(mast);
  const lidar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.14, 16), accentMat);
  lidar.position.set(0, 1.34, 0.45);
  lidar.castShadow = true;
  group.add(lidar);
  const lidarCap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 16), darkMat);
  lidarCap.position.set(0, 1.42, 0.45);
  group.add(lidarCap);

  // Front sensor bar.
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.1), darkMat);
  bar.position.set(0, 0.66, 0.86);
  group.add(bar);
  [-0.28, 0, 0.28].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.03), ledMat);
    eye.position.set(x, 0.66, 0.92);
    group.add(eye);
  });

  // Antenna.
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.4, 8), darkMat);
  antenna.position.set(-0.45, 0.95, -0.5);
  antenna.rotation.z = 0.2;
  group.add(antenna);

  // Six wheels.
  const wheels: THREE.Mesh[] = [];
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1d1f24, roughness: 0.85 });
  [-0.72, 0, 0.72].forEach((z) => {
    [-0.68, 0.68].forEach((x) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 18), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.3, z);
      wheel.castShadow = true;
      group.add(wheel);
      wheels.push(wheel);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 12), accentMat);
      hub.rotation.z = Math.PI / 2;
      hub.position.set(x, 0.3, z);
      group.add(hub);
    });
  });

  return { group, wheels };
}

function createRocket() {
  const group = new THREE.Group();
  const shellMat = new THREE.MeshStandardMaterial({ color: 0xe8ecf1, metalness: 0.55, roughness: 0.35 });
  const bandMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, metalness: 0.5, roughness: 0.4 });
  const noseMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, metalness: 0.45, roughness: 0.35 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2a2f37, metalness: 0.8, roughness: 0.3 });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.9 });

  // Rocket body points forward (+z); tail/nozzle is at -z.
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 1.9, 20), shellMat);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  group.add(body);

  // Ogive nose cone.
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.72, 20), noseMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.z = 1.31;
  nose.castShadow = true;
  group.add(nose);
  const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), darkMat);
  noseTip.position.z = 1.66;
  group.add(noseTip);

  // Painted bands.
  [-0.35, 0.35].forEach((z) => {
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.178, 0.178, 0.16, 20), bandMat);
    band.rotation.x = Math.PI / 2;
    band.position.z = z;
    group.add(band);
  });

  // Four swept fins around the tail.
  for (let i = 0; i < 4; i += 1) {
    const fin = new THREE.Group();
    fin.rotation.z = (i / 4) * Math.PI * 2;
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0.5);
    finShape.lineTo(0, -0.95);
    finShape.lineTo(0.42, -0.95);
    finShape.lineTo(0.3, 0.05);
    finShape.closePath();
    const finMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(finShape, { depth: 0.03, bevelEnabled: false }),
      bandMat
    );
    finMesh.rotation.y = Math.PI / 2;
    finMesh.position.set(0.14, 0, -0.25);
    finMesh.castShadow = true;
    fin.add(finMesh);
    group.add(fin);
  }

  // Engine nozzle.
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.23, 0.3, 20, 1, true), darkMat);
  nozzle.rotation.x = Math.PI / 2;
  nozzle.position.z = -1.08;
  group.add(nozzle);

  // Exhaust flame with a bright core.
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.15, 1.1, 14), flameMat);
  flame.rotation.x = Math.PI / 2;
  flame.position.z = -1.85;
  group.add(flame);
  const flameCore = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.7, 10),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
  );
  flameCore.rotation.x = Math.PI / 2;
  flameCore.position.z = -1.65;
  group.add(flameCore);

  return { group, flame };
}

function createHexapod() {
  const group = new THREE.Group();
  const carbon = createCarbonTexture();
  const plateMat = new THREE.MeshStandardMaterial({ color: 0x2b303a, map: carbon, metalness: 0.6, roughness: 0.4 });
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3a414b, metalness: 0.5, roughness: 0.5 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: 0.9, roughness: 0.28 });
  const servoMat = new THREE.MeshStandardMaterial({ color: 0x1f242b, metalness: 0.7, roughness: 0.4 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1.4 });
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0x14171c, roughness: 0.9 });

  // Stacked chassis plates with standoffs.
  const topPlate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 1.2), plateMat);
  topPlate.position.y = 0.62;
  topPlate.castShadow = true;
  topPlate.receiveShadow = true;
  group.add(topPlate);

  const bottomPlate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 1.2), plateMat);
  bottomPlate.position.y = 0.44;
  bottomPlate.castShadow = true;
  group.add(bottomPlate);

  [
    [-0.36, -0.5],
    [0.36, -0.5],
    [-0.36, 0.5],
    [0.36, 0.5],
  ].forEach(([sx, sz]) => {
    const standoff = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 8), metalMat);
    standoff.position.set(sx, 0.53, sz);
    group.add(standoff);
  });

  const core = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.24, 0.8), bodyMat);
  core.position.y = 0.53;
  core.castShadow = true;
  group.add(core);

  const battery = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.14, 0.34),
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6 })
  );
  battery.position.set(0, 0.72, -0.15);
  group.add(battery);

  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), bodyMat);
  dome.position.set(0, 0.66, 0.35);
  group.add(dome);

  const cam = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.1, 0.1), servoMat);
  cam.position.set(0, 0.6, 0.62);
  group.add(cam);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.05, 14), eyeMat);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 0.6, 0.68);
  group.add(lens);

  // Six three-segment legs (coxa / femur / tibia).
  const legs: { side: number; hip: THREE.Group; femur: THREE.Group; tibia: THREE.Group }[] = [];
  const zs = [-0.45, 0, 0.45];
  [-1, 1].forEach((side) => {
    zs.forEach((z) => {
      const hip = new THREE.Group();
      hip.position.set(side * 0.45, 0.55, z);
      group.add(hip);

      const coxa = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 14), servoMat);
      coxa.rotation.z = Math.PI / 2;
      coxa.position.x = side * 0.09;
      coxa.castShadow = true;
      hip.add(coxa);

      const femur = new THREE.Group();
      femur.position.x = side * 0.18;
      hip.add(femur);

      const femurServo = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 12), metalMat);
      femurServo.rotation.z = Math.PI / 2;
      femurServo.position.x = side * 0.02;
      femur.add(femurServo);

      const femurMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.12), bodyMat);
      femurMesh.position.x = side * 0.25;
      femurMesh.castShadow = true;
      femur.add(femurMesh);

      const tibia = new THREE.Group();
      tibia.position.x = side * 0.5;
      femur.add(tibia);

      const knee = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 12), servoMat);
      knee.rotation.z = Math.PI / 2;
      tibia.add(knee);

      const tibiaMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), metalMat);
      tibiaMesh.position.y = -0.25;
      tibiaMesh.castShadow = true;
      tibia.add(tibiaMesh);

      const foot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), rubberMat);
      foot.position.y = -0.5;
      tibia.add(foot);

      legs.push({ side, hip, femur, tibia });
    });
  });

  return { group, legs };
}

function loadLocalModel(url: string, loader: GLTFLoader, onLoaded: (root: THREE.Object3D) => void, onMissing: () => void) {
  loader.load(
    url,
    (gltf) => onLoaded(gltf.scene),
    undefined,
    () => onMissing()
  );
}

function makeTrajectory(data: TelemetryPoint[]) {
  const points = data
    .filter((d) => d.position)
    .map((d) => new THREE.Vector3(...(d.position as [number, number, number])));
  if (points.length < 2) return null;
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.78 });
  return new THREE.Line(geometry, material);
}

/* ==========================================================================
   3D SCENE
   ========================================================================== */

interface SceneProps {
  appState: AppState;
  mission: ReturnType<typeof makeMission> | null;
  time: number;
  engineeringMode: boolean;
}

export function RoboticsScene({ appState, mission, time, engineeringMode }: SceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef({ appState, mission, time, engineeringMode });

  useEffect(() => {
    liveRef.current = { appState, mission, time, engineeringMode };
  }, [appState, mission, time, engineeringMode]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0a06b);
    scene.fog = new THREE.FogExp2(0xd98c5e, 0.0032);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 500);
    camera.position.set(15, 7, 23);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    mount.appendChild(renderer.domElement);

    // Bloom + filmic output pass for a less "cartoon" look.
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.55, 0.82);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    const resize = () => {
      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      composer.setSize(width, height);
    };
    resize();
    window.addEventListener("resize", resize);

    const sky = createGradientSky();
    scene.add(sky);
    createSun(scene);
    const stars = createStars(scene);

    const ambient = new THREE.AmbientLight(0xffe3c2, 1.1);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xffb27a, 0x4a342c, 1.1);
    scene.add(hemi);

    const sunLight = new THREE.DirectionalLight(0xffca9a, 5.5);
    sunLight.position.set(-45, 55, -70);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1536, 1536);
    sunLight.shadow.camera.left = -65;
    sunLight.shadow.camera.right = 65;
    sunLight.shadow.camera.top = 65;
    sunLight.shadow.camera.bottom = -65;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 180;
    scene.add(sunLight);

    createField(scene);
    createGrass(scene);
    createLandingPad(scene);
    const trees = createTrees(scene);

    // Local, replaceable cloud assets are intentionally not required.
    const cloudTexture = createCloudTexture();
    const cloudMaterial = new THREE.SpriteMaterial({
      map: cloudTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
    });
    const cloudGroup = new THREE.Group();
    [
      [-35, 28, -75, 20],
      [10, 33, -95, 27],
      [42, 24, -65, 16],
      [-8, 27, -50, 14],
      [65, 30, -40, 22],
      [-70, 26, -30, 19],
      [25, 38, -120, 30],
      [-45, 35, -110, 24],
      [80, 28, -90, 18],
      [-20, 22, -25, 12],
      [55, 34, -15, 17],
    ].forEach(([x, y, z, scale]) => {
      const sprite = new THREE.Sprite(cloudMaterial);
      sprite.position.set(x, y, z);
      sprite.scale.set(scale, scale * 0.48, 1);
      cloudGroup.add(sprite);
    });
    scene.add(cloudGroup);

    const loader = new GLTFLoader();

    const dronePlaceholder = createPlaceholderDrone();
    const droneGroup = dronePlaceholder.group;
    droneGroup.visible = false;
    scene.add(droneGroup);

    const squidPlaceholder = createPlaceholderSquid();
    const squidGroup = squidPlaceholder.group;
    squidGroup.visible = false;
    scene.add(squidGroup);

    const roverPlaceholder = createPlaceholderRover();
    const roverGroup = roverPlaceholder.group;
    roverGroup.visible = false;
    scene.add(roverGroup);

    // Hero drone flock: multiple UAVs flying together in formation.
    const flockGroup = new THREE.Group();
    flockGroup.visible = false;
    scene.add(flockGroup);

    const FLOCK_FORMATION: [number, number, number][] = [
      [0, 0, 0],
      [2.4, 0.15, 0.4],
      [-2.4, 0.15, 0.4],
      [1.2, 0.3, 2.0],
      [-1.2, 0.3, 2.0],
      [0, 0.5, -1.9],
      [3.6, 0.35, -0.6],
    ];
    const flockUnits = FLOCK_FORMATION.map((offset) => {
      const drone = createPlaceholderDrone();
      flockGroup.add(drone.group);
      return {
        group: drone.group,
        props: drone.props,
        leds: drone.leds,
        offset: new THREE.Vector3(...offset),
      };
    });

    // Hero UGV patrolling the field.
    const ugv = createUGV();
    const ugvGroup = ugv.group;
    ugvGroup.visible = false;
    scene.add(ugvGroup);

    // Hero interceptor that launches up and takes down the drone flock.
    // Tries the drone model first (a real quad interceptor instead of the
    // rocket fallback), then the user-supplied interceptor part, then a
    // procedural fallback keeps the scene rendering.
    const interceptorFallback = createRocket();
    const interceptorGroup = new THREE.Group();
    interceptorGroup.add(interceptorFallback.group);
    interceptorGroup.visible = false;
    scene.add(interceptorGroup);

    const adoptInterceptorModel = (root: THREE.Object3D) => {
      root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.castShadow = true;
          m.receiveShadow = true;
        }
      });
      interceptorGroup.add(root);
      // Re-scale so the downloaded model is ~1.4 m across the widest axis and
      // centered on its origin, regardless of how it was exported.
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const span = Math.max(size.x, Math.max(size.y, size.z)) || 1;
      root.scale.setScalar(1.4 / span);
      box.setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      root.position.sub(center);
      interceptorFallback.group.visible = false;
    };

    // Hero interceptor that launches up and takes down the drone flock.
    // Tries the ODIN Win Hit tailsitter first, then the v6 scout drone, the
    // base-plate part, and finally a procedural fallback keeps the scene
    // rendering.
    loadLocalModel(assetUrl("models/interceptor.glb"), loader, adoptInterceptorModel, () => {
      loadLocalModel(assetUrl("models/drone.glb"), loader, adoptInterceptorModel, () => {
        loadLocalModel(assetUrl("models/interceptor.gltf"), loader, adoptInterceptorModel, () => {});
      });
    });

    // Blinking red beacon on the interceptor (added to the group so it shows
    // regardless of which model — GLB or fallback — is currently loaded).
    const interceptorBeaconMat = new THREE.MeshStandardMaterial({
      color: 0xff2222,
      emissive: 0xff2222,
      emissiveIntensity: 2,
    });
    const interceptorBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), interceptorBeaconMat);
    interceptorBeacon.position.set(0, 0.2, 0.3);
    interceptorGroup.add(interceptorBeacon);
    const interceptorBeaconGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createGlowTexture(),
        color: 0xff2222,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    interceptorBeaconGlow.scale.setScalar(0.9);
    interceptorBeaconGlow.position.copy(interceptorBeacon.position);
    interceptorGroup.add(interceptorBeaconGlow);
    const interceptorBeaconLight = new THREE.PointLight(0xff2222, 4, 10, 2);
    interceptorBeaconLight.position.copy(interceptorBeacon.position);
    interceptorGroup.add(interceptorBeaconLight);

    // Hero walking hexapod.
    const hexapod = createHexapod();
    const hexapodGroup = hexapod.group;
    hexapodGroup.visible = false;
    scene.add(hexapodGroup);

    const loadedModels = new THREE.Group();
    scene.add(loadedModels);

    let droneModel: THREE.Object3D | null = null;
    let squidModel: THREE.Object3D | null = null;
    let roverModel: THREE.Object3D | null = null;

    loadLocalModel(
      assetUrl("models/drone.glb"),
      loader,
      (root) => {
        droneModel = root;
        root.scale.setScalar(0.9);
        root.visible = false;
        root.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            m.castShadow = true;
            m.receiveShadow = true;
          }
        });
        loadedModels.add(root);
      },
      () => {}
    );

    loadLocalModel(
      assetUrl("models/squid.glb"),
      loader,
      (root) => {
        squidModel = root;
        root.scale.setScalar(0.8);
        root.visible = false;
        root.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            m.castShadow = true;
            m.receiveShadow = true;
          }
        });
        loadedModels.add(root);
      },
      () => {}
    );

    loadLocalModel(
      assetUrl("models/rover.glb"),
      loader,
      (root) => {
        roverModel = root;
        root.scale.setScalar(0.8);
        root.visible = false;
        root.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            m.castShadow = true;
            m.receiveShadow = true;
          }
        });
        loadedModels.add(root);
      },
      () => {}
    );

    let droneTrajectory: THREE.Line | null = null;
    let squidTrajectory: THREE.Line | null = null;
    let roverTrajectory: THREE.Line | null = null;
    const axes = new THREE.AxesHelper(2);
    axes.visible = false;
    scene.add(axes);

    let lastTrajectoryKey = "";
    let animationId = 0;
    let last = performance.now();

    const setModelTransform = (
      model: THREE.Object3D,
      sample: TelemetryPoint,
      isRover = false
    ) => {
      if (sample.position) model.position.set(...sample.position);
      if (sample.rotation) model.rotation.set(...sample.rotation);
      if (isRover) model.position.y += 0.05;
    };

    const replaceTrajectory = (missionData?: TelemetryPoint[], type?: string) => {
      const key = `${type}:${missionData?.length ?? 0}:${missionData?.map((x) => x.position?.join(",")).join("|") ?? ""}`;
      if (key === lastTrajectoryKey) return;
      lastTrajectoryKey = key;

      [droneTrajectory, squidTrajectory, roverTrajectory].forEach((line) => {
        if (line) {
          scene.remove(line);
          line.geometry.dispose();
          (line.material as THREE.Material).dispose();
        }
      });
      droneTrajectory = squidTrajectory = roverTrajectory = null;

      const line = missionData ? makeTrajectory(missionData) : null;
      if (!line) return;
      scene.add(line);

      if (type === "drone") droneTrajectory = line;
      else if (type === "squid") squidTrajectory = line;
      else roverTrajectory = line;
    };

    const animate = (now: number) => {
      animationId = requestAnimationFrame(animate);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const state = liveRef.current;
      const activeMission = state.mission;
      const hero = state.appState === "HERO";
      const selectedProject = activeMission
        ? PROJECTS.find((p) => p.id === activeMission.projectId)
        : undefined;

      const type =
        selectedProject?.model ??
        (activeMission?.robot === "SQUID-01" ? "squid" : activeMission?.robot === "ROVER-01" ? "rover" : "drone");

      const sample = activeMission
        ? interpolateTelemetry(activeMission.telemetry, state.time)
        : null;

      const droneVisible = !hero && state.appState !== "CASE_STUDY" && type === "drone";
      const squidVisible = !hero && state.appState !== "CASE_STUDY" && type === "squid";
      const roverVisible = !hero && state.appState !== "CASE_STUDY" && type === "rover";

      const applyVisibility = (
        placeholder: THREE.Object3D,
        model: THREE.Object3D | null,
        visible: boolean
      ) => {
        placeholder.visible = visible && !model;
        if (model) model.visible = visible;
      };

      applyVisibility(droneGroup, droneModel, droneVisible);
      applyVisibility(squidGroup, squidModel, squidVisible);
      applyVisibility(roverGroup, roverModel, roverVisible);

      if (activeMission && sample) {
        replaceTrajectory(
          activeMission.telemetry,
          type === "squid" ? "squid" : type === "rover" ? "rover" : "drone"
        );

        const activeModel =
          type === "squid" ? squidModel ?? squidGroup : type === "rover" ? roverModel ?? roverGroup : droneModel ?? droneGroup;

        setModelTransform(activeModel, sample, type === "rover");
        axes.visible = state.engineeringMode && state.appState === "MISSION_VIEW";
        axes.position.copy(activeModel.position);
        axes.rotation.copy(activeModel.rotation);

        const trajectory =
          type === "squid" ? squidTrajectory : type === "rover" ? roverTrajectory : droneTrajectory;
        if (trajectory) trajectory.visible = state.engineeringMode && state.appState === "MISSION_VIEW";

        if (type === "drone" && !droneModel && sample.velocity !== undefined) {
          const spinning = sample.velocity > 0.05;
          dronePlaceholder.props.forEach((prop, i) => {
            prop.rotation.y += (spinning ? 42 : 0) * dt * (i % 2 === 0 ? 1 : -1);
          });
          const navPhase = Math.sin(state.time * 4);
          dronePlaceholder.leds.navGreenMat.emissiveIntensity = navPhase > 0 ? 2.4 : 0.15;
          dronePlaceholder.leds.navRedMat.emissiveIntensity = navPhase > 0 ? 0.15 : 2.4;
          dronePlaceholder.leds.strobeMat.emissiveIntensity = Math.sin(state.time * 7) > 0.2 ? 2.6 : 0.15;
        }

        if (type === "squid" && !squidModel) {
          const moving = (sample.velocity ?? 0) > 0.05;
          const cycle = state.time * 6;
          squidPlaceholder.pivots.forEach(({ hip, knee }, i) => {
            const phase = i * ((Math.PI * 2) / 3);
            const lift = moving ? Math.sin(cycle + phase) * 0.26 : 0;
            hip.rotation.z = THREE.MathUtils.lerp(hip.rotation.z, lift, 0.15);
            knee.rotation.x = THREE.MathUtils.lerp(
              knee.rotation.x,
              moving ? 0.62 + Math.cos(cycle + phase) * 0.18 : 0.62,
              0.15
            );
          });
        }

        if (type === "rover" && !roverModel) {
          const moving = (sample.velocity ?? 0) > 0.05;
          if (moving) roverPlaceholder.wheels.forEach((wheel) => (wheel.rotation.z += dt * 4));
        }
      } else {
        replaceTrajectory(undefined, undefined);
        axes.visible = false;
      }

      // Hero is intentionally cinematic, but the robot motion still comes
      // from the same demo telemetry instead of a separate fake animation.
      flockGroup.visible = hero;
      ugvGroup.visible = hero;
      hexapodGroup.visible = hero;
      if (!hero) {
        interceptorGroup.visible = false;
        interceptorBeaconLight.intensity = 0;
      }
      if (hero) {
        const t = now / 1000;
        const yAxis = new THREE.Vector3(0, 1, 0);

        // Non-repeating serpentine that sweeps toward the camera (z grows
        // toward +pointing at the viewer) and passes through it, then swings
        // back for another pass.
        const flyAt = (u: number) => {
          const x = 15 + Math.sin(u * 0.63) * 30;
          const z = -38 + 78 * (0.5 + 0.5 * Math.cos(u * 0.41));
          const y = 7.5 + Math.sin(u * 1.31) * 3.4;
          const dx = Math.cos(u * 0.63) * 30 * 0.63;
          const dz = -78 * 0.5 * 0.41 * Math.sin(u * 0.41);
          return { x, z, y, heading: Math.atan2(dx, dz), dx, dz };
        };

        const flock = flyAt(t);
        const center = new THREE.Vector3(flock.x, flock.y, flock.z);

        flockUnits.forEach((unit, i) => {
          const offset = unit.offset.clone().applyAxisAngle(yAxis, flock.heading);
          unit.group.position
            .set(flock.x, flock.y + Math.sin(t * 2.2 + i * 1.3) * 0.22, flock.z)
            .add(offset);
          // Bank into the turn (roll about the nose axis) so the drones look
          // like they're hauling around the corner at speed.
          const bank = 0.34 + 0.28 * Math.sin(t * 1.6 + i * 0.9);
          unit.group.rotation.set(0, flock.heading, bank, "YXZ");
          unit.group.visible = true;
          const spin = 60 * dt * (i % 2 === 0 ? 1 : -1);
          unit.props.forEach((prop, j) => {
            prop.rotation.y += spin * (j % 2 === 0 ? 1 : -1);
          });
          // Blinking nav lights: red (port) and green (starboard) alternate,
          // plus a white anti-collision strobe.
          const navPhase = Math.sin(t * 4 + i * 0.7);
          unit.leds.navGreenMat.emissiveIntensity = navPhase > 0 ? 2.4 : 0.15;
          unit.leds.navRedMat.emissiveIntensity = navPhase > 0 ? 0.15 : 2.4;
          unit.leds.strobeMat.emissiveIntensity = Math.sin(t * 7 + i) > 0.2 ? 2.6 : 0.15;
        });

        // Interceptor: launches from the pad, then chases the same flypast
        // slightly behind and offset above/sideways — it flows past the camera
        // right behind the herd but never hits them.
        const CHASE_START = 0.3;
        const launch = THREE.MathUtils.smoothstep(t, CHASE_START, CHASE_START + 2.2);
        const chase = flyAt(Math.max(t - 1.1, 0));
        const inv = 1 / (Math.hypot(chase.dx, chase.dz) || 1);
        const nx = -chase.dz * inv;
        const nz = chase.dx * inv;
        const chasePos = new THREE.Vector3(
          chase.x + nx * 3.4,
          chase.y + 1.2 + Math.sin(t * 1.1) * 0.5,
          chase.z + nz * 3.4
        );
        const start = new THREE.Vector3(11, terrainHeight(11, 17) + 0.4, 17);
        const pos = start.clone().lerp(chasePos, launch);
        interceptorGroup.visible = true;
        interceptorGroup.position.copy(pos);
        const look = pos.clone().lerp(center, 0.3);
        interceptorGroup.lookAt(look);

        // Blinking red beacon on the interceptor.
        const beacon = Math.sin(t * 9) > 0;
        interceptorBeaconMat.emissiveIntensity = beacon ? 3 : 0.25;
        interceptorBeaconGlow.material.opacity = beacon ? 0.95 : 0.25;
        interceptorBeaconLight.intensity = beacon ? 5 : 0.5;

        // Walking hexapod patrols a small loop with a tripod gait.
        const hx = Math.cos(t * 0.16 + 2) * 10;
        const hz = Math.sin(t * 0.16 + 2) * 10;
        const hHeading = Math.atan2(-Math.sin(t * 0.16 + 2), Math.cos(t * 0.16 + 2));
        hexapodGroup.position.set(hx, terrainHeight(hx, hz), hz);
        hexapodGroup.rotation.y = hHeading;
        const gait = t * 5;
        hexapod.legs.forEach((leg, i) => {
          const ph = gait + (i % 2 === 0 ? 0 : Math.PI);
          const swing = Math.sin(ph);
          const lift = Math.max(0, Math.sin(ph));
          leg.hip.rotation.y = 0.32 * swing;
          leg.femur.rotation.z = leg.side * (0.14 + 0.3 * lift);
          leg.tibia.rotation.z = leg.side * (-0.22 - 0.16 * lift);
        });

        // UGV drives a wide patrol loop around the field.
        const ugvOmega = 0.12;
        const ugvRadius = 19;
        const ux = Math.cos(t * ugvOmega) * ugvRadius;
        const uz = Math.sin(t * ugvOmega + 0.6) * ugvRadius * 0.8;
        const ugvHeading = Math.atan2(-Math.sin(t * ugvOmega) * ugvRadius, Math.cos(t * ugvOmega + 0.6) * ugvRadius * 0.8);
        ugvGroup.position.set(ux, terrainHeight(ux, uz), uz);
        ugvGroup.rotation.y = ugvHeading;
        ugv.wheels.forEach((wheel) => (wheel.rotation.x += dt * 5));
      }

      const targetPosition = new THREE.Vector3();
      const desiredCamera = new THREE.Vector3();

      if (hero) {
        desiredCamera.set(16, 9, 25);
        targetPosition.set(0, 4.5, 0);
      } else if (state.appState === "MISSION_CONTROL") {
        desiredCamera.set(0, 13, 28);
        targetPosition.set(0, 1, 0);
      } else if (state.appState === "MISSION_VIEW" && sample?.position) {
        targetPosition.set(...sample.position);
        const offset = new THREE.Vector3(-7, 4.2, 9);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), sample.rotation?.[1] ?? 0);
        desiredCamera.copy(targetPosition).add(offset);
        targetPosition.y += type === "rover" ? 0.6 : 0.8;
      } else {
        desiredCamera.set(14, 7, 22);
        targetPosition.set(0, 1, 0);
      }

      camera.position.lerp(desiredCamera, 1 - Math.pow(0.02, dt));
      const currentLook = new THREE.Vector3();
      camera.getWorldDirection(currentLook);
      const lookPoint = camera.position.clone().add(currentLook.multiplyScalar(20));
      lookPoint.lerp(targetPosition, 0.08);
      camera.lookAt(lookPoint);

      cloudGroup.rotation.y += dt * 0.002;

      composer.render();
    };

    animate(performance.now());

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);

      [droneTrajectory, squidTrajectory, roverTrajectory].forEach((line) => {
        if (line) {
          line.geometry.dispose();
          (line.material as THREE.Material).dispose();
        }
      });

      disposeObject(sky);
      disposeObject(cloudGroup);
      disposeObject(stars);
      disposeObject(trees.group);
      disposeObject(flockGroup);
      disposeObject(ugvGroup);
      disposeObject(interceptorGroup);
      disposeObject(hexapodGroup);
      disposeObject(droneGroup);
      disposeObject(squidGroup);
      disposeObject(roverGroup);
      if (droneModel) disposeObject(droneModel);
      if (squidModel) disposeObject(squidModel);
      if (roverModel) disposeObject(roverModel);

      composer.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 h-full w-full" />;
}

/* ==========================================================================
   UI
   ========================================================================== */

function DataBadge({ source }: { source: DataSource }) {
  const label = sourceLabel(source);
  const cls =
    source === "demo"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
      : source === "real_flight"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : "border-cyan-500/40 bg-cyan-500/10 text-cyan-300";

  return (
    <span className={`inline-flex items-center rounded border px-2 py-1 text-[10px] font-bold tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

function formatValue(value: number | undefined, unit = "") {
  return value === undefined || Number.isNaN(value) ? "—" : `${value.toFixed(2)}${unit}`;
}

export function getProject(mission: ReturnType<typeof makeMission> | null) {
  return mission ? PROJECTS.find((project) => project.id === mission.projectId) ?? null : null;
}

export function MissionSelector({
  missions,
  selectedMission,
  onSelect,
}: {
  missions: ReturnType<typeof makeMission>[];
  selectedMission: ReturnType<typeof makeMission> | null;
  onSelect: (mission: ReturnType<typeof makeMission>) => void;
}) {
  return (
    <div className="space-y-3">
      {missions.map((mission) => {
        const selected = selectedMission?.id === mission.id;
        return (
          <button
            key={mission.id}
            onClick={() => onSelect(mission)}
            className={`w-full rounded-lg border p-3.5 text-left transition ${
              selected
                ? "border-orange-500/80 bg-orange-500/10"
                : "border-slate-800 bg-slate-950/60 hover:border-orange-500/60"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-100">{mission.title}</span>
              <ChevronRight size={15} className="shrink-0 text-slate-500" />
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{mission.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <DataBadge source={mission.dataSource} />
              <span className="text-[10px] text-slate-500">TARGET: {mission.robot}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function TelemetryPanel({
  mission,
  sample,
  time,
}: {
  mission: ReturnType<typeof makeMission>;
  sample: TelemetryPoint | null;
  time: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-black/75 p-4 shadow-2xl backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="text-xs font-bold tracking-wider text-orange-400">{mission.robot} TELEMETRY</span>
        <DataBadge source={mission.dataSource} />
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-xs">
        <div>
          <div className="text-slate-500">MODE</div>
          <div className="mt-0.5 truncate font-semibold text-cyan-300">{sample?.state ?? "—"}</div>
        </div>
        <div>
          <div className="text-slate-500">TIME</div>
          <div className="mt-0.5 font-semibold text-white">{time.toFixed(1)} s</div>
        </div>
        <div>
          <div className="text-slate-500">ALTITUDE</div>
          <div className="mt-0.5 font-semibold text-white">{formatValue(sample?.altitude, " m")}</div>
        </div>
        <div>
          <div className="text-slate-500">VELOCITY</div>
          <div className="mt-0.5 font-semibold text-white">{formatValue(sample?.velocity, " m/s")}</div>
        </div>
        <div>
          <div className="text-slate-500">HEADING</div>
          <div className="mt-0.5 font-semibold text-white">{formatValue(sample?.heading, "°")}</div>
        </div>
        <div>
          <div className="text-slate-500">POSITION</div>
          <div className="mt-0.5 font-semibold text-white">
            {sample?.position
              ? `${sample.position[0].toFixed(1)}, ${sample.position[1].toFixed(1)}, ${sample.position[2].toFixed(1)}`
              : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

function EngineeringLegend() {
  return (
    <div className="rounded-lg border border-cyan-500/30 bg-slate-950/80 px-3 py-2 text-[10px] font-mono backdrop-blur">
      <div className="font-bold tracking-wider text-cyan-300">ENGINEERING VIEW</div>
      <div className="mt-1 text-slate-400">X / Y / Z frame • trajectory • robot orientation</div>
    </div>
  );
}

export function FlightRecorder({
  mission,
  time,
  setTime,
  isPlaying,
  setIsPlaying,
}: {
  mission: ReturnType<typeof makeMission>;
  time: number;
  setTime: (v: number) => void;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
}) {
  const sample = interpolateTelemetry(mission.telemetry, time);
  const progress = mission.duration ? (time / mission.duration) * 100 : 0;

  return (
    <div className="pointer-events-auto w-full max-w-3xl rounded-xl border border-slate-800 bg-black/85 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-3 text-[10px] text-slate-400 sm:text-xs">
        <span className="min-w-0 truncate font-bold tracking-wider text-orange-400">FLIGHT RECORDER // {mission.title}</span>
        <span className="shrink-0">{time.toFixed(1)}s / {mission.duration.toFixed(1)}s</span>
      </div>

      <div className="mb-2 h-1 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-orange-500 transition-[width]" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          aria-label={isPlaying ? "Pause mission" : "Play mission"}
          onClick={() => setIsPlaying(!isPlaying)}
          className="rounded p-2 text-orange-400 transition hover:bg-slate-800"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <button
          aria-label="Restart mission"
          onClick={() => {
            setTime(0);
            setIsPlaying(false);
          }}
          className="rounded p-2 text-slate-400 transition hover:bg-slate-800"
        >
          <RotateCcw size={17} />
        </button>

        <input
          aria-label="Mission timeline"
          type="range"
          min={0}
          max={mission.duration}
          step={0.05}
          value={time}
          onChange={(e) => {
            setTime(Number(e.target.value));
            setIsPlaying(false);
          }}
          className="min-w-0 flex-1 accent-orange-500"
        />

        <span className="hidden max-w-[32%] truncate text-[10px] font-bold text-cyan-300 sm:block">
          {sample?.state ?? "—"}
        </span>
      </div>
    </div>
  );
}

export function ProjectCaseStudy({
  project,
  mission,
  onClose,
  onLaunch,
}: {
  project: Project;
  mission: ReturnType<typeof makeMission> | null;
  onClose: () => void;
  onLaunch: () => void;
}) {
  const fields = [
    ["Objective", project.objective],
    ["Hardware", project.hardware],
    ["Sensors", project.sensors],
    ["Software", project.software],
    ["Control", project.control],
    ["Simulation", project.simulation],
    ["Challenges", project.challenges],
  ].filter(([, value]) => value);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/96 p-4 font-sans backdrop-blur-xl sm:p-8 lg:p-14"
    >
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 p-4 backdrop-blur sm:p-6">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-orange-400">{project.category}</div>
            <div className="mt-1 text-xs text-cyan-300">{project.status}</div>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-800 p-2 text-white hover:bg-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_300px] lg:p-12">
          <main>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">{project.title}</h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">{project.description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {fields.map(([label, value]) => (
                <section key={label} className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-orange-400">{label}</h3>
                  <p className="text-sm leading-6 text-slate-300">{value}</p>
                </section>
              ))}
            </div>

            {fields.length === 0 && (
              <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm text-amber-200">
                Engineering details have not been supplied yet. This case study intentionally does not invent them.
              </div>
            )}

            {project.media && Object.values(project.media).some((x) => x?.length) && (
              <section className="mt-8 rounded-xl border border-slate-800 bg-slate-950/70 p-5">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-orange-400">Media</h3>
                <div className="grid gap-2 text-xs text-slate-400">
                  {Object.entries(project.media).map(([type, items]) =>
                    items?.length ? (
                      <div key={type}>
                        <span className="font-bold text-slate-200">{type.toUpperCase()}:</span> {items.join(", ")}
                      </div>
                    ) : null
                  )}
                </div>
              </section>
            )}
          </main>

          <aside className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-black/40 p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
                <Layers size={16} className="text-orange-400" /> PROJECT LINKS
              </div>

              {project.links?.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-2 flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700"
                >
                  <Github size={17} /> GitHub
                </a>
              )}
              {project.links?.thingiverse && (
                <a
                  href={project.links.thingiverse}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-2 flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700"
                >
                  <Box size={17} /> Thingiverse
                </a>
              )}
              {project.links?.docs && (
                <a href={project.links.docs} target="_blank" rel="noreferrer" className="mb-2 block rounded-lg bg-slate-800 px-4 py-3 text-center text-sm font-bold text-white">
                  Documentation
                </a>
              )}
              {project.links?.video && (
                <a href={project.links.video} target="_blank" rel="noreferrer" className="mb-2 block rounded-lg bg-slate-800 px-4 py-3 text-center text-sm font-bold text-white">
                  Video
                </a>
              )}
              {project.links?.report && (
                <a href={project.links.report} target="_blank" rel="noreferrer" className="mb-2 block rounded-lg bg-slate-800 px-4 py-3 text-center text-sm font-bold text-white">
                  Report
                </a>
              )}

              {!project.links?.github && !project.links?.thingiverse && !project.links?.docs && !project.links?.video && !project.links?.report && (
                <div className="text-xs leading-5 text-slate-500">No project links supplied.</div>
              )}
            </div>

            {mission && (
              <button
                onClick={onLaunch}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-500"
              >
                <MonitorPlay size={17} /> LAUNCH MISSION
              </button>
            )}
          </aside>
        </div>
      </div>
    </motion.div>
  );
}

function App() {
  const [appState, setAppState] = useState<AppState>("HERO");
  const [missions, setMissions] = useState<ReturnType<typeof makeMission>[]>(FALLBACK_MISSIONS);
  const [selectedMission, setSelectedMission] = useState<ReturnType<typeof makeMission> | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [engineeringMode, setEngineeringMode] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadRealData() {
      const loaded = await Promise.all(
        FALLBACK_MISSIONS.map(async (fallback, index) => {
          const fileName = `${fallback.projectId}.json`;
          try {
            const response = await fetch(assetUrl(`data/${fileName}`), { cache: "no-store" });
            if (!response.ok) return fallback;
            const json = (await response.json()) as Partial<MissionData>;

            if (!json.telemetry || !Array.isArray(json.telemetry) || json.telemetry.length === 0) return fallback;

            const source: DataSource =
              json.dataSource === "real_flight" || json.dataSource === "rosbag" ? json.dataSource : "demo";

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

  const activeTelemetry = useMemo(
    () => (selectedMission ? interpolateTelemetry(selectedMission.telemetry, time) : null),
    [selectedMission, time]
  );

  const openMission = useCallback((mission: ReturnType<typeof makeMission>) => {
    setSelectedMission(mission);
    setSelectedProject(PROJECTS.find((p) => p.id === mission.projectId) ?? null);
    setTime(0);
    setIsPlaying(true);
    setEngineeringMode(false);
    setAppState("MISSION_VIEW");
    setMobileMenu(false);
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

      // UI does not need to re-render at display refresh rate. The Three.js
      // scene has its own animation loop.
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

  const goHome = () => {
    setIsPlaying(false);
    setAppState("HERO");
    setMobileMenu(false);
  };

  const projectForMission = getProject(selectedMission);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950 text-white selection:bg-orange-500/30">
      <RoboticsScene
        appState={appState}
        mission={selectedMission}
        time={time}
        engineeringMode={engineeringMode}
      />

      {/* Global readable veil; the actual field remains visible. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45" />

      <header className="pointer-events-none absolute left-0 right-0 top-0 z-30">
        <div className="flex items-center justify-between bg-gradient-to-b from-black/75 to-transparent px-4 py-4 sm:px-6 lg:px-8">
          <button onClick={goHome} className="pointer-events-auto flex items-center gap-3 text-left">
            <span className="h-3 w-3 animate-pulse rounded-full bg-orange-500" />
            <span className="text-xs font-bold tracking-[0.18em] sm:text-sm">ROBOTICS / MISSION CONTROL</span>
          </button>

          <nav className="hidden items-center gap-5 text-xs font-bold tracking-wider text-slate-300 md:flex">
            {[
              ["HOME", goHome],
              ["MISSIONS", () => setAppState("MISSION_CONTROL")],
              ["ROBOTS", () => setAppState("ROBOT_GALLERY")],
              ["PROJECTS", () => setAppState("PROJECTS_LIST")],
              ["STACK", () => setAppState("STACK")],
              ["ABOUT", () => setAppState("ABOUT")],
            ].map(([label, action]) => (
              <button key={String(label)} onClick={action as () => void} className="pointer-events-auto hover:text-orange-400">
                {label}
              </button>
            ))}
          </nav>

          <button
            aria-label="Open navigation"
            onClick={() => setMobileMenu((v) => !v)}
            className="pointer-events-auto rounded-lg border border-white/10 bg-black/45 p-2 md:hidden"
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
              className="pointer-events-auto mx-3 rounded-xl border border-slate-800 bg-black/90 p-3 shadow-2xl backdrop-blur-xl md:hidden"
            >
              {[
                ["HOME", goHome],
                ["MISSIONS", () => setAppState("MISSION_CONTROL")],
                ["ROBOTS", () => setAppState("ROBOT_GALLERY")],
                ["PROJECTS", () => setAppState("PROJECTS_LIST")],
                ["STACK", () => setAppState("STACK")],
                ["ABOUT", () => setAppState("ABOUT")],
              ].map(([label, action]) => (
                <button
                  key={String(label)}
                  onClick={() => {
                    (action as () => void)();
                    setMobileMenu(false);
                  }}
                  className="block w-full rounded-lg px-3 py-3 text-left text-xs font-bold tracking-wider text-slate-200 hover:bg-slate-800"
                >
                  {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence mode="wait">
        {appState === "HERO" && (
          <motion.main
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center px-5 pt-16"
          >
            <div className="max-w-5xl text-center">
              <div className="mb-4 text-[10px] font-bold tracking-[0.28em] text-orange-300 sm:text-xs">
                OUTDOOR ROBOTICS TEST FIELD // DEMO SIMULATION
              </div>
              <h1 className="text-5xl font-black leading-[0.9] tracking-[-0.06em] text-white drop-shadow-2xl sm:text-7xl lg:text-9xl">
                I BUILD MACHINES
                <br />
                <span className="text-orange-500">THAT MOVE.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                A robotics engineering portfolio built around machines, mission replay, telemetry, simulation, and physical systems.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => setAppState("MISSION_CONTROL")}
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
          </motion.main>
        )}

        {appState === "MISSION_CONTROL" && (
          <motion.aside
            key="missions"
            initial={{ x: -420 }}
            animate={{ x: 0 }}
            exit={{ x: -420 }}
            className="absolute bottom-0 left-0 top-0 z-20 w-full max-w-md overflow-y-auto border-r border-slate-800 bg-black/82 p-4 pt-20 backdrop-blur-xl sm:p-6 sm:pt-24"
          >
            <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Settings2 size={19} className="text-orange-400" />
                <span className="font-bold tracking-wider">MISSION CONTROL</span>
              </div>
              <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-300">
                STATUS: DEMO
              </span>
            </div>

            <div className="mb-7">
              <div className="mb-2 text-[10px] font-bold tracking-wider text-slate-500">SIMULATION ASSETS</div>
              <div className="space-y-2">
                {[
                  ["UAV-01", "Quadrotor", "SIMULATION READY"],
                  ["SQUID-01", "3-Leg Crawler", "SIMULATION READY"],
                  ["ROVER-01", "Planetary Platform", "SIMULATION READY"],
                ].map(([id, type, status]) => (
                  <div key={id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                    <div>
                      <div className="text-sm font-bold">{id}</div>
                      <div className="text-[10px] text-slate-500">{type}</div>
                    </div>
                    <span className="text-[10px] text-orange-300">{status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-2 text-[10px] font-bold tracking-wider text-slate-500">MISSIONS</div>
            <MissionSelector missions={missions} selectedMission={selectedMission} onSelect={openMission} />
          </motion.aside>
        )}

        {appState === "MISSION_VIEW" && selectedMission && (
          <motion.div
            key="mission-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            <div className="absolute right-3 top-20 z-20 flex max-w-[calc(100%-1.5rem)] flex-wrap justify-end gap-2 sm:right-6">
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
                  setAppState("CASE_STUDY");
                }}
                className="flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-xs font-bold hover:bg-orange-500"
              >
                <Activity size={15} /> VIEW PROJECT
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setAppState("MISSION_CONTROL");
                }}
                className="rounded-lg border border-slate-700 bg-black/55 px-3 py-2 text-xs font-bold text-slate-200 backdrop-blur"
              >
                MISSIONS
              </button>
            </div>

            {engineeringMode && (
              <div className="absolute left-3 top-20 z-20 sm:left-6">
                <EngineeringLegend />
              </div>
            )}

            <div className="absolute right-3 top-36 z-20 w-[calc(100%-1.5rem)] max-w-xs sm:right-6 sm:w-72">
              <TelemetryPanel mission={selectedMission} sample={activeTelemetry} time={time} />
            </div>

            <div className="absolute bottom-3 left-1/2 z-20 flex w-[calc(100%-1rem)] -translate-x-1/2 justify-center sm:bottom-6 sm:w-[calc(100%-3rem)]">
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

        {appState === "CASE_STUDY" && selectedProject && (
          <ProjectCaseStudy
            key="case-study"
            project={selectedProject}
            mission={selectedMission}
            onClose={() => setAppState(selectedMission ? "MISSION_VIEW" : "PROJECTS_LIST")}
            onLaunch={() => selectedMission && openMission(selectedMission)}
          />
        )}

        {appState === "ROBOT_GALLERY" && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 overflow-y-auto bg-slate-950/94 p-5 pt-24 backdrop-blur-xl sm:p-10 sm:pt-28"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-7 flex items-end justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-orange-400">ENGINEERING PLATFORMS</div>
                  <h2 className="mt-1 text-3xl font-black sm:text-5xl">ROBOTS</h2>
                </div>
                <button onClick={goHome} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold">CLOSE</button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PROJECTS.filter((p) => p.model).map((project) => {
                  const mission = missions.find((m) => m.projectId === project.id);
                  return (
                    <div key={project.id} className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-5 hover:border-orange-500/60">
                      <div>
                        <div className="mb-2 text-[10px] font-bold tracking-wider text-orange-400">{project.category}</div>
                        <h3 className="text-lg font-bold">{project.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{project.description}</p>
                      </div>
                      {mission && (
                        <button onClick={() => openMission(mission)} className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-slate-800 py-2.5 text-xs font-bold hover:bg-orange-600">
                          <MonitorPlay size={15} /> LAUNCH MISSION
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {appState === "PROJECTS_LIST" && (
          <motion.div
            key="projects"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 overflow-y-auto bg-slate-950/95 p-5 pt-24 backdrop-blur-xl sm:p-10 sm:pt-28"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-7 flex items-end justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-orange-400">PROJECT ARCHIVE</div>
                  <h2 className="mt-1 text-3xl font-black sm:text-5xl">CASE STUDIES</h2>
                </div>
                <button onClick={goHome} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold">CLOSE</button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {PROJECTS.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setSelectedProject(project);
                      setSelectedMission(missions.find((m) => m.projectId === project.id) ?? null);
                      setAppState("CASE_STUDY");
                    }}
                    className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 text-left transition hover:border-orange-500/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-bold tracking-wider text-orange-400">{project.category}</span>
                      <span className="text-[10px] text-cyan-300">{project.status}</span>
                    </div>
                    <h3 className="mt-2 text-xl font-bold">{project.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{project.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {appState === "STACK" && (
          <motion.div
            key="stack"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 overflow-y-auto bg-slate-950/95 p-5 pt-24 backdrop-blur-xl sm:p-10 sm:pt-28"
          >
            <div className="mx-auto max-w-5xl">
              <div className="mb-8 flex items-center justify-between border-b border-slate-800 pb-5">
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-orange-400">ENGINEERING TOOLCHAIN</div>
                  <h2 className="mt-1 text-4xl font-black">STACK</h2>
                </div>
                <button onClick={goHome} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold">CLOSE</button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["Robotics", ["ROS 2", "Three.js", "Gazebo", "ArduPilot / PX4"]],
                  ["Programming", ["C++", "Python", "TypeScript"]],
                  ["Simulation", ["Mission Replay", "Telemetry Playback", "3D Visualization"]],
                  ["Design", ["CAD", "3D Models", "Engineering Prototypes"]],
                  ["Perception", ["Computer Vision", "Telemetry", "Sensor Data"]],
                  ["Workflow", ["Git", "Linux", "Data-driven UI"]],
                ].map(([name, items]) => (
                  <div key={String(name)} className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
                    <h3 className="mb-4 text-sm font-bold text-orange-400">{name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {(items as string[]).map((item) => (
                        <span key={item} className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-cyan-300">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {appState === "ABOUT" && (
          <motion.div
            key="about"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 overflow-y-auto bg-slate-950/95 p-5 pt-24 backdrop-blur-xl sm:p-10 sm:pt-28"
          >
            <div className="mx-auto max-w-3xl">
              <div className="mb-8 flex items-center justify-between border-b border-slate-800 pb-5">
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-orange-400">WORKFLOW</div>
                  <h2 className="mt-1 text-4xl font-black">FROM MODEL TO MACHINE</h2>
                </div>
                <button onClick={goHome} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold">CLOSE</button>
              </div>
              <div className="space-y-5 text-sm leading-7 text-slate-300">
                <p className="text-lg font-medium text-white">
                  The portfolio is organized around machines rather than generic software-project cards.
                </p>
                <div className="grid gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-5 font-mono text-sm text-cyan-300 sm:grid-cols-5">
                  <span>DESIGN</span><span className="hidden sm:block">→</span>
                  <span>SIMULATION</span><span className="hidden sm:block">→</span>
                  <span>HARDWARE / DATA</span>
                </div>
                <p>
                  Mission playback is data-driven. Demo telemetry is kept visibly separate from future real-flight and ROS 2 recordings, so the visualization can become a genuine engineering portfolio as actual logs and models are added.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
