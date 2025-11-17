# Design choice

## Binary serialization

> by ConMaster
> We all know that JS/TS is known for they infinite ways of implementing single thing, so what way is suitable for us the most? Firs of all, we have list our criteria, and what is important for us.

- **Performance/Efficiency**: is We wan't our binary serialization to perform as good as possible, this performance will reflect in whole project.
- **Simplicity/Reusability**: Minimal effort to write new structures and the apis should be solid in way we don't need to write own logic anymore.

### Deserialization Instancing

> Is it better to call deserialize on instance or creating new instance in static method?

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

> After thinking how to properly implement it, we wen't with idea of interfaces and abstract classes. Sometimes you don't need instance at all for objects like Int32
> thats where interfaces make sense, and for more complex types that requires to hold the property values we choose class abstraction with decorators.

The core of the serialization is `SerializableType` interface having simply two methods `serialize/deserialize`. Anyone who implement this interface is considered as serialization type.
For complex instances we choose basic `getType` method that returns SerializationType for such a instance, in most cases it would return `this.constructor as SerializationType`.
This pattern works really well with decorators where you can pass types directly without instances and it would accept them.

> After implementing first working prototype i realized that instances doesn't always need to have own method, the reason is because types it self rarely inherit from another type, unless its abstract type or just base shared code, the serialization logic is always for the last child, after all its single instance for whole prototype chain that does the serialization. Current choice was `SerializableType` only. We also have abstract class for types that has getType method mentioned above that should return constructor of current instance and constructor must be SerializationType compatible. We also manage to improve type checking with decorators.

## Timing is the key

> by ConMaster

When it comes games like minecraft network batching and more, its all about proper timing, strict execution order and being all in one with the core event loop. If we do it right we don't even have to use setInterval or setTimeout at all. For example we designed raknet in way it doesn't tick but it also batches packet once stack call ends. using setInterval is unpredictable with low delays. If you set setTimeout/setInternal less than 10ms. It still waits about ~15ms in general.
