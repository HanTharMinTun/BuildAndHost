interface Props{

children?:React.ReactNode;

gap?:string;

style?: React.CSSProperties;

}


export default function Stack({

children,

gap="space-y-6",

style

}:Props){


return (

<div className={`flex flex-col ${gap} items-stretch`} style={style}>

{children}

</div>

);

}