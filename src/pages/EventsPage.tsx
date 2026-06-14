import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import mockEvents from "../../data/mock_events.json";
import { SecurityEvent } from "../types";
import { loadSettings } from "../settings";
import {
  DEFAULT_FILTERS,
  EventFilters,
  FilterCategory,
  SortKey,
  deriveFacets,
  filterEvents,
  sortEvents,
} from "../eventQuery";
import Tabs from "../components/Tabs";
import EventExplorer from "../components/EventExplorer";
import OverviewTab from "../components/OverviewTab";
import InsightsTab from "../components/InsightsTab";
import DataQualityTab from "../components/DataQualityTab";
import AskAiPlaceholderButton from "../components/AskAiPlaceholderButton";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "insights", label: "Insights" },
  { id: "explorer", label: "Event Explorer" },
  { id: "data-quality", label: "Data Quality" },
];
const TAB_IDS = TABS.map((t) => t.id);

export default function EventsPage() {
  const events = useMemo(() => mockEvents as SecurityEvent[], []);
  const [settings] = useState(loadSettings);

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") ?? "overview";
  const activeTab = TAB_IDS.includes(tabParam) ? tabParam : "overview";
  const setActiveTab = (id: string) => setSearchParams({ tab: id }, { replace: true });

  const [filters, setFilters] = useState<EventFilters>({
    ...DEFAULT_FILTERS,
    severities:
      settings.dashboard.defaultSeverity === "ALL" ? [] : [settings.dashboard.defaultSeverity],
  });
  const [sort, setSort] = useState<SortKey>(settings.dashboard.defaultSort);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number | "all">(25);
  const [page, setPage] = useState(1);

  const facets = useMemo(() => deriveFacets(events), [events]);
  const filtered = useMemo(() => filterEvents(events, filters), [events, filters]);
  const visible = useMemo(() => sortEvents(filtered, sort), [filtered, sort]);

  // Any change to the result set or page size returns to page 1.
  const setCategory = (key: FilterCategory, values: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: values }));
    setPage(1);
  };
  const setSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPage(1);
  };
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };
  const changeSort = (value: SortKey) => {
    setSort(value);
    setPage(1);
  };
  const changeRowsPerPage = (value: number | "all") => {
    setRowsPerPage(value);
    setPage(1);
  };

  // Deep-link from the read-only tabs into the Explorer with a filter applied.
  const drillTo = (partial: Partial<EventFilters>) => {
    setFilters({ ...DEFAULT_FILTERS, ...partial });
    setPage(1);
    setActiveTab("explorer");
  };
  // Open a specific event in the Explorer (clear filters so it is guaranteed visible).
  const openEvent = (event: SecurityEvent) => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    setSelectedEvent(event);
    setActiveTab("explorer");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Security Operations</h1>
          <p className="page-subtitle">
            Mission control for triaging and investigating security events
          </p>
        </div>
        <AskAiPlaceholderButton
          label="Ask AI"
          context="Ask AI is planned for future investigation assistance."
        />
      </div>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div role="tabpanel" aria-label={activeTab}>
        {activeTab === "overview" && (
          <OverviewTab
            events={events}
            onDrill={drillTo}
            onOpenEvent={openEvent}
            onGoTab={setActiveTab}
          />
        )}

        {activeTab === "insights" && (
          <InsightsTab events={events} onDrill={drillTo} onOpenEvent={openEvent} />
        )}

        {activeTab === "explorer" && (
          <EventExplorer
            totalCount={events.length}
            facets={facets}
            filters={filters}
            setCategory={setCategory}
            setSearch={setSearch}
            resetFilters={resetFilters}
            sort={sort}
            changeSort={changeSort}
            visible={visible}
            rowsPerPage={rowsPerPage}
            changeRowsPerPage={changeRowsPerPage}
            page={page}
            setPage={setPage}
            selectedEvent={selectedEvent}
            onSelect={setSelectedEvent}
            onClosePanel={() => setSelectedEvent(null)}
            settings={settings}
          />
        )}

        {activeTab === "data-quality" && (
          <DataQualityTab events={events} onOpenEvent={openEvent} />
        )}
      </div>
    </div>
  );
}
