import { useState } from "react";

interface MultiSelectProps {
  /** Category label, e.g. "Severity". */
  label: string;
  /** Plural unit for the multi count, e.g. "severities". */
  unit: string;
  /** Label when nothing is selected, e.g. "All Severities". */
  allLabel: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function MultiSelect({
  label,
  unit,
  allLabel,
  options,
  selected,
  onChange,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const toggle = (option: string) =>
    onChange(
      selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option]
    );

  const summary =
    selected.length === 0
      ? allLabel
      : selected.length === 1
        ? `${label}: ${selected[0]}`
        : `${selected.length} ${unit} selected`;

  const visibleOptions = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <span className="ms-wrap">
      <button
        type="button"
        className={`ms-trigger${selected.length > 0 ? " ms-trigger-active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={summary}
      >
        <span className="ms-trigger-label">{summary}</span>
        <span className="ms-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <>
          <div className="ms-backdrop" onClick={() => setOpen(false)} />
          <div className="ms-popover" role="listbox" aria-label={label}>
            {options.length > 8 && (
              <input
                type="text"
                className="ms-search"
                placeholder={`Filter ${unit}…`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={`Filter ${unit}`}
              />
            )}
            <div className="ms-options">
              {visibleOptions.length === 0 && <p className="ms-empty">No matches.</p>}
              {visibleOptions.map((option) => (
                <label key={option} className="ms-option">
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => toggle(option)}
                  />
                  <span className="ms-option-text">{option}</span>
                </label>
              ))}
            </div>
            {selected.length > 0 && (
              <div className="ms-footer">
                <span>{selected.length} selected</span>
                <button type="button" className="ms-clear" onClick={() => onChange([])}>
                  Clear
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </span>
  );
}
