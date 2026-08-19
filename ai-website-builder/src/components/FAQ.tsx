interface FAQItem{

question:string;

answer:string;

}


interface Props{

items:FAQItem[];

style?: React.CSSProperties;

}


export default function FAQ({

items=[],

style

}:Props){


return (

<div className="space-y-4" style={style}>


{

items.map(

(item,index)=>(


<details

key={index}

className="
rounded-[1.25rem]
border
border-slate-200/70
bg-white/80
p-4
shadow-[0_14px_40px_-24px_rgba(15,23,42,0.3)]
"

>

<summary className="
cursor-pointer
font-semibold
text-slate-900
list-none
">

{item.question}

</summary>


<p className="
mt-3
text-base
leading-7
text-slate-600
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