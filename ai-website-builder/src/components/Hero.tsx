interface Props {
  title:string;
  subtitle?:string;
  buttonText?:string;
  buttonAction?:string;
  image?:string;
}


export default function Hero({

title,

subtitle,

buttonText,

image

}:Props){

return (

<section className="
py-20
px-6
grid
md:grid-cols-2
gap-10
items-center
">


<div>

<h1 className="
text-5xl
font-bold
mb-6
">

{title}

</h1>


{
subtitle &&

<p className="
text-xl
text-gray-600
mb-8
">

{subtitle}

</p>

}


{
buttonText &&

<button className="
px-6
py-3
bg-blue-600
text-white
rounded-lg
">

{buttonText}

</button>

}


</div>


{

image &&

<img

src={image}

className="
rounded-xl
shadow-lg
"

/>

}


</section>

);

}