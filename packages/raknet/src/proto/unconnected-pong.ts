import { MAGIC } from "../constants";
import { RakNetUnconnectedPacketId } from "../enums";

const PONG_BUFFER = new Uint8Array(256);
PONG_BUFFER[0] = RakNetUnconnectedPacketId.UnconnectedPong;
PONG_BUFFER.set(MAGIC, 16 + 1);

const PONG_VIEW = new DataView(PONG_BUFFER.buffer, 1); // Exclude packetId
const MESSAGE_BUFFER_VIEW = PONG_BUFFER.subarray(1 + 16 + 16 + 2);

export function rentUnconnectedPongBufferWith(pongTime: bigint, serverGuid: bigint, message: Uint8Array): Uint8Array{
    // Set pong time
    PONG_VIEW.setBigUint64(0, pongTime, false);
    
    // Set server guid
    PONG_VIEW.setBigUint64(8, serverGuid, false);
    
    // Set message length and skip magic (+16)
    PONG_VIEW.setUint16(16 + 16, message.length, false);

    // Set message data at the end of the buffer
    MESSAGE_BUFFER_VIEW.set(message);
    
    // return rented buffer with correct length
    return PONG_BUFFER.subarray(0, 35 + message.length);
}