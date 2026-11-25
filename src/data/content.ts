const assetBase = import.meta.env.BASE_URL;
const media = (file: string) => `${assetBase}media/${file}`;

export type Theme = "dark" | "light";

export type Spec = {
  value: string;
  unit?: string;
  label: string;
};

export type SchematicVariant =
  | "docking"
  | "landing"
  | "moving-platform"
  | "firmware"
  | "swarm"
  | "planner"
  | "uav";

export type ProjectMedia =
  | { kind: "video"; src: string; poster: string; alt: string }
  | { kind: "image"; src: string; alt: string; fit?: "cover" | "contain" }
  | { kind: "schematic"; variant: SchematicVariant; alt: string };

export type ProjectLinks = {
  github?: string;
  upstream?: string;
  demo?: string;
  model?: string;
};

export type Project = {
  id: string;
  title: string;
  /** Short context line: competition, employer, or "Independent". */
  context: string;
  category: string;
  period: string;
  summary: string;
  problem: string;
  role: string;
  approach: string;
  result: string;
  pipeline: string[];
  specs: Spec[];
  tags: string[];
  links: ProjectLinks;
  media: ProjectMedia;
  /** Extra photos shown in the case study. */
  gallery?: { src: string; alt: string; caption: string }[];
  featured: boolean;
};

export type SkillGroup = {
  title: string;
  icon: "learning" | "perception" | "control" | "hardware";
  summary: string;
  items: string[];
};

export type ExperienceItem = {
  title: string;
  org: string;
  period: string;
  points: string[];
  links?: { label: string; href: string }[];
};

export type Honor = { value: string; label: string; detail: string };

/* ------------------------------------------------------------------ */

export const person = {
  name: "Vaibhav Vishwakarma",
  firstName: "Vaibhav",
  lastName: "Vishwakarma",
  role: "Robotics engineer",
  affiliation: "Team Head, Aerial Robotics IITK",
  headline: "I build robots that see, plan, and move on their own, from simulation to hardware.",
  intro:
    "Robotics engineer at IIT Kanpur building physical-AI systems end to end: robot learning in simulation, vision-guided manipulation, planning and control, and the embedded hardware underneath, validated from SIL to HIL.",
  githubUsername: "rubikscube05",
  githubUrl: "https://github.com/rubikscube05",
  linkedinUrl: "https://www.linkedin.com/in/vaibhav-vishwakarma-987b0b322/",
  resumeUrl: `${assetBase}resume.pdf`,
  location: "Kanpur, India",
};

export const contact = {
  email: "vaibhavh24@iitk.ac.in",
  linkedin: person.linkedinUrl,
  github: person.githubUrl,
  resume: person.resumeUrl,
};

/** Hero proof strip. Every figure comes from the résumé. */
export const heroStats: Spec[] = [
  { value: "Top 20", label: "Of 1000+ teams, ISRO IRoC-U 2026" },
  { value: "100", unit: "%", label: "Vision-guided landing success, IRoC-U" },
  { value: "44/45", label: "Moving-platform landings, IMAV 2025" },
  { value: "35", unit: "people", label: "Team I lead at Aerial Robotics IITK" },
];

export const projects: Project[] = [
  {
    id: "space-docking",
    title: "Autonomous Satellite Docking",
    context: "DREAM Aerospace, IIT Kanpur · internship",
    category: "Space robotics · manipulation",
    period: "Jul – Aug 2026",
    summary:
      "An in-space refueling and satellite-servicing demonstrator: a 6U chaser satellite whose vision-guided 6-DOF manipulator completes a fully autonomous docking sequence, validated in simulation and then on hardware.",
    problem:
      "Demonstrate autonomous refueling and servicing: a chaser satellite must find its target, align a manipulator to it, and dock with no manual intervention.",
    role:
      "Robotics intern. Built the manipulator software stack, the pose-estimation pipeline, and the IK and visual-servoing controllers, and ran SIL and HIL validation.",
    approach:
      "ROS 2 and MoveIt 2 for URDF modelling, kinematics, motion planning, and joint-space trajectory execution. A multi-marker ArUco pipeline on a Raspberry Pi 5 with a global-shutter camera estimates the target pose; intrinsic and hand-eye calibration reject pose ambiguity. Damped least-squares inverse kinematics and position-based visual servoing close the loop.",
    result:
      "Validated in Gazebo (SIL), then on hardware (HIL), achieving a fully autonomous docking sequence with no manual intervention.",
    pipeline: [
      "Global-shutter camera · Raspberry Pi 5",
      "Multi-marker ArUco pose",
      "Intrinsic + hand-eye calibration",
      "Position-based visual servoing",
      "Damped least-squares IK",
      "MoveIt 2 trajectory execution",
      "SIL in Gazebo → HIL on hardware",
    ],
    specs: [
      { value: "6", unit: "DOF", label: "Vision-guided manipulator" },
      { value: "6U", label: "Chaser satellite" },
      { value: "SIL→HIL", label: "Gazebo, then hardware" },
      { value: "0", label: "Manual interventions in docking" },
    ],
    tags: ["ROS 2", "MoveIt 2", "Visual servoing", "DLS IK", "ArUco", "Raspberry Pi 5"],
    links: {},
    media: {
      kind: "schematic",
      variant: "docking",
      alt: "Diagram of a chaser satellite's robotic arm aligning with a target satellite's docking marker",
    },
    featured: true,
  },
  {
    id: "iroc-u",
    title: "ISRO IRoC-U 2026",
    context: "Top 20 of 1000+ teams · Aerial Robotics IITK",
    category: "Aerial autonomy · GPS-denied",
    period: "Jan 2026 – ongoing",
    summary:
      "A self-charging autonomous drone and base station for GPS-denied Martian surface analysis. Visual SLAM for state estimation, vision-guided landing with 100% success, and a docking sequence that returns the drone to its charger.",
    problem:
      "Scan Martian terrain autonomously with no GPS, then land and dock on a base station so the drone can recharge itself.",
    role:
      "Integrated Isaac ROS VSLAM for state estimation and built the vision-guided landing and the UAV-to-base docking sequence.",
    approach:
      "Isaac ROS VSLAM gives GPS-denied state estimation at about 10 cm precision. Landing uses multi-marker ArUco pose estimation with an adaptive PID controller sending setpoints to a PX4 flight stack, followed by a UAV-to-base docking sequence for self-charging.",
    result:
      "Qualified the elimination round with full autonomy in terrain scanning; top 20 of 1000+ teams. 100% landing success.",
    pipeline: [
      "Onboard camera",
      "Isaac ROS VSLAM · ~10 cm",
      "Autonomous terrain scan",
      "Multi-marker ArUco pose",
      "Adaptive PID landing",
      "UAV-to-base docking · self-charging",
    ],
    specs: [
      { value: "Top 20", label: "Of 1000+ teams" },
      { value: "100", unit: "%", label: "Landing success" },
      { value: "~10", unit: "cm", label: "VSLAM precision" },
      { value: "0", unit: "GPS", label: "Fully GPS-denied" },
    ],
    tags: ["ROS 2", "Isaac ROS VSLAM", "PX4", "ArUco", "Adaptive PID"],
    links: {
      github: "https://github.com/rubikscube05/IRoC-U-26-precision-landing",
    },
    media: {
      kind: "image",
      src: media("iroc-drone.jpg"),
      alt: "IRoC-U quadrotor in the lab: F450 frame with a ZED stereo camera mounted under the body",
      fit: "cover",
    },
    featured: true,
  },
  {
    id: "robofest-swarm",
    title: "Multi-UAV Swarm",
    context: "RoboFest 5.0 · Aerial Robotics IITK",
    category: "Multi-robot systems · hardware",
    period: "Oct 2025 – Mar 2026",
    summary:
      "A decentralized drone swarm with leader-follower coordination over a wireless mesh and Micro XRCE-DDS, flown on custom CNC-cut airframes with Raspberry Pi compute and an SDR-based subsurface detection pipeline.",
    problem:
      "Coordinate several drones without a central controller, on airframes the team builds itself, while carrying a payload that detects what lies below the surface.",
    role:
      "Built the decentralized coordination stack, fabricated the airframes, integrated compute, power, and the SDR detection pipeline, and implemented the 2D MINCO trajectory optimizer.",
    approach:
      "Each drone runs ROS 2, with Micro XRCE-DDS carrying messages over a wireless mesh for low-latency leader-follower coordination. Airframes were designed within CNC manufacturing limits and carry Raspberry Pi compute and Li-ion power. Paths come from a 2D MINCO trajectory optimizer in C++, where optimizing LAPACK calls cut memory overhead by 33%. A software-defined radio pipeline handles subsurface detection. The fleet was first brought up in a Gazebo simulation of three ArduPilot drones with GPS disabled.",
    result:
      "Custom airframes built and integrated with decentralized leader-follower coordination, and a 33% reduction in planner memory overhead.",
    pipeline: [
      "CAD → CNC-cut airframe",
      "Raspberry Pi + Li-ion power",
      "ROS 2 + Micro XRCE-DDS",
      "Wireless mesh · leader-follower",
      "2D MINCO trajectories · C++",
      "SDR subsurface detection",
    ],
    specs: [
      { value: "33", unit: "%", label: "Less planner memory" },
      { value: "Mesh", label: "Decentralized, leader-follower" },
      { value: "CNC", label: "Custom airframes" },
      { value: "SDR", label: "Subsurface detection" },
    ],
    tags: ["ROS 2", "C++", "Micro XRCE-DDS", "MINCO", "Raspberry Pi", "SDR"],
    links: { github: "https://github.com/rubikscube05/GPS-denied" },
    media: {
      kind: "image",
      src: media("robofest-drone.jpg"),
      alt: "RoboFest 5.0 drone from above: custom frame with a LiDAR unit, Raspberry Pi, and GPS module",
      fit: "cover",
    },
    gallery: [
      {
        src: media("robofest-cad.jpg"),
        alt: "CAD render of the RoboFest 5.0 drone with a top-mounted LiDAR and tall landing legs",
        caption: "CAD model",
      },
      {
        src: media("robofest-drone.jpg"),
        alt: "Built RoboFest 5.0 drone photographed from above",
        caption: "Built hardware",
      },
    ],
    featured: true,
  },
  {
    id: "iron-squid",
    title: "IRON-SQUID",
    context: "Independent · MuJoCo + ROS 2",
    category: "Robot learning · locomotion",
    period: "2026",
    summary:
      "A 3-arm, 120-DOF tendon-driven robot that learns to move with PPO in MuJoCo, benchmarked against a classical ROS 2 controller built from tendon IK and a central pattern generator.",
    problem:
      "Learn locomotion for a free-floating robot with three flexible, tendon-driven arms instead of legs, and compare it with a hand-designed controller.",
    role:
      "Sole author: robot model, URDF-to-MJCF conversion, RL environment and training, and the ROS 2 baseline.",
    approach:
      "A custom Gymnasium environment in MuJoCo exposes all 120 arm joints, with a velocity-and-stability reward for motion in x, y, and z. PPO (Stable-Baselines3) trains across 4 parallel environments for 5M timesteps. The baseline is a ROS 2 Jazzy and Gazebo model with a procedural URDF, tendon IK over 9 tendon commands, and a CPG gait controller.",
    result:
      "A trained PPO locomotion policy on the 120-DOF model, plus a classical-control baseline for comparison.",
    pipeline: [
      "Procedural URDF → MJCF",
      "Gymnasium env · 120 joints",
      "Velocity + stability reward",
      "PPO · 4 envs · 5M steps",
      "Baseline: CPG + tendon IK in ROS 2",
    ],
    specs: [
      { value: "120", unit: "DOF", label: "Free-floating robot" },
      { value: "5", unit: "M", label: "Training timesteps" },
      { value: "4", label: "Parallel environments" },
      { value: "9", label: "Tendon commands (baseline)" },
    ],
    tags: ["MuJoCo", "PPO", "Stable-Baselines3", "ROS 2 Jazzy", "Gazebo", "CPG"],
    links: {
      github: "https://github.com/rubikscube05/octopus-rl-mujoco",
      upstream: "https://github.com/rubikscube05/iron-squid",
    },
    media: {
      kind: "image",
      src: media("iron-squid.png"),
      alt: "IRON-SQUID robot in simulation: a central body with three segmented tendon-driven arms",
    },
    featured: true,
  },
  {
    id: "imav-2025",
    title: "Landing on a Moving Platform",
    context: "IMAV 2025",
    category: "Perception · control",
    period: "Jun – Aug 2025",
    summary:
      "YOLOv11 perception with cascaded PID and Kalman drift recovery lands a drone on a 1 m platform moving at 0.5 m/s, plus a custom 3D-printed arm for surface contact.",
    problem:
      "Detect, track, and land on a small platform that keeps moving, then make physical contact with a surface using an onboard arm.",
    role:
      "Built the perception and landing controller, and designed and printed the actuated arm.",
    approach:
      "YOLOv11 detects the platform; a cascaded PID controller tracks it, with Kalman filtering to recover from drift between detections. Runs on PX4 SITL with ROS 2 and MAVROS. The arm is 3D-printed, actuated, uses potentiometer feedback, and is positioned with inverse kinematics.",
    result: "Landed on the moving platform in 44 of 45 simulated trials.",
    pipeline: [
      "Camera · YOLOv11 detection",
      "Kalman drift recovery",
      "Cascaded PID tracking",
      "Descent onto 1 m platform",
      "IK-driven arm for contact",
    ],
    specs: [
      { value: "44/45", label: "Successful sim landings" },
      { value: "0.5", unit: "m/s", label: "Platform speed" },
      { value: "1", unit: "m", label: "Platform size" },
      { value: "YOLOv11", label: "Detector" },
    ],
    tags: ["PX4 SITL", "ROS 2", "MAVROS", "YOLOv11", "Kalman filter", "3D printing"],
    links: {},
    media: {
      kind: "schematic",
      variant: "moving-platform",
      alt: "Diagram of a drone tracking and descending onto a moving platform",
    },
    featured: true,
  },

  /* ---------------- More work ---------------- */
  {
    id: "esp32-flight-controller",
    title: "ESP32 Flight-Control Firmware",
    context: "Inter IIT 14.0 · MagisV2",
    category: "Embedded control",
    period: "Dec 2025",
    summary:
      "A modular C++ flight controller ported from Cleanflight to the ESP32 for GPS-free hover and disturbance rejection, running a 1–4 kHz control loop.",
    problem: "Hold a GPS-free hover and reject disturbances on a low-cost ESP32 drone.",
    role: "Wrote and ported the flight-control firmware.",
    approach:
      "Cascaded position, velocity, and altitude loops with adaptive PID, and Kalman-filtered IMU fusion, on Cleanflight-derived C++.",
    result: "GPS-free hover with disturbance rejection at a 1–4 kHz loop rate.",
    pipeline: ["IMU", "Kalman fusion", "Position → velocity → altitude", "Adaptive PID", "Motor mixer"],
    specs: [{ value: "1–4", unit: "kHz", label: "Control loop" }],
    tags: ["C++", "ESP32", "Kalman filter"],
    links: {},
    media: {
      kind: "schematic",
      variant: "firmware",
      alt: "Block diagram of a cascaded flight-control loop",
    },
    featured: false,
  },
  {
    id: "hulkbuster",
    title: "Hulkbuster Humanoid",
    context: "Independent · MuJoCo",
    category: "Whole-body control · RL",
    period: "2026",
    summary:
      "A procedurally generated 126 kg, 29-DoF humanoid trained with a four-stage SAC curriculum to balance and reach, specified against real actuator torque limits.",
    problem: "Build a reproducible testbed for whole-body control of a heavy humanoid.",
    role: "Sole author.",
    approach:
      "Robot generated from a YAML spec with Draft's actuator feasibility gate; 50 Hz SAC policy over PD control with gravity compensation.",
    result:
      "Stands for the full 8 s episode; learns a two-handed reach. Lift and carry are still training.",
    pipeline: ["YAML spec", "Draft feasibility gate", "MJCF scene", "Staged SAC"],
    specs: [{ value: "29", unit: "DoF", label: "126 kg" }],
    tags: ["MuJoCo", "SAC", "Curriculum RL"],
    links: { github: "https://github.com/rubikscube05/hulkbuster-rl" },
    media: {
      kind: "video",
      src: media("hulkbuster.mp4"),
      poster: media("hulkbuster-poster.jpg"),
      alt: "Hulkbuster humanoid policy balancing and reaching toward a crate in MuJoCo",
    },
    featured: false,
  },
  {
    id: "microduck",
    title: "Microduck Biped",
    context: "Independent · MuJoCo",
    category: "Legged locomotion · RL",
    period: "2026",
    summary:
      "PPO policy that teaches Pollen Robotics' 25 cm Microduck biped to walk forward, trained on the manufacturer's own MJCF model.",
    problem: "Learn a forward gait for a small biped on the real manufacturer model.",
    role: "Wrote the Gymnasium environment, reward, PPO training, evaluation, and recording tools.",
    approach: "MuJoCo, Gymnasium, Stable-Baselines3 PPO with parallel environments.",
    result: "About 1.4 m mean forward distance over 10 evaluation episodes; best about 2.1 m.",
    pipeline: ["Official MJCF", "Gymnasium env", "PPO", "Evaluation"],
    specs: [{ value: "25", unit: "cm", label: "Robot height" }],
    tags: ["MuJoCo", "PPO", "Biped"],
    links: { github: "https://github.com/rubikscube05/microduck-rl" },
    media: {
      kind: "video",
      src: media("microduck.mp4"),
      poster: media("microduck-poster.jpg"),
      alt: "Microduck biped walking in MuJoCo under a PPO policy",
    },
    featured: false,
  },
  {
    id: "robot-designer",
    title: "Robot Designer",
    context: "Independent · live tool",
    category: "Mechanical design tooling",
    period: "2026",
    summary:
      "Browser tool for laying out real actuators from a 114-unit catalogue, inspecting their mount faces, painting structure between them, and exporting STL.",
    problem: "Robot layout starts from actuators; early design needs real mount data and a fast path to a printable part.",
    role: "Built the three.js editor, catalogue integration, voxel tools, STL export, and tests.",
    approach: "JavaScript, three.js, voxel modelling; 26 unit tests and 23 Playwright end-to-end checks.",
    result: "Live demo on GitHub Pages.",
    pipeline: ["Actuator catalogue", "Place and connect", "Voxel paint", "Export STL"],
    specs: [{ value: "114", label: "Actuators" }],
    tags: ["three.js", "CAD", "STL"],
    links: {
      github: "https://github.com/rubikscube05/robot-designer",
      demo: "https://rubikscube05.github.io/robot-designer/",
    },
    media: {
      kind: "image",
      src: media("robot-designer.png"),
      alt: "Robot Designer editor showing two actuators joined by painted voxel structure",
    },
    featured: false,
  },
  {
    id: "long-range-uav",
    title: "Intelligent Long-Distance UAV",
    context: "Hardware design · open model on Thingiverse",
    category: "UAV hardware design",
    period: "2026",
    summary:
      "A 3D-printable, backpack-portable UAV frame built around RTK GPS, 360° LiDAR, and ToF sensing, with high-tension arm locks that damp frame resonance.",
    problem:
      "Combine centimetre-level RTK positioning, LiDAR obstacle avoidance, and GPS-denied SLAM on a frame that folds small enough to carry in a backpack.",
    role: "Designed the frame and selected the avionics, sensors, and power system.",
    approach:
      "A foldable frame with high-tension arm locking to damp resonance carries an H7-class flight controller (ArduPilot or PX4), an M10 RTK GPS for centimetre accuracy, a 360° 2D LiDAR (LD19 / RPLIDAR class) and ToF sensors for obstacle avoidance and SLAM, and a 4S2P Li-ion pack. PID loops are tuned for the added inertia of the battery and LiDAR payload.",
    result: "Published as an open, printable model on Thingiverse.",
    pipeline: [
      "Foldable printed frame · arm locks",
      "H7 flight controller",
      "M10 RTK GPS",
      "360° LiDAR + ToF",
      "SLAM for GPS-denied flight",
      "4S2P Li-ion power",
    ],
    specs: [{ value: "4S2P", label: "Li-ion pack" }],
    tags: ["CAD", "3D printing", "RTK GPS", "LiDAR"],
    links: { model: "https://www.thingiverse.com/thing:7344739" },
    media: {
      kind: "image",
      src: media("long-range-uav.jpg"),
      alt: "Render of the Intelligent Long-Distance UAV folding its arms in flight, titled Intelligent Long-Distance UAVs",
    },
    featured: false,
  },
  {
    id: "minco-trajectory-planner",
    title: "MINCO Trajectory Planner",
    context: "RoboFest 5.0 · Aerial Robotics IITK",
    category: "Motion planning",
    period: "2025 – 2026",
    summary:
      "C++ planner that generates smooth, dynamically feasible trajectories through polynomial optimization. I implemented the 2D version for the RoboFest swarm and cut its memory overhead by 33%.",
    problem: "Generate time-efficient, smooth trajectories that respect quadrotor dynamics.",
    role: "Implemented 2D MINCO trajectory optimization for the RoboFest 5.0 swarm in the team's C++ planner.",
    approach: "C++, MINCO polynomial optimization, Eigen, LAPACK, ROS 2.",
    result: "Cut memory overhead by 33% by optimizing LAPACK calls.",
    pipeline: ["Waypoints", "Collision checking", "MINCO optimization", "Feasible trajectory"],
    specs: [{ value: "33", unit: "%", label: "Less memory" }],
    tags: ["C++", "MINCO", "LAPACK"],
    links: {
      github: "https://github.com/rubikscube05/minco-trajectory-planner",
      upstream: "https://github.com/AerialRobotics-IITK/minco-trajectory-planner",
    },
    media: {
      kind: "schematic",
      variant: "planner",
      alt: "Diagram of a smooth trajectory through waypoints",
    },
    featured: false,
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: "Robot learning & simulation",
    icon: "learning",
    summary: "Training policies in simulation and checking them against classical baselines before they touch hardware.",
    items: [
      "Reinforcement learning (PPO)",
      "PyTorch · TensorFlow",
      "Stable-Baselines3 · Gymnasium",
      "MuJoCo (URDF → MJCF)",
      "Gazebo · Isaac ROS",
      "SIL / HIL validation",
    ],
  },
  {
    title: "Perception",
    icon: "perception",
    summary: "Turning camera frames into poses and tracks a controller can trust, calibrated and tested against drift.",
    items: [
      "OpenCV",
      "YOLOv11 / v12 fine-tuning",
      "DeepSORT tracking",
      "Vision-language grounding",
      "Isaac VSLAM",
      "ArUco pose · hand-eye calibration",
    ],
  },
  {
    title: "Manipulation, planning & control",
    icon: "control",
    summary: "Getting arms and airframes to where they need to be: IK, visual servoing, trajectory optimization, tuned loops.",
    items: [
      "ROS 2 · MoveIt 2",
      "Damped least-squares IK",
      "Visual servoing",
      "MINCO trajectory optimization",
      "Cascaded / adaptive PID",
      "Kalman filtering · sensor fusion",
    ],
  },
  {
    title: "Systems & hardware",
    icon: "hardware",
    summary: "The layer underneath: flight stacks, embedded firmware, sensors, buses, and parts I design and print.",
    items: [
      "C / C++ · Python · Linux",
      "PX4 · ArduPilot",
      "ESP32 · Raspberry Pi 5",
      "I2C / SPI / UART",
      "IMU · LiDAR · ToF",
      "KiCad · Fusion 360 · 3D printing",
    ],
  },
];

export const experience: ExperienceItem[] = [
  {
    title: "Team Head",
    org: "Aerial Robotics IITK · Science & Technology Council",
    period: "Apr 2026 – present",
    points: [
      "Lead a 35-member team across autonomy, perception, controls, electronics, and mechanical design.",
      "Manage a budget above INR 5 lakh and hardware above INR 25 lakh, with a fleet of 5+ multirotors for sim-to-real validation.",
    ],
  },
  {
    title: "Robotics Intern, Space Robotics",
    org: "DREAM Aerospace, IIT Kanpur",
    period: "Jul – Aug 2026",
    points: [
      "Built an autonomous satellite-servicing demonstrator: a 6U chaser satellite with a vision-guided 6-DOF manipulator on ROS 2 and MoveIt 2.",
      "Calibrated a multi-marker ArUco pose pipeline on a Raspberry Pi 5; implemented damped least-squares IK and visual servoing.",
      "Validated in Gazebo (SIL), then on hardware (HIL): fully autonomous docking with no manual intervention.",
    ],
  },
  {
    title: "Drone Systems Integration & Validation Intern",
    org: "TheThikana",
    period: "May – Jun 2026",
    points: [
      "Built a real-time perception and tracking pipeline in ROS 2 and ArduPilot Gazebo: fine-tuned YOLOv12, DeepSORT tracking, and NVIDIA LocateAnything for open-vocabulary grounding.",
      "Tuned cascaded PID controllers from flight logs to track targets at up to 20 m/s and land on moving platforms; led HIL integration for fault-tolerance testing.",
    ],
  },
  {
    title: "ArduPilot Contributor",
    org: "Open source · C++, Python, SITL",
    period: "2026",
    points: [
      "Removed dead Copter-era RTL state code from ArduSub after a repo-wide reference audit, verified with a SITL build and full CI.",
      "Fixed a bitwise-shift bug in the ChibiOS bidirectional-DShot encoder script that produced invalid test frames.",
    ],
    links: [
      { label: "PR #34727 (merged)", href: "https://github.com/ArduPilot/ardupilot/pull/34727" },
      { label: "PR #34350 (merged)", href: "https://github.com/ArduPilot/ardupilot/pull/34350" },
    ],
  },
];

export const honors: Honor[] = [
  { value: "44/45", label: "IMAV 2025", detail: "Landings on a moving platform" },
  { value: "Top 20", label: "ISRO IRoC-U 2026", detail: "Of 1000+ teams" },
  { value: "2", label: "ArduPilot PRs", detail: "Merged upstream" },
];

export const education = {
  title: "B.Tech, Civil Engineering",
  org: "Indian Institute of Technology Kanpur",
  period: "Expected 2028",
  location: "Kanpur, India",
};

export const about = {
  title: "From a simulation to a robot that works on the bench.",
  video: {
    src: media("takeoff.mp4"),
    poster: media("takeoff-poster.jpg"),
    alt: "A red quadrotor lifting off from a runway and climbing during an outdoor test flight",
    caption: "Takeoff during an outdoor test flight",
  },
  paragraphs: [
    "I study at IIT Kanpur and lead Aerial Robotics IITK, a 35-person team building autonomous drones for international competitions. Most of what I know came from making things fly, land, and dock without a pilot, and from finding out where they fail.",
    "I like owning the whole loop: the model in simulation, the perception that feeds it, the controller that acts on it, and the firmware and wiring underneath. Then I take it to hardware and measure what actually happens.",
  ],
  principles: [
    { title: "Simulate first", detail: "Every system runs in Gazebo or MuJoCo before it runs on a robot." },
    { title: "Validate on hardware", detail: "SIL, then HIL. The docking arm and flight stacks were tested on real boards." },
    { title: "Report real numbers", detail: "44 of 45 landings, not “robust landing”. Limits are written down." },
  ],
};

/** Competitions, programmes, and organisations from the résumé (names only, no logos). */
export const proof = [
  "ISRO IRoC-U",
  "RoboFest 5.0",
  "IMAV 2025",
  "Inter IIT 14.0",
  "DREAM Aerospace",
  "ArduPilot",
];
