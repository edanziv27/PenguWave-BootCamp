import { SecurityEvent } from "../types";
import { displayValue, formatTimestamp } from "../utils";
import { dataQualityBuckets } from "../insights";
import SeverityBadge from "./SeverityBadge";
import SectionHeader from "./SectionHeader";

interface DataQualityTabProps {
  events: SecurityEvent[];
  onOpenEvent: (event: SecurityEvent) => void;
}

export default function DataQualityTab({ events, onOpenEvent }: DataQualityTabProps) {
  const buckets = dataQualityBuckets(events);
  const affected = new Set(buckets.flatMap((b) => b.events.map((e) => e.id))).size;

  return (
    <div className="dq-tab">
      <section className="panel-card dq-intro">
        <h3>Data quality &amp; trust</h3>
        <p className="panel-card-sub">
          Real-world security feeds are messy. PenguWave inspects every record and flags anything
          unusual instead of trusting it blindly — <strong>{affected}</strong> of {events.length}{" "}
          events triggered at least one check below. All field values are rendered as plain text,
          never executed.
        </p>
      </section>

      {buckets.length === 0 ? (
        <div className="empty-state">
          <p>No data-quality issues detected. The dataset looks clean.</p>
        </div>
      ) : (
        <div className="dq-bucket-grid">
          {buckets.map((bucket) => (
            <section key={bucket.id} className="panel-card dq-bucket">
              <SectionHeader
                title={bucket.title}
                sub={bucket.description}
                action={<span className="dq-bucket-count">{bucket.events.length}</span>}
              />
              <div className="dq-event-list">
                {bucket.events.map((e) => {
                  const ts = formatTimestamp(e.timestamp);
                  return (
                    <button key={e.id} className="dq-event-row" onClick={() => onOpenEvent(e)}>
                      <SeverityBadge severity={e.severity} />
                      <span className="dq-event-title">{displayValue(e.title, "(no title)")}</span>
                      <span className="dq-event-meta">
                        {e.id}
                        {bucket.id === "future" ? ` · ${ts.label}` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
