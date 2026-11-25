# Design notes

**Goal.** A hiring manager should see in seconds that this person builds working
robot systems, then open the strongest four projects.

**Direction.** Industrial work cell. A dark "stage" (hero, contact, header)
frames a light spec-sheet body. Cool steel neutrals; one accent, safety orange.
Light and dark themes; the default follows the visitor's system setting.

**Type.** Archivo (expanded widths) for display, like an equipment nameplate;
Inter for text; JetBrains Mono for labels, units, and readouts.

**Hero.** An interactive 3-DoF arm (Canvas 2D): closed-form 2-link IK with the
tool held vertical. It tracks the pointer and runs a pick-and-place cycle when
idle, with live joint angles and end-effector position in mm. It stops when off
screen or the tab is hidden; reduced-motion shows a still frame.

**Projects.** Four featured systems in alternating media/spec rows: real footage
where it exists, theme-aware schematic drawings where it doesn't. Six smaller
projects in a card grid. Every project opens a case study (problem, role,
approach, result, pipeline).

**Honesty rules.** Every figure comes from a project README. Unconfirmed facts
stay as `[ADD: …]` in the data and are hidden from visitors (see
CONTENT_TODO.md). Diagrams carry labels, not invented numbers.
