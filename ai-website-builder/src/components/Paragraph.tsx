interface Props{

text:string;

align?:string;

}


export default function Paragraph({

text,

align="left"

}:Props){


return (

<p

className={`text-gray-600 text-${align} text-lg`}

>

{text}

</p>

);

}