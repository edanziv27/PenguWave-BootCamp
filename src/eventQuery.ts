// Pure filtering / sorting / faceting logic for the Events page.
import { SecurityEvent } from "./types";
import { severityRank, timestampMs } from "./utils";

export interface EventFilters {
  search: string;
  severities: string[];
  assets: string[];
  sourceIps: string[];
  tags: string[];
}

/** The multi-select filter categories (everything except free-text search). */
export type FilterCategory = "severities" | "assets" | "sourceIps" | "tags";

export const DEFAULT_FILTERS: EventFilters = {
  search: "",
  severities: [],
  assets: [],
  sourceIps: [],
  tags: [],
};

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "sev-desc", label: "Severity: highest first" },
  { value: "sev-asc", label: "Severity: lowest first" },
  { value: "asset", label: "Asset A–Z" },
  { value: "title", label: "Title A–Z" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

/** Case-insensitive substring match across the searchable fields. Null/non-string fields are skipped. */
export function matchesSearch(event: SecurityEvent, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    event.title,
    event.description,
    event.assetHostname,
    event.assetIp,
    event.sourceIp,
    event.userId,
    ...(event.tags ?? []),
  ]
    .filter((v): v is string => typeof v === "string")
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

/**
 * Apply all filters together. Within a category the selected values are OR'd;
 * across categories the categories are AND'd. An empty category matches all.
 */
export function filterEvents(events: SecurityEvent[], f: EventFilters): SecurityEvent[] {
  return events.filter(
    (e) =>
      matchesSearch(e, f.search) &&
      (f.severities.length === 0 || f.severities.includes(e.severity)) &&
      (f.assets.length === 0 || (e.assetHostname != null && f.assets.includes(e.assetHostname))) &&
      (f.sourceIps.length === 0 || (e.sourceIp != null && f.sourceIps.includes(e.sourceIp))) &&
      (f.tags.length === 0 || (e.tags ?? []).some((t) => f.tags.includes(t)))
  );
}

/** Sort a copy of the list. Invalid/missing timestamps always sink to the bottom. */
export function sortEvents(events: SecurityEvent[], sort: SortKey): SecurityEvent[] {
  const list = [...events];
  const byTime = (dir: number) => (a: SecurityEvent, b: SecurityEvent) => {
    const av = timestampMs(a.timestamp);
    const bv = timestampMs(b.timestamp);
    const aInvalid = Number.isNaN(av);
    const bInvalid = Number.isNaN(bv);
    if (aInvalid && bInvalid) return 0;
    if (aInvalid) return 1; // push invalid to the end regardless of direction
    if (bInvalid) return -1;
    return dir * (bv - av); // dir = 1 => newest first
  };
  switch (sort) {
    case "newest":
      return list.sort(byTime(1));
    case "oldest":
      return list.sort(byTime(-1));
    case "sev-desc":
      return list.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
    case "sev-asc":
      return list.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
    case "asset":
      return list.sort((a, b) => (a.assetHostname ?? "").localeCompare(b.assetHostname ?? ""));
    case "title":
      return list.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    default:
      return list;
  }
}

/** Derive the distinct, sorted values used to populate the filter dropdowns. */
export function deriveFacets(events: SecurityEvent[]) {
  const assets = new Set<string>();
  const sourceIps = new Set<string>();
  const tags = new Set<string>();
  for (const e of events) {
    if (e.assetHostname) assets.add(e.assetHostname);
    if (e.sourceIp && e.sourceIp !== "unknown") sourceIps.add(e.sourceIp);
    for (const t of e.tags ?? []) tags.add(t);
  }
  const cmp = (a: string, b: string) => a.localeCompare(b);
  return {
    assets: [...assets].sort(cmp),
    sourceIps: [...sourceIps].sort(cmp),
    tags: [...tags].sort(cmp),
  };
}
