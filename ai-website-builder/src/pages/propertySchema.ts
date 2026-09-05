// Property Schema System for CMS Editor
// Defines the types and validation rules for component properties

export type PropertyType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "color"
  | "select"
  | "url"
  | "stringArray"
  | "objectArray";

export interface SelectOption {
  label: string;
  value: string;
}

export interface ObjectArrayField {
  key: string;
  label: string;
  type: "text" | "textarea" | "number";
  placeholder?: string;
}

export interface PropertyDefinition {
  key: string;
  label: string;
  type: PropertyType;
  placeholder?: string;
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  fields?: ObjectArrayField[]; // For objectArray type
  defaultValue?: any;
}

// Property schemas for each component type
export const PROPERTY_SCHEMAS: Record<string, PropertyDefinition[]> = {
  Page: [
    { key: "style", label: "Custom Styles", type: "textarea", placeholder: "CSS-in-JS object" },
  ],
  
  Container: [
    { key: "maxWidth", label: "Max Width", type: "text", placeholder: "e.g., 1200px or 80%" },
    { key: "padding", label: "Padding", type: "text", placeholder: "e.g., 2rem" },
  ],
  
  Section: [
    { key: "background", label: "Background Color", type: "color" },
    { key: "padding", label: "Padding", type: "text", placeholder: "e.g., 4rem 2rem" },
  ],
  
  Stack: [
    { key: "direction", label: "Direction", type: "select", options: [
      { label: "Vertical", value: "column" },
      { label: "Horizontal", value: "row" },
    ]},
    { key: "gap", label: "Gap", type: "text", placeholder: "e.g., 1rem" },
    { key: "align", label: "Alignment", type: "select", options: [
      { label: "Start", value: "flex-start" },
      { label: "Center", value: "center" },
      { label: "End", value: "flex-end" },
      { label: "Stretch", value: "stretch" },
    ]},
  ],
  
  Grid: [
    { key: "columns", label: "Columns", type: "number", min: 1, max: 6, step: 1, defaultValue: 3 },
    { key: "gap", label: "Gap", type: "text", placeholder: "e.g., gap-6", defaultValue: "gap-6" },
  ],
  
  Heading: [
    { key: "text", label: "Text", type: "textarea", placeholder: "Heading text" },
    { key: "level", label: "Level", type: "select", options: [
      { label: "H1", value: "1" },
      { label: "H2", value: "2" },
      { label: "H3", value: "3" },
      { label: "H4", value: "4" },
      { label: "H5", value: "5" },
      { label: "H6", value: "6" },
    ], defaultValue: "1" },
    { key: "align", label: "Text Align", type: "select", options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
      { label: "Justify", value: "justify" },
    ], defaultValue: "left" },
    { key: "color", label: "Color", type: "color" },
    { key: "size", label: "Font Size", type: "text", placeholder: "e.g., 2rem or 24px" },
  ],
  
  Paragraph: [
    { key: "text", label: "Text", type: "textarea", placeholder: "Paragraph text" },
    { key: "align", label: "Text Align", type: "select", options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
      { label: "Justify", value: "justify" },
    ], defaultValue: "left" },
    { key: "color", label: "Color", type: "color" },
    { key: "size", label: "Font Size", type: "text", placeholder: "e.g., 1rem or 16px" },
  ],
  
  Text: [
    { key: "text", label: "Text", type: "text", placeholder: "Text content" },
    { key: "color", label: "Color", type: "color" },
    { key: "size", label: "Font Size", type: "text", placeholder: "e.g., 1rem" },
  ],
  
  Button: [
    { key: "text", label: "Button Text", type: "text", placeholder: "Click me", defaultValue: "Button" },
    { key: "link", label: "Link URL", type: "url", placeholder: "https://example.com or #section", defaultValue: "#" },
    { key: "variant", label: "Variant", type: "select", options: [
      { label: "Primary", value: "primary" },
      { label: "Secondary", value: "secondary" },
    ], defaultValue: "primary" },
    { key: "align", label: "Alignment", type: "select", options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ] },
    { key: "color", label: "Text Color", type: "color" },
    { key: "size", label: "Font Size", type: "text", placeholder: "e.g., 1rem" },
  ],
  
  Image: [
    { key: "src", label: "Image URL", type: "url", placeholder: "https://example.com/image.jpg" },
    { key: "alt", label: "Alt Text", type: "text", placeholder: "Image description" },
    { key: "width", label: "Width", type: "text", placeholder: "e.g., 100% or 500px", defaultValue: "100%" },
    { key: "height", label: "Height", type: "text", placeholder: "e.g., auto or 300px", defaultValue: "auto" },
    { key: "rounded", label: "Rounded Corners", type: "boolean", defaultValue: true },
  ],
  
  Card: [
    { key: "title", label: "Title", type: "text", placeholder: "Card title" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Card description" },
    { key: "image", label: "Image URL", type: "url", placeholder: "https://example.com/image.jpg" },
    { key: "buttonText", label: "Button Text", type: "text", placeholder: "Learn more" },
    { key: "color", label: "Text Color", type: "color" },
    { key: "size", label: "Font Size", type: "text", placeholder: "e.g., 1rem" },
    { key: "align", label: "Text Align", type: "select", options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ] },
  ],
  
  Hero: [
    { key: "title", label: "Title", type: "text", placeholder: "Hero title" },
    { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Hero subtitle" },
    { key: "buttonText", label: "Button Text", type: "text", placeholder: "Get Started" },
    { key: "buttonAction", label: "Button Link", type: "url", placeholder: "#" },
    { key: "image", label: "Image URL", type: "url", placeholder: "https://example.com/hero.jpg" },
  ],
  
  Navbar: [
    { key: "logo", label: "Logo Text", type: "text", placeholder: "Logo", defaultValue: "Logo" },
    { key: "items", label: "Navigation Items", type: "stringArray", placeholder: "One item per line" },
    { key: "sticky", label: "Sticky Position", type: "boolean", defaultValue: false },
  ],
  
  FeatureList: [
    { key: "items", label: "Features", type: "stringArray", placeholder: "One feature per line" },
  ],
  
  Gallery: [
    { key: "images", label: "Image URLs", type: "stringArray", placeholder: "One URL per line" },
    { key: "columns", label: "Columns", type: "number", min: 1, max: 6, step: 1, defaultValue: 3 },
  ],
  
  Timeline: [
    { key: "items", label: "Timeline Items", type: "objectArray", fields: [
      { key: "year", label: "Year", type: "text", placeholder: "2024" },
      { key: "title", label: "Title", type: "text", placeholder: "Event title" },
      { key: "description", label: "Description", type: "textarea", placeholder: "Event description" },
    ]},
  ],
  
  Stats: [
    { key: "items", label: "Statistics", type: "objectArray", fields: [
      { key: "value", label: "Value", type: "text", placeholder: "99%" },
      { key: "label", label: "Label", type: "text", placeholder: "Success Rate" },
    ]},
  ],
  
  FAQ: [
    { key: "items", label: "FAQ Items", type: "objectArray", fields: [
      { key: "question", label: "Question", type: "text", placeholder: "What is...?" },
      { key: "answer", label: "Answer", type: "textarea", placeholder: "The answer is..." },
    ]},
  ],
  
  ContactForm: [
    { key: "title", label: "Form Title", type: "text", placeholder: "Contact Us" },
    { key: "submitText", label: "Submit Button", type: "text", placeholder: "Send Message", defaultValue: "Send" },
  ],
  
  Footer: [
    { key: "copyright", label: "Copyright Text", type: "text", placeholder: "© 2024 Company Name" },
    { key: "links", label: "Footer Links", type: "stringArray", placeholder: "One link text per line" },
  ],
  
  Divider: [],
};

// Get property schema for a component type
export function getPropertySchema(componentType: string): PropertyDefinition[] {
  return PROPERTY_SCHEMAS[componentType] || [];
}

// Validate and convert property value based on type
export function validateAndConvert(value: any, propDef: PropertyDefinition): any {
  if (value === undefined || value === null) {
    return propDef.defaultValue;
  }

  switch (propDef.type) {
    case "number":
      const num = typeof value === "number" ? value : Number(value);
      if (isNaN(num)) return propDef.defaultValue ?? 0;
      if (propDef.min !== undefined && num < propDef.min) return propDef.min;
      if (propDef.max !== undefined && num > propDef.max) return propDef.max;
      return num;

    case "boolean":
      if (typeof value === "boolean") return value;
      if (typeof value === "string") return value === "true" || value === "1";
      return !!value;

    case "stringArray":
      if (Array.isArray(value)) {
        return value.filter((item) => typeof item === "string");
      }
      if (typeof value === "string") {
        return value.split("\n").map((s) => s.trim()).filter(Boolean);
      }
      return [];

    case "objectArray":
      if (Array.isArray(value)) return value;
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];

    case "text":
    case "textarea":
    case "url":
    case "color":
    case "select":
    default:
      return String(value ?? "");
  }
}

// Format value for display in input
export function formatForDisplay(value: any, type: PropertyType): string {
  if (value === undefined || value === null) return "";
  
  if (type === "stringArray") {
    if (Array.isArray(value)) {
      return value.join("\n");
    }
    return String(value);
  }
  
  if (type === "objectArray") {
    if (Array.isArray(value)) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }
  
  if (type === "boolean") {
    return value ? "true" : "false";
  }
  
  return String(value);
}
