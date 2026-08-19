interface Props {
  children?: React.ReactNode;
  maxWidth?: string;
  style?: React.CSSProperties;
}

export default function Container({
  children,
  maxWidth="max-w-7xl",
  style
}:Props){

return (

<div className={`mx-auto px-6 sm:px-8 lg:px-10 ${maxWidth} w-full`} style={style}>
  {children}
</div>

);

}