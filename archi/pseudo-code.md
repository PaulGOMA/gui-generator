# Data structure

## Component structure

**Base structure**

*All components inherit from this structure*

```
STRUCT Component:
    id : string
    type : string
END STRUCT
```
---

**Text component**

```
STRUCT TextComponent EXTENDS Component:
    font : string
    size : int
    weight : string
    style : string
    color : string
    alignment : string
END STRUCT
```
---

**Image component**

```
STRUCT ImageComponent EXTENDS Component:
    src : string
    width : int
    height : int
    scaleMode : string
    alt : string
END STRUCT
```
---

**Form component**
```
STRUCT FormComponent EXTENDS Component:
    method : string
    action : string
    fields : List<Field>
END STRUCT
```

- *Field structure*

```
STRUCT Field:
    type : string
    name : string
    label : string
    placeholder : string
    required : bool
    value : string
END STRUCT
```
---

## Bloc structure

```
STRUCT Bloc:
    id : string
    component : Component
    metadata : BlocMetadata
END STRUCT
```

- *Bloc metadata structure*

```
STRUCT BlocMetadata:
    order : int
    style : string
END STRUCT
```
---

## Document structure
```
STRUCT Document:
    blocs : List<Bloc>
END STRUCT
```
---
## Default values
```
STRUCT DefaultTextStyle:
    font : string
    size : int
    weight : string
    style : string
    color : string
    alignment : string
END STRUCT
```
---
## Auxiliary function

**Unique identifiers**
```
FUNCTION GenerateUniqueID() RETURNS string
```
---

**Normalization**
```
FUNCTION Normalize(property, value) RETURNS any
```
---

# Main classes

## Component builder interface
```
INTERFACE IComponentBuilder:
    FUNCTION Validate(jsonEntry) RETURNS BOOLEAN
    FUNCTION Build(jsonEntry) RETURNS Component
END INTERFACE
```
---

## Base component abstract class
```
ABSTRACT CLASS BaseComponentBuilder implements IComponentBuilder
    FUNCTION Validate(jsonEntry) RETURNS BOOLEAN
    FUNCTION Build(jsonEntry) RETURNS Component
    FUNCTION Normalize(property, value) RETURNS  any
    FUNCTION ApplyDefaults(component)
    FUNCTION IsInvalid(property, value) RETURNS bool
END ABSTRACT CLASS
```
---

## Text component builder
```
CLASS TextComponentBuilder EXTENDS BaseComponentBuilder:
    FUNCTION Validate(jsonEntry):
        RETURN jsonEntry.type = "text"
    END FUNCTION

    FUNCTION Build(jsonEntry):
        component ← NEW TextComponent

        /* --- Font family --- */
        font ← jsonEntry.fontFamily

        IF font IS NULL THEN
            component.font ← DEFAULT_FONT
        ELSE
            IF NOT FontExists(font) THEN
                DISPLAY("Error: font family not found.")
                component.font ← DEFAULT_FONT
            ELSE
                component.font ← font
            END IF
        END IF

        /* --- Font properties --- */
        FOR EACH property IN ["size", "weight", "style", "color"] DO
            value ← jsonEntry[property]

            IF value IS NULL THEN
                component[property] ← DEFAULT(property)
                CONTINUE
            END IF

            normalized ← Normalize(property, value)

            IF IsInvalid(property, normalized) THEN
                component[property] ← DEFAULT(property)
            ELSE
                component[property] ← normalized
            END IF
        END FOR

        RETURN component
    END FUNCTION

END CLASS
```
---

## Image component builder
```
CLASS ImageComponentBuilder EXTENDS BaseComponentBuilder:
    FUNCTION Validate(jsonEntry):
        RETURN jsonEntry.type = "image"
    END FUNCTION

    FUNCTION Build(jsonEntry):
        component ← NEW ImageComponent

        /* --- Source --- */
        src ← jsonEntry.src

        IF src IS NULL THEN
            DISPLAY("Error: missing image source.")
            component.src ← DEFAULT_IMAGE
        ELSE
            IF IsLocalPath(src) AND NOT FileExists(src) THEN
                DISPLAY("Error: image file not found.")
                component.src ← DEFAULT_IMAGE
            ELSE IF IsURL(src) AND NOT IsValidURL(src) THEN
                DISPLAY("Error: invalid image URL.")
                component.src ← DEFAULT_IMAGE
            ELSE
                component.src ← src
            END IF
        END IF

        /* --- Properties --- */
        FOR EACH property IN ["width", "height", "scaleMode", "alt"] DO
            value ← jsonEntry[property]

            IF value IS NULL OR IsInvalid(property, value) THEN
                component[property] ← DEFAULT(property)
            ELSE
                component[property] ← Normalize(property, value)
            END IF
        END FOR

        RETURN component

    END FUNCTION 

END CLASS
``` 
---

## Form component builder
```
CLASS FormComponentBuilder EXTENDS BaseComponentBuilder:
    FUNCTION Validate(jsonEntry):
        RETURN jsonEntry.type = "form"
    END FUNCTION

    FUNCTION Build(jsonEntry):
        component ← NEW FormComponent

        /* --- Method --- */
        method ← jsonEntry.method
        IF method IS NULL OR NOT IsValidMethod(method) THEN
            component.method ← "POST"
        ELSE
            component.method ← method
        END IF

        /* --- Action URL --- */
        action ← jsonEntry.action
        IF action IS NULL OR NOT IsValidURL(action) THEN
            DISPLAY("Warning: invalid form action URL.")
            component.action ← DEFAULT_FORM_ACTION
        ELSE
            component.action ← action
        END IF

        /* --- Fields --- */
        fields ← jsonEntry.fields

        IF fields IS NULL OR fields IS EMPTY THEN
            DISPLAY("Error: form has no fields.")
            RETURN component
        END IF

        FOR EACH field IN fields DO
            newField ← NEW Field

            /* Type */
            IF field.type IS NULL OR NOT IsValidFieldType(field.type) THEN
                DISPLAY("Warning: invalid field type.")
                newField.type ← "text"
            ELSE
                newField.type ← field.type
            END IF

            /* Name */
            IF field.name IS NULL THEN
                DISPLAY("Error: form field missing name.")
                CONTINUE
            ELSE
                newField.name ← field.name
            END IF

            /* Optional properties */
            FOR EACH property IN ["label", "placeholder", "required", "value"] DO
                value ← field[property]

                IF value IS NULL THEN
                    newField[property] ← DEFAULT(property)
                ELSE
                    newField[property] ← Normalize(property, value)
                END IF
            END FOR

            ADD newField TO component.fields
        END FOR

        RETURN component
    END FUNCTION 

END CLASS
```
---
## Sequential engine

**Orchestrator function**

```
CLASS Engine:

    FUNCTION Run():

        jsonData ← LoadJSON(self.jsonFilePath)

        IF jsonData IS NULL THEN
            DISPLAY("Error: JSON loading failed.")
            TERMINATE_PROGRAM
        END IF

        FOR EACH entry IN jsonData DO
            ProcessEntry(entry)
        END FOR

        FinalizeDocument(self.document)
        DisplayDocument(self.document)

    END FUNCTION


    FUNCTION LoadJSON(path):

        rawContent ← ReadFile(path)

        IF rawContent IS NULL THEN
            RETURN NULL
        END IF

        jsonData ← ParseJSON(rawContent)

        IF jsonData IS INVALID OR EMPTY THEN
            RETURN NULL
        END IF

        RETURN jsonData

    END FUNCTION


    FUNCTION ProcessEntry(entry):

        builder ← FindMatchingBuilder(self.builders, entry)

        IF builder IS NULL THEN
            DISPLAY("Warning: no builder found for entry.")
            RETURN
        END IF

        component ← builder.Build(entry)

        IF component IS NULL THEN
            DISPLAY("Warning: component build failed.")
            RETURN
        END IF

        bloc ← CreateBloc(component)
        InsertBloc(self.document, bloc)

    END FUNCTION

END CLASS
```

**Auxiliary functions**

```
FUNCTION RegisterBuilders():
    builders ← EMPTY LIST
    ADD TextComponentBuilder TO builders
    ADD ImageComponentBuilder TO builders
    ADD FormComponentBuilder TO builders
    RETURN builders
END FUNCTION


FUNCTION FindMatchingBuilder(builders, entry):

    FOR EACH builder IN builders DO
        IF builder.Validate(entry) = TRUE THEN
            RETURN builder
        END IF
    END FOR

    RETURN NULL

END FUNCTION

FUNCTION CreateBloc(component):
    bloc ← NEW Bloc
    bloc.component ← component
    RETURN bloc
END FUNCTION


FUNCTION InsertBloc(document, bloc):
    document.AddBloc(bloc)
END FUNCTION

FUNCTION FinalizeDocument(document):
    FOR EACH bloc IN document.blocs DO
        NormalizeBloc(bloc)
    END FOR
END FUNCTION

FUNCTION DisplayDocument(document):
    RENDER document USING CURRENT_RENDERER
END FUNCTION
```
---

## Document function

**Add bloc**

```
FUNCTION AddBloc(document, bloc):
    APPEND bloc TO document.blocs
    UPDATE document.order IF NEEDED
END FUNCTION
```


