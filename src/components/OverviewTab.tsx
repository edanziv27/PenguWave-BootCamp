import { SecurityEvent } from "../types";
import { EventFilters } from "../eventQuery";
import { displayValue, formatTimestamp } from "../utils";
import {
  riskSummary,
  severityDistribution,
  topAssets,
  tagFrequency,
  recentHighSeverity,
  dataQualityBuckets,
} from "../insights";
import SeverityBadge from "./SeverityBadge";
import SectionHeader from "./SectionHeader";
import AskAiPlaceholderButton from "./AskAiPlaceholderButton";

interface OverviewTabProps {
  events: SecurityEvent[];
  onDrill: (partial: Partial<EventFilters>) => void;
  onOpenEvent: (event: SecurityEvent) => void;
  onGoTab: (id: string) => void;
}

const SEVERITY_BAR_COLOR: Record<string, string> = {
  CRITICAL: "var(--critical)",
  HIGH: "var(--high)",
  MEDIUM: "#f2c94c",
  LOW: "#56d364",
  OTHER: "var(--text-muted)",
};

export default function OverviewTab({ events, onDrill, onOpenEvent, onGoTab }: OverviewTabProps) {
  const summary = riskSummary(events);
  const distribution = severityDistribution(events);
  const assets = topAssets(events, 6);
  const tags = tagFrequency(events, 14);
  const recent = recentHighSeverity(events, 6);
  const dqBuckets = dataQualityBuckets(events);
  const dqTotal = new Set(dqBuckets.flatMap((b) => b.events.map((e) => e.id))).size;

  const maxAsset = Math.max(1, ...assets.map((a) => a.count));
  const maxDist = Math.max(1, ...distribution.map((d) => d.count));

  return (
    <div className="overview-tab">
      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-value">{summary.total}</span>
          <span className="stat-label">Total Events</span>
        </div>
        <button
          className="stat-card stat-critical"
          onClick={() => onDrill({ severities: ["CRITICAL"] })}
        >
          <span className="stat-value">{summary.critical}</span>
          <span className="stat-label">Critical</span>
        </button>
        <button className="stat-card stat-high" onClick={() => onDrill({ severities: ["HIGH"] })}>
          <span className="stat-value">{summary.high}</span>
          <span className="stat-label">High</span>
        </button>
        <button className="stat-card" onClick={() => onGoTab("data-quality")}>
          <span className="stat-value">{summary.withIssues}</span>
          <span className="stat-label">Data-quality issues</span>
        </button>
        <div className="stat-card">
          <span className="stat-value">{summary.externalSource}</span>
          <span className="stat-label">External source IPs</span>
        </div>
      </div>

      <div className="dash-3col">
        <section className="panel-card dash-col">
          <SectionHeader title="Severity distribution" sub="Click a band to investigate" />
          <div className="dist-list">
            {distribution.map((d) => (
              <button
                key={d.key}
                className="dist-row"
                onClick={() => d.key !== "OTHER" && onDrill({ severities: [d.key] })}
                disabled={d.key === "OTHER"}
              >
                <span className="dist-label">{d.key}</span>
                <span className="dist-track">
                  <span
                    className="dist-fill"
                    style={{
                      width: `${(d.count / maxDist) * 100}%`,
                      background: SEVERITY_BAR_COLOR[d.key] ?? "var(--text-muted)",
                    }}
                  />
                </span>
                <span className="dist-count">{d.count}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel-card dash-col">
          <SectionHeader title="Top affected assets" sub="By event volume" />
          <div className="rank-list">
            {assets.map((a) => (
              <button key={a.key} className="rank-row" onClick={() => onDrill({ assets: [a.key] })}>
                <span className="rank-label" title={a.key}>
                  {a.key}
                </span>
                <span className="rank-track">
                  <span className="rank-fill" style={{ width: `${(a.count / maxAsset) * 100}%` }} />
                </span>
                <span className="rank-count">{a.count}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="panel-card dash-col">
          <SectionHeader title="Common tags" sub="Click to filter" />
          <div className="tag-cloud">
            {tags.map((t) => (
              <button
                key={t.key}
                className="tag-chip tag-chip-button"
                onClick={() => onDrill({ tags: [t.key] })}
              >
                {t.key} <span className="tag-count">{t.count}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="panel-card">
        <SectionHeader
          title="Recent critical & high activity"
          sub="Newest first"
          action={<AskAiPlaceholderButton context="Ask AI could summarize this activity." />}
        />
        <div className="recent-list">
          {recent.length === 0 && <p className="panel-empty">No critical or high events.</p>}
          {recent.map((e) => {
            const ts = formatTimestamp(e.timestamp);
            return (
              <button key={e.id} className="recent-row" onClick={() => onOpenEvent(e)}>
                <SeverityBadge severity={e.severity} />
                <span className="recent-title">{displayValue(e.title)}</span>
                <span className="recent-time">
                  {ts.label}
                  {ts.isFuture ? " (future)" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {dqTotal > 0 && (
        <section className="panel-card dq-strip">
          <div className="dq-strip-text">
            <strong>{dqTotal}</strong> events have data-quality concerns across {dqBuckets.length}{" "}
            categories. PenguWave flags these rather than trusting them blindly.
          </div>
          <button className="btn-secondary" onClick={() => onGoTab("data-quality")}>
            Open Data Quality
          </button>
        </section>
      )}
    </div>
  );
}
