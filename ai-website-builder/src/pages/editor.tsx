import { useMemo, useState, useEffect, type DragEvent, type ReactNode } from "react";
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

// Avoid statically importing `generated_website.json` which can cause the
// dev server to throw and break the overlay when the file is invalid. Use a
// small safe fallback and attempt to fetch the generated JSON at runtime.
const websiteTemplate = {
  type: "Page",
  props: {},
  children: [
    { type: "Navbar", props: { items: ["Home", "About", "Projects", "Contact"] }, children: [] },
    { type: "Container", props: {}, children: [] },
    { type: "Footer", props: {}, children: [] },
  ],
};
import { COMPONENT_REGISTRY } from "../renderer/registry";
import type { ComponentNode } from "../renderer/types";
import { themeToCss } from "../theme/generatedTheme";
import "./editor.css";

type NodePath = number[];

type DragPayload =
  | { kind: "node"; path: NodePath }
  | { kind: "palette"; type: string };

const palette = [
  "Section", "Heading", "Paragraph", "Button", "Grid", "Card",
  "FeatureList", "Divider", "Image", "ContactForm",
];

const defaults: Record<string, ComponentNode> = {
  Section: { type: "Section", props: {}, children: [] },
  Heading: { type: "Heading", props: { level: 2 }, children: [] },
  Paragraph: { type: "Paragraph", props: {}, children: [] },
  Button: { type: "Button", props: { link: "#", text: "Button" }, children: [] },
  Grid: { type: "Grid", props: { columns: 3 }, children: [] },
  Card: { type: "Card", props: { title: "New card", description: "Card description" }, children: [] },
  FeatureList: { type: "FeatureList", props: { items: ["First feature", "Second feature"] }, children: [] },
  Divider: { type: "Divider", props: {}, children: [] },
  Image: { type: "Image", props: { src: "https://placehold.co/800x500", alt: "Placeholder" }, children: [] },
  ContactForm: { type: "ContactForm", props: {}, children: [] },
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
    // Show one item per line in the inspector so commas may be typed freely.
    ? value.join("\n")
    : JSON.stringify(value);
}

function PropertyInput({
  name,
  value,
  onCommit,
}: {
  name: string;
  value: unknown;
  onCommit: (name: string, value: string) => void;
}) {
  const isList = Array.isArray(value);
  const formattedValue = formatPropValue(value);
  const [draft, setDraft] = useState(formattedValue);

  // Sync draft state when value changes externally
  useEffect(() => {
    setDraft(formattedValue);
  }, [formattedValue]);

  const commit = () => {
    if (draft !== formattedValue) onCommit(name, draft);
  };

  // Specialized inputs for common props
  if (name === "color") {
    const v = typeof value === "string" && value && value ? value : "#000000";
    return (
      <input
        type="color"
        value={typeof draft === "string" && draft ? draft : v}
        onChange={(e) => { setDraft(e.target.value); onCommit(name, e.target.value); }}
        onBlur={commit}
        aria-label={name}
      />
    );
  }

  if (name === "align") {
    const v = typeof value === "string" && value ? value : "left";
    return (
      <select value={typeof draft === "string" && draft ? draft : v} onChange={(e) => { setDraft(e.target.value); onCommit(name, e.target.value); }} onBlur={commit}>
        <option value="left">left</option>
        <option value="center">center</option>
        <option value="right">right</option>
        <option value="justify">justify</option>
      </select>
    );
  }

  if (name === "size") {
    const v = typeof value === "string" && value ? value : "";
    return (
      <input
        placeholder="e.g. 1rem or 16px"
        value={typeof draft === "string" ? draft : String(draft)}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
      />
    );
  }

  if (name === "animations") {
    const v = typeof value === "string" ? value : "";
    return (
      <textarea
        value={draft}
        rows={3}
        spellCheck={false}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        aria-label={name}
      />
    );
  }

  if (name === "text") {
    return (
      <textarea
        value={draft}
        rows={3}
        spellCheck={false}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        aria-label={name}
      />
    );
  }

  if (isList) {
    return (
      <textarea
        value={draft}
        rows={3}
        spellCheck={false}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        aria-label={name}
      />
    );
  }

  return (
    <input
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
    />
  );
}

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

  // Support the older AI format, where text was put in children instead of props.
  if (["Heading", "Paragraph", "Text", "Button"].includes(raw.type) && !props.text && textChildren) {
    props.text = textChildren;
  }

  if (raw.type === "Image") props.src = replaceLegacyImage(props.src);
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
    return { type: raw.type, props, children: [] };
  }

  if (raw.type === "Card") {
    props.title ??= getText(children.find((child) => child.type === "Heading"));
    props.description ??= getText(children.find((child) => child.type === "Paragraph"));
    props.image ??= typeof children.find((child) => child.type === "Image")?.props?.src === "string"
      ? children.find((child) => child.type === "Image")?.props?.src
      : undefined;
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

/** Apply simple, deterministic layout heuristics so generated sites are less
 * uniformly stacked. This post-process converts runs of `Card` siblings into
 * a `Grid` and ensures `Grid` nodes have a sensible `columns` prop. These
 * heuristics are intentionally small and safe so they don't break editor UX.
 */
function applyAutoLayout(node: ComponentNode): ComponentNode {
  // Ensure Grid nodes declare columns based on children count when missing.
  if (node.type === 'Grid') {
    const cols = typeof node.props?.columns === 'number' ? node.props.columns : undefined;
    const childCount = Array.isArray(node.children) ? node.children.filter(isComponentNode).length : 0;
    if (!cols) {
      (node.props ??= {});
      node.props.columns = Math.max(1, Math.min(4, childCount || 3));
    }
  }

  // Process children first
  if (Array.isArray(node.children) && node.children.length) {
    const processedChildren: ComponentNode[] = [];
    let run: ComponentNode[] = [];
    const flushRun = () => {
      if (run.length >= 2) {
        // replace run with a Grid
        const grid: ComponentNode = { type: 'Grid', props: { columns: Math.max(1, Math.min(4, run.length)) }, children: run };
        processedChildren.push(grid);
      } else if (run.length === 1) {
        processedChildren.push(run[0]);
      }
      run = [];
    };

    for (const child of node.children as ComponentNode[]) {
      const processed = applyAutoLayout(child);
      // collect consecutive Card nodes into a run
      if (processed.type === 'Card') {
        run.push(processed);
        continue;
      }

      // If we hit a non-Card, flush any run first
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

  // Skip Grid wrapper in editor to prevent nested layout issues
  // Render Grid children directly without the grid container
  if (node.type === "Grid") {
    return <>{children}</>;
  }

  if (!Component) return null;

  return (
    <div
      className={`editor-node component-${node.type.toLowerCase()} ${isSelected ? "editor-node--selected" : ""}`}
      draggable={path.length > 0}
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

  // Helper function to check if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // If there's no stored theme, request a generated theme from the backend
  // to provide richer visuals (transitions, hover states, responsive tweaks).
  useEffect(() => {
    // On mount try to fetch a generated website JSON and replace the template
    // only when the user hasn't stored a website in localStorage. This avoids
    // importing the JSON at module load time which can crash HMR if the file
    // is missing or malformed.
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
        if (stored) return; // user has a theme already
        const resp = await fetch("/api/ai/design_theme", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief: "Create a polished, modern theme with subtle animations and responsive adjustments.", ...(website as any) }),
        });
        if (!resp.ok) return;
        const data = await resp.json();
        if (cancelled) return;
        if (data?.theme) {
          setTheme(data.theme);
          try { localStorage.setItem("websiteTheme", JSON.stringify(data.theme)); } catch { }
        }
      } catch (e) {
        // ignore network errors in dev
      }
    }
    fetchTheme();
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    // Fix obvious low-contrast text by forcing a readable color when contrast is poor.
    function luminance(r: number, g: number, b: number) {
      const a = [r, g, b].map((v) => {
        v = v / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    }

    function parseRgb(cssColor: string): [number, number, number] | null {
      if (!cssColor) return null;
      const m = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
      // hex
      const mh = cssColor.match(/^#([0-9a-f]{6})$/i);
      if (mh) {
        const hex = mh[1];
        return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
      }
      return null;
    }

    function contrastRatio(fg: string, bg: string) {
      const f = parseRgb(fg) ?? [0, 0, 0];
      const b = parseRgb(bg) ?? [255, 255, 255];
      const L1 = luminance(f[0], f[1], f[2]);
      const L2 = luminance(b[0], b[1], b[2]);
      const lighter = Math.max(L1, L2);
      const darker = Math.min(L1, L2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    function getEffectiveBackground(el: Element): string {
      let node: Element | null = el as Element;
      while (node && node !== document.documentElement) {
        const cs = getComputedStyle(node as Element);
        const bg = cs.backgroundColor;
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') return bg;
        node = node.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor || '#ffffff';
    }

    const root = document.querySelector('.ai-site');
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,button')) as Element[];
    for (const el of nodes) {
      try {
        const cs = getComputedStyle(el as Element);
        const fg = cs.color;
        const bg = getEffectiveBackground(el as Element);
        const ratio = contrastRatio(fg, bg);
        if (isNaN(ratio) || ratio < 4.5) {
          // pick black or white depending on background luminance
          const bgRgb = parseRgb(bg) ?? [255, 255, 255];
          const bgLum = luminance(bgRgb[0], bgRgb[1], bgRgb[2]);
          const newColor = bgLum > 0.5 ? '#0f172a' : '#ffffff';
          (el as HTMLElement).style.color = newColor;
        } else {
          // clear any previously set inline color so theme can control it
          (el as HTMLElement).style.color = '';
        }
      } catch { }
    }
  }, [website, themeCss]);
  const [selectedPath, setSelectedPath] = useState<string | null>("0");
  const selected = useMemo(
    () => selectedPath ? getNode(website, selectedPath.split(".").map(Number)) : undefined,
    [website, selectedPath],
  );
  const selectedIndex = selectedPath ? Number(selectedPath.split(".").at(-1)) : -1;
  const selectedParent = selectedPath
    ? getNode(website, selectedPath.split(".").map(Number).slice(0, -1))
    : undefined;

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

  function updateProp(key: string, value: string) {
    if (!selected || !selectedPath) return;
    const path = selectedPath.split(".").map(Number);
    if (!path.length) return;

    const next = clone(website);
    const node = getNode(next, path);
    if (!node) return;

    const oldValue = node.props?.[key];
    const nextValue = Array.isArray(oldValue)
      ? parseListInput(value)
      : typeof oldValue === "number" ? Number(value) || 0 : value;

    // Ensure we create a completely new props object to avoid any reference issues
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

  function handleDeploy() {
    // Save the current website state before navigating
    localStorage.setItem("website", JSON.stringify(website));
    localStorage.setItem("websiteTheme", JSON.stringify(theme));
    // Navigate to deploy page with the current website context
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

            {/* Logo - Show user profile circle instead of B&H when logged in */}
            <div className="flex items-center gap-3 group">
              {isAuthenticated && user ? (
                // User Profile Circle - replaces B&H logo
                <div
                  className="relative w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 cursor-pointer hover:scale-105"
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  <div className="w-full h-full rounded-full bg-[#0a0d18] flex items-center justify-center">
                    <span className="text-base font-luxury font-bold bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
                      {user.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  {/* Status indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0a0d18]"></div>
                </div>
              ) : (
                // Show B&H logo when not logged in
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

            {/* Desktop Navigation - Only show when authenticated */}
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

            {/* Authentication - Only show Login/Get Started when not authenticated */}
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
          {/* Backdrop with blur */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
            onClick={() => setShowSidebar(false)}
          />

          {/* Premium Sidebar - Fixed height layout with hidden scrollbar */}
          <div className="fixed right-0 top-0 z-50 h-full w-80 bg-gradient-to-b from-[#0a0d18] via-[#0d1120] to-[#0a0d18] backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl shadow-black/80 sidebar-slide-in">
            <div className="flex flex-col h-full">
              {/* Premium Sidebar Header - Fixed */}
              <div className="relative p-6 border-b border-white/[0.06] bg-gradient-to-br from-purple-500/5 to-cyan-500/5 flex-shrink-0">
                {/* Decorative glow */}
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

              {/* Sidebar Navigation - Scrollable with hidden scrollbar */}
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

              {/* Premium Sidebar Footer - Fixed with logout button */}
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

                {/* Version info */}
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
            <button onClick={() => localStorage.setItem("website", JSON.stringify(website))}>Save changes</button>

            <button onClick={async () => {
              try {
                const resp = await fetch("/api/ai/design_theme", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ brief: "Create a polished, modern theme with subtle animations and responsive adjustments.", ...(website as any) }),
                });
                if (!resp.ok) return;
                const data = await resp.json();
                if (data?.theme) {
                  setTheme(data.theme);
                  try { localStorage.setItem("websiteTheme", JSON.stringify(data.theme)); } catch { }
                }
              } catch { }
            }}>Generate Theme</button>

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
              {
                // Show only the props that exist on this component, excluding UI-only properties
                (() => {
                  const excludedProps = ["style", "color", "size", "align", "animations"];
                  const existing = Object.keys(selected.props ?? {}).filter((k) => !excludedProps.includes(k));
                  return existing.map((key) => (
                    <label key={key}>
                      {key}
                      <PropertyInput key={`${selectedPath ?? "root"}-${key}`} name={key} value={(selected.props ?? {})[key]} onCommit={updateProp} />
                    </label>
                  ));
                })()
              }
              {!Object.keys(selected.props ?? {}).length && <p className="cms-empty">This block has no editable properties.</p>}
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

      {/* Styles for sidebar scroll hiding */}
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .sidebar-scroll::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .sidebar-scroll {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
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