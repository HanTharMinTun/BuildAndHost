interface Stat{

label:string;

value:string;

}


interface Props{

items:Stat[];

style?: React.CSSProperties;

}


export default function Stats({

items=[],

style

}:Props){


return (

<div className="
grid
grid-cols-2
md:grid-cols-4
gap-6
sm:gap-8
" style={style}>


{

items.map(

(item,index)=>(


<div

key={index}

className="
rounded-[1.5rem]
border
border-slate-200/70
bg-white/80
p-6
text-center
shadow-[0_16px_45px_-24px_rgba(15,23,42,0.35)]
"

>

<h2 className="
text-3xl
sm:text-4xl
font-semibold
tracking-tight
text-slate-900
">

{item.value}

</h2>


<p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">

{item.label}

</p>


</div>


)

)

}


</div>

);

}