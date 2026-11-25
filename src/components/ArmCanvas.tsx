import { useEffect, useRef } from "react";

/*
 * Interactive 3-link planar arm.
 * Shoulder + elbow are solved with closed-form 2-link IK; the wrist keeps
 * the tool pointing straight down, like a pick-and-place cell. The arm
 * follows the pointer, and runs a pick-and-place cycle when idle.
 */

type Vec = { x: number; y: number };

type Keyframe = {
  /** target flange position: x in pad units, y as height above table (R units) */
  at: "A" | "B";
  lift: number;
  hold: number;
  grip: boolean;
};

// Height above the table is in units of total reach R.
const SEQUENCE: Keyframe[] = [
  { at: "A", lift: 0.34, hold: 0.9, grip: false },
  { at: "A", lift: 0, hold: 0.55, grip: false },
  { at: "A", lift: 0, hold: 0.35, grip: true },
  { at: "A", lift: 0.42, hold: 0.8, grip: true },
  { at: "B", lift: 0.42, hold: 1.1, grip: true },
  { at: "B", lift: 0, hold: 0.55, grip: true },
  { at: "B", lift: 0, hold: 0.35, grip: false },
  { at: "B", lift: 0.34, hold: 0.8, grip: false },
];

type Palette = Record<
  | "bg" | "grid" | "envelope" | "label" | "table" | "tableLine" | "hatch"
  | "padLabel" | "box" | "boxInner" | "pedestal" | "steel" | "jointFill"
  | "jointStroke" | "arc",
  string
>;

const PALETTES: Record<"dark" | "light", Palette> = {
  dark: {
    bg: "#0d1012",
    grid: "rgba(230, 236, 240, 0.045)",
    envelope: "rgba(230, 236, 240, 0.16)",
    label: "rgba(230, 236, 240, 0.38)",
    table: "#15191c",
    tableLine: "rgba(230, 236, 240, 0.28)",
    hatch: "rgba(230, 236, 240, 0.1)",
    padLabel: "rgba(230, 236, 240, 0.4)",
    box: "#c9d1d6",
    boxInner: "#0d1012",
    pedestal: "#2a3035",
    steel: "#c9d1d6",
    jointFill: "#1b2024",
    jointStroke: "#e9edf0",
    arc: "rgba(230, 236, 240, 0.45)",
  },
  light: {
    bg: "#f3f5f6",
    grid: "rgba(18, 22, 25, 0.06)",
    envelope: "rgba(18, 22, 25, 0.22)",
    label: "rgba(18, 22, 25, 0.5)",
    table: "#e3e7e9",
    tableLine: "rgba(18, 22, 25, 0.35)",
    hatch: "rgba(18, 22, 25, 0.12)",
    padLabel: "rgba(18, 22, 25, 0.55)",
    box: "#3a434a",
    boxInner: "#f3f5f6",
    pedestal: "#bfc6cb",
    steel: "#56616a",
    jointFill: "#ffffff",
    jointStroke: "#121619",
    arc: "rgba(18, 22, 25, 0.45)",
  },
};

const currentPalette = (): Palette =>
  PALETTES[document.documentElement.dataset.theme === "dark" ? "dark" : "light"];

const REACH_MM = 900;
const CURSOR_TIMEOUT = 2.6;

export function ArmCanvas() {
  const panelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLDListElement>(null);
  const modeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    const canvas = canvasRef.current;
    if (!panel || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let frame = 0;
    let last = performance.now();
    let visible = true;

    // geometry, recomputed on resize
    let base: Vec = { x: 0, y: 0 };
    let tableY = 0;
    let R = 1; // L1 + L2
    let L1 = 0;
    let L2 = 0;
    let L3 = 0;
    let finger = 0;
    let box = 0;
    let pads: Record<"A" | "B", number> = { A: 0, B: 0 };

    // state
    let ee: Vec = { x: 0, y: 0 };
    let pointer: Vec | null = null;
    let pointerAge = Infinity;
    let step = 0;
    let stepTime = 0;
    let gripAmount = 0; // 0 open, 1 closed
    let carrying = false;
    let boxPos: Vec = { x: 0, y: 0 };
    let boxPad: "A" | "B" = "A";
    let cycleFrom: "A" | "B" = "A";
    const trail: Vec[] = [];
    let readoutTimer = 0;
    let P = currentPalette();

    const layout = () => {
      tableY = height * 0.8;
      R = Math.min(height * 0.66, width * 0.62);
      base = { x: width * 0.3, y: tableY - R * 0.08 };
      L1 = R * 0.54;
      L2 = R * 0.46;
      L3 = R * 0.15;
      finger = R * 0.08;
      box = Math.max(16, R * 0.11);
      pads = { A: base.x + R * 0.42, B: base.x + R * 0.86 };
      if (pads.B > width - box * 1.4) pads.B = width - box * 1.4;
      boxPos = { x: pads[boxPad], y: tableY - box };
      if (ee.x === 0) ee = { x: pads.A, y: tableY - R * 0.5 };
    };

    const resize = () => {
      const rect = panel.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
      draw();
    };

    /** flange height when the fingers are around the box */
    const gripY = () => tableY - box - finger * 0.35;

    // "A" in the sequence means the pad the box starts on, "B" the other one,
    // so the box shuttles back and forth between the two pads.
    const resolvePad = (slot: "A" | "B"): "A" | "B" =>
      slot === "A" ? cycleFrom : cycleFrom === "A" ? "B" : "A";

    const clampTarget = (t: Vec): Vec => {
      const minX = base.x + R * 0.18;
      const maxY = tableY - finger - 4;
      let x = Math.max(minX, Math.min(width - 12, t.x));
      let y = Math.min(maxY, Math.max(12, t.y));
      // keep the wrist inside the reachable annulus
      const wx = x - base.x;
      const wy = y - L3 - base.y;
      const d = Math.hypot(wx, wy);
      const max = R * 0.985;
      const min = Math.abs(L1 - L2) + R * 0.08;
      if (d > max || d < min) {
        const s = (d > max ? max : min) / (d || 1);
        x = base.x + wx * s;
        y = base.y + wy * s + L3;
      }
      return { x, y };
    };

    const solve = (flange: Vec) => {
      const wrist = { x: flange.x, y: flange.y - L3 };
      // math frame: y up
      const dx = wrist.x - base.x;
      const dy = base.y - wrist.y;
      const d = Math.min(Math.hypot(dx, dy), L1 + L2 - 1e-3);
      const c = (d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2);
      const q2 = -Math.acos(Math.max(-1, Math.min(1, c))); // elbow up
      const q1 =
        Math.atan2(dy, dx) - Math.atan2(L2 * Math.sin(q2), L1 + L2 * Math.cos(q2));
      const elbow = {
        x: base.x + L1 * Math.cos(q1),
        y: base.y - L1 * Math.sin(q1),
      };
      const q3 = -Math.PI / 2 - (q1 + q2); // tool straight down
      return { elbow, wrist, q1, q2, q3 };
    };

    const update = (dt: number) => {
      pointerAge += dt;
      const cursorMode = pointer !== null && pointerAge < CURSOR_TIMEOUT;
      let target: Vec;
      let wantGrip = false;

      if (cursorMode && pointer) {
        if (carrying) {
          // set the box down on the nearest pad
          carrying = false;
          boxPad =
            Math.abs(boxPos.x - pads.A) < Math.abs(boxPos.x - pads.B) ? "A" : "B";
          boxPos = { x: pads[boxPad], y: tableY - box };
        }
        target = clampTarget(pointer);
        step = 0;
        stepTime = 0;
      } else {
        if (step === 0 && stepTime === 0) cycleFrom = boxPad;
        const key = SEQUENCE[step];
        const real = resolvePad(key.at);
        target = { x: pads[real], y: key.lift === 0 ? gripY() : tableY - box - R * key.lift };
        wantGrip = key.grip;
        stepTime += dt;
        const settled = Math.hypot(ee.x - target.x, ee.y - target.y) < R * 0.02;
        if (settled && stepTime > key.hold) {
          // grip transitions happen at the bottom keyframes
          if (key.grip && key.lift === 0 && !carrying && real === boxPad) carrying = true;
          if (!key.grip && key.lift === 0 && carrying) {
            carrying = false;
            boxPad = real;
            boxPos = { x: pads[boxPad], y: tableY - box };
          }
          step = (step + 1) % SEQUENCE.length;
          stepTime = 0;
        }
      }

      const k = 1 - Math.exp(-dt * (cursorMode ? 9 : 4.2));
      ee = { x: ee.x + (target.x - ee.x) * k, y: ee.y + (target.y - ee.y) * k };
      gripAmount += ((wantGrip || carrying ? 1 : 0) - gripAmount) * (1 - Math.exp(-dt * 10));

      if (carrying) boxPos = { x: ee.x, y: ee.y + finger * 0.35 };

      trail.push({ ...ee });
      if (trail.length > 70) trail.shift();

      if (modeRef.current) {
        const label = cursorMode ? "Tracking pointer" : "Auto · pick and place";
        if (modeRef.current.textContent !== label) modeRef.current.textContent = label;
      }
    };

    const draw = () => {
      const { elbow, wrist, q1, q2, q3 } = solve(ee);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = P.bg;
      ctx.fillRect(0, 0, width, height);

      // grid
      ctx.strokeStyle = P.grid;
      ctx.lineWidth = 1;
      const g = 28;
      for (let x = (base.x % g) + 0.5; x < width; x += g) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, tableY);
        ctx.stroke();
      }
      for (let y = (tableY % g) + 0.5; y < tableY; y += g) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // reach envelope
      ctx.save();
      ctx.setLineDash([3, 6]);
      ctx.strokeStyle = P.envelope;
      ctx.beginPath();
      ctx.arc(base.x, base.y + L3, R, Math.PI * 1.04, Math.PI * 1.98);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = P.label;
      ctx.font = '500 10px "JetBrains Mono", ui-monospace, monospace';
      ctx.textBaseline = "middle";
      ctx.fillText(`reach ${REACH_MM} mm`, base.x + R * 0.71 + 8, base.y + L3 - R * 0.71);

      // table + pads
      ctx.fillStyle = P.table;
      ctx.fillRect(0, tableY, width, height - tableY);
      ctx.strokeStyle = P.tableLine;
      ctx.beginPath();
      ctx.moveTo(0, tableY + 0.5);
      ctx.lineTo(width, tableY + 0.5);
      ctx.stroke();
      ctx.strokeStyle = P.hatch;
      for (let x = 6; x < width; x += 14) {
        ctx.beginPath();
        ctx.moveTo(x, tableY + 1);
        ctx.lineTo(x - 8, tableY + 9);
        ctx.stroke();
      }
      (["A", "B"] as const).forEach((pad) => {
        const x = pads[pad];
        ctx.fillStyle = "rgba(255, 107, 26, 0.2)";
        ctx.fillRect(x - box * 0.8, tableY - 2, box * 1.6, 4);
        ctx.fillStyle = P.padLabel;
        ctx.fillText(`PAD ${pad}`, x - box * 0.8, tableY + 18);
      });

      // trail
      if (trail.length > 2) {
        ctx.beginPath();
        trail.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.strokeStyle = "rgba(255, 140, 70, 0.28)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // pointer reticle
      if (pointer && pointerAge < CURSOR_TIMEOUT) {
        const a = Math.max(0, 1 - pointerAge / CURSOR_TIMEOUT);
        ctx.strokeStyle = `rgba(255, 140, 70, ${0.7 * a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 9, 0, Math.PI * 2);
        ctx.moveTo(pointer.x - 15, pointer.y);
        ctx.lineTo(pointer.x - 5, pointer.y);
        ctx.moveTo(pointer.x + 5, pointer.y);
        ctx.lineTo(pointer.x + 15, pointer.y);
        ctx.moveTo(pointer.x, pointer.y - 15);
        ctx.lineTo(pointer.x, pointer.y - 5);
        ctx.moveTo(pointer.x, pointer.y + 5);
        ctx.lineTo(pointer.x, pointer.y + 15);
        ctx.stroke();
      }

      // box
      ctx.fillStyle = P.box;
      ctx.fillRect(boxPos.x - box / 2, boxPos.y, box, box);
      ctx.strokeStyle = P.boxInner;
      ctx.lineWidth = 1;
      ctx.strokeRect(boxPos.x - box / 2 + 3.5, boxPos.y + 3.5, box - 7, box - 7);

      // pedestal
      const pw = R * 0.16;
      ctx.fillStyle = P.pedestal;
      ctx.beginPath();
      ctx.moveTo(base.x - pw, tableY);
      ctx.lineTo(base.x - pw * 0.6, base.y);
      ctx.lineTo(base.x + pw * 0.6, base.y);
      ctx.lineTo(base.x + pw, tableY);
      ctx.closePath();
      ctx.fill();

      // links
      const link = (a: Vec, b: Vec, w: number, color: string) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = w;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      };
      const shoulder = base;
      const lw = Math.max(9, R * 0.075);
      link(shoulder, elbow, lw + 3, "#9a3d0b");
      link(shoulder, elbow, lw, "#ff6b1a");
      link(elbow, wrist, lw * 0.82 + 3, "#9a3d0b");
      link(elbow, wrist, lw * 0.82, "#ff7d33");
      link(wrist, ee, lw * 0.5, P.steel);

      // gripper
      const open = box * (0.85 - 0.33 * gripAmount);
      ctx.strokeStyle = P.steel;
      ctx.lineWidth = 3;
      ctx.lineCap = "butt";
      ctx.beginPath();
      ctx.moveTo(ee.x - open / 2 - 2, ee.y);
      ctx.lineTo(ee.x + open / 2 + 2, ee.y);
      ctx.moveTo(ee.x - open / 2, ee.y);
      ctx.lineTo(ee.x - open / 2, ee.y + finger);
      ctx.moveTo(ee.x + open / 2, ee.y);
      ctx.lineTo(ee.x + open / 2, ee.y + finger);
      ctx.stroke();

      // joints
      [shoulder, elbow, wrist].forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, lw * (i === 2 ? 0.48 : 0.62), 0, Math.PI * 2);
        ctx.fillStyle = P.jointFill;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = P.jointStroke;
        ctx.stroke();
      });

      // joint angle arc at the elbow
      ctx.strokeStyle = P.arc;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const a0 = -q1;
      const a1 = -(q1 + q2);
      ctx.arc(elbow.x, elbow.y, lw * 1.9, Math.min(a0, a1), Math.max(a0, a1));
      ctx.stroke();

      // readouts (throttled)
      readoutTimer += 1;
      if (readoutRef.current && readoutTimer % 4 === 0) {
        const deg = (r: number) => `${((r * 180) / Math.PI).toFixed(1)}°`;
        const mm = (px: number) => `${Math.round((px / R) * REACH_MM)}`;
        const values = [
          deg(q1),
          deg(q2),
          deg(q3),
          `${mm(ee.x - base.x)}, ${mm(tableY - ee.y)}`,
        ];
        readoutRef.current.querySelectorAll("dd").forEach((dd, i) => {
          if (dd.textContent !== values[i]) dd.textContent = values[i];
        });
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      update(dt);
      draw();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame || reduced || !visible || document.hidden) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const toLocal = (event: PointerEvent): Vec => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onPointer = (event: PointerEvent) => {
      pointer = toLocal(event);
      pointerAge = 0;
      if (reduced) {
        ee = clampTarget(pointer);
        draw();
      }
    };
    const onLeave = () => {
      pointerAge = CURSOR_TIMEOUT * 0.6;
    };

    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("pointerdown", onPointer);
    canvas.addEventListener("pointerleave", onLeave);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(panel);
    resize();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(panel);

    const onVisibility = () => (document.hidden ? stop() : start());

    // repaint with the other palette when the theme toggles
    const themeObserver = new MutationObserver(() => {
      P = currentPalette();
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) {
      ee = { x: pads.A, y: tableY - box - R * 0.3 };
      draw();
    } else {
      start();
    }

    return () => {
      stop();
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerdown", onPointer);
      canvas.removeEventListener("pointerleave", onLeave);
      resizeObserver.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <figure className="arm" aria-label="Interactive robot arm simulation">
      <div className="arm__stage" ref={panelRef}>
        <canvas ref={canvasRef} aria-hidden="true" />
        <div className="arm__hud arm__hud--top">
          <span className="arm__live" aria-hidden="true" />
          <span ref={modeRef}>Auto · pick and place</span>
        </div>
        <dl className="arm__readout" ref={readoutRef}>
          <div>
            <dt>q1</dt>
            <dd>0.0°</dd>
          </div>
          <div>
            <dt>q2</dt>
            <dd>0.0°</dd>
          </div>
          <div>
            <dt>q3</dt>
            <dd>0.0°</dd>
          </div>
          <div>
            <dt>x, z mm</dt>
            <dd>0, 0</dd>
          </div>
        </dl>
      </div>
      <figcaption className="arm__caption">
        <span>3-DoF arm · closed-form IK, tool held vertical</span>
        <span>Move your pointer over it</span>
      </figcaption>
    </figure>
  );
}
