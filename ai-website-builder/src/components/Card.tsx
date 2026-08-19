import { parseAnimations, mergeStyle } from "../renderer/utils";

interface Props {
  title: string;
  description?: string;
  image?: string;
  buttonText?: string;
  color?: string;
  size?: string;
  align?: string;
  animations?: string;
  style?: React.CSSProperties;
}

export default function Card({
  title,
  description,
  image,
  buttonText,
  color,
  size,
  align,
  animations,
  style,
}: Props) {
  const animStyle = parseAnimations(animations);
  const extra: React.CSSProperties = {};
  if (color) extra.color = color;
  if (size) extra.fontSize = size as any;
  if (align) extra.textAlign = align as any;
  const merged = mergeStyle(style, { ...extra, ...(animStyle as any) });

  return (
    <div
      className="component-card w-full h-full flex flex-col rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.35)] backdrop-blur"
      style={merged}
    >

      {image && (
        <img
          src={image}
          style={{ height: "12rem", maxWidth: "100%", objectFit: "cover" }}
          className="mb-4 h-48 w-full rounded-[1.25rem] object-cover shadow-sm"
        />
      )}

      <div className="flex-1">
        <h3 className="mb-3 text-2xl font-semibold tracking-tight text-current">{title}</h3>

        {description && <p className="mb-4 text-base leading-7 text-current">{description}</p>}
      </div>

      {buttonText && (
        <div className="mt-4">
          <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-transform duration-200 hover:-translate-y-0.5">{buttonText}</button>
        </div>
      )}

    </div>
  );
}
