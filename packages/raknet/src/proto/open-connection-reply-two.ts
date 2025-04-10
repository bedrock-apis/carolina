import { MAGIC } from "../constants";
import { RakNetUnconnectedPacketId } from "../enums";
import { writeAddress } from "./address";
import type { AddressInfo } from "node:net";

const REPLY_BUFFER = new Uint8Array(1 + 16 + 8 + 29 + 2 + 1);

// Set packetId
REPLY_BUFFER[0] = RakNetUnconnectedPacketId.OpenConnectionReplyTwo;

// Set magic
REPLY_BUFFER.set(MAGIC, 1);

// Exclude packetId
const PONG_VIEW = new DataView(REPLY_BUFFER.buffer, 1);

export function rentOpenConnectionReplyTwoBufferWith(serverGuid: bigint, clientAddress: AddressInfo, mtuSize: number): Uint8Array{
    // Set server guid
    PONG_VIEW.setBigUint64(16, serverGuid, false);

    // Magic + server guid
    let offset = 16 + 8;

    offset = writeAddress(PONG_VIEW, offset, clientAddress);
    
    // Set message length and skip magic (+16)
    PONG_VIEW.setUint16(offset, mtuSize, false);

    // 0 - no encryption required
    PONG_VIEW.setUint8(offset+=2, 0);
    // Increment for last written byte
    offset++;

    // return rented buffer with correct length, 1 for packetId
    return REPLY_BUFFER.subarray(0, offset + 1);
}