interface Props {
  title:string;
  subtitle?:string;
  buttonText?:string;
  buttonAction?:string;
  image?:string;
  style?: React.CSSProperties;
}


export default function Hero({

title,

subtitle,

buttonText,

image,

style

}:Props){

return (

  <section
    className={
      "component-hero relative overflow-hidden rounded-[2.5rem] border border-slate-200/70 px-6 py-20 sm:px-8 lg:px-12 grid md:grid-cols-2 gap-10 items-center shadow-[0_30px_100px_-35px_rgba(2,6,23,0.7)]"
    }
    style={style}
  >


<div className="relative z-10">

  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-current mb-6">{title}</h1>

  {subtitle && <p className="max-w-xl text-lg sm:text-xl leading-8 text-current/70 mb-8">{subtitle}</p>}


{
buttonText &&

            <button className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-slate-900 font-medium shadow-lg shadow-slate-950/20 transition-transform duration-200 hover:-translate-y-0.5">
              {buttonText}
            </button>

}


</div>


{

image &&

<img

src={image}

style={{ height: "clamp(18rem, 42vw, 32rem)", maxWidth: "100%", objectFit: "cover" }}

className="
rounded-[2rem]
border
border-white/10
h-full
max-h-[560px]
w-full
object-cover
shadow-[0_24px_80px_-24px_rgba(15,23,42,0.8)]
"

/>

}


</section>

);

}
