interface Props{

children?:React.ReactNode;

columns?:number;

gap?:string;

}


export default function Grid({

children,

columns=3,

gap="gap-6"

}:Props){


return (

<div

className={`grid grid-cols-1 md:grid-cols-${columns} ${gap}`}

>

{children}

</div>

);

}