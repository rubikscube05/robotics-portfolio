import type { ReactNode } from "react";

type SectionHeaderProps = {
  id: string;
  label: string;
  title: string;
  children?: ReactNode;
};

export function SectionHeader({ id, label, title, children }: SectionHeaderProps) {
  return (
    <header className="section-head">
      <p className="label">{label}</p>
      <h2 id={id}>{title}</h2>
      {children ? <div className="section-head__intro">{children}</div> : null}
    </header>
  );
}
