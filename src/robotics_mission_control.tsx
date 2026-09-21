import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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

/* ==========================================================================
   ROBOTICS MISSION CONTROL — DROP-IN SINGLE FILE
   - Demo telemetry is explicitly labeled DEMO SIMULATION.
   - Real JSON/ROS 2 data can replace demo data without changing the renderer.
   - Local GLB/GLTF models are loaded when present; engineering placeholders
     remain clearly marked when they are not.
   ========================================================================== */

type AppState =
  | "HERO"
  | "MISSION_CONTROL"
  | "MISSION_VIEW"
  | "CASE_STUDY"
  | "ROBOT_GALLERY"
  | "PROJECTS_LIST"
  | "STACK"
  | "ABOUT";

type DataSource = "demo" | "real_flight" | "rosbag";

interface TelemetryPoint {
  time: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  altitude?: number;
  velocity?: number;
  heading?: number;
  state?: string;
  joints?: Record<string, number>;
}

interface MissionData {
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
  docs?: string;
  video?: string;
  report?: string;
}

interface Project {
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
const PROJECTS: Project[] = [
  {
    id: "squid-robot",
    title: "Bio-Inspired 3-Leg Squid Robot",
    category: "Bio-Inspired Robotics",
    status: "Prototype / Simulation",
    description:
      "Three-legged bio-inspired robotic platform developed around coordinated leg motion and physical locomotion.",
    objective: DATA_NOT_PROVIDED,
    hardware: DATA_NOT_PROVIDED,
    sensors: DATA_NOT_PROVIDED,
    software: DATA_NOT_PROVIDED,
    control: DATA_NOT_PROVIDED,
    simulation: DATA_NOT_PROVIDED,
    challenges: DATA_NOT_PROVIDED,
    model: "squid",
    links: {},
    media: {},
  },
  {
    id: "autonomous-landing",
    title: "Autonomous Drone Landing",
    category: "Aerial Robotics",
    status: "Development",
    description:
      "Autonomous UAV landing project with a replayable mission interface for recorded or simulated telemetry.",
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
    id: "gps-drone",
    title: "GPS Autonomous Drone",
    category: "Autonomous Systems",
    status: "Development",
    description:
      "Autonomous UAV navigation project represented through waypoint telemetry and mission replay.",
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
    id: "swarm-coordination",
    title: "Multi-Drone Coordination / Drone Swarm",
    category: "Multi-Robot Systems",
    status: "Development",
    description:
      "Multi-UAV coordination project presented as a mission-level formation and trajectory replay.",
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

function makeMission(index: number, demo: MissionData): MissionData & {
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

const FALLBACK_MISSIONS = DEMO_MISSIONS.map((m, i) => makeMission(i, m));

function interpolateTelemetry(data: TelemetryPoint[], time: number): TelemetryPoint | null {
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

function createGradientSky() {
  const geometry = new THREE.SphereGeometry(220, 32, 16);
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color("#2f6fa8") },
      middle: { value: new THREE.Color("#91b9c7") },
      horizon: { value: new THREE.Color("#f4a261") },
      ground: { value: new THREE.Color("#20362a") },
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
      varying vec3 vWorld;
      void main() {
        float h = normalize(vWorld).y;
        vec3 c = mix(horizon, middle, smoothstep(-0.10, 0.25, h));
        c = mix(c, top, smoothstep(0.25, 0.85, h));
        c = mix(ground, c, smoothstep(-0.18, -0.02, h));
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
  ctx.filter = "blur(10px)";
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  const blobs = [
    [55, 70, 34], [90, 58, 42], [130, 65, 36], [165, 72, 28], [205, 68, 35],
  ];
  blobs.forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  return new THREE.CanvasTexture(canvas);
}

function createSun(scene: THREE.Scene) {
  const geometry = new THREE.SphereGeometry(5, 24, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xffd27d });
  const sun = new THREE.Mesh(geometry, material);
  sun.position.set(-65, 22, -110);
  scene.add(sun);
  return sun;
}

function createGrass(scene: THREE.Scene) {
  const geometry = new THREE.ConeGeometry(0.025, 0.24, 3);
  const material = new THREE.MeshStandardMaterial({
    color: 0x2f5e34,
    roughness: 1,
    metalness: 0,
  });
  const count = 850;
  const grass = new THREE.InstancedMesh(geometry, material, count);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i += 1) {
    const x = (Math.random() - 0.5) * 150;
    const z = (Math.random() - 0.5) * 150;
    const scale = 0.65 + Math.random() * 1.1;
    dummy.position.set(x, 0.08 * Math.sin(x * 0.08) * Math.cos(z * 0.08), z);
    dummy.rotation.y = Math.random() * Math.PI;
    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();
    grass.setMatrixAt(i, dummy.matrix);
  }
  grass.instanceMatrix.needsUpdate = true;
  grass.receiveShadow = true;
  scene.add(grass);
  return grass;
}

function createField(scene: THREE.Scene) {
  const geometry = new THREE.PlaneGeometry(180, 180, 80, 80);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z =
      Math.sin(x * 0.045) * Math.cos(y * 0.05) * 0.22 +
      Math.sin(x * 0.11 + y * 0.04) * 0.07;
    pos.setZ(i, z);
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0x315f36,
    roughness: 0.92,
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
  group.position.set(15, 0.08, -25);

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

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.18, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.6, roughness: 0.3 })
  );
  body.castShadow = true;
  group.add(body);

  const armMat = new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.65, roughness: 0.32 });
  const propMat = new THREE.MeshStandardMaterial({
    color: 0xe5e7eb,
    transparent: true,
    opacity: 0.72,
    roughness: 0.45,
  });

  const props: THREE.Mesh[] = [];
  const offsets = [
    [0.62, 0.42],
    [-0.62, 0.42],
    [0.62, -0.42],
    [-0.62, -0.42],
  ];

  offsets.forEach(([x, z], i) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.07, 0.07), armMat);
    arm.position.set(x * 0.48, 0, z * 0.48);
    arm.rotation.y = i % 2 === 0 ? 0.62 : -0.62;
    arm.castShadow = true;
    group.add(arm);

    const motor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 0.1, 16),
      armMat
    );
    motor.position.set(x, 0.05, z);
    motor.castShadow = true;
    group.add(motor);

    const prop = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.015, 0.055), propMat);
    prop.position.set(x, 0.12, z);
    group.add(prop);
    props.push(prop);
  });

  const marker = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.08, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 })
  );
  marker.position.y = -0.13;
  group.add(marker);

  return { group, props };
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

function RoboticsScene({ appState, mission, time, engineeringMode }: SceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef({ appState, mission, time, engineeringMode });

  useEffect(() => {
    liveRef.current = { appState, mission, time, engineeringMode };
  }, [appState, mission, time, engineeringMode]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7899ad);
    scene.fog = new THREE.FogExp2(0xb6b8aa, 0.0065);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 500);
    camera.position.set(15, 7, 23);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    mount.appendChild(renderer.domElement);

    const resize = () => {
      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    window.addEventListener("resize", resize);

    const sky = createGradientSky();
    scene.add(sky);
    createSun(scene);

    const ambient = new THREE.AmbientLight(0xffead5, 0.72);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xa8c7df, 0x203b2a, 1.25);
    scene.add(hemi);

    const sunLight = new THREE.DirectionalLight(0xffbd72, 3.0);
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

    // Local, replaceable cloud assets are intentionally not required.
    const cloudTexture = createCloudTexture();
    const cloudMaterial = new THREE.SpriteMaterial({
      map: cloudTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.44,
    });
    const cloudGroup = new THREE.Group();
    [
      [-35, 28, -75, 18],
      [10, 33, -95, 25],
      [42, 24, -65, 15],
      [-8, 27, -50, 13],
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

    const loadedModels = new THREE.Group();
    scene.add(loadedModels);

    let droneModel: THREE.Object3D | null = null;
    let squidModel: THREE.Object3D | null = null;
    let roverModel: THREE.Object3D | null = null;

    loadLocalModel(
      "/models/drone.glb",
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
      "/models/squid.glb",
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
      "/models/rover.glb",
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

      const droneVisible = hero || (state.appState !== "CASE_STUDY" && type === "drone");
      const squidVisible = hero || (state.appState !== "CASE_STUDY" && type === "squid");
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
      if (hero) {
        const demo = FALLBACK_MISSIONS[0];
        const heroDrone = interpolateTelemetry(demo.telemetry, (now / 1000) % demo.duration);
        if (heroDrone) {
          const model = droneModel ?? droneGroup;
          model.visible = !squidModel;
          setModelTransform(model, heroDrone);
          if (!droneModel) {
            dronePlaceholder.props.forEach((prop, i) => {
              prop.rotation.y += 28 * dt * (i % 2 === 0 ? 1 : -1);
            });
          }
        }

        const squidDemo = interpolateTelemetry(FALLBACK_MISSIONS[1].telemetry, (now / 1000) % 18);
        if (squidDemo) {
          const model = squidModel ?? squidGroup;
          model.visible = true;
          setModelTransform(model, squidDemo);
        }
      }

      const targetPosition = new THREE.Vector3();
      const desiredCamera = new THREE.Vector3();

      if (hero) {
        desiredCamera.set(14, 6.8, 22);
        targetPosition.set(3, 1.5, -3);
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

      renderer.render(scene, camera);
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
      disposeObject(droneGroup);
      disposeObject(squidGroup);
      disposeObject(roverGroup);
      if (droneModel) disposeObject(droneModel);
      if (squidModel) disposeObject(squidModel);
      if (roverModel) disposeObject(roverModel);

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

function getProject(mission: ReturnType<typeof makeMission> | null) {
  return mission ? PROJECTS.find((project) => project.id === mission.projectId) ?? null : null;
}

function MissionSelector({
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

function TelemetryPanel({
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

function FlightRecorder({
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

function ProjectCaseStudy({
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
      className="absolute inset-0 z-40 overflow-y-auto bg-slate-950/96 p-4 font-sans backdrop-blur-xl sm:p-8 lg:p-14"
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

              {!project.links?.github && !project.links?.docs && !project.links?.video && !project.links?.report && (
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
            const response = await fetch(`/data/${fileName}`, { cache: "no-store" });
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
