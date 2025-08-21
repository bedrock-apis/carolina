// oxlint-disable no-unused-vars
import { Cursor, mergeSourceDirectNoEnumerable, SerializableType } from "@carolina/binary";

// oxlint-disable-next-line no-unsafe-declaration-merging
export abstract class BaseType {
    public serialize(cursor: Cursor): void{
        this.serializableType.serialize(cursor, this);
    }
    public static serialize<T>(this: new()=>T, cursor: Cursor, value: T): void{
        throw new ReferenceError("No implementation error");
    }
    public static deserialize<T>(this:  new()=>T, cursor: Cursor): T{
        throw new ReferenceError("No implementation error");
    }
}
export interface BaseType {
    readonly serializableType: SerializableType<this>;
}
mergeSourceDirectNoEnumerable(BaseType.prototype, {
    get serializableType(){
        return (this.constructor as typeof BaseType satisfies SerializableType<BaseType>);
    }
});