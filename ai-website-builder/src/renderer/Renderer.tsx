import {COMPONENT_REGISTRY} from "./registry";

import type { ComponentNode } from "./types";

interface Props{

node:ComponentNode;

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