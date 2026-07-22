interface Props{

src:string;

alt?:string;

width?:string;

height?:string;

rounded?:boolean;

}


export default function Image({

src,

alt="",

width="100%",

height="auto",

rounded=true

}:Props){


return (

<img

src={src}

alt={alt}

style={{
width,
height
}}

className={rounded?"rounded-xl":""}

/>

);

}