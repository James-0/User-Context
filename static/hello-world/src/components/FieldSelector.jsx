import React, { useState } from 'react';
import './component.css';

export default function FieldSelector({ fields, selected, onChange }) {
  const [showCustomOnly, setShowCustomOnly] = useState(false);

  const filteredFields = showCustomOnly ? fields.filter((f) => f.isCustom) : fields;

  const options = filteredFields.map((f) => ({
    label: f.label,
    value: f.value,
    isCustom: f.isCustom,
    schema: f.schema,
  }));

  const value = options.filter((o) => selected.includes(o.value));

  return (
    <section className="selector-stack">
      <label className="field-label" htmlFor="field-select">Active Fields</label>
      <p className="field-help">
        Choose which Jira fields this app reads from or modifies.
      </p>

      {/* Filter toggle */}
      <label className="toggle-row" htmlFor="custom-only-toggle">
        <input
          type="checkbox"
          id="custom-only-toggle"
          checked={showCustomOnly}
          onChange={(event) => setShowCustomOnly(event.target.checked)}
        />
        <span>Show custom fields only</span>
      </label>

      <select
        id="field-select"
        className="multi-select"
        multiple
        value={value.map((option) => option.value)}
        onChange={(event) => onChange(Array.from(event.target.selectedOptions, (option) => option.value))}
        aria-label="Active fields"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} ({option.value}){option.isCustom ? ' - Custom' : ''}{option.schema ? ` - ${option.schema}` : ''}
          </option>
        ))}
      </select>

      {/* Selected summary */}
      {selected.length > 0 && (
        <p className="selection-summary">
            {selected.length} field{selected.length > 1 ? 's' : ''} selected
        </p>
      )}
    </section>
  );
}