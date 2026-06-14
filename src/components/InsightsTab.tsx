import { SecurityEvent } from "../types";
import { EventFilters } from "../eventQuery";
import { displayValue, isExternalIp, whyThisMatters } from "../utils";
import {
  riskyAssets,
  repeatedSourceIps,
  tagFrequency,
  recentHighSeverity,
  duplicateClusters,
} from "../insights";
import SeverityBadge from "./SeverityBadge";
import SectionHeader from "./SectionHeader";
import AskAiPlaceholderButton from "./AskAiPlaceholderButton";

interface InsightsTabProps {
  events: SecurityEvent[];
  onDrill: (partial: Partial<EventFilters>) => void;
  onOpenEvent: (event: SecurityEvent) => void;
}

export default function InsightsTab({ events, onDrill, onOpenEvent }: InsightsTabProps) {
  const assets = riskyAssets(events, 6);
  const ips = repeatedSourceIps(events, 8);
  const tags = tagFrequency(events, 12);
  const attention = recentHighSeverity(events, 4);
  const clusters = duplicateClusters(events);
  const maxScore = Math.max(1, ...assets.map((a) => a.score));

  return (
    <div className="insights-tab">
      <div className="dash-3col">
        <section className="panel-card dash-col">
          <SectionHeader
            title="Top risky assets"
            sub="Weighted score — CRITICAL×3, HIGH×2, MEDIUM×1"
          />
          <div className="rank-list">
            {assets.map((a) => (
              <button
                key={a.asset}
                className="rank-row"
                onClick={() => onDrill({ assets: [a.asset] })}
                title={`${a.count} events · score ${a.score}`}
              >
                <span className="rank-label" title={a.asset}>
                  {a.asset}
                </span>
                <span className="rank-track">
                  <span className="rank-fill" style={{ width: `${(a.score / maxScore) * 100}%` }} />
                </span>
                <span className="rank-count">{a.score}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel-card dash-col">
          <SectionHeader title="Repeated source IPs" sub="Same source seen on multiple events" />
          <div className="rank-list">
            {ips.length === 0 && <p className="panel-empty">No repeated source IPs.</p>}
            {ips.map((ip) => (
              <button key={ip.key} className="rank-row" onClick={() => onDrill({ sourceIps: [ip.key] })}>
                <span className="rank-label cell-mono">
                  {ip.key}
                  {isExternalIp(ip.key) && <span className="tag-ext">external</span>}
                </span>
                <span className="rank-count">{ip.count}×</span>
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

      <div className="dash-2col">
        <section className="panel-card dash-col">
          <SectionHeader
            title="Needs attention"
            sub="Highest-severity events and why they matter"
            action={<AskAiPlaceholderButton context="Ask AI could triage these events." />}
          />
          <div className="attention-grid">
            {attention.map((e) => (
              <button key={e.id} className="attention-row" onClick={() => onOpenEvent(e)}>
                <div className="attention-head">
                  <SeverityBadge severity={e.severity} />
                  <span className="attention-title">{displayValue(e.title)}</span>
                </div>
                <ul className="attention-reasons">
                  {whyThisMatters(e).map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </section>

        <section className="panel-card dash-col">
          <SectionHeader
            title="Possible duplicate clusters"
            sub="Different IDs sharing the same title and description"
          />
          {clusters.length === 0 ? (
            <p className="panel-empty">No duplicate-like records found.</p>
          ) : (
            <div className="cluster-list">
              {clusters.map((c) => (
                <div key={c.signature} className="cluster">
                  <div className="cluster-title">
                    <SeverityBadge severity={c.events[0].severity} />
                    {displayValue(c.events[0].title)}
                  </div>
                  <div className="cluster-events">
                    {c.events.map((e) => (
                      <button key={e.id} className="cluster-id" onClick={() => onOpenEvent(e)}>
                        {e.id}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
