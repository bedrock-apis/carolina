import type { RakNetUtils } from "./index";
import { RakNetUnconnectedPacketId } from "../enums";

const ACK_BUFFER = new Uint8Array(256);

const VIEW = new DataView(ACK_BUFFER.buffer);

export function rentAcknowledgePacketWith(this: typeof RakNetUtils, kind: RakNetUnconnectedPacketId.AckDatagram | RakNetUnconnectedPacketId.NackDatagram, ranges: Iterable<{max: number, min: number}>): Uint8Array{
    // Packet Id
    ACK_BUFFER[0] = kind;
    let count = 0, offset = 1 + 2;
    for(const {max, min} of ranges){
        // Write Min
        this.writeUint24(VIEW, offset + 1, min);

        // Skip max if the max === min
        if(!((ACK_BUFFER[offset] as unknown) = (max === min))) {
            this.writeUint24(VIEW, offset + 1 + 3, max);
            offset += 3 + 3 + 1;
        }
        else offset += 3 + 1;
        count++;
    }

    // Write Count
    VIEW.setUint16(1, count, false);

    // return rented buffer with correct length
    return ACK_BUFFER.subarray(0, offset);
}