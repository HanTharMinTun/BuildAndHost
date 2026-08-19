import { parseAnimations, mergeStyle } from "../renderer/utils";

interface Props{
	text:string;
	size?:string;
	weight?:string;
	color?:string;
	align?:string;
	animations?:string;
	style?: React.CSSProperties;
}

export default function Text({
	text,
	size="base",
	weight="normal",
	color,
	align,
	animations,
	style
}:Props){
	const animStyle = parseAnimations(animations);
	const extra: React.CSSProperties = {};
	if (color) extra.color = color;
	if (size) extra.fontSize = size as any;
	if (align) extra.textAlign = align as any;
	const merged = mergeStyle(style, { ...extra, ...(animStyle as any) });

	return (
		<span
			className={`leading-relaxed tracking-wide text-current`}
			style={merged}
		>
			{text}
		</span>
	);

}