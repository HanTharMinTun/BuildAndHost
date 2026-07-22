import {COMPONENT_REGISTRY}
from "./registry";


export function validateNode(node:any):boolean{


if(!node.type){

return false;

}



if(!COMPONENT_REGISTRY[node.type]){


console.error(
"Invalid component:",
node.type
);


return false;

}



if(node.children){

return node.children.every(
validateNode
);

}



return true;

}