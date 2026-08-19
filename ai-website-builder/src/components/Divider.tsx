interface Props {
  style?: React.CSSProperties;
}

export default function Divider({ style }: Props){

return (

<hr

className="
my-8
border-0
border-t
border-slate-200/80
"

style={style}

/>

);

}