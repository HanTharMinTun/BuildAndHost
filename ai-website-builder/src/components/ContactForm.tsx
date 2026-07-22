interface Props{

submitAction?:string;

}


export default function ContactForm({

submitAction

}:Props){


return (

<form

className="
space-y-4
max-w-xl
"

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
bg-blue-600
text-white
px-6
py-3
rounded
"

>

Send

</button>


</form>

);

}