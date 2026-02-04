export interface ComponentData {
    id: string
    type: ComponentType
}

// FONT STORAGE
export interface FontStorageData { 
    [family: string]: { 
        [weight: string]: { 
            [style: string]: string
        } 
    } 
}

// TEXT
export interface TextComponentData extends ComponentData {
    value: string
    font?: string
    size?: number
    weight?: string | number
    style?: string
    color?: string
    alignment?: string
}

// IMAGE
export interface ImageComponentData extends ComponentData {
    src: string
    width?: number
    height?: number
    scaleMode?: "fit" | "fill" | "stretch" | "none"
    alt?: string
}

// FORM
export interface FormComponentData extends ComponentData {
    method: "GET" | "POST" | "PUT" | "DELETE"
    action?: string
    fields: Array<Field>
}

// FIELD
export interface Field {
    name: string
    label?: string
    placeholder?: string
    required: boolean
    value: string | boolean | number
}

// ENUM
export enum ComponentType {
    Text = "text",
    Image = "image",
    Form = "form"
}

// UNION
export type AnyComponentData =
    | TextComponentData
    | ImageComponentData
    | FormComponentData

// BLOC
export interface Bloc {
    id: string
    component: AnyComponentData
    metadata: BlocMetadata
}

// BLOC METADATA
export interface BlocMetadata {
    order: number
    style?: string
}

// DOCUMENT
export interface Document {
    id?: string
    blocs: Array<Bloc>
    metadata?: Record<string, unknown>
}