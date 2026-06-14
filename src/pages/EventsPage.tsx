import { useState } from "react";
import mockEvents from "../../data/mock_events.json";
import { SecurityEvent } from "../types";
import { severityColor, displayValue, formatTimestamp, eventDataIssues } from "../utils";

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      style={{
        backgroundColor: severityColor(severity),
        color: "white",
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {displayValue(severity)}
    </span>
  );
}

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  const events = mockEvents as SecurityEvent[];

  const filtered = events.filter((e) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (e.title ?? "").toLowerCase().includes(q) ||
      (e.description ?? "").toLowerCase().includes(q) ||
      (e.assetHostname ?? "").toLowerCase().includes(q);
    const matchesSeverity = severityFilter === "ALL" || e.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="page-container">
      <h1>Security Events</h1>

      <div style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: 400 }}
        />
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          style={{ width: 140 }}
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {search && (
        <p>
          Showing results for: <strong>{search}</strong> ({filtered.length} events)
        </p>
      )}

      <table>
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
          {filtered.map((event) => {
            const ts = formatTimestamp(event.timestamp);
            const issues = eventDataIssues(event);
            return (
              <tr
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedEvent(event);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${displayValue(event.title)}`}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <SeverityBadge severity={event.severity} />
                </td>
                <td>
                  {displayValue(event.title)}
                  {issues.length > 0 && (
                    <span title={issues.join("; ")} style={{ marginLeft: 6, cursor: "help" }}>
                      ⚠️
                    </span>
                  )}
                </td>
                <td style={{ fontFamily: "monospace", fontSize: 13 }}>
                  {displayValue(event.assetHostname)}
                </td>
                <td style={{ fontFamily: "monospace", fontSize: 13 }}>
                  {displayValue(event.sourceIp)}
                </td>
                <td style={{ fontSize: 13 }}>
                  {ts.label}
                  {ts.isFuture && (
                    <span style={{ color: "#b71c1c", marginLeft: 6 }} title="Timestamp is in the future">
                      (future)
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {filtered.length === 0 && <p style={{ color: "#999" }}>No events found.</p>}

      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "penguwave_events_export.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
          style={{ fontSize: 13 }}
        >
          Export Events (JSON)
        </button>
      </div>

      {/* Inline event detail */}
      {selectedEvent && (
        <div className="event-detail">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>{displayValue(selectedEvent.title)}</h2>
            <button onClick={() => setSelectedEvent(null)} style={{ cursor: "pointer" }}>
              Close
            </button>
          </div>

          {eventDataIssues(selectedEvent).length > 0 && (
            <p
              style={{
                background: "#fff8e1",
                border: "1px solid #ffe082",
                padding: "8px 10px",
                fontSize: 13,
              }}
            >
              ⚠️ Data quality: {eventDataIssues(selectedEvent).join("; ")}
            </p>
          )}

          <p>
            <strong>Severity:</strong> <SeverityBadge severity={selectedEvent.severity} />
          </p>
          <p>
            <strong>Description:</strong>
          </p>
          <div style={{ whiteSpace: "pre-wrap" }}>
            {displayValue(selectedEvent.description, "(no description)")}
          </div>
          <p>
            <strong>Asset:</strong> {displayValue(selectedEvent.assetHostname)} (
            {displayValue(selectedEvent.assetIp)})
          </p>
          <p>
            <strong>Source IP:</strong> {displayValue(selectedEvent.sourceIp)}
          </p>
          <p>
            <strong>Tags:</strong> {displayValue((selectedEvent.tags ?? []).join(", "))}
          </p>
          <p>
            <strong>Timestamp:</strong> {formatTimestamp(selectedEvent.timestamp).label}
          </p>
          <h3>Raw Event Data</h3>
          <pre>{JSON.stringify(selectedEvent, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
