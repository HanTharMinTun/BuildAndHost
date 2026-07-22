interface Props{

text:string;

variant?:string;

action?:string;

link?:string;

}


export default function Button({

text,

variant="primary",

link

}:Props){


return (

<a

href={link || "#"}

className="
inline-block
px-6
py-3
rounded-lg
bg-blue-600
text-white
hover:bg-blue-700
"

>

{text}

</a>

);

}