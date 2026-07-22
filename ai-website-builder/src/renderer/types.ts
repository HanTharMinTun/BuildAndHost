// src/renderer/types.ts


export interface ComponentNode {

    type: string;

    props?: {
        [key:string]: any;
    };

    children?: ComponentNode[];

}