interface Props {
  children?: React.ReactNode;
  maxWidth?: string;
}

export default function Container({
  children,
  maxWidth="max-w-7xl"
}:Props){

return (

<div className={`mx-auto px-6 ${maxWidth}`}>
  {children}
</div>

);

}