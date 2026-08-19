// src/renderer/types.ts

// import type { CSSProperties } from "react";


// export interface Website {
//     theme: Theme;
//     component: ComponentNode;
// }


// export interface Theme {

// colors:{
//     primary:string;
//     secondary:string;
//     background:string;
//     text:string;
// };

// typography:{
//     heading:string;
//     body:string;
// };

// spacing:{
//     small:string;
//     medium:string;
//     large:string;
// };

// borderRadius:string;

// }

export interface ComponentNode {

    

    type: string;

    props?: {
        [key:string]: any;
    };

    // style?:Record<string,string | undefined>;


    children?: ComponentNode[];
    

}
