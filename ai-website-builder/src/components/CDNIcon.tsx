import React from "react";

interface Props {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function CDNIcon({ src, alt = "icon", size = 24, className = "", style }: Props) {
  if (!src) return null;

  const finalStyle: React.CSSProperties = {
    width: size,
    height: size,
    display: "inline-block",
    verticalAlign: "middle",
    ...style,
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      crossOrigin="anonymous"
      onError={(e) => {
        try {
          (e.target as HTMLImageElement).style.display = "none";
        } catch {}
      }}
      style={finalStyle}
      loading="lazy"
    />
  );
}
