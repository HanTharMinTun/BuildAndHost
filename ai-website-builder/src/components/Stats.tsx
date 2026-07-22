interface Stat{

label:string;

value:string;

}


interface Props{

items:Stat[];

}


export default function Stats({

items=[]

}:Props){


return (

<div className="
grid
grid-cols-2
md:grid-cols-4
gap-6
">


{

items.map(

(item,index)=>(


<div

key={index}

className="
text-center
p-5
border
rounded-xl
"

>

<h2 className="
text-4xl
font-bold
">

{item.value}

</h2>


<p>

{item.label}

</p>


</div>


)

)

}


</div>

);

}