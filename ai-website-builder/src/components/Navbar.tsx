interface Props{
	logo?:string;
	items:string[];
	sticky?:boolean;
	style?: React.CSSProperties;
}


export default function Navbar({
	logo="Logo",
	items=[],
	sticky=false,
	style
}:Props){

	return (
		<nav
			className={`component-navbar w-full flex justify-between items-center px-6 py-4 sm:px-8 rounded-full border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-[0_12px_40px_-20px_rgba(15,23,42,0.25)] ${sticky ? "sticky top-4 z-20 mx-auto max-w-7xl" : "mx-auto max-w-7xl"}`}
			style={style}
		>

			<h2 className="font-semibold text-lg tracking-tight text-current">{logo}</h2>

			<ul className="flex items-center gap-4 sm:gap-6">
				{items.map((item) => (
					<li key={item}>
						<a href="#" className="text-sm font-medium text-current transition-colors hover:text-slate-900">{item}</a>
					</li>
				))}
			</ul>

		</nav>
	);

}