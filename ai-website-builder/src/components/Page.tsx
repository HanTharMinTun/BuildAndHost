interface Props {
  children?: React.ReactNode;
  background?: string;
  style?: React.CSSProperties;
}

export default function Page({
  children,
  background = "bg-slate-50",
  style
}: Props) {

  return (
    <main className={`min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.1),_transparent_35%)] ${background} text-slate-900 antialiased`} style={style}>
      {children}
    </main>
  );
}