import { SecurityEvent } from "../types";

interface OverviewCard {
  label: string;
  value: number;
  accent?: "critical" | "high";
}

/**
 * Summary cards describing the events currently in view. Driven by whatever
 * list is passed in (the filtered set), so the overview always matches the table.
 */
export default function EventsOverview({ events }: { events: SecurityEvent[] }) {
  const critical = events.filter((e) => e.severity === "CRITICAL").length;
  const high = events.filter((e) => e.severity === "HIGH").length;
  const affectedAssets = new Set(
    events.map((e) => e.assetHostname).filter((h): h is string => Boolean(h))
  ).size;
  // Exclude missing/placeholder IPs so the count reflects real, distinct sources.
  const uniqueSourceIps = new Set(
    events.filter((e) => e.sourceIp && e.sourceIp !== "unknown").map((e) => e.sourceIp)
  ).size;

  const cards: OverviewCard[] = [
    { label: "Total Events", value: events.length },
    { label: "Critical", value: critical, accent: "critical" },
    { label: "High", value: high, accent: "high" },
    { label: "Affected Assets", value: affectedAssets },
    { label: "Unique Source IPs", value: uniqueSourceIps },
  ];

  return (
    <div className="overview-grid">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`overview-card${card.accent ? ` accent-${card.accent}` : ""}`}
        >
          <div className="overview-card-value">{card.value}</div>
          <div className="overview-card-label">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
