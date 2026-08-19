interface Props{

children?:React.ReactNode;

padding?:string;

background?:string;

style?: React.CSSProperties;

}


export default function Section({

children,

padding="py-16",

background="",

style

}:Props){


return (
	<section
		className={`component-section relative overflow-hidden ${padding} ${background} rounded-[2rem] border border-slate-200/70 bg-white/80 shadow-[0_20px_80px_-30px_rgba(15,23,42,0.35)] backdrop-blur`}
		style={style}
	>
		{children}
	</section>
);

}