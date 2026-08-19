import { parseAnimations, mergeStyle } from "../renderer/utils";

interface Props{
	text:string;
	align?:string;
	color?:string;
	size?:string;
	animations?:string;
	style?: React.CSSProperties;
}

export default function Paragraph({
	text,
	align = "left",
	color,
	size,
	animations,
	style,
}:Props){
	const animStyle = parseAnimations(animations);
	const extra: React.CSSProperties = {};
	if (color) extra.color = color;
	if (size) extra.fontSize = size as any;
	if (align) extra.textAlign = align as any;
	const merged = mergeStyle(style, { ...extra, ...(animStyle as any) });

	return (
		<p
			className={`component-paragraph max-w-2xl text-base sm:text-lg leading-8 text-current`}
			style={merged}
		>
			{text}
		</p>
	);
}