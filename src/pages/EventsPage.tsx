import { useMemo, useState } from "react";
import mockEvents from "../../data/mock_events.json";
import { SecurityEvent } from "../types";
import { toCsv } from "../utils";
import { loadSettings } from "../settings";
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

  // Read saved preferences once on mount; they seed the initial view.
  const [settings] = useState(loadSettings);

  const [filters, setFilters] = useState<EventFilters>({
    ...DEFAULT_FILTERS,
    severity: settings.dashboard.defaultSeverity,
  });
  const [sort, setSort] = useState<SortKey>(settings.dashboard.defaultSort);
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

  const exportEvents = () => {
    const { format, includeRaw } = settings.export;
    let content: string;
    let filename: string;
    let type: string;

    if (format === "csv") {
      const rows = visible.map((e) => ({
        id: e.id,
        timestamp: e.timestamp,
        severity: e.severity,
        title: e.title,
        assetHostname: e.assetHostname,
        assetIp: e.assetIp,
        sourceIp: e.sourceIp,
        tags: (e.tags ?? []).join("|"),
        userId: e.userId,
      }));
      content = toCsv(rows);
      filename = "penguwave_events_export.csv";
      type = "text/csv";
    } else {
      const data = includeRaw
        ? visible
        : visible.map((e) => ({
            id: e.id,
            timestamp: e.timestamp,
            severity: e.severity,
            title: e.title,
            assetHostname: e.assetHostname,
            sourceIp: e.sourceIp,
          }));
      content = JSON.stringify(data, null, 2);
      filename = "penguwave_events_export.json";
      type = "application/json";
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Security Events</h1>
          <p className="page-subtitle">Triage and investigate security events across your infrastructure</p>
        </div>
      </div>

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
            <button className="btn-secondary" onClick={exportEvents}>
              Export Events ({settings.export.format.toUpperCase()})
            </button>
          </div>

          {visible.length > 0 ? (
            <EventsTable
              events={visible}
              selectedId={selectedEvent?.id ?? null}
              onSelect={setSelectedEvent}
              compact={settings.dashboard.compactTable}
              showDataQuality={settings.dashboard.showDataQualityWarnings}
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
