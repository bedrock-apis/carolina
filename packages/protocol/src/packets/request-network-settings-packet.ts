import { BuildIn, Marshal, Serializable } from "../base";

export class RequestNetworkSettingsPacket extends Serializable {
    @Marshal(BuildIn.Int32 | BuildIn.BigEndian)
    public version: number = 0;
}

