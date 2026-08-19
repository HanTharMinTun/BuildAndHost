import {COMPONENT_REGISTRY} from "./registry";

import type { ComponentNode } from "./types";
import type { CSSProperties } from "react";

interface Props{

node:ComponentNode;


}

/**
 * AI-generated data is untrusted. React requires `style` to be an object, so
 * discard malformed style values instead of allowing one node to unmount the
 * whole preview.
 */
function getStyle(value: unknown): CSSProperties | undefined {
if (!value || typeof value !== "object" || Array.isArray(value)) {
return undefined;
}

return value as CSSProperties;
}



export default function Renderer({

node

}:Props){


const Component =
COMPONENT_REGISTRY[node.type];



if(!Component){

console.error(
"Unknown component:",
node.type
);


return null;

}



return (

<Component

{...(node.props || {})}
style={getStyle(node.props?.style)}


>


{

node.children?.map(

(child,index)=>(


<Renderer

key={index}

node={child}

/>


)

)

}


</Component>

);

}
