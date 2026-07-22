interface Props{

children?:React.ReactNode;

padding?:string;

background?:string;

}


export default function Section({

children,

padding="py-16",

background=""

}:Props){


return (

<section className={`${padding} ${background}`}>

{children}

</section>

);

}