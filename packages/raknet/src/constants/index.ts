
export const MAGIC = new Uint8Array([0x00, 0xFF, 0xFF, 0x00, 0xFE, 0xFE, 0xFE, 0xFE, 0xFD, 0xFD, 0xFD, 0xFD, 0x12, 0x34, 0x56, 0x78]);
export const ONLINE_DATAGRAM_BIT_MASK = 0b1110_0000;
export const VALID_DATAGRAM_BIT = 0b1000_0000;
export const ACK_DATAGRAM_BIT = 0b0100_0000;
export const NACK_DATAGRAM_BIT = 0b0010_0000;
export const RELIABILITY_BIT_MASK = 0b1110_0000;
export const IS_FRAGMENTED_BIT = 0b10001_0000;

/* 
    + 1500 Max Ethernet Payload Chunk, for WIFI it's default but could be extended
    - TCP Layer header 20-60 bytes
    - UDP header 8 bytes
    
    So for (raknet max packet size / UDP payload) its ideal to use "1432" or a byte less depends on TCP/IP version 4 vs 6

    Don't use this value as the MTU is calculated when connection is established average value for IPv4 connection is (1464 bytes).
*/
export const IDEAL_MAX_MTU_SIZE = 1432; //1432
export const UDP_HEADER_SIZE = 28;
export const MAX_MTU_SIZE = 1492;
export const CAPSULE_FRAGMENT_META_SIZE = 10;
export const MAX_CAPSULE_HEADER_SIZE = CAPSULE_FRAGMENT_META_SIZE + 13;
export const MAX_FRAME_SET_HEADER_SIZE = MAX_CAPSULE_HEADER_SIZE + 4;

export const IS_RELIABLE_LOOKUP: Record<number, boolean> = {
    2: true,
    3: true,
    4: true
};
export const IS_SEQUENCED_LOOKUP: Record<number, boolean> = {
    1: true,
    4: true
};
export const IS_ORDERED_LOOKUP: Record<number, boolean> = {
    1: true,
    3: true,
    4: true
};
export const iS_ORDERED_EXCLUSIVE_LOOKUP: Record<number, boolean> = {
    3: true,
    7: true
};

Reflect.setPrototypeOf(IS_RELIABLE_LOOKUP, null);
Reflect.setPrototypeOf(IS_SEQUENCED_LOOKUP, null);
Reflect.setPrototypeOf(IS_ORDERED_LOOKUP, null);
Reflect.setPrototypeOf(iS_ORDERED_EXCLUSIVE_LOOKUP, null);