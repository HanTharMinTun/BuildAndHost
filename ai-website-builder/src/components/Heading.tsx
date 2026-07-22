interface Props{

text:string;

level?:number;

align?:string;

}


export default function Heading({

text,

level=1,

align="left"

}:Props){


const Tag:any=`h${level}`;


return (

<Tag

className={`font-bold text-4xl text-${align}`}

>

{text}

</Tag>

);

}