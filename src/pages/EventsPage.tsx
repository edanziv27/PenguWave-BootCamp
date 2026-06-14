import { useState } from "react";
import mockEvents from "../../data/mock_events.json";
import { SecurityEvent } from "../types";
import EventsOverview from "../components/EventsOverview";
import EventsTable from "../components/EventsTable";
import EventDetailsPanel from "../components/EventDetailsPanel";

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

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "penguwave_events_export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container">
      <h1>Security Events</h1>

      <EventsOverview events={filtered} />

      <div className="events-controls">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
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
          Showing results for: <strong>{search}</strong>
        </p>
      )}

      <div className="events-layout">
        <div className="events-main">
          <div className="events-toolbar">
            <p className="table-meta">
              Showing {filtered.length} of {events.length} events
            </p>
            <button className="btn-secondary" onClick={exportJson}>
              Export Events (JSON)
            </button>
          </div>

          <EventsTable
            events={filtered}
            selectedId={selectedEvent?.id ?? null}
            onSelect={setSelectedEvent}
          />

          {filtered.length === 0 && <p className="no-results">No events found.</p>}
        </div>

        {selectedEvent && (
          <EventDetailsPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </div>
    </div>
  );
}
