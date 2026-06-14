import { SecurityEvent } from "../types";
import { displayValue, formatTimestamp, eventDataIssues, whyThisMatters } from "../utils";
import SeverityBadge from "./SeverityBadge";
import DataQualityBadge from "./DataQualityBadge";

interface EventDetailsPanelProps {
  event: SecurityEvent;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel-field">
      <span className="panel-field-label">{label}</span>
      <span className="panel-field-value">{value}</span>
    </div>
  );
}

export default function EventDetailsPanel({ event, onClose }: EventDetailsPanelProps) {
  const ts = formatTimestamp(event.timestamp);
  const issues = eventDataIssues(event);
  const reasons = whyThisMatters(event);
  const tags = event.tags ?? [];

  return (
    <aside className="event-panel" aria-label="Event details">
      <div className="event-panel-header">
        <SeverityBadge severity={event.severity} />
        <button className="event-panel-close" onClick={onClose} aria-label="Close details">
          ✕
        </button>
      </div>

      <h2 className="event-panel-title">{displayValue(event.title)}</h2>

      <DataQualityBadge issues={issues} />

      {reasons.length > 0 && (
        <div className="why-box">
          <div className="why-title">Why this matters</div>
          <ul>
            {reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="panel-fields">
        <Field label="Timestamp" value={ts.label + (ts.isFuture ? "  (future)" : "")} />
        <Field label="Asset hostname" value={displayValue(event.assetHostname)} />
        <Field label="Asset IP" value={displayValue(event.assetIp)} />
        <Field label="Source IP" value={displayValue(event.sourceIp)} />
        {event.userId && <Field label="User ID" value={displayValue(event.userId)} />}
      </div>

      <div className="panel-section">
        <div className="panel-section-title">Tags</div>
        {tags.length > 0 ? (
          <div className="tag-row">
            {tags.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <span className="panel-empty">—</span>
        )}
      </div>

      <div className="panel-section">
        <div className="panel-section-title">Description</div>
        <div className="panel-description">
          {displayValue(event.description, "(no description)")}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">Raw event data</div>
        <pre className="panel-raw">{JSON.stringify(event, null, 2)}</pre>
      </div>
    </aside>
  );
}
