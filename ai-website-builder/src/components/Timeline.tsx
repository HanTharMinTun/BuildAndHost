interface TimelineItem{

year:string;

title:string;

description:string;

}


interface Props{

items:TimelineItem[];

}


export default function Timeline({

items=[]

}:Props){


return (

<div className="space-y-8">


{

items.map(
(item,index)=>(


<div

key={index}

className="
border-l-4
border-blue-600
pl-6
"

>


<h3 className="
font-bold
text-xl
">

{item.title}

</h3>


<p className="
text-blue-600
">

{item.year}

</p>


<p className="
text-gray-600
">

{item.description}

</p>



</div>


)

)

}


</div>

);

}