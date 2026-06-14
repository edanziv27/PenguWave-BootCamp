// Shared helpers for PenguWave.

import type { Severity, SecurityEvent } from "./types";

// Severity ordering, most severe first. Use for any sorting/ranking.
export const SEVERITY_ORDER: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const SEVERITY_COLORS: Record<Severity, string> = {
  CRITICAL: "#b71c1c", // deep red — most severe, distinct from HIGH
  HIGH: "#e53935",
  MEDIUM: "#fb8c00",
  LOW: "#43a047",
};

/**
 * Color for a severity. Unknown/unexpected values get a neutral gray —
 * never the LOW/green color, so an unrecognized severity can't look benign.
 */
export function severityColor(severity: string): string {
  return SEVERITY_COLORS[severity as Severity] ?? "#757575";
}

/**
 * Rank for sorting: higher is more severe. Unknown severities sort last.
 */
export function severityRank(severity: string): number {
  const idx = SEVERITY_ORDER.indexOf(severity as Severity);
  return idx === -1 ? -1 : SEVERITY_ORDER.length - idx;
}

/**
 * Safely turn a possibly null/empty value into something displayable.
 */
export function displayValue(value: unknown, fallback = "—"): string {
  if (value === null || value === undefined) return fallback;
  const s = String(value).trim();
  return s === "" ? fallback : s;
}

/**
 * Format a timestamp for display, tolerating invalid values, and flag
 * timestamps that are in the future (a common data-quality problem).
 */
export function formatTimestamp(ts: string): { label: string; isFuture: boolean } {
  const date = new Date(ts);
  if (isNaN(date.getTime())) {
    return { label: displayValue(ts), isFuture: false };
  }
  return { label: date.toLocaleString(), isFuture: date.getTime() > Date.now() };
}

/**
 * Detect data-quality problems in an event so the UI can flag, not crash on, them.
 */
export function eventDataIssues(event: SecurityEvent): string[] {
  const issues: string[] = [];
  if (formatTimestamp(event.timestamp).isFuture) issues.push("Timestamp is in the future");
  if (!event.sourceIp) issues.push("Missing source IP");
  if (event.sourceIp === "unknown" || event.assetIp === "unknown") issues.push("Unknown IP address");
  if (!event.description || event.description.trim() === "") issues.push("Empty description");
  if (!event.userId) issues.push("Missing owning user");
  return issues;
}

/**
 * Escape a single CSV cell: neutralize spreadsheet formula injection (values
 * starting with = + - @ or control chars get a leading apostrophe) and quote
 * fields containing commas, quotes, or newlines.
 */
function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

/**
 * Serialize a list of records to CSV for export. Quotes/escapes fields and
 * neutralizes formula injection. (Currently unused — the app exports JSON —
 * but kept safe so any future CSV export can't carry an injection payload.)
 */
export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = rows.map((r) => headers.map((h) => csvCell(r[h])).join(","));
  return [headers.map(csvCell).join(","), ...lines].join("\n");
}

/**
 * Whether the current user has admin privileges.
 */
export function isAdmin(): boolean {
  return localStorage.getItem("role") === "admin";
}
