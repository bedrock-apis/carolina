import { Short } from "@carolina/binary/src/types/numbers/short";
import { BuildIn, Marshal, Serializable, SerializableInstance } from "../base";
import { Long } from "@carolina/binary/src/types/numbers/long";

@Serializable
export class RequestNetworkSettingsPacket extends SerializableInstance {
    @Marshal(Long)
    public version: number = 0;
}

