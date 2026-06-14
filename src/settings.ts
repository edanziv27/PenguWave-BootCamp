// Frontend-only user/dashboard preferences, persisted to localStorage.
// These are safe, non-sensitive UI preferences — never store secrets here.
import { SortKey } from "./eventQuery";

export interface Settings {
  notify: {
    critical: boolean;
    high: boolean;
    dataQuality: boolean;
    unknownSourceIp: boolean;
    futureTimestamp: boolean;
  };
  dashboard: {
    defaultSeverity: string; // "ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    defaultSort: SortKey;
    compactTable: boolean;
    showDataQualityWarnings: boolean;
  };
  export: {
    format: "json" | "csv";
    includeRaw: boolean;
  };
}

export const DEFAULT_SETTINGS: Settings = {
  notify: {
    critical: true,
    high: true,
    dataQuality: true,
    unknownSourceIp: false,
    futureTimestamp: false,
  },
  dashboard: {
    defaultSeverity: "ALL",
    defaultSort: "newest",
    compactTable: false,
    showDataQualityWarnings: true,
  },
  export: {
    format: "json",
    includeRaw: true,
  },
};

const STORAGE_KEY = "penguwave.settings";

/** Load settings, merging stored values over defaults so missing keys are safe. */
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      notify: { ...DEFAULT_SETTINGS.notify, ...(parsed.notify ?? {}) },
      dashboard: { ...DEFAULT_SETTINGS.dashboard, ...(parsed.dashboard ?? {}) },
      export: { ...DEFAULT_SETTINGS.export, ...(parsed.export ?? {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage failures (e.g. private mode / quota).
  }
}
