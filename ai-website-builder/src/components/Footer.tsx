interface Props{
  copyright?:string;
  socialLinks?:string[];
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function Footer({
	copyright="© 2026",
	style,
	children,
}:Props){

	return (

		<footer

			className="mt-12 bg-slate-900 text-white py-12"

			style={style}

		>

			<div className="max-w-5xl mx-auto px-6">

				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

					<div className="flex-1">
						<div className="text-xl font-bold">Brand</div>
						<div className="mt-2 text-sm text-slate-300">Trusted professionals and thoughtful care.</div>
					</div>

					<div className="flex-1">
						{children ? (
							<div className="space-y-2 text-slate-200">{children}</div>
						) : (
							<div className="text-sm text-slate-400">Contact information, links, or a short blurb can go here.</div>
						)}
					</div>

					<div className="flex-1 text-right">
						<div className="text-sm text-slate-400">Follow</div>
						<div className="mt-2 flex items-center justify-end gap-3 text-slate-300">{/* social icons could go here */}</div>
					</div>

				</div>

				<div className="mt-8 border-t border-slate-800 pt-6 text-center text-sm text-slate-400">
					{copyright}
				</div>

			</div>

		</footer>

	);

}