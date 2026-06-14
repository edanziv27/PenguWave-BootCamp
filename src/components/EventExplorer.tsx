import { SecurityEvent } from "../types";
import { toCsv } from "../utils";
import { Settings } from "../settings";
import { EventFilters, FilterCategory, SORT_OPTIONS, SortKey } from "../eventQuery";
import EventsTable from "./EventsTable";
import EventDetailsPanel from "./EventDetailsPanel";
import MultiSelect from "./MultiSelect";

interface Facets {
  assets: string[];
  sourceIps: string[];
  tags: string[];
}

const SEVERITY_OPTIONS = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const CATEGORY_LABEL: Record<FilterCategory, string> = {
  severities: "Severity",
  assets: "Asset",
  sourceIps: "Source IP",
  tags: "Tag",
};

interface EventExplorerProps {
  totalCount: number;
  facets: Facets;
  filters: EventFilters;
  setCategory: (key: FilterCategory, values: string[]) => void;
  setSearch: (value: string) => void;
  resetFilters: () => void;
  sort: SortKey;
  changeSort: (sort: SortKey) => void;
  visible: SecurityEvent[];
  rowsPerPage: number | "all";
  changeRowsPerPage: (value: number | "all") => void;
  page: number;
  setPage: (page: number) => void;
  selectedEvent: SecurityEvent | null;
  onSelect: (event: SecurityEvent) => void;
  onClosePanel: () => void;
  settings: Settings;
}

export default function EventExplorer({
  totalCount,
  facets,
  filters,
  setCategory,
  setSearch,
  resetFilters,
  sort,
  changeSort,
  visible,
  rowsPerPage,
  changeRowsPerPage,
  page,
  setPage,
  selectedEvent,
  onSelect,
  onClosePanel,
  settings,
}: EventExplorerProps) {
  const total = visible.length;
  const totalPages = rowsPerPage === "all" ? 1 : Math.max(1, Math.ceil(total / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const start = rowsPerPage === "all" ? 0 : (currentPage - 1) * rowsPerPage;
  const end = rowsPerPage === "all" ? total : Math.min(start + rowsPerPage, total);
  const pageEvents = visible.slice(start, end);

  const selectedVisible =
    selectedEvent && visible.some((e) => e.id === selectedEvent.id) ? selectedEvent : null;

  // Active filter chips, derived from the array filters.
  const categoryChips = (["severities", "assets", "sourceIps", "tags"] as FilterCategory[]).flatMap(
    (key) =>
      filters[key].map((value) => ({
        key,
        value,
        label: `${CATEGORY_LABEL[key]}: ${value}`,
        remove: () => setCategory(key, filters[key].filter((v) => v !== value)),
      }))
  );
  const chips = [
    ...(filters.search
      ? [{ key: "search", value: filters.search, label: `Search: "${filters.search}"`, remove: () => setSearch("") }]
      : []),
    ...categoryChips,
  ];
  const hasActiveFilters = chips.length > 0;

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
    <>
      <div className="events-controls">
        <input
          type="text"
          placeholder="Search events..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search events"
        />
        <MultiSelect
          label="Severity"
          unit="severities"
          allLabel="All Severities"
          options={SEVERITY_OPTIONS}
          selected={filters.severities}
          onChange={(v) => setCategory("severities", v)}
        />
        <MultiSelect
          label="Asset"
          unit="assets"
          allLabel="All Assets"
          options={facets.assets}
          selected={filters.assets}
          onChange={(v) => setCategory("assets", v)}
        />
        <MultiSelect
          label="Source IP"
          unit="source IPs"
          allLabel="All Source IPs"
          options={facets.sourceIps}
          selected={filters.sourceIps}
          onChange={(v) => setCategory("sourceIps", v)}
        />
        {facets.tags.length > 0 && (
          <MultiSelect
            label="Tag"
            unit="tags"
            allLabel="All Tags"
            options={facets.tags}
            selected={filters.tags}
            onChange={(v) => setCategory("tags", v)}
          />
        )}
        <select
          value={sort}
          onChange={(e) => changeSort(e.target.value as SortKey)}
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
          {chips.map((chip) => (
            <span key={`${chip.key}:${chip.value}`} className="filter-chip">
              {chip.label}
              <button onClick={chip.remove} aria-label={`Remove filter ${chip.label}`}>
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
              {total === 0
                ? "Showing 0 of 0 events"
                : `Showing ${start + 1}–${end} of ${total} ${
                    total !== totalCount ? "filtered " : ""
                  }events${total !== totalCount ? ` (of ${totalCount})` : ""}`}
            </p>
            <div className="toolbar-right">
              <label className="rows-per-page">
                Rows
                <select
                  value={String(rowsPerPage)}
                  onChange={(e) =>
                    changeRowsPerPage(e.target.value === "all" ? "all" : Number(e.target.value))
                  }
                  aria-label="Rows per page"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="all">All</option>
                </select>
              </label>
              <button className="btn-secondary" onClick={exportEvents}>
                Export Events ({settings.export.format.toUpperCase()})
              </button>
            </div>
          </div>

          {total > 0 ? (
            <>
              <EventsTable
                events={pageEvents}
                selectedId={selectedVisible?.id ?? null}
                onSelect={onSelect}
                compact={settings.dashboard.compactTable}
                showDataQuality={settings.dashboard.showDataQualityWarnings}
              />

              <div className="pagination">
                <button
                  className="btn-secondary"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn-secondary"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            </>
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

        {selectedVisible && <EventDetailsPanel event={selectedVisible} onClose={onClosePanel} />}
      </div>
    </>
  );
}
