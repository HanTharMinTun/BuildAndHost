import { useMemo, useState, useEffect, type DragEvent, type ReactNode } from "react";
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

// Avoid statically importing `generated_website.json` which can cause the
// dev server to throw and break the overlay when the file is invalid. Use a
// small safe fallback and attempt to fetch the generated JSON at runtime.
const websiteTemplate = {
  type: "Page",
  props: {},
  children: [
    { type: "Navbar", props: { items: ["Home", "About", "Projects", "Contact"] }, children: [] },
    { type: "Container", props: {}, children: [] },
    { type: "Paragraph", props: { text: "Welcome to my portfolio" }, children: [] },
    { type: "Footer", props: {}, children: [] },
  ],
};
import { COMPONENT_REGISTRY } from "../renderer/registry";
import type { ComponentNode } from "../renderer/types";
import { themeToCss } from "../theme/generatedTheme";
import { getPropertySchema, validateAndConvert } from "./propertySchema";
import { PropertyEditor, AnimationEditor } from "./PropertyEditors";
import "./editor.css";

type NodePath = number[];

type DragPayload =
  | { kind: "node"; path: NodePath }
  | { kind: "palette"; type: string };

// Expanded component palette - all available components from registry
const palette = [
  "Heading", "Paragraph", "Text",
  "Button", "Image",
  "Container", "Section", "Stack", "Grid",
  "Card", "Hero", "Navbar", "Footer",
  "FeatureList", "Gallery", "Stats", "FAQ", "Timeline",
  "ContactForm", "Divider",
];

// Default props for new components
const defaults: Record<string, ComponentNode> = {
  Heading: { type: "Heading", props: { text: "New Heading", level: 2 }, children: [] },
  Paragraph: { type: "Paragraph", props: { text: "Your paragraph text here" }, children: [] },
  Text: { type: "Text", props: { text: "Text content" }, children: [] },
  Button: { type: "Button", props: { link: "#", text: "Button" }, children: [] },
  Image: { type: "Image", props: { src: "https://placehold.co/800x500", alt: "Placeholder" }, children: [] },
  Container: { type: "Container", props: {}, children: [] },
  Section: { type: "Section", props: {}, children: [] },
  Stack: { type: "Stack", props: { direction: "column", gap: "1rem" }, children: [] },
  Grid: { type: "Grid", props: { columns: 3 }, children: [] },
  Card: { type: "Card", props: { title: "New card", description: "Card description" }, children: [] },
  Hero: { type: "Hero", props: { title: "Hero Title", subtitle: "Hero subtitle", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80" }, children: [] },
  Navbar: { type: "Navbar", props: { logo: "Logo", items: ["Home", "About", "Contact"] }, children: [] },
  Footer: { type: "Footer", props: { copyright: "© 2024 Your Company" }, children: [] },
  FeatureList: { type: "FeatureList", props: { items: ["First feature", "Second feature", "Third feature"] }, children: [] },
  Gallery: { type: "Gallery", props: { images: ["https://placehold.co/400x300", "https://placehold.co/400x300"], columns: 3 }, children: [] },
  Stats: { type: "Stats", props: { items: [{ label: "Projects", value: "50+" }, { label: "Clients", value: "100+" }] }, children: [] },
  FAQ: { type: "FAQ", props: { items: [{ question: "What is this?", answer: "This is an FAQ item" }] }, children: [] },
  Timeline: { type: "Timeline", props: { items: [{ year: "2024", title: "Event", description: "Event description" }] }, children: [] },
  ContactForm: { type: "ContactForm", props: { title: "Contact Us" }, children: [] },
  Divider: { type: "Divider", props: {}, children: [] },
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isComponentNode(value: unknown): value is ComponentNode {
  return Boolean(value) && typeof value === "object" && typeof (value as ComponentNode).type === "string";
}

function getText(node: ComponentNode | undefined): string | undefined {
  if (!node) return undefined;
  const text = node.props?.text;
  return typeof text === "string" && text.trim() ? text : undefined;
}

const legacyImageFallbacks = {
  profile: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
  project1: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=80",
  project2: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
  gallery1: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=80",
  gallery2: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
  gallery3: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
};

/** Normalize Image src from object to string if needed */
function normalizeImageSrc(src: unknown): unknown {
  // If src is an object like {url: "..."} or {"url": "..."}, extract the URL
  if (src && typeof src === "object" && !Array.isArray(src)) {
    const obj = src as Record<string, unknown>;
    if (typeof obj.url === "string") return obj.url;
    if (typeof obj.src === "string") return obj.src;
  }
  return src;
}

function replaceLegacyImage(url: unknown): unknown {
  if (typeof url !== "string" || !url.startsWith("https://example.com/")) return url;
  const key = url.split("/").at(-1)?.replace(".jpg", "") as keyof typeof legacyImageFallbacks;
  return legacyImageFallbacks[key] ?? url;
}

/** Convert the inspector's newline-separated list input back to an array.
 * Use newlines only so item text may contain commas without being split.
 */
function parseStringList(value: string): string[] {
  return value
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseListInput(value: string): unknown[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Plain newline-separated values are the convenient editor format.
  }
  return parseStringList(value);
}

function formatPropValue(value: unknown): string {
  if (!Array.isArray(value)) return String(value ?? "");
  return value.every((item) => typeof item === "string")
    ? value.join("\n")
    : JSON.stringify(value);
}

// PropertyInput component has been replaced with the schema-based PropertyEditor system
// See PropertyEditors.tsx for the new implementation

/** Remove malformed AI/local-storage nodes before they reach the React tree. */
function normalizeWebsite(value: unknown): ComponentNode {
  if (!isComponentNode(value)) return clone(websiteTemplate) as unknown as ComponentNode;

  const raw = value as unknown as {
    type: string;
    props?: Record<string, unknown>;
    children?: unknown[];
  };
  const textChildren = Array.isArray(raw.children)
    ? raw.children.filter((child): child is string => typeof child === "string").join(" ").trim()
    : "";
  const children = Array.isArray(raw.children)
    ? raw.children.filter(isComponentNode).map(normalizeWebsite)
    : [];
  const props = raw.props && typeof raw.props === "object" && !Array.isArray(raw.props)
    ? { ...raw.props }
    : {};

  if (["Heading", "Paragraph", "Text", "Button"].includes(raw.type) && !props.text && textChildren) {
    props.text = textChildren;
  }

  if (raw.type === "Image") props.src = replaceLegacyImage(normalizeImageSrc(props.src));
  if (["Gallery", "FeatureList", "Navbar"].includes(raw.type)) {
    const listKey = raw.type === "Gallery" ? "images" : "items";
    if (typeof props[listKey] === "string") props[listKey] = parseStringList(props[listKey]);
    if (!Array.isArray(props[listKey])) props[listKey] = [];
  }
  if (raw.type === "Gallery") {
    props.images = (props.images as unknown[]).map(replaceLegacyImage);
  }

  if (raw.type === "Hero") {
    props.title ??= getText(children.find((child) => child.type === "Heading"));
    props.subtitle ??= getText(children.find((child) => child.type === "Paragraph"));
    const button = children.find((child) => child.type === "Button");
    props.buttonText ??= getText(button);
    props.buttonAction ??= typeof button?.props?.link === "string" ? button.props.link : undefined;
    props.image ??= "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80";
    props.image = normalizeImageSrc(props.image); // Normalize in case it's an object
    return { type: raw.type, props, children: [] };
  }

  if (raw.type === "Card") {
    props.title ??= getText(children.find((child) => child.type === "Heading"));
    props.description ??= getText(children.find((child) => child.type === "Paragraph"));
    props.image ??= typeof children.find((child) => child.type === "Image")?.props?.src === "string"
      ? children.find((child) => child.type === "Image")?.props?.src
      : undefined;
    props.image = normalizeImageSrc(props.image); // Normalize in case it's an object
    props.buttonText ??= getText(children.find((child) => child.type === "Button"));
    return { type: raw.type, props, children: [] };
  }

  if (raw.type === "Footer" && !props.copyright && textChildren) {
    props.copyright = textChildren;
  }

  return {
    type: raw.type,
    props,
    children,
  };
}

function applyAutoLayout(node: ComponentNode): ComponentNode {
  if (node.type === 'Grid') {
    const cols = typeof node.props?.columns === 'number' ? node.props.columns : undefined;
    const childCount = Array.isArray(node.children) ? node.children.filter(isComponentNode).length : 0;
    if (!cols) {
      (node.props ??= {});
      node.props.columns = Math.max(1, Math.min(4, childCount || 3));
    }
  }

  if (Array.isArray(node.children) && node.children.length) {
    const processedChildren: ComponentNode[] = [];
    let run: ComponentNode[] = [];
    const flushRun = () => {
      if (run.length >= 2) {
        const grid: ComponentNode = { type: 'Grid', props: { columns: Math.max(1, Math.min(4, run.length)) }, children: run };
        processedChildren.push(grid);
      } else if (run.length === 1) {
        processedChildren.push(run[0]);
      }
      run = [];
    };

    for (const child of node.children as ComponentNode[]) {
      const processed = applyAutoLayout(child);
      if (processed.type === 'Card') {
        run.push(processed);
        continue;
      }
      flushRun();
      processedChildren.push(processed);
    }
    flushRun();
    node.children = processedChildren;
  }

  return node;
}

function readStoredWebsite(): ComponentNode {
  try {
    const stored = localStorage.getItem("website");
    const raw = stored ? JSON.parse(stored) : websiteTemplate;
    const normalized = normalizeWebsite(raw);
    return applyAutoLayout(normalized);
  } catch {
    const normalized = normalizeWebsite(websiteTemplate);
    return applyAutoLayout(normalized);
  }
}

function readStoredTheme(): unknown {
  try {
    return JSON.parse(localStorage.getItem("websiteTheme") ?? "{}");
  } catch {
    return {};
  }
}

function getNode(root: ComponentNode, path: NodePath): ComponentNode | undefined {
  return path.reduce<ComponentNode | undefined>((node, index) => node?.children?.[index], root);
}

function getPayload(event: DragEvent): DragPayload | null {
  try {
    return JSON.parse(event.dataTransfer.getData("application/x-website-node")) as DragPayload;
  } catch {
    return null;
  }
}

function makeNode(type: string): ComponentNode {
  return clone(defaults[type] ?? { type, props: {}, children: [] });
}

function insertBefore(root: ComponentNode, targetPath: NodePath, node: ComponentNode): ComponentNode {
  const next = clone(root);
  const parent = getNode(next, targetPath.slice(0, -1));
  parent?.children?.splice(targetPath.at(-1) ?? 0, 0, node);
  return next;
}

function moveBefore(root: ComponentNode, sourcePath: NodePath, targetPath: NodePath): ComponentNode {
  if (sourcePath.join(".") === targetPath.join(".") || targetPath.slice(0, sourcePath.length).join(".") === sourcePath.join(".")) {
    return root;
  }

  const next = clone(root);
  const sourceParent = getNode(next, sourcePath.slice(0, -1));
  const sourceIndex = sourcePath.at(-1);
  const moved = sourceParent?.children?.splice(sourceIndex ?? -1, 1)[0];
  if (!moved) return root;

  const targetParentPath = targetPath.slice(0, -1);
  const targetParent = getNode(next, targetParentPath);
  let targetIndex = targetPath.at(-1) ?? 0;
  if (sourcePath.slice(0, -1).join(".") === targetParentPath.join(".") && (sourceIndex ?? 0) < targetIndex) {
    targetIndex -= 1;
  }
  targetParent?.children?.splice(targetIndex, 0, moved);
  return next;
}

function EditorNode({
  node,
  path,
  selectedPath,
  onSelect,
  onDropNode,
}: {
  node: ComponentNode;
  path: NodePath;
  selectedPath: string;
  onSelect: (path: NodePath) => void;
  onDropNode: (payload: DragPayload, targetPath: NodePath) => void;
}) {
  if (!isComponentNode(node)) return null;

  const Component = COMPONENT_REGISTRY[node.type];
  const isSelected = path.join(".") === selectedPath;
  const style = node.props?.style;
  const safeStyle = style && typeof style === "object" && !Array.isArray(style) ? style : undefined;
  const children: ReactNode = node.children?.filter(isComponentNode).map((child, index) => (
    <EditorNode
      key={`${child.type}-${index}`}
      node={child}
      path={[...path, index]}
      selectedPath={selectedPath}
      onSelect={onSelect}
      onDropNode={onDropNode}
    />
  ));

  // Render actual Grid component with editor wrapper
  if (node.type === "Grid" && Component) {
    const cols = node.props?.columns || 3;
    
    return (
      <div
        className={`editor-node component-grid ${isSelected ? "editor-node--selected" : ""}`}
        draggable={true}
        onClick={(event) => { event.stopPropagation(); onSelect(path); }}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("application/x-website-node", JSON.stringify({ kind: "node", path }));
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const payload = getPayload(event);
          if (payload) onDropNode(payload, path);
        }}
        style={{
          position: 'relative',
          border: isSelected ? '2px solid #4F46E5' : '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '1.5rem 0.5rem 0.5rem 0.5rem',
          minHeight: '50px'
        }}
      >
        <span className="editor-node__label" style={{
          position: 'absolute',
          top: '2px',
          left: '4px',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.3)',
          zIndex: 10
        }}>
          Grid ({cols} columns)
        </span>
        {node.children && node.children.length > 0 ? (
          <Component {...(node.props ?? {})} style={safeStyle}>
            {children}
          </Component>
        ) : (
          <Component {...(node.props ?? {})} style={safeStyle}>
            <div style={{
              gridColumn: '1 / -1',
              padding: '1rem',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.2)',
              fontSize: '12px',
              fontStyle: 'italic'
            }}>
              Drop components here
            </div>
          </Component>
        )}
      </div>
    );
  }

  // Render actual Container component with editor wrapper
  if (node.type === "Container" && Component) {
    return (
      <div
        className={`editor-node component-container ${isSelected ? "editor-node--selected" : ""}`}
        draggable={true}
        onClick={(event) => { event.stopPropagation(); onSelect(path); }}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("application/x-website-node", JSON.stringify({ kind: "node", path }));
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const payload = getPayload(event);
          if (payload) onDropNode(payload, path);
        }}
        style={{
          position: 'relative',
          minHeight: '50px',
          border: isSelected ? '2px solid #4F46E5' : '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '1.5rem 0.5rem 0.5rem 0.5rem',
        }}
      >
        <span className="editor-node__label" style={{
          position: 'absolute',
          top: '2px',
          left: '4px',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.3)',
          zIndex: 10
        }}>
          Container
        </span>
        {node.children && node.children.length > 0 ? (
          <Component {...(node.props ?? {})} style={safeStyle}>
            {children}
          </Component>
        ) : (
          <Component {...(node.props ?? {})} style={safeStyle}>
            <div style={{
              padding: '1rem',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.2)',
              fontSize: '12px',
              fontStyle: 'italic'
            }}>
              Drop components here
            </div>
          </Component>
        )}
      </div>
    );
  }

  // Render actual Section component with editor wrapper
  if (node.type === "Section" && Component) {
    return (
      <div
        className={`editor-node component-section ${isSelected ? "editor-node--selected" : ""}`}
        draggable={true}
        onClick={(event) => { event.stopPropagation(); onSelect(path); }}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("application/x-website-node", JSON.stringify({ kind: "node", path }));
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const payload = getPayload(event);
          if (payload) onDropNode(payload, path);
        }}
        style={{
          position: 'relative',
          minHeight: '50px',
          border: isSelected ? '2px solid #4F46E5' : '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '1.5rem 0.5rem 0.5rem 0.5rem',
        }}
      >
        <span className="editor-node__label" style={{
          position: 'absolute',
          top: '2px',
          left: '4px',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.3)',
          zIndex: 10
        }}>
          Section
        </span>
        {node.children && node.children.length > 0 ? (
          <Component {...(node.props ?? {})} style={safeStyle}>
            {children}
          </Component>
        ) : (
          <Component {...(node.props ?? {})} style={safeStyle}>
            <div style={{
              padding: '1rem',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.2)',
              fontSize: '12px',
              fontStyle: 'italic'
            }}>
              Drop components here
            </div>
          </Component>
        )}
      </div>
    );
  }

  // Render actual Stack component with editor wrapper
  if (node.type === "Stack" && Component) {
    const direction = node.props?.direction || 'vertical';
    return (
      <div
        className={`editor-node component-stack ${isSelected ? "editor-node--selected" : ""}`}
        draggable={true}
        onClick={(event) => { event.stopPropagation(); onSelect(path); }}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("application/x-website-node", JSON.stringify({ kind: "node", path }));
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const payload = getPayload(event);
          if (payload) onDropNode(payload, path);
        }}
        style={{
          position: 'relative',
          minHeight: '50px',
          border: isSelected ? '2px solid #4F46E5' : '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '1.5rem 0.5rem 0.5rem 0.5rem',
        }}
      >
        <span className="editor-node__label" style={{
          position: 'absolute',
          top: '2px',
          left: '4px',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.3)',
          zIndex: 10
        }}>
          Stack ({direction})
        </span>
        {node.children && node.children.length > 0 ? (
          <Component {...(node.props ?? {})} style={safeStyle}>
            {children}
          </Component>
        ) : (
          <Component {...(node.props ?? {})} style={safeStyle}>
            <div style={{
              padding: '1rem',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.2)',
              fontSize: '12px',
              fontStyle: 'italic'
            }}>
              Drop components here
            </div>
          </Component>
        )}
      </div>
    );
  }

  if (!Component) return null;

  return (
    <div
      className={`editor-node component-${node.type.toLowerCase()} ${isSelected ? "editor-node--selected" : ""}`}
      draggable={true}
      onClick={(event) => { event.stopPropagation(); onSelect(path); }}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("application/x-website-node", JSON.stringify({ kind: "node", path }));
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const payload = getPayload(event);
        if (payload) onDropNode(payload, path);
      }}
    >
      <span className="editor-node__label">{node.type}</span>
      <Component {...(node.props ?? {})} style={safeStyle}>{children}</Component>
    </div>
  );
}

export default function Editor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);
  const [website, setWebsite] = useState<ComponentNode>(readStoredWebsite);
  const [theme, setTheme] = useState(readStoredTheme);
  const themeCss = useMemo(() => themeToCss(theme), [theme]);
  
  // Save state management
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string>('');

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    (async () => {
      try {
        const stored = localStorage.getItem("website");
        if (stored) return;
        const resp = await fetch('/src/generated_website.json');
        if (!resp.ok) return;
        const data = await resp.json();
        const normalized = normalizeWebsite(data);
        setWebsite(applyAutoLayout(normalized));
      } catch {
        // ignore failures; keep the safe fallback template
      }
    })();

    let cancelled = false;
    async function fetchTheme() {
      try {
        const stored = localStorage.getItem("websiteTheme");
        if (stored) return;
        
        // Get website ID from localStorage (set when website is created/loaded)
        const websiteId = localStorage.getItem('websiteId');
        if (!websiteId) return; // No website ID available yet
        
        const response = await api.post<{ theme: any; website_id: string }>("/api/ai/design_theme", {
          website_id: websiteId,
          brief: "Create a polished, modern theme with subtle animations and responsive adjustments.",
        });
        
        if (response.error || !response.data) return;
        if (cancelled) return;
        
        if (response.data.theme) {
          setTheme(response.data.theme);
          try { localStorage.setItem("websiteTheme", JSON.stringify(response.data.theme)); } catch { }
        }
      } catch (e) {
        // ignore network errors in dev
      }
    }
    fetchTheme();
    return () => { cancelled = true; };
  }, []);

  // Color properties are now properly handled by the component props system
  // Components apply color props as inline styles which work correctly with the theme

  const [selectedPath, setSelectedPath] = useState<string | null>("0");
  const selected = useMemo(
    () => selectedPath ? getNode(website, selectedPath.split(".").map(Number)) : undefined,
    [website, selectedPath],
  );
  const selectedIndex = selectedPath ? Number(selectedPath.split(".").at(-1)) : -1;
  const selectedParent = selectedPath
    ? getNode(website, selectedPath.split(".").map(Number).slice(0, -1))
    : undefined;

  // Save changes to database
  async function saveChanges() {
    // Prevent duplicate saves
    if (isSaving) return;
    
    // Get the website ID from localStorage (stored when website was created)
    const websiteId = localStorage.getItem('websiteId');
    
    if (!websiteId) {
      setSaveStatus('error');
      setSaveError('No website ID found. Please generate a website first.');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }
    
    setIsSaving(true);
    setSaveStatus('idle');
    setSaveError('');
    
    try {
      // Send the complete current website JSON to the backend
      const response = await api.put(`/api/websites/${websiteId}`, {
        website_json: website,
        theme_json: theme,
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Also save to localStorage for offline editing
      localStorage.setItem("website", JSON.stringify(website));
      localStorage.setItem("websiteTheme", JSON.stringify(theme));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save website:', error);
      setSaveStatus('error');
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  }

  function save(next: ComponentNode) {
    setWebsite(next);
    localStorage.setItem("website", JSON.stringify(next));
  }

  function dropNode(payload: DragPayload, targetPath: NodePath) {
    const next = payload.kind === "palette"
      ? insertBefore(website, targetPath, makeNode(payload.type))
      : moveBefore(website, payload.path, targetPath);
    save(next);
  }

  function addToEnd(type: string) {
    const next = clone(website);
    next.children = [...(next.children ?? []), makeNode(type)];
    save(next);
  }

  function updateProp(key: string, value: any) {
    if (!selected || !selectedPath) return;
    const path = selectedPath.split(".").map(Number);
    if (!path.length) return;

    const next = clone(website);
    const node = getNode(next, path);
    if (!node) return;

    // Use schema-based validation and conversion
    const schema = getPropertySchema(node.type);
    const propDef = schema.find(p => p.key === key);
    const nextValue = propDef ? validateAndConvert(value, propDef) : value;

    node.props = { ...(node.props || {}), [key]: nextValue };
    save(next);
  }

  function deleteSelected() {
    const path = selectedPath?.split(".").map(Number);
    if (!path?.length || !selected) return;
    const next = clone(website);
    const parent = getNode(next, path.slice(0, -1));
    parent?.children?.splice(path.at(-1) ?? -1, 1);
    save(next);
    setSelectedPath("0");
  }

  function moveSelected(direction: -1 | 1) {
    const path = selectedPath?.split(".").map(Number);
    if (!path?.length || !selectedParent?.children) return;

    const nextIndex = selectedIndex + direction;
    if (nextIndex < 0 || nextIndex >= selectedParent.children.length) return;

    const next = clone(website);
    const parent = getNode(next, path.slice(0, -1));
    if (!parent?.children) return;
    [parent.children[selectedIndex], parent.children[nextIndex]] = [parent.children[nextIndex], parent.children[selectedIndex]];
    save(next);
    setSelectedPath([...path.slice(0, -1), nextIndex].join("."));
  }

  function addChild(childType: string) {
    if (!selected || !selectedPath) return;
    const path = selectedPath.split(".").map(Number);
    if (!path.length) return;

    const next = clone(website);
    const node = getNode(next, path);
    if (!node) return;

    // Initialize children array if it doesn't exist
    if (!node.children) node.children = [];
    
    // Add new child component
    node.children.push(makeNode(childType));
    save(next);
  }

  function removeChild(childIndex: number) {
    if (!selected || !selectedPath) return;
    const path = selectedPath.split(".").map(Number);
    if (!path.length) return;

    const next = clone(website);
    const node = getNode(next, path);
    if (!node?.children || childIndex < 0 || childIndex >= node.children.length) return;

    // Remove child at specified index
    node.children.splice(childIndex, 1);
    save(next);
  }

  function handleDeploy() {
    localStorage.setItem("website", JSON.stringify(website));
    localStorage.setItem("websiteTheme", JSON.stringify(theme));
    navigate('/websites');
  }

  return (
    <>
      {/* =========================================================
          NAVIGATION - SAME AS HOME PAGE
      ========================================================= */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-[#080a15]/75 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="h-[76px] flex items-center justify-between">

            <div className="flex items-center gap-3 group">
              {isAuthenticated && user ? (
                <div
                  className="relative w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 cursor-pointer hover:scale-105"
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  <div className="w-full h-full rounded-full bg-[#0a0d18] flex items-center justify-center">
                    <span className="text-base font-luxury font-bold bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
                      {user.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0a0d18]"></div>
                </div>
              ) : (
                <Link to="/" className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-[11px] bg-[#0a0d18] flex items-center justify-center">
                    <span className="text-xs font-luxury font-bold tracking-widest bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">B&H</span>
                  </div>
                </Link>
              )}
              <div>
                <div className="font-luxury text-lg font-bold tracking-wide text-white">
                  Build<span className="text-purple-400">And</span>Host
                </div>
                <div className="text-[9px] font-serif-light uppercase tracking-[0.3em] text-white/40">AI Website Builder</div>
              </div>
            </div>

            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/" className="px-4 py-2 rounded-lg text-white/65 hover:text-white hover:bg-white/[0.06] text-sm font-body font-medium transition-all">Home</Link>
                <Link to="/chat" className="px-4 py-2 rounded-lg text-white/65 hover:text-white hover:bg-white/[0.06] text-sm font-body font-medium transition-all">AI Builder</Link>
                <Link to="/websites" className={`px-4 py-2 rounded-lg text-sm font-body font-medium transition-all ${isActive('/websites')
                  ? 'bg-white/[0.09] text-white border border-white/[0.08]'
                  : 'text-white/65 hover:text-white hover:bg-white/[0.06]'
                  }`}>My Websites</Link>
              </div>
            )}

            <div className="flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="hidden sm:block px-4 py-2.5 text-sm font-body font-light text-white/75 hover:text-white transition-colors tracking-wide">Login</Link>
                  <Link to="/register" className="btn-get-started px-5 py-2.5 rounded-lg text-white text-sm font-body font-semibold tracking-wide">Get Started</Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      {/* =========================================================
          PREMIUM TOGGLE SIDEBAR - SAME AS HOME PAGE
      ========================================================= */}
      {isAuthenticated && showSidebar && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
            onClick={() => setShowSidebar(false)}
          />

          <div className="fixed right-0 top-0 z-50 h-full w-80 bg-gradient-to-b from-[#0a0d18] via-[#0d1120] to-[#0a0d18] backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl shadow-black/80 sidebar-slide-in">
            <div className="flex flex-col h-full">
              <div className="relative p-6 border-b border-white/[0.06] bg-gradient-to-br from-purple-500/5 to-cyan-500/5 flex-shrink-0">
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-purple-500/10 blur-[80px]" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-cyan-500/10 blur-[80px]" />

                <div className="relative flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-[2px] shadow-xl shadow-purple-500/30">
                    <div className="w-full h-full rounded-full bg-[#0a0d18] flex items-center justify-center">
                      <span className="text-xl font-luxury font-bold bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-body text-base font-semibold text-white tracking-wide">{user?.username}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <div className="text-[10px] font-serif-light text-white/40 tracking-wider">Online</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="text-white/30 hover:text-white/60 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto sidebar-scroll p-4 space-y-1.5">
                <div className="px-3 py-2 text-[10px] font-serif-light text-white/20 tracking-[0.15em] uppercase">Navigation</div>

                <Link
                  to="/"
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive('/')
                    ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                    : 'hover:bg-white/[0.06] text-white/70 hover:text-white'
                    }`}
                  onClick={() => setShowSidebar(false)}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActive('/')
                    ? 'bg-gradient-to-br from-purple-500/20 to-cyan-500/20'
                    : 'bg-white/5'
                    }`}>
                    <svg className={`w-5 h-5 ${isActive('/') ? 'text-purple-300' : 'text-white/40'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className={`font-body text-sm font-medium flex-1 ${isActive('/') ? 'text-white' : ''
                    }`}>Home</span>
                  <span className={`transition-colors ${isActive('/') ? 'text-white/40' : 'text-white/20 group-hover:text-white/40'
                    }`}>→</span>
                </Link>

                <Link
                  to="/chat"
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive('/chat')
                    ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                    : 'hover:bg-white/[0.06] text-white/70 hover:text-white'
                    }`}
                  onClick={() => setShowSidebar(false)}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActive('/chat')
                    ? 'bg-gradient-to-br from-purple-500/20 to-cyan-500/20'
                    : 'bg-white/5'
                    }`}>
                    <svg className={`w-5 h-5 ${isActive('/chat') ? 'text-purple-300' : 'text-white/40'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className={`font-body text-sm font-medium flex-1 ${isActive('/chat') ? 'text-white' : ''
                    }`}>AI Builder</span>
                  <span className={`transition-colors ${isActive('/chat') ? 'text-white/40' : 'text-white/20 group-hover:text-white/40'
                    }`}>→</span>
                </Link>

                <Link
                  to="/websites"
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive('/websites')
                    ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30 text-white'
                    : 'hover:bg-white/[0.06] text-white/70 hover:text-white'
                    }`}
                  onClick={() => setShowSidebar(false)}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActive('/websites')
                    ? 'bg-gradient-to-br from-purple-500/30 to-cyan-500/30'
                    : 'bg-white/5'
                    }`}>
                    <svg className={`w-5 h-5 ${isActive('/websites') ? 'text-purple-300' : 'text-white/40'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <span className={`font-body text-sm font-medium flex-1 ${isActive('/websites') ? 'text-white' : ''
                    }`}>My Websites</span>
                  <span className={`transition-colors ${isActive('/websites') ? 'text-white/40' : 'text-white/20 group-hover:text-white/40'
                    }`}>→</span>
                </Link>
              </div>

              <div className="p-4 border-t border-white/[0.06] bg-gradient-to-t from-purple-500/5 to-transparent flex-shrink-0">
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                    setShowSidebar(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-red-500/10 to-rose-500/10 hover:from-red-500/20 hover:to-rose-500/20 transition-all duration-300 text-red-400 hover:text-red-300 border border-red-500/10 hover:border-red-500/30"
                >
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span className="font-body text-sm font-medium flex-1">Logout</span>
                  <span className="text-red-400/20">↗</span>
                </button>

                <div className="mt-4 text-center text-[9px] font-serif-light text-white/15 tracking-wider">
                  BuildAndHost v2.0 • AI Powered
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="cms-editor pt-[76px]">
        <aside className="cms-panel cms-panel--palette">
          <div className="cms-brand">BuildAndHost <span>CMS</span></div>
          <p>Drag a block onto the page, or click to add it at the bottom.</p>
          <div className="cms-palette">
            {palette.map((type) => (
              <button
                key={type}
                draggable
                onDragStart={(event) => event.dataTransfer.setData("application/x-website-node", JSON.stringify({ kind: "palette", type }))}
                onClick={() => addToEnd(type)}
              >
                <span>+</span>{type}
              </button>
            ))}
          </div>
        </aside>

        <main
          className="cms-workspace"
          onClick={() => setSelectedPath("")}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const payload = getPayload(event);
            if (payload?.kind === "palette") addToEnd(payload.type);
          }}
        >
          <div className="cms-toolbar">
            <span>Page editor</span>
            <button
              onClick={saveChanges}
              disabled={isSaving}
              style={{
                backgroundColor: saveStatus === 'success' ? '#10b981' : saveStatus === 'error' ? '#ef4444' : undefined,
                opacity: isSaving ? 0.7 : 1,
                cursor: isSaving ? 'wait' : 'pointer'
              }}
            >
              {isSaving ? 'Saving...' : saveStatus === 'success' ? 'Saved ✓' : saveStatus === 'error' ? 'Error ✗' : 'Save Changes'}
            </button>
            {saveError && <span style={{ color: '#ef4444', fontSize: '12px', marginLeft: '8px' }}>{saveError}</span>}
{/* 
            <button onClick={async () => {
              try {
                // Get website ID from localStorage
                const websiteId = localStorage.getItem('websiteId');
                if (!websiteId) {
                  console.error('No website ID found. Please save your website first.');
                  return;
                }
                
                const response = await api.post<{ theme: any; website_id: string }>("/api/ai/design_theme", {
                  website_id: websiteId,
                  brief: "Create a polished, modern theme with subtle animations and responsive adjustments.",
                });
                
                if (response.error) {
                  console.error('Failed to generate theme:', response.error);
                  return;
                }
                
                if (response.data?.theme) {
                  setTheme(response.data.theme);
                  try { localStorage.setItem("websiteTheme", JSON.stringify(response.data.theme)); } catch { }
                }
              } catch (error) {
                console.error('Error generating theme:', error);
              }
            }}>Generate Theme</button> */}

            <button onClick={handleDeploy} style={{ backgroundColor: '#4F46E5', color: 'white' }}>Deploy Website</button>
          </div>
          <div className="cms-canvas ai-site">
            {themeCss && <style>{themeCss}</style>}
            <EditorNode node={website} path={[]} selectedPath={selectedPath ?? ""} onSelect={(path) => setSelectedPath(path.length ? path.join(".") : null)} onDropNode={dropNode} />
          </div>
        </main>

        <aside className="cms-panel cms-panel--inspector">
          <h2>Properties</h2>
          {selected ? (
            <>
              <div className="cms-selected-type">{selected.type}</div>
              
              {(() => {
                const schema = getPropertySchema(selected.type);
                
                if (schema.length === 0) {
                  return <p className="cms-empty" style={{ fontSize: "12px", color: "#6b7280" }}>
                    This component has no editable properties.
                  </p>;
                }
                
                return (
                  <>
                    <details open style={{ marginBottom: "1rem" }}>
                      <summary style={{
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "13px",
                        padding: "0.5rem 0",
                        color: "#1f2937",
                        userSelect: "none"
                      }}>
                        Component Properties
                      </summary>
                      <div style={{ paddingLeft: "0.5rem", marginTop: "0.5rem" }}>
                        {schema.map((propDef) => {
                          const value = selected.props?.[propDef.key];
                          
                          // Boolean properties are rendered inline
                          if (propDef.type === "boolean") {
                            return (
                              <div key={propDef.key} style={{ marginBottom: "0.75rem" }}>
                                <PropertyEditor
                                  propDef={propDef}
                                  value={value}
                                  onCommit={(val) => updateProp(propDef.key, val)}
                                />
                              </div>
                            );
                          }
                          
                          // Other properties have labels
                          return (
                            <label key={propDef.key} style={{ marginBottom: "0.75rem" }}>
                              <span style={{ fontSize: "12px", color: "#374151", fontWeight: "500" }}>
                                {propDef.label}
                              </span>
                              <PropertyEditor
                                propDef={propDef}
                                value={value}
                                onCommit={(val) => updateProp(propDef.key, val)}
                              />
                            </label>
                          );
                        })}
                      </div>
                    </details>
                    
                    {/* Children Management Section for Container Components */}
                    {["Grid", "Container", "Section", "Stack"].includes(selected.type) && (
                      <details open style={{ marginBottom: "1rem" }}>
                        <summary style={{
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "13px",
                          padding: "0.5rem 0",
                          color: "#1f2937",
                          userSelect: "none"
                        }}>
                          Children ({selected.children?.length || 0})
                        </summary>
                        <div style={{ paddingLeft: "0.5rem", marginTop: "0.5rem" }}>
                          {/* List current children */}
                          {selected.children && selected.children.length > 0 ? (
                            <div style={{ marginBottom: "0.75rem" }}>
                              {selected.children.map((child: any, index: number) => (
                                <div key={index} style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "0.5rem",
                                  marginBottom: "0.5rem",
                                  background: "#f3f4f6",
                                  borderRadius: "4px",
                                  fontSize: "12px"
                                }}>
                                  <span style={{ color: "#374151", fontWeight: "500" }}>
                                    {index + 1}. {child.type}
                                  </span>
                                  <button
                                    onClick={() => removeChild(index)}
                                    style={{
                                      padding: "0.25rem 0.5rem",
                                      fontSize: "11px",
                                      background: "#ef4444",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "4px",
                                      cursor: "pointer"
                                    }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "0.75rem", fontStyle: "italic" }}>
                              No children yet. Add components below.
                            </p>
                          )}
                          
                          {/* Add child dropdown */}
                          <div style={{ marginTop: "0.75rem" }}>
                            <label style={{ fontSize: "12px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "0.25rem" }}>
                              Add Child Component
                            </label>
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  addChild(e.target.value);
                                  e.target.value = ""; // Reset selection
                                }
                              }}
                              style={{
                                width: "100%",
                                padding: "0.5rem",
                                fontSize: "12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                background: "white",
                                color: "#374151"
                              }}
                            >
                              <option value="">Select component type...</option>
                              {palette.map((type) => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </details>
                    )}
                    
                    <details style={{ marginBottom: "1rem" }}>
                      <summary style={{
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "13px",
                        padding: "0.5rem 0",
                        color: "#1f2937",
                        userSelect: "none"
                      }}>
                        Animations
                      </summary>
                      <div style={{ paddingLeft: "0.5rem", marginTop: "0.5rem" }}>
                        <AnimationEditor
                          value={selected.props?.animations}
                          onCommit={(val) => updateProp("animations", val)}
                        />
                      </div>
                    </details>
                  </>
                );
              })()}
              
              {selectedPath && (
                <>
                  <div className="cms-position-actions">
                    <button disabled={selectedIndex === 0} onClick={() => moveSelected(-1)}>↑ Move up</button>
                    <button disabled={!selectedParent?.children || selectedIndex === selectedParent.children.length - 1} onClick={() => moveSelected(1)}>↓ Move down</button>
                  </div>
                  <button className="cms-delete" onClick={deleteSelected}>Delete block</button>
                </>
              )}
            </>
          ) : <p className="cms-empty">Select a block on the canvas to edit it.</p>}
        </aside>
      </div>

      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          display: none;
        }
        .sidebar-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .sidebar-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}