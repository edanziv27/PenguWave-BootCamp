// Deterministic, explainable aggregations over the events dataset.
// No AI, no network — pure functions used by the Overview / Insights / Data Quality tabs.
import { SecurityEvent, Severity } from "./types";
import { SEVERITY_ORDER, eventDataIssues, isExternalIp, timestampMs } from "./utils";

export interface Counted<T> {
  key: T;
  count: number;
}

/** Count of events per severity, in CRITICAL→LOW order, plus an "OTHER" bucket. */
export function severityDistribution(events: SecurityEvent[]): Counted<string>[] {
  const counts: Record<string, number> = {};
  for (const e of events) counts[e.severity] = (counts[e.severity] ?? 0) + 1;
  const known = SEVERITY_ORDER.map((s) => ({ key: s as string, count: counts[s] ?? 0 }));
  const otherCount = events.length - known.reduce((sum, k) => sum + k.count, 0);
  return otherCount > 0 ? [...known, { key: "OTHER", count: otherCount }] : known;
}

/** Risk summary numbers for the Overview cards. */
export function riskSummary(events: SecurityEvent[]) {
  return {
    total: events.length,
    critical: events.filter((e) => e.severity === "CRITICAL").length,
    high: events.filter((e) => e.severity === "HIGH").length,
    withIssues: events.filter((e) => eventDataIssues(e).length > 0).length,
    externalSource: events.filter((e) => isExternalIp(e.sourceIp)).length,
  };
}

function topCounts<T>(values: T[], limit: number): Counted<T>[] {
  const map = new Map<T, number>();
  for (const v of values) map.set(v, (map.get(v) ?? 0) + 1);
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Most frequently affected asset hostnames. */
export function topAssets(events: SecurityEvent[], limit = 6): Counted<string>[] {
  return topCounts(
    events.map((e) => e.assetHostname).filter((h): h is string => Boolean(h)),
    limit
  );
}

/** Tag frequency, most common first. */
export function tagFrequency(events: SecurityEvent[], limit = 14): Counted<string>[] {
  return topCounts(events.flatMap((e) => e.tags ?? []), limit);
}

/** Source IPs seen on more than one event (potential repeat offenders). */
export function repeatedSourceIps(events: SecurityEvent[], limit = 8): Counted<string>[] {
  const ips = events
    .map((e) => e.sourceIp)
    .filter((ip): ip is string => Boolean(ip) && ip !== "unknown");
  return topCounts(ips, ips.length).filter((c) => c.count > 1).slice(0, limit);
}

/** CRITICAL/HIGH events, newest first (future/invalid timestamps sink). */
export function recentHighSeverity(events: SecurityEvent[], limit = 6): SecurityEvent[] {
  return events
    .filter((e) => e.severity === "CRITICAL" || e.severity === "HIGH")
    .slice()
    .sort((a, b) => {
      const av = timestampMs(a.timestamp);
      const bv = timestampMs(b.timestamp);
      if (Number.isNaN(av) && Number.isNaN(bv)) return 0;
      if (Number.isNaN(av)) return 1;
      if (Number.isNaN(bv)) return -1;
      return bv - av;
    })
    .slice(0, limit);
}

const SEVERITY_WEIGHT: Record<string, number> = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };

export interface RiskyAsset {
  asset: string;
  score: number;
  count: number;
  bySeverity: Record<string, number>;
}

/** Assets ranked by a transparent weighted score (CRITICAL=3, HIGH=2, MEDIUM=1, LOW=0). */
export function riskyAssets(events: SecurityEvent[], limit = 6): RiskyAsset[] {
  const map = new Map<string, RiskyAsset>();
  for (const e of events) {
    const asset = e.assetHostname;
    if (!asset) continue;
    const entry =
      map.get(asset) ?? { asset, score: 0, count: 0, bySeverity: {} as Record<string, number> };
    entry.score += SEVERITY_WEIGHT[e.severity] ?? 0;
    entry.count += 1;
    entry.bySeverity[e.severity] = (entry.bySeverity[e.severity] ?? 0) + 1;
    map.set(asset, entry);
  }
  return [...map.values()].sort((a, b) => b.score - a.score || b.count - a.count).slice(0, limit);
}

function normalizeForDup(e: SecurityEvent): string {
  return `${(e.title ?? "").trim().toLowerCase()}::${(e.description ?? "").trim().toLowerCase()}`;
}

export interface DuplicateCluster {
  signature: string;
  events: SecurityEvent[];
}

/** Groups of events that share a normalized title+description but have different ids. */
export function duplicateClusters(events: SecurityEvent[]): DuplicateCluster[] {
  const map = new Map<string, SecurityEvent[]>();
  for (const e of events) {
    const sig = normalizeForDup(e);
    if (!sig || sig === "::") continue;
    map.set(sig, [...(map.get(sig) ?? []), e]);
  }
  return [...map.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([signature, group]) => ({ signature, events: group }));
}

/** A hostname that isn't a normal dotted FQDN (URLs, repo paths, k8s pods, serials). */
export function isUnusualHostname(hostname: string | null): boolean {
  if (!hostname) return true;
  const h = hostname.trim();
  if (h === "") return true;
  if (/\s/.test(h)) return true;
  if (/[:/@]/.test(h)) return true; // s3://…, github.com/org, scheme/path separators
  return !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(h);
}

/** Text that looks like an injected payload (markup or spreadsheet-formula markers). */
export function looksLikePayload(value: string | null | undefined): boolean {
  if (!value) return false;
  if (/[<>]/.test(value)) return true; // HTML/script-like markup
  if (/^\s*[=+\-@]/.test(value)) return true; // CSV/formula injection prefix
  return false;
}

export type DataQualityBucketId =
  | "future"
  | "missing"
  | "emptyDescription"
  | "unknownIp"
  | "unusualHostname"
  | "duplicate"
  | "payload";

export interface DataQualityBucket {
  id: DataQualityBucketId;
  title: string;
  description: string;
  events: SecurityEvent[];
}

/** Group events into data-quality buckets. Each event may appear in multiple buckets. */
export function dataQualityBuckets(events: SecurityEvent[]): DataQualityBucket[] {
  const isFuture = (e: SecurityEvent) => {
    const t = timestampMs(e.timestamp);
    return !Number.isNaN(t) && t > Date.now();
  };
  const dupIds = new Set(duplicateClusters(events).flatMap((c) => c.events.map((e) => e.id)));

  const buckets: DataQualityBucket[] = [
    {
      id: "future",
      title: "Future timestamps",
      description: "Events dated in the future — likely clock drift or tampering.",
      events: events.filter(isFuture),
    },
    {
      id: "missing",
      title: "Missing fields",
      description: "Null source IP or owning user.",
      events: events.filter((e) => !e.sourceIp || !e.userId),
    },
    {
      id: "emptyDescription",
      title: "Empty descriptions",
      description: "No description to triage from.",
      events: events.filter((e) => !e.description || e.description.trim() === ""),
    },
    {
      id: "unknownIp",
      title: "Unknown IPs",
      description: 'Source or asset IP recorded as "unknown".',
      events: events.filter((e) => e.sourceIp === "unknown" || e.assetIp === "unknown"),
    },
    {
      id: "unusualHostname",
      title: "Unusual hostnames",
      description: "Asset identifiers that aren't standard FQDNs (URLs, repos, pods, serials).",
      events: events.filter((e) => isUnusualHostname(e.assetHostname)),
    },
    {
      id: "duplicate",
      title: "Duplicate-like records",
      description: "Different IDs that share the same title and description.",
      events: events.filter((e) => dupIds.has(e.id)),
    },
    {
      id: "payload",
      title: "Suspicious payloads",
      description: "Field values containing markup or formula characters (shown as text only).",
      events: events.filter(
        (e) => looksLikePayload(e.description) || looksLikePayload(e.title) || looksLikePayload(e.assetHostname)
      ),
    },
  ];

  return buckets.filter((b) => b.events.length > 0);
}

/** Severity helper kept here so tabs don't all import from utils for one value. */
export function isKnownSeverity(s: string): s is Severity {
  return (SEVERITY_ORDER as string[]).includes(s);
}
