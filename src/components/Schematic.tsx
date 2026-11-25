import type { SchematicVariant } from "../data/content";

/*
 * Theme-aware line drawings for projects without footage.
 * Strokes use CSS classes (.sch-*) so they follow the light/dark tokens.
 */

function Quad({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const a = 18 * s;
  const r = 8 * s;
  return (
    <g>
      <path
        className="sch-ink"
        d={`M${x - a} ${y - a}L${x + a} ${y + a}M${x + a} ${y - a}L${x - a} ${y + a}`}
      />
      {[
        [-a, -a],
        [a, -a],
        [-a, a],
        [a, a],
      ].map(([dx, dy], i) => (
        <circle key={i} className="sch-ink" cx={x + dx} cy={y + dy} r={r} />
      ))}
      <rect className="sch-solid" x={x - 6 * s} y={y - 6 * s} width={12 * s} height={12 * s} />
    </g>
  );
}

export function Schematic({ variant, label }: { variant: SchematicVariant; label: string }) {
  return (
    <svg
      className="schematic"
      viewBox="0 0 400 260"
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id={`grid-${variant}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" className="sch-grid" />
        </pattern>
      </defs>
      <rect width="400" height="260" fill={`url(#grid-${variant})`} />
      {variant === "docking" ? <Docking /> : null}
      {variant === "landing" ? <Landing /> : null}
      {variant === "moving-platform" ? <MovingPlatform /> : null}
      {variant === "firmware" ? <Firmware /> : null}
      {variant === "swarm" ? <Swarm /> : null}
      {variant === "planner" ? <Planner /> : null}
    </svg>
  );
}

function Landing() {
  // ArUco-style marker: 6x6 cells with a fixed pattern
  const bits = [
    "111111",
    "100101",
    "110001",
    "101011",
    "100111",
    "111111",
  ];
  const cell = 9;
  const mx = 200 - 3 * cell;
  const my = 196;
  return (
    <g>
      <path className="sch-ink" d="M40 236h320" />
      <path className="sch-faint" d="M60 236c40-10 70-6 100-12s60 8 90 2 60-4 90 4" />
      <g transform={`translate(${mx} ${my - 6 * cell + 34}) skewX(-28) scale(1 .42)`}>
        {bits.map((row, r) =>
          row.split("").map((b, c) =>
            b === "1" ? (
              <rect
                key={`${r}-${c}`}
                className="sch-solid"
                x={c * cell}
                y={r * cell}
                width={cell}
                height={cell}
              />
            ) : null,
          ),
        )}
      </g>
      <path className="sch-accent sch-dash" d="M200 84v118" />
      <path className="sch-accent" d="M150 120l50-30 50 30M150 120v28M250 120v28" opacity=".45" />
      <path className="sch-faint" d="M168 116l32 92 32-92" />
      <Quad x={200} y={70} s={1.1} />
      <text className="sch-label" x="262" y="66">camera FOV</text>
      <text className="sch-label" x="262" y="82">pose → velocity</text>
      <text className="sch-label" x="262" y="190">ArUco marker</text>
      <path className="sch-accent" d="M222 200l36-8" />
    </g>
  );
}

function Swarm() {
  const nodes: [number, number, string][] = [
    [110, 92, "UAV 1"],
    [292, 76, "UAV 2"],
    [214, 186, "UAV 3"],
  ];
  return (
    <g>
      <path className="sch-accent sch-dash" d="M110 92L292 76L214 186Z" />
      {nodes.map(([x, y], i) => (
        <circle key={i} className="sch-faint" cx={x} cy={y} r="52" />
      ))}
      {nodes.map(([x, y, name]) => (
        <g key={name}>
          <Quad x={x} y={y} s={0.85} />
          <text className="sch-label" x={x + 26} y={y - 22}>
            {name}
          </text>
        </g>
      ))}
      <g transform="translate(40 216)">
        <rect className="sch-ink" width="58" height="22" />
        <path className="sch-ink" d="M8 6l42 10M8 16l42-10" />
        <text className="sch-label" x="70" y="15">GPS disabled · mesh links</text>
      </g>
    </g>
  );
}

function Planner() {
  const pts: [number, number][] = [
    [40, 206],
    [118, 120],
    [196, 160],
    [270, 70],
    [360, 98],
  ];
  return (
    <g>
      <rect className="sch-faint" x="140" y="40" width="44" height="76" />
      <rect className="sch-faint" x="226" y="140" width="56" height="70" />
      <path className="sch-faint sch-dash" d={`M${pts.map((p) => p.join(" ")).join("L")}`} />
      <path
        className="sch-accent sch-thick"
        d="M40 206C70 160 92 118 118 120S170 168 196 160 244 66 270 70 340 92 360 98"
      />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle className="sch-solid" cx={x} cy={y} r="4.5" />
          <text className="sch-label" x={x - 8} y={y + 22}>
            {`w${i}`}
          </text>
        </g>
      ))}
    </g>
  );
}

function Docking() {
  // chaser satellite (left) with a 3-segment arm reaching a target's marker (right)
  return (
    <g>
      <rect className="sch-ink" x="40" y="96" width="78" height="78" />
      <path className="sch-faint" d="M40 135h78M79 96v78" />
      <path className="sch-ink" d="M40 120H8M40 150H8M8 112v46" />
      <path className="sch-faint" d="M8 120h-4M8 150h-4" />
      <path className="sch-accent sch-thick" d="M118 118L170 84L232 106L262 132" />
      {[
        [118, 118],
        [170, 84],
        [232, 106],
      ].map(([x, y], i) => (
        <circle key={i} className="sch-ink" cx={x} cy={y} r="6" />
      ))}
      <path className="sch-ink" d="M262 132l10-8M262 132l8 10" />
      <rect className="sch-ink" x="298" y="92" width="76" height="86" />
      <rect className="sch-solid" x="304" y="120" width="22" height="22" />
      <rect x="309" y="125" width="12" height="12" fill="var(--panel)" />
      <rect className="sch-solid" x="313" y="129" width="4" height="4" />
      <path className="sch-ink" d="M374 120h20M374 150h20M394 112v46" />
      <path className="sch-faint sch-dash" d="M276 132h22" />
      <path className="sch-accent sch-dash" d="M138 92L304 128" opacity=".55" />
      <text className="sch-label" x="40" y="200">chaser · 6U</text>
      <text className="sch-label" x="298" y="200">target</text>
      <text className="sch-label" x="150" y="62">6-DOF arm · visual servoing</text>
    </g>
  );
}

function MovingPlatform() {
  return (
    <g>
      <path className="sch-ink" d="M30 222h340" />
      <rect className="sch-solid" x="214" y="206" width="96" height="10" />
      <circle className="sch-ink" cx="230" cy="220" r="5" />
      <circle className="sch-ink" cx="294" cy="220" r="5" />
      <path className="sch-accent" d="M320 196h34m-8-6 8 6-8 6" />
      <text className="sch-label" x="326" y="186">0.5 m/s</text>
      <path className="sch-faint sch-dash" d="M120 70C170 80 220 130 252 196" />
      <path className="sch-accent sch-dash" d="M262 196l-4-28" opacity=".7" />
      <Quad x={120} y={66} s={0.9} />
      <rect className="sch-accent" x="206" y="168" width="112" height="46" />
      <text className="sch-label" x="206" y="160">detection</text>
      <text className="sch-label" x="214" y="244">1 m platform</text>
    </g>
  );
}

function Firmware() {
  const blocks: [number, string][] = [
    [24, "pos"],
    [110, "vel"],
    [196, "alt"],
    [282, "mixer"],
  ];
  return (
    <g>
      {blocks.map(([x, label], i) => (
        <g key={label}>
          <rect className={i === 3 ? "sch-accent" : "sch-ink"} x={x} y="96" width="70" height="44" />
          <text className="sch-label" x={x + 35} y="122" textAnchor="middle">
            {label}
          </text>
          {i < 3 ? <path className="sch-ink" d={`M${x + 70} 118h16m-6-5 6 5-6 5`} /> : null}
        </g>
      ))}
      <path className="sch-faint" d="M317 140v50H59v-50" />
      <rect className="sch-ink" x="150" y="172" width="100" height="36" />
      <text className="sch-label" x="200" y="194" textAnchor="middle">IMU · Kalman</text>
      <text className="sch-label" x="24" y="72">ESP32 · 1–4 kHz loop</text>
    </g>
  );
}
