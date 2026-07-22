interface Props {

title:string;

description?:string;

image?:string;

buttonText?:string;

}


export default function Card({

title,

description,

image,

buttonText

}:Props){


return (

<div className="
rounded-xl
shadow-md
border
p-6
bg-white
">


{

image &&

<img

src={image}

className="
rounded-lg
mb-4
"

/>

}



<h3 className="
text-2xl
font-bold
mb-3
">

{title}

</h3>


{

description &&

<p className="
text-gray-600
mb-4
">

{description}

</p>

}



{

buttonText &&

<button className="
bg-blue-600
text-white
px-4
py-2
rounded
">

{buttonText}

</button>

}



</div>

);

}