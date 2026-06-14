import { displayValue } from "../utils";

const KNOWN = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

/**
 * Severity pill. Unknown severities get a neutral style — never the LOW look —
 * so an unexpected value can't masquerade as low priority.
 */
export default function SeverityBadge({ severity }: { severity: string }) {
  const variant = KNOWN.includes(severity) ? severity : "UNKNOWN";
  return <span className={`sev-badge sev-${variant}`}>{displayValue(severity)}</span>;
}
