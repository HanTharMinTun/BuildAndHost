interface FAQItem{

question:string;

answer:string;

}


interface Props{

items:FAQItem[];

}


export default function FAQ({

items=[]

}:Props){


return (

<div className="space-y-4">


{

items.map(

(item,index)=>(


<details

key={index}

className="
border
p-4
rounded
"

>

<summary className="
font-bold
cursor-pointer
">

{item.question}

</summary>


<p className="
mt-3
text-gray-600
">

{item.answer}

</p>


</details>


)

)

}


</div>

);

}