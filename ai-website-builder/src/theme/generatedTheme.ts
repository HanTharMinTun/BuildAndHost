export type ThemeDeclarations = Record<string, string | number>;
export type GeneratedTheme = {
  theme?: { name?: string; styles?: Record<string, ThemeDeclarations> };
};

const allowedSelectors = new Set([
  ".ai-site", ".component-page", ".component-navbar", ".component-hero",
  ".component-section", ".component-heading", ".component-paragraph",
  ".component-button", ".component-card", ".component-featurelist",
  ".component-gallery", ".component-gallery img", ".component-contactform", ".component-stats",
  ".component-faq", ".component-footer",
]);

const allowedProperties = new Set([
  "backgroundColor", "backgroundImage", "color", "fontFamily", "fontSize",
  "fontWeight", "lineHeight", "letterSpacing", "borderColor", "borderRadius",
  "borderWidth", "boxShadow", "padding", "margin", "gap", "maxWidth",
  "minHeight", "height", "width", "objectFit", "textAlign", "display",
  "gridTemplateColumns", "justifyContent", "alignItems", "opacity",
  // allow simple interaction props
  "transition", "transform",
]);

const propertyName = (value: string) => value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

function safeValue(value: string | number): string | null {
  const text = String(value).trim();
  return text && text.length <= 160 && !/[;{}<>@]/.test(text) ? text : null;
}

/** Converts the restricted theme JSON into CSS without accepting arbitrary CSS. */
export function themeToCss(value: unknown): string {
  const styles = (value as GeneratedTheme | null)?.theme?.styles;
  if (!styles || typeof styles !== "object") return "";
  const parts: string[] = [];
  for (const [selector, declarations] of Object.entries(styles)) {
    if (typeof selector === "string" && selector.trim().startsWith("@media") && typeof declarations === "object") {
      // declarations is nested selector map
      const nested: string[] = [];
      for (const [nestedSel, nestedDecls] of Object.entries(declarations as Record<string, unknown>)) {
        if (!nestedSel || !nestedDecls || typeof nestedDecls !== "object") continue;
        const rules = Object.entries(nestedDecls as Record<string, unknown>).flatMap(([property, ruleValue]) => {
          if (!allowedProperties.has(property) || (typeof ruleValue !== "string" && typeof ruleValue !== "number")) return [];
          const v = safeValue(ruleValue);
          return v ? [`${propertyName(property)}:${v}`] : [];
        });
        if (rules.length) nested.push(`${nestedSel}{${rules.join(";")}}`);
      }
      if (nested.length) parts.push(`${selector}{${nested.join("\n")}}`);
      continue;
    }

    if (!selector || typeof declarations !== "object") continue;

    // allow hover selectors if they end with :hover
    const baseSel = selector.endsWith(":hover") ? selector.slice(0, -6) : selector;
    if (!allowedSelectors.has(baseSel) && !selector.endsWith(":hover")) continue;

    const rules = Object.entries(declarations as Record<string, unknown>).flatMap(([property, ruleValue]) => {
      if (!allowedProperties.has(property) || (typeof ruleValue !== "string" && typeof ruleValue !== "number")) return [];
      const v = safeValue(ruleValue);
      return v ? [`${propertyName(property)}:${v}`] : [];
    });
    if (rules.length) parts.push(`${selector}{${rules.join(";")}}`);
  }

  return parts.join("\n");
}
