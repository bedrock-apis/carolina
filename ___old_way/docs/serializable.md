# Design choice
## Deserialization Instancing
> Is it bette to call deserialize on instance or creating new instance in static method?

**Problems & Considerations**:
- When we use static method we have to deal with these problems:
    - No control on when objects are created
    - Requires classes to always have no-params in their constructors

- Instance method
    - More flexible
    - Problem with deserialization code gen, deserialization code gen should just call `Type.deserialize(cursor)`, without wondering about instance creation

- Serialization
    - In Term of serialization its pretty much the same but without wondering about instance creating as its always available

- Type Ser/Des code gen
    - Code gen for serialization and deserialization requires minimal complexity, thats where static methods make sense
    - Static methods require static target to serialize their instances, more complex & OOP-less, **doesn't** works with polymorphism, inheritance and abstractions.

- Both?
    - We could go for both, the `SerializableType` and `Serializable`, `SerializableType` is build to cover static methods and Serializable is instance based

#### Serializable-s
They could have separated serialization methods, or just provide clean way to get its type something like, requires performance tests!
```js
const SerializableType = objectInstance.constructor;
```


### Summary
It might be more complex but i would definitely go for `Both?` variant, where serializable types are used in decorators and Serializable-s are used by dev in real-world scenarios

### Step-back - Implementation
After implementing first working prototype i realized that instances doesn't always need to have own method, the reason is because types it self rarely inherit from another type, unless its abstract type or just base shared code, the serialization logic is always for the last child, after all its single instance for whole prototype chain that does the serialization. Current choice was `SerializableType` only.
