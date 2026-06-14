import { SecurityEvent } from "../types";
import { displayValue, formatTimestamp, eventDataIssues } from "../utils";
import SeverityBadge from "./SeverityBadge";
import DataQualityBadge from "./DataQualityBadge";

interface EventsTableProps {
  events: SecurityEvent[];
  selectedId: string | null;
  onSelect: (event: SecurityEvent) => void;
  compact?: boolean;
  showDataQuality?: boolean;
}

export default function EventsTable({
  events,
  selectedId,
  onSelect,
  compact = false,
  showDataQuality = true,
}: EventsTableProps) {
  return (
    <table className={`events-table${compact ? " compact" : ""}`}>
      <thead>
        <tr>
          <th>Severity</th>
          <th>Title</th>
          <th>Asset</th>
          <th>Source IP</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {events.map((event) => {
          const ts = formatTimestamp(event.timestamp);
          const issues = eventDataIssues(event);
          const tags = event.tags ?? [];
          return (
            <tr
              key={event.id}
              className={event.id === selectedId ? "selected" : ""}
              onClick={() => onSelect(event)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(event);
                }
              }}
              tabIndex={0}
              role="button"
              aria-pressed={event.id === selectedId}
              aria-label={`View details for ${displayValue(event.title)}`}
            >
              <td>
                <SeverityBadge severity={event.severity} />
              </td>
              <td>
                <div className="event-title">
                  <span className="event-title-text">{displayValue(event.title)}</span>
                  {showDataQuality && <DataQualityBadge issues={issues} inline />}
                </div>
                {tags.length > 0 && (
                  <div className="tag-row">
                    {tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="tag-chip">
                        {tag}
                      </span>
                    ))}
                    {tags.length > 3 && <span className="tag-more">+{tags.length - 3}</span>}
                  </div>
                )}
              </td>
              <td className="cell-mono" title={displayValue(event.assetHostname)}>
                {displayValue(event.assetHostname)}
              </td>
              <td className="cell-mono" title={displayValue(event.sourceIp)}>
                {displayValue(event.sourceIp)}
              </td>
              <td className="cell-ts">
                {ts.label}
                {ts.isFuture && showDataQuality && (
                  <span className="ts-future" title="Timestamp is in the future">
                    {" "}
                    (future)
                  </span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
