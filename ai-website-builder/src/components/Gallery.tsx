import Image from "./Image";

interface Props{
  images?: unknown;
  columns?: number;
  style?: React.CSSProperties;
}

function isUsableImageSource(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;

  const source = value.trim();
  if (source.startsWith("/") || source.startsWith("./") || source.startsWith("../")) return true;

  if (source.startsWith("data:image/")) {
    const base64 = source.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,([A-Za-z0-9+/]+={0,2})$/)?.[1];
    return Boolean(base64 && base64.length >= 4 && base64.length % 4 === 0);
  }

  try {
    const url = new URL(source);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function Gallery({ images = [], columns = 3, style }: Props) {
  const galleryImages = Array.isArray(images) ? images.filter(isUsableImageSource) : [];

  const columnClasses: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  return (
    <div className={`component-gallery grid grid-cols-1 ${columnClasses[columns] ?? columnClasses[3]} gap-5 sm:gap-6`} style={style}>
      {galleryImages.map((img, index) => (
        <div key={index}>
          <Image src={img} alt={`Gallery image ${index + 1}`} style={{ height: "16rem", maxWidth: "100%" }} />
        </div>
      ))}
    </div>
  );
}
 
