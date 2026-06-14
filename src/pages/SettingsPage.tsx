import { useEffect, useRef, useState } from "react";
import { DEFAULT_SETTINGS, Settings, loadSettings, saveSettings } from "../settings";

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="setting-row">
      <span className="setting-text">
        <span className="setting-label">{label}</span>
        {hint && <span className="setting-hint">{hint}</span>}
      </span>
      <input
        type="checkbox"
        className="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function SelectRow({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="setting-row">
      <span className="setting-text">
        <span className="setting-label">{label}</span>
        {hint && <span className="setting-hint">{hint}</span>}
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [justSaved, setJustSaved] = useState(false);
  const savedTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(savedTimer.current), []);

  const update = (next: Settings) => {
    setSettings(next);
    saveSettings(next);
    setJustSaved(true);
    window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setJustSaved(false), 1500);
  };

  const setNotify = (key: keyof Settings["notify"], value: boolean) =>
    update({ ...settings, notify: { ...settings.notify, [key]: value } });
  const setDashboard = (key: keyof Settings["dashboard"], value: string | boolean) =>
    update({ ...settings, dashboard: { ...settings.dashboard, [key]: value } });
  const setExport = (key: keyof Settings["export"], value: string | boolean) =>
    update({ ...settings, export: { ...settings.export, [key]: value } });

  const reset = () => update({ ...DEFAULT_SETTINGS });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">
            Frontend preferences for your analyst workflow — stored in this browser only.
          </p>
        </div>
        <div className="settings-actions">
          {justSaved && <span className="saved-pill">Saved ✓</span>}
          <button className="btn-secondary" onClick={reset}>
            Reset to defaults
          </button>
        </div>
      </div>

      <section className="settings-card">
        <div className="settings-card-head">
          <h3>Notification Preferences</h3>
          <p className="settings-card-desc">
            Choose which events you would want to be alerted about. Demo only — no notifications
            are actually sent.
          </p>
        </div>
        <ToggleRow
          label="Notify on CRITICAL events"
          checked={settings.notify.critical}
          onChange={(v) => setNotify("critical", v)}
        />
        <ToggleRow
          label="Notify on HIGH events"
          checked={settings.notify.high}
          onChange={(v) => setNotify("high", v)}
        />
        <ToggleRow
          label="Notify on data-quality issues"
          hint="Missing fields, empty descriptions, etc."
          checked={settings.notify.dataQuality}
          onChange={(v) => setNotify("dataQuality", v)}
        />
        <ToggleRow
          label="Notify when a source IP is unknown"
          checked={settings.notify.unknownSourceIp}
          onChange={(v) => setNotify("unknownSourceIp", v)}
        />
        <ToggleRow
          label="Notify when a future timestamp is detected"
          checked={settings.notify.futureTimestamp}
          onChange={(v) => setNotify("futureTimestamp", v)}
        />
      </section>

      <section className="settings-card">
        <div className="settings-card-head">
          <h3>Dashboard Preferences</h3>
          <p className="settings-card-desc">
            Applied when the Events page loads. Open or return to Events to see them take effect.
          </p>
        </div>
        <SelectRow
          label="Default severity filter"
          value={settings.dashboard.defaultSeverity}
          onChange={(v) => setDashboard("defaultSeverity", v)}
          options={[
            { value: "ALL", label: "All" },
            { value: "CRITICAL", label: "Critical" },
            { value: "HIGH", label: "High" },
            { value: "MEDIUM", label: "Medium" },
            { value: "LOW", label: "Low" },
          ]}
        />
        <SelectRow
          label="Default sort order"
          value={settings.dashboard.defaultSort}
          onChange={(v) => setDashboard("defaultSort", v)}
          options={[
            { value: "newest", label: "Newest first" },
            { value: "sev-desc", label: "Severity: highest first" },
            { value: "oldest", label: "Oldest first" },
          ]}
        />
        <ToggleRow
          label="Compact table mode"
          hint="Tighter rows to fit more events on screen."
          checked={settings.dashboard.compactTable}
          onChange={(v) => setDashboard("compactTable", v)}
        />
        <ToggleRow
          label="Show data-quality warnings"
          hint="Display ⚠️ markers on unusual records in the table."
          checked={settings.dashboard.showDataQualityWarnings}
          onChange={(v) => setDashboard("showDataQualityWarnings", v)}
        />
      </section>

      <section className="settings-card">
        <div className="settings-card-head">
          <h3>Export Preferences</h3>
          <p className="settings-card-desc">Used by the Export button on the Events page.</p>
        </div>
        <SelectRow
          label="Default export format"
          value={settings.export.format}
          onChange={(v) => setExport("format", v)}
          options={[
            { value: "json", label: "JSON" },
            { value: "csv", label: "CSV" },
          ]}
        />
        <ToggleRow
          label="Include raw event data"
          hint="JSON only — export full event objects vs. a curated subset."
          checked={settings.export.includeRaw}
          onChange={(v) => setExport("includeRaw", v)}
        />
      </section>
    </div>
  );
}
