import type React from "react";

export function parseAnimations(value: unknown): Partial<CSSStyleDeclaration> {
  const out: Partial<CSSStyleDeclaration> = {};
  if (typeof value !== 'string' || !value.trim()) return out;
  // simple parser for `key: value; key2: value2` pairs
  for (const part of value.split(';')) {
    const p = part.trim();
    if (!p) continue;
    const idx = p.indexOf(':');
    if (idx === -1) continue;
    const k = p.slice(0, idx).trim();
    const v = p.slice(idx + 1).trim();
    if (k === 'transition') (out as any).transition = v;
    if (k === 'transform') (out as any).transform = v;
  }
  return out;
}

export function mergeStyle(a: unknown, b: Partial<CSSStyleDeclaration> | undefined): React.CSSProperties | undefined {
  const base = (a && typeof a === 'object' && !Array.isArray(a)) ? (a as React.CSSProperties) : {};
  if (!b || Object.keys(b).length === 0) return Object.keys(base).length ? base : undefined;
  return { ...(base as React.CSSProperties), ...(b as React.CSSProperties) } as React.CSSProperties;
}
