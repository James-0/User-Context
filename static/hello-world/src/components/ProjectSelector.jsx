import React from 'react';
import './component.css';

export default function ProjectSelector({ projects, selected, onChange }) {
  const options = projects.map((p) => ({
    label: p.label,
    value: p.value,
    avatarUrl: p.avatarUrl,
  }));

  const value = options.filter((o) => selected.includes(o.value));

  return (
    <section className="selector-stack">
      <label className="field-label" htmlFor="project-select">Allowed Projects</label>
      <p className="field-help">
        The app will only activate in these projects. Leave empty to enable on all projects.
      </p>
      <select
        id="project-select"
        className="multi-select"
        multiple
        value={value.map((option) => option.value)}
        onChange={(event) => onChange(Array.from(event.target.selectedOptions, (option) => option.value))}
        aria-label="Allowed projects"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label} ({option.value})</option>
        ))}
      </select>
      {/* Selected summary badges */}
      {selected.length > 0 && (
        <p className="selection-summary">
            Active on {selected.length} project{selected.length > 1 ? 's' : ''}:{' '}
          <span className="tag-list">
          {selected.map((key) => (
            <span key={key} className="tag tag-project">
              {key}
            </span>
          ))}
          </span>
        </p>
      )}
    </section>
  );
}