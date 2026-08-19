import { useMemo, useState, useEffect, type DragEvent, type ReactNode } from "react";

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
  Heading: { type: "Heading", props: { text: "New heading", level: 2 }, children: [] },
  Paragraph: { type: "Paragraph", props: { text: "Write something meaningful here.", color: "#0f172a", size: "1rem", align: "left", animations: "" }, children: [] },
  Button: { type: "Button", props: { text: "Learn more", link: "#", color: "#0f172a", size: "0.95rem", align: "center", animations: "" }, children: [] },
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

  const commit = () => {
    if (draft !== formattedValue) onCommit(name, draft);
  };

  // Specialized inputs for common props
  if (name === "color") {
    const v = typeof value === "string" && value ? value : "#000000";
    return (
      <input
        type="color"
        value={v}
        onChange={(e) => { setDraft(e.target.value); onCommit(name, e.target.value); }}
        onBlur={commit}
        aria-label={name}
      />
    );
  }

  if (name === "align") {
    const v = typeof value === "string" && value ? value : "left";
    return (
      <select value={v} onChange={(e) => { setDraft(e.target.value); onCommit(name, e.target.value); }} onBlur={commit}>
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
        value={v}
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
  const [website, setWebsite] = useState<ComponentNode>(readStoredWebsite);
  const [theme, setTheme] = useState(readStoredTheme);
  const themeCss = useMemo(() => themeToCss(theme), [theme]);

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
        const resp = await fetch("http://localhost:8000/design_theme", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief: "Create a polished, modern theme with subtle animations and responsive adjustments.", ...(website as any) }),
        });
        if (!resp.ok) return;
        const data = await resp.json();
        if (cancelled) return;
        if (data?.theme) {
          setTheme(data.theme);
          try { localStorage.setItem("websiteTheme", JSON.stringify(data.theme)); } catch {}
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
      } catch {}
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
    if (!selected) return;
    const path = selectedPath?.split(".").map(Number);
    const next = clone(website);
    const node = path ? getNode(next, path) : undefined;
    if (!node) return;
    const oldValue = node.props?.[key];
    const nextValue = Array.isArray(oldValue)
      ? parseListInput(value)
      : typeof oldValue === "number" ? Number(value) || 0 : value;
    node.props = { ...node.props, [key]: nextValue };
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

  return (
    <div className="cms-editor">
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
              const resp = await fetch("http://localhost:8000/design_theme", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brief: "Create a polished, modern theme with subtle animations and responsive adjustments.", ...(website as any) }),
              });
              if (!resp.ok) return;
              const data = await resp.json();
              if (data?.theme) {
                setTheme(data.theme);
                try { localStorage.setItem("websiteTheme", JSON.stringify(data.theme)); } catch {}
              }
            } catch {}
          }}>Generate Theme</button>
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
              // Show a union of existing props plus common editable props
              (() => {
                const existing = Object.keys(selected.props ?? {}).filter((k) => k !== "style");
                const common = ["color", "size", "align", "animations", "text"];
                const keys = Array.from(new Set([...existing, ...common]));
                return keys.map((key) => (
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
  );
}
