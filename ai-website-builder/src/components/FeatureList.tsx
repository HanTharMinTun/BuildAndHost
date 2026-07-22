interface Props {

items:string[];

columns?:number;

}


export default function FeatureList({

items,

columns=3

}:Props){


return (

<div

className={`
grid
grid-cols-1
md:grid-cols-${columns}
gap-6
`}

>


{

items.map(
(item,index)=>(


<div

key={index}

className="
p-5
border
rounded-xl
"

>

<h3 className="
font-bold
">

✓ {item}

</h3>


</div>


)

)

}


</div>

);

}