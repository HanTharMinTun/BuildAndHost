interface Props{

children?:React.ReactNode;

gap?:string;

}


export default function Stack({

children,

gap="space-y-6"

}:Props){


return (

<div className={`flex flex-col ${gap}`}>

{children}

</div>

);

}