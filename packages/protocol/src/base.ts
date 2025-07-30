import { Cursor } from "@carolina/binary";
import {} from "@bedrock-apis/nbt-core";

export abstract class Serializable {
    public deserialize(_: Cursor): this{
        // Intended to not be implemented implementation is override after via decorators
        throw new ReferenceError("No implementation error");
    }
    public serialize(_: Cursor): void {
        // Intended to not be implemented implementation is override after via decorators
        throw new ReferenceError("No implementation error");
    }
}
export abstract class BasePacket extends Serializable {}