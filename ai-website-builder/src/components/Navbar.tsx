interface Props{

logo?:string;

items:string[];

sticky?:boolean;

}


export default function Navbar({

logo="Logo",

items=[],

sticky=false

}:Props){


return (

<nav

className={`
w-full
flex
justify-between
items-center
px-8
py-5
border-b
${sticky?"sticky top-0 bg-white":""}
`}

>


<h2 className="font-bold text-xl">

{logo}

</h2>


<ul className="flex gap-6">

{

items.map(item=>(

<li key={item}>

<a href="#">

{item}

</a>

</li>

))

}

</ul>


</nav>

);

}