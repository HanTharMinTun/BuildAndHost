interface Props{

children?:React.ReactNode;

columns?:number;

gap?:string;

style?: React.CSSProperties;

}


export default function Grid({

children,

columns=3,

gap="gap-6",

style

}:Props){

const columnClasses: Record<number, string> = {
	1: "md:grid-cols-1",
	2: "md:grid-cols-2",
	3: "md:grid-cols-3",
	4: "md:grid-cols-4",
};

return (

	<div

		className={`grid grid-cols-1 ${columnClasses[columns] ?? columnClasses[3]} ${gap}`}

		style={style}

	>

		{children}

	</div>

);

}
