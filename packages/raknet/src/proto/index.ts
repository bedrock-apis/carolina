import { AddressInfo } from "node:net";
import { rentOpenConnectionReplyOneBufferWith } from "./open-connection-reply-one";
import { rentOpenConnectionReplyTwoBufferWith } from "./open-connection-reply-two";
import { rentUnconnectedPongBufferWith } from "./unconnected-pong";
import { IS_FRAGMENTED_BIT, IS_ORDERED_LOOKUP, IS_RELIABLE_LOOKUP, IS_SEQUENCED_LOOKUP } from "../constants";
import { FrameDescriptor } from "../interfaces";

export class RakNetUtils {
    public static readonly rentUnconnectedPongBufferWith = rentUnconnectedPongBufferWith;
    public static readonly rentOpenConnectionReplyOneBufferWith = rentOpenConnectionReplyOneBufferWith;
    public static readonly rentOpenConnectionReplyTwoBufferWith = rentOpenConnectionReplyTwoBufferWith;
    public static getUnconnectedPingTime(buffer: ArrayBufferView): bigint{
        if(!(buffer instanceof DataView)) buffer = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

        //first byte is packet so offset is hardcoded to 1
        return (buffer as DataView).getBigUint64(1, false);
    }
    public static getDataFromOpenConnectionRequestTwo(buffer: ArrayBufferView): {guid: bigint, mtu: number}{
        if(!(buffer instanceof DataView)) buffer = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        
        // Get address version with hardcoded offset
        let addressVersion = (buffer as DataView).getUint8(1 + 16);
        
        // Skip address bytes
        let skip = addressVersion === 4?7:29;

        // Read guid and mtu with hardcoded offset
        return {guid: (buffer as DataView).getBigUint64(1 + 16 + 2 + skip), mtu: ((buffer as DataView).getUint16(1 + 16 + skip))};
    }
    // Read Uint24LE
    public static readUint24(view: DataView, offset: number = 0): number{ return (view.getUint16(offset, true) | (view.getUint8(offset+2) << 16)); }
    // Write Uint24LE
    public static writeUint24(view: DataView, offset: number, value: number): void{ 
        view.setUint16(offset, value & 0xffff, true);
        view.setUint8(offset, (value >> 16));
    }
    public static debug(...params: any[]): void{ __debug__: console.log(...params); }

    // Basic method for building consistent identifier
    public static getFullAddressFor(info: AddressInfo): string{return `${info.address}:${info.port}`}
    public static readFrameData(view: DataView, offset: number): {offset: number} & FrameDescriptor{
        const result: FrameDescriptor & {offset: number} = {
            body: null!,
            offset,
        };
        const header = view.getUint8(offset++);

        // First top 3bits of the byte 8-5 = 3
        const reliability = header>>5;

        // get is fragmented by bit check
        const isFragmented = (header & IS_FRAGMENTED_BIT) === IS_FRAGMENTED_BIT;

        // body length in bits, so >>3 bit shift makes it in bytes
        const bodyLength = view.getUint16(offset) >> 3;
        offset+=2;

        // Check if the frame is reliable.
        // If so, read the reliable index.
        if (IS_RELIABLE_LOOKUP[reliability]) {
            result.reliableIndex = RakNetUtils.readUint24(view,offset);
            offset+=3;
        }

        // Check if the frame is sequenced.
        // If so, read the sequence index.
        if (IS_SEQUENCED_LOOKUP[reliability]) {
            result.sequenceIndex =RakNetUtils.readUint24(view,offset);
            offset+=3;
        }

        // Check if the frame is ordered.
        // If so, read the order index and channel.
        if (IS_ORDERED_LOOKUP[reliability]) {
            result.orderIndex = RakNetUtils.readUint24(view, offset);
            offset += 3;
            result.orderChannel = view.getUint8(offset++);
        }

        if(isFragmented){
            const fragment = (result.fragment = {} as typeof result.fragment)!;
            fragment.length = view.getUint32(offset);
            offset += 4;
            fragment.id = view.getUint16(offset);
            offset += 2;
            fragment.index = view.getUint32(offset);
            offset += 4;
        }

        result.body = new Uint8Array(view.buffer, view.byteOffset + offset, bodyLength);
        result.offset = offset+=bodyLength;
        return result;
    }
    public static random64(): bigint{
        return (
            (BigInt((Math.random() * 0xffff_ffff) & 0xffff_ffff)<<32n)
            & (BigInt((Math.random() * 0xffff_ffff) & 0xffff_ffff))
        );
    }
}