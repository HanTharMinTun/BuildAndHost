interface Props{

images:string[];

columns?:number;

}


export default function Gallery({

images=[],

columns=3

}:Props){


return (

<div

className={`
grid
grid-cols-1
md:grid-cols-${columns}
gap-5
`}

>


{

images.map(

(img,index)=>(


<img

key={index}

src={img}

className="
rounded-xl
"

/>


)

)

}


</div>

);

}