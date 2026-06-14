import { useMemo, useState } from "react";
import mockEvents from "../../data/mock_events.json";
import { SecurityEvent } from "../types";
import EventsOverview from "../components/EventsOverview";
import EventsTable from "../components/EventsTable";
import EventDetailsPanel from "../components/EventDetailsPanel";
import {
  DEFAULT_FILTERS,
  EventFilters,
  SORT_OPTIONS,
  SortKey,
  deriveFacets,
  filterEvents,
  sortEvents,
} from "../eventQuery";

export default function EventsPage() {
  const events = useMemo(() => mockEvents as SecurityEvent[], []);

  const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("newest");
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  const facets = useMemo(() => deriveFacets(events), [events]);
  const filtered = useMemo(() => filterEvents(events, filters), [events, filters]);
  const visible = useMemo(() => sortEvents(filtered, sort), [filtered, sort]);

  const setFilter = (key: keyof EventFilters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const clearChip = (key: keyof EventFilters) =>
    setFilter(key, key === "search" ? "" : "ALL");

  const activeChips = (
    [
      filters.search && { key: "search", label: `Search: "${filters.search}"` },
      filters.severity !== "ALL" && { key: "severity", label: `Severity: ${filters.severity}` },
      filters.asset !== "ALL" && { key: "asset", label: `Asset: ${filters.asset}` },
      filters.sourceIp !== "ALL" && { key: "sourceIp", label: `Source IP: ${filters.sourceIp}` },
      filters.tag !== "ALL" && { key: "tag", label: `Tag: ${filters.tag}` },
    ] as Array<false | { key: keyof EventFilters; label: string }>
  ).filter(Boolean) as Array<{ key: keyof EventFilters; label: string }>;

  const hasActiveFilters = activeChips.length > 0;

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(visible, null, 2)], { type: "application/json" });
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

      <EventsOverview events={visible} />

      <div className="events-controls">
        <input
          type="text"
          placeholder="Search events..."
          value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)}
          aria-label="Search events"
        />
        <select
          value={filters.severity}
          onChange={(e) => setFilter("severity", e.target.value)}
          aria-label="Filter by severity"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select
          value={filters.asset}
          onChange={(e) => setFilter("asset", e.target.value)}
          aria-label="Filter by asset"
        >
          <option value="ALL">All Assets</option>
          {facets.assets.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={filters.sourceIp}
          onChange={(e) => setFilter("sourceIp", e.target.value)}
          aria-label="Filter by source IP"
        >
          <option value="ALL">All Source IPs</option>
          {facets.sourceIps.map((ip) => (
            <option key={ip} value={ip}>
              {ip}
            </option>
          ))}
        </select>
        {facets.tags.length > 0 && (
          <select
            value={filters.tag}
            onChange={(e) => setFilter("tag", e.target.value)}
            aria-label="Filter by tag"
          >
            <option value="ALL">All Tags</option>
            {facets.tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort events"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {hasActiveFilters && (
          <button className="btn-secondary" onClick={resetFilters}>
            Clear filters
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="filter-chips">
          {activeChips.map((chip) => (
            <span key={chip.key} className="filter-chip">
              {chip.label}
              <button onClick={() => clearChip(chip.key)} aria-label={`Remove filter ${chip.label}`}>
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="events-layout">
        <div className="events-main">
          <div className="events-toolbar">
            <p className="table-meta">
              Showing {visible.length} of {events.length} events
            </p>
            <button className="btn-secondary" onClick={exportJson}>
              Export Events (JSON)
            </button>
          </div>

          {visible.length > 0 ? (
            <EventsTable
              events={visible}
              selectedId={selectedEvent?.id ?? null}
              onSelect={setSelectedEvent}
            />
          ) : (
            <div className="empty-state">
              <p>No events match your current search and filters.</p>
              {hasActiveFilters && (
                <button className="btn-secondary" onClick={resetFilters}>
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {selectedEvent && (
          <EventDetailsPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </div>
    </div>
  );
}
