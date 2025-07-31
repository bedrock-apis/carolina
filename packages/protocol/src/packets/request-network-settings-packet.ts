import { BuildIn, Marshal, Serializable, SerializableInstance } from "../base";

@Serializable
export class RequestNetworkSettingsPacket extends SerializableInstance {
    @Marshal(BuildIn.Int32 | BuildIn.BigEndian)
    public version: number = 0;
}

