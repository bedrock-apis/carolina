# JSON format proposal — simple, structured, Mojang-friendly

This document proposes a compact, structured JSON format for describing Minecraft networking data (packets, structs, enums). The format is designed to be:

- Human readable and machine-friendly.
- Compact by allowing types to be defined globally and referenced.
- Flexible enough to express nested/compound types and conditional fields.

Rationale

- Centralizing types (structs/enums) at the top-level avoids repeating type definitions inside each packet and reduces file size.
- The type system is inspired by Script API modules and supports common binary encoding patterns used in Minecraft/BDS metadata.

Root JSON overview
A single top-level document groups versioning information and collections of packets, structs and enums:

```json
{
   "minecraft-engine": "1.22.130",
   "protocol-version": 997,
   "packets": [],
   "structs": [],
   "enums": []
}
```

- "minecraft-engine": engine or BDS version string for reference.
- "protocol-version": numeric protocol identifier.
- "packets": list of packet definitions (packets are a special case of structs with an id and additional metadata).
- "structs": reusable structured types referenced from fields.
- "enums": named enumerations referenced by fields.

Type system
Each type object describes either a primitive or a reference to a compound/structured type. Types can be recursive (for example arrays of structs). The minimal fields and examples:

1. Primitive (numeric types must have encoding)

```json
{
   "type": {
      "family": "primitive",
      "name": "int32",
      "encoding": "little-endian"
   }
}
```

- family: "primitive" indicates a basic binary type.
- name: logical type name (int8, int16, int32, uint32, float, bool, etc.).
- encoding: for numeric types, common encodings: "little-endian", "big-endian", "variant" (varint), "zigzag".

2. Array

```json
{
   "type": {
      "family": "primitive",
      "name": "array",
      "element_type": {
         /* recursive type object */
      },
      "length_type": {
         /* type of the length prefix */
      }
   }
}
```

- element_type: type of each array element.
- length_type: type used to encode the array length (e.g., a varint type).

3. String with length prefix

```json
{
   "type": {
      "family": "primitive",
      "name": "string",
      "length_type": {
         /* type of the length prefix */
      }
   }
}
```

- Strings are represented by a length prefix followed by UTF-8 bytes.

4. Optional (prefixed, not conditional)

```json
{
   "type": {
      "family": "primitive",
      "name": "optional",
      "type": {
         /* underlying type */
      }
   }
}
```

- "optional" here means the value is present or omitted according to its own prefix (for example, a byte flag is read then the value). Conditional presence is expressed at the field level (see Conditions).

5. Struct reference

```json
{
   "type": {
      "family": "struct",
      "name": "MyStruct"
   }
}
```

- name refers to an entry in the top-level "structs" array.

6. Enum reference

```json
{
   "type": {
      "family": "enum",
      "name": "GameMode"
   }
}
```

- name refers to an entry in the top-level "enums" array.

Packets and structs

- Packets are similar to structs: a collection of named fields with types.
- A packet adds metadata such as its packet id and an optional description.

Example packet entry:

```json
{
   "packet_id": 0x01,
   "name": "CommandRequest",
   "description": "Client sends a command request to the server.",
   "fields": [
      /* field definitions */
   ]
}
```

Fields
A field describes one element inside a struct or packet:

- name: field name.
- description: optional documentation for the field.
- type: type object as described above.
- condition: optional expression that determines whether the field is present or valid.

Example field:

```json
{
   "name": "friendlyName",
   "description": "Optional display name for the entity.",
   "type": {
      /* type object */
   },
   "condition": {
      /* conditional expression */
   }
}
```

Condition expressions — overview
Conditions are expressions evaluated relative to the current object instance (the struct/packet being parsed). They are expressed as a tree with an operator and a chain of values/operands. The chain model allows n-ary operators (e.g., logical-and with many operands, addition with many terms).

Condition object shape:

```json
{
   "operator": "equal", // e.g., "equal", "less-than", "logic-and", "logic-or", "not", "in", ...
   "chain": [
      /* operands: literals, references, nested conditions */
   ]
}
```

Allowed chain elements

- Property reference: a relative reference to another field in the same object, prefixed with "#". Example: "#./mode" or "#./count".
- Enum value reference: starts with "%", e.g. "%GameMode:CREATIVE" to reference an enum member.
- Literal number (integer/float).
- Literal boolean (true/false).
- Literal string, indicated with a leading "$", the first recognized "$" is always trimmed.
- Any String literal that doesn't starts with "#", "%", "$" is not valid!
- Nested condition objects (for composing expressions).

Examples

1. Simple equality (this.field == 5)

```json
{
   "operator": "equal",
   "chain": ["#./field", 5]
}
```

2. Nested comparison (this.x == (5 < 10))

```json
{
   "operator": "equal",
   "chain": [
      "#./x",
      {
         "operator": "less-than",
         "chain": [5, 10]
      }
   ]
}
```

3. Logical AND (a && b && c)

```json
{
   "operator": "logic-and",
   "chain": [
      {
         /* condition a */
      },
      {
         /* condition b */
      },
      {
         /* condition c */
      }
   ]
}
```

4. Only for players in creative (this.gamemode == GameMode.creative)

```json
{
   "operator": "equal",
   "chain": ["#./gamemode", "%GameMode:Creative"]
}
```

Notes about optional vs conditional

- Optional types (the "optional" family) model values that are encoded with their own presence prefix.
- Field-level conditions determine whether a field is present or should be parsed/processed based on the runtime values of other fields or constants.

Parsing/processing guidance (summary)

- Resolve types by name: when a field type references a struct/enum by name, look it up in the top-level "structs" or "enums".
- Evaluate conditions in field order, since conditions often reference previous fields.
- Keep encoding details in the type objects (encoding, length_type) so parsers can be generic.

This proposal aims to be compact, expressive and compatible with common Script API patterns while being explicit enough for tooling to generate parsers and serializers reliably.
