import { BrainCircuit, Cpu, Move3d, ScanEye, type LucideIcon } from "lucide-react";
import { skillGroups, type SkillGroup } from "../data/content";
import { SectionHeader } from "./SectionHeader";

const ICONS: Record<SkillGroup["icon"], LucideIcon> = {
  learning: BrainCircuit,
  perception: ScanEye,
  control: Move3d,
  hardware: Cpu,
};

export function Skills() {
  return (
    <section className="section" id="skills" aria-labelledby="skills-title">
      <div className="shell">
        <SectionHeader id="skills-title" label="Capabilities" title="What I bring to a robotics team.">
          <p>Four layers of the stack, each used in the projects above.</p>
        </SectionHeader>

        <div className="capabilities">
          {skillGroups.map((group) => {
            const Icon = ICONS[group.icon];
            return (
              <article className="capability reveal" key={group.title}>
                <span className="capability__icon" aria-hidden="true">
                  <Icon size={22} strokeWidth={1.75} />
                </span>
                <h3>{group.title}</h3>
                <p className="capability__summary">{group.summary}</p>
                <ul className="tags tags--small" aria-label={`${group.title} tools`}>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
