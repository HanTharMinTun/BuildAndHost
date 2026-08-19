interface Props{

src:string;

alt?:string;

width?:string;

height?:string;

rounded?:boolean;

style?: React.CSSProperties;

}


export default function Image({

src,

alt="",

width="100%",

height="auto",

rounded=true,

style

}:Props){


return (

<img
			src={src}
			alt={alt}
			crossOrigin="anonymous"
			onError={(e) => {
				// hide broken images instead of showing browser broken icon
				try {
					(e.target as HTMLImageElement).style.display = "none";
				} catch {}
			}}
			style={{
				width,
				height,
				...style,
				maxWidth: "100%",
				objectFit: "cover",
				display: "block",
			}}

			className={
				rounded
					? "h-auto w-full rounded-[1.5rem] object-cover shadow-[0_18px_50px_-20px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/70"
					: "h-auto w-full object-cover"
			}
		/>

);

}
