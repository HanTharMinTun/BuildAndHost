interface Props{

text:string;

size?:string;

weight?:string;

}


export default function Text({

text,

size="base",

weight="normal"

}:Props){


return (

<span

className={`text-${size} font-${weight}`}

>

{text}

</span>

);

}