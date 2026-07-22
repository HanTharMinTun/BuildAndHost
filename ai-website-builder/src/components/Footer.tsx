interface Props{

copyright?:string;

socialLinks?:string[];

}


export default function Footer({

copyright="© 2026"

}:Props){


return (

<footer

className="
py-8
text-center
border-t
mt-10
"

>


<p>

{copyright}

</p>


</footer>

);

}