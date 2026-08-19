import { parseAnimations, mergeStyle } from "../renderer/utils";

interface Props{
	text:string;
	level?:number;
	align?:string;
	color?:string;
	size?:string;
	animations?:string;
	style?: React.CSSProperties;
}

export default function Heading({
	text,
	level=1,
	align="left",
	color,
	size,
	animations,
	style
}:Props){

	const Tag:any = `h${level}`;
	const animStyle = parseAnimations(animations);
	const extra: React.CSSProperties = {};
	if (color) extra.color = color;
	if (size) extra.fontSize = size as any;
	if (align) extra.textAlign = align as any;

	const merged = mergeStyle(style, { ...extra, ...(animStyle as any) });

	return (
		<Tag
			className={`component-heading font-semibold tracking-tight leading-tight text-3xl sm:text-4xl lg:text-5xl`}
			style={merged}
		>
			{text}
		</Tag>
	);

}