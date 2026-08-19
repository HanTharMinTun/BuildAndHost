interface Props{

submitAction?:string;

style?: React.CSSProperties;

}


export default function ContactForm({

submitAction,

style

}:Props){


return (

<form

className="
max-w-2xl
space-y-4
rounded-[1.75rem]
border
border-slate-200/70
bg-white/90
p-6
shadow-[0_20px_70px_-30px_rgba(15,23,42,0.35)]
sm:p-8
"

style={style}

>


<input

placeholder="Name"

className="
w-full
border
p-3
rounded
"

/>



<input

placeholder="Email"

className="
w-full
border
p-3
rounded
"

/>



<textarea

placeholder="Message"

className="
w-full
border
p-3
rounded
"

/>



<button

type="submit"

className="
rounded-full
bg-gradient-to-r
from-sky-600
to-blue-600
px-6
py-3
font-medium
text-white
shadow-lg
shadow-sky-600/25
transition-transform
duration-200
hover:-translate-y-0.5
"

>

Send

</button>


</form>

);

}