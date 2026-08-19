type FeatureItem = string | {
title?: unknown;
description?: unknown;
name?: unknown;
label?: unknown;
};

interface Props {

items?:FeatureItem[];

children?:React.ReactNode;

columns?:number;

style?: React.CSSProperties;

}


export default function FeatureList({

items=[],

children,

columns=3,

style

}:Props){

const featureItems = Array.isArray(items) ? items : [];
const columnClasses: Record<number, string> = {
1: "md:grid-cols-1",
2: "md:grid-cols-2",
3: "md:grid-cols-3",
4: "md:grid-cols-4",
};


return (

<div

className={`
grid
grid-cols-1
${columnClasses[columns] ?? columnClasses[3]}
gap-6
sm:gap-8
`}

style={style}

>


{

featureItems.map(
(item,index)=>{

const title = typeof item === "string"
  ? item
  : typeof item.title === "string"
    ? item.title
    : typeof item.name === "string"
      ? item.name
      : typeof item.label === "string"
        ? item.label
        : "Feature";
const description = typeof item === "object" && item && typeof item.description === "string"
  ? item.description
  : undefined;

return (


<div

key={index}

className="
rounded-[1.25rem]
border
border-slate-200/70
bg-gradient-to-br
from-slate-50
to-white
p-6
shadow-[0_18px_50px_-25px_rgba(15,23,42,0.3)]
"

>

<h3 className="
font-semibold
text-slate-900
leading-7
">

✓ {title}

</h3>

{description && <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}


</div>


);

}

)

}

{children}


</div>

);

}
