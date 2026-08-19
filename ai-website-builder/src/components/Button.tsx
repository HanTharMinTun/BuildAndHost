import { parseAnimations, mergeStyle } from "../renderer/utils";

interface Props{
  text:string;
  variant?:string;
  action?:string;
  link?:string;
  color?:string;
  size?:string;
  align?:string;
  animations?:string;
  style?: React.CSSProperties;
}

export default function Button({
  text,
  variant="primary",
  link,
  color,
  size,
  align,
  animations,
  style
}:Props){

  const variantClasses = variant === "secondary"
    ? "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
    : "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-600/25 hover:from-sky-500 hover:to-blue-500";

  const animStyle = parseAnimations(animations);
  const extra: React.CSSProperties = {};
  if (color) extra.color = color;
  if (size) extra.fontSize = size as any;
  if (align) extra.textAlign = align as any;
  const merged = mergeStyle(style, { ...extra, ...(animStyle as any) });

  return (
    <a
      href={link || "#"}
      className={`component-button inline-flex items-center justify-center px-6 py-3 rounded-full font-medium transition-all duration-200 hover:-translate-y-0.5 ${variantClasses}`}
      style={merged}
    >
      {text}
    </a>
  );

}