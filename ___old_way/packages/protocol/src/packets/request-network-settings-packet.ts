import { BasePacket } from "../base/packet";
import { Endianness, EndianOrder, Marshal } from "../base";
import { Int } from "@carolina/binary";

export class RequestNetworkSettingsPacket extends BasePacket {
    @Marshal(Int)
    @EndianOrder(Endianness.Big)
    public version: number = 0;
}