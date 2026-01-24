import React from 'react';

export default function AddressField({
  label,
  note,
  name,
  value,
  placeholder,
  loading,
  open,
  suggestions,
  activeIndex,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  onSelectSuggestion,
  required = false,
}) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label} {note && <span className="admin-label-note">({note})</span>}
      </label>
      <div className="address-input-group">
        <div className="input-with-spinner">
          <input
            type="text"
            className="form-input"
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            required={required}
          />
          {loading && <span className="input-spinner" aria-hidden="true" />}
        </div>
        {open && suggestions.length > 0 && (
          <div className="address-suggestions">
            {suggestions.map((item, index) => (
              <button
                key={`${item.kind}-${item.label}`}
                type="button"
                className={`address-suggestion ${index === activeIndex ? 'active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelectSuggestion(item)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
