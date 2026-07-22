interface Props {
  children?: React.ReactNode;
  background?: string;
}

export default function Page({
  children,
  background = "bg-white"
}: Props) {

  return (
    <main className={`min-h-screen ${background}`}>
      {children}
    </main>
  );
}