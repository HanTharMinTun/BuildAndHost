// Property Editor Components for CMS
import { useState, useEffect } from "react";
import type { PropertyDefinition, SelectOption, ObjectArrayField } from "./propertySchema";

interface BasePropertyInputProps {
  propDef: PropertyDefinition;
  value: any;
  onCommit: (value: any) => void;
}

// Text input
export function TextPropertyInput({ propDef, value, onCommit }: BasePropertyInputProps) {
  const [draft, setDraft] = useState(String(value ?? ""));
  
  useEffect(() => {
    setDraft(String(value ?? ""));
  }, [value]);
  
  return (
    <input
      type="text"
      value={draft}
      placeholder={propDef.placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onCommit(draft)}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
    />
  );
}

// Textarea input
export function TextareaPropertyInput({ propDef, value, onCommit }: BasePropertyInputProps) {
  const [draft, setDraft] = useState(String(value ?? ""));
  
  useEffect(() => {
    setDraft(String(value ?? ""));
  }, [value]);
  
  return (
    <textarea
      value={draft}
      rows={3}
      placeholder={propDef.placeholder}
      spellCheck={false}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onCommit(draft)}
    />
  );
}

// Number input
export function NumberPropertyInput({ propDef, value, onCommit }: BasePropertyInputProps) {
  const [draft, setDraft] = useState(String(value ?? propDef.defaultValue ?? ""));
  
  useEffect(() => {
    setDraft(String(value ?? propDef.defaultValue ?? ""));
  }, [value]);
  
  const handleChange = (val: string) => {
    setDraft(val);
    const num = Number(val);
    if (!isNaN(num)) {
      let clamped = num;
      if (propDef.min !== undefined && clamped < propDef.min) clamped = propDef.min;
      if (propDef.max !== undefined && clamped > propDef.max) clamped = propDef.max;
      onCommit(clamped);
    }
  };
  
  return (
    <input
      type="number"
      value={draft}
      min={propDef.min}
      max={propDef.max}
      step={propDef.step ?? 1}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={() => handleChange(draft)}
    />
  );
}

// Boolean checkbox
export function BooleanPropertyInput({ propDef, value, onCommit }: BasePropertyInputProps) {
  const checked = typeof value === "boolean" ? value : !!value;
  
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCommit(e.target.checked)}
        style={{ cursor: "pointer" }}
      />
      <span>{propDef.label}</span>
    </label>
  );
}

// Color picker
export function ColorPropertyInput({ propDef, value, onCommit }: BasePropertyInputProps) {
  const colorValue = typeof value === "string" && value ? value : "#000000";
  
  return (
    <input
      type="color"
      value={colorValue}
      onChange={(e) => onCommit(e.target.value)}
    />
  );
}

// Select dropdown
export function SelectPropertyInput({ propDef, value, onCommit }: BasePropertyInputProps) {
  const selectValue = String(value ?? propDef.defaultValue ?? "");
  
  return (
    <select value={selectValue} onChange={(e) => onCommit(e.target.value)}>
      {propDef.options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// URL input
export function UrlPropertyInput({ propDef, value, onCommit }: BasePropertyInputProps) {
  const [draft, setDraft] = useState(String(value ?? ""));
  
  useEffect(() => {
    setDraft(String(value ?? ""));
  }, [value]);
  
  return (
    <input
      type="url"
      value={draft}
      placeholder={propDef.placeholder ?? "https://example.com"}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onCommit(draft)}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
    />
  );
}

// String array editor (newline-separated)
export function StringArrayEditor({ propDef, value, onCommit }: BasePropertyInputProps) {
  const arrayValue = Array.isArray(value) ? value : [];
  const [draft, setDraft] = useState(arrayValue.join("\n"));
  
  useEffect(() => {
    const arr = Array.isArray(value) ? value : [];
    setDraft(arr.join("\n"));
  }, [value]);
  
  const handleBlur = () => {
    const items = draft.split("\n").map((s) => s.trim()).filter(Boolean);
    onCommit(items);
  };
  
  return (
    <textarea
      value={draft}
      rows={4}
      placeholder={propDef.placeholder ?? "One item per line"}
      spellCheck={false}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleBlur}
    />
  );
}

// Object array editor with structured fields
export function ObjectArrayEditor({ propDef, value, onCommit }: BasePropertyInputProps) {
  const items = Array.isArray(value) ? value : [];
  
  const addItem = () => {
    const newItem: Record<string, any> = {};
    propDef.fields?.forEach((field) => {
      newItem[field.key] = "";
    });
    onCommit([...items, newItem]);
  };
  
  const removeItem = (index: number) => {
    onCommit(items.filter((_, i) => i !== index));
  };
  
  const updateItem = (index: number, key: string, val: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: val };
    onCommit(updated);
  };
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
    {items.map((item: any, index: number) => (
      <div key={index} style={{
        padding: "0.75rem",
        border: "1px solid rgba(0,0,0,0.15)",
        borderRadius: "8px",
        backgroundColor: "rgba(0,0,0,0.03)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "500" }}>Item {index + 1}</span>
          <button
            type="button"
            onClick={() => removeItem(index)}
            style={{
              padding: "0.25rem 0.5rem",
              fontSize: "11px",
              background: "rgba(239,68,68,0.1)",
              color: "#dc2626",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Remove
          </button>
        </div>
        
        {propDef.fields?.map((field) => (
          <div key={field.key} style={{ marginBottom: "0.5rem" }}>
            <label style={{ fontSize: "11px", color: "#374151", display: "block", marginBottom: "0.25rem", fontWeight: "500" }}>
              {field.label}
            </label>
              {field.type === "textarea" ? (
                <textarea
                  value={item[field.key] ?? ""}
                  placeholder={field.placeholder}
                  rows={2}
                  spellCheck={false}
                  onChange={(e) => updateItem(index, field.key, e.target.value)}
                  style={{ width: "100%", fontSize: "12px" }}
                />
              ) : field.type === "number" ? (
                <input
                  type="number"
                  value={item[field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(e) => updateItem(index, field.key, e.target.value)}
                  style={{ width: "100%", fontSize: "12px" }}
                />
              ) : (
                <input
                  type="text"
                  value={item[field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(e) => updateItem(index, field.key, e.target.value)}
                  style={{ width: "100%", fontSize: "12px" }}
                />
              )}
            </div>
          ))}
        </div>
      ))}
      
      <button
        type="button"
        onClick={addItem}
        style={{
          padding: "0.5rem",
          background: "rgba(99,102,241,0.1)",
          color: "#4f46e5",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "500"
        }}
      >
        + Add Item
      </button>
    </div>
  );
}

// Animation editor (simplified CSS)
export function AnimationEditor({ value, onCommit }: { value: any; onCommit: (value: any) => void }) {
  const [draft, setDraft] = useState(String(value ?? ""));
  
  useEffect(() => {
    setDraft(String(value ?? ""));
  }, [value]);
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>
        CSS animations (e.g., "transition: all 0.3s; transform: scale(1.05)")
      </p>
      <textarea
        value={draft}
        rows={3}
        spellCheck={false}
        placeholder="transition: all 0.3s ease; transform: translateY(0)"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => onCommit(draft)}
      />
    </div>
  );
}

// Main property editor dispatcher
export function PropertyEditor({ propDef, value, onCommit }: BasePropertyInputProps) {
  switch (propDef.type) {
    case "textarea":
      return <TextareaPropertyInput propDef={propDef} value={value} onCommit={onCommit} />;
    case "number":
      return <NumberPropertyInput propDef={propDef} value={value} onCommit={onCommit} />;
    case "boolean":
      return <BooleanPropertyInput propDef={propDef} value={value} onCommit={onCommit} />;
    case "color":
      return <ColorPropertyInput propDef={propDef} value={value} onCommit={onCommit} />;
    case "select":
      return <SelectPropertyInput propDef={propDef} value={value} onCommit={onCommit} />;
    case "url":
      return <UrlPropertyInput propDef={propDef} value={value} onCommit={onCommit} />;
    case "stringArray":
      return <StringArrayEditor propDef={propDef} value={value} onCommit={onCommit} />;
    case "objectArray":
      return <ObjectArrayEditor propDef={propDef} value={value} onCommit={onCommit} />;
    case "text":
    default:
      return <TextPropertyInput propDef={propDef} value={value} onCommit={onCommit} />;
  }
}
