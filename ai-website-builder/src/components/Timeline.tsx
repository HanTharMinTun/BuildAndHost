interface TimelineItem{

year:string;

title:string;

description:string;

}


interface Props{

items:TimelineItem[];

style?: React.CSSProperties;

}


export default function Timeline({

items=[],

style

}:Props){


return (

<div className="space-y-8" style={style}>


{

items.map(
(item,index)=>(


<div

key={index}

className="
relative
rounded-[1.25rem]
border
border-slate-200/70
bg-white/80
p-6
pl-8
shadow-[0_16px_45px_-24px_rgba(15,23,42,0.35)]
"

>


<div className="absolute left-0 top-6 h-3 w-3 -translate-x-1/2 rounded-full bg-sky-600 shadow-lg shadow-sky-600/30"></div>

<h3 className="
font-semibold
text-xl
tracking-tight
text-slate-900
">

{item.title}

</h3>


<p className="
mt-2
text-sm
font-medium
uppercase
tracking-[0.2em]
text-sky-600
">

{item.year}

</p>


<p className="
mt-3
text-base
leading-7
text-slate-600
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