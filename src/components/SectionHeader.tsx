import { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  sub?: string;
  action?: ReactNode;
}

/** Consistent card/section header: title + optional subtitle, with an optional right-aligned action slot. */
export default function SectionHeader({ title, sub, action }: SectionHeaderProps) {
  return (
    <div className="panel-card-head">
      <div className="panel-card-head-text">
        <h3>{title}</h3>
        {sub && <span className="panel-card-sub">{sub}</span>}
      </div>
      {action && <div className="panel-card-head-action">{action}</div>}
    </div>
  );
}
