export const MAGIC = new Uint8Array([0x00, 0xFF, 0xFF, 0x00, 0xFE, 0xFE, 0xFE, 0xFE, 0xFD, 0xFD, 0xFD, 0xFD, 0x12, 0x34, 0x56, 0x78]);
export const ONLINE_DATAGRAM_BIT_MASK = 0b1110_0000;
export const VALID_DATAGRAM_BIT = 0b1000_0000;
export const ACK_DATAGRAM_BIT = 0b0100_0000;
export const NACK_DATAGRAM_BIT = 0b0010_0000;
export const RELIABILITY_BIT_MASK = 0b1110_0000;
export const IS_FRAGMENTED_BIT = 0b10001_0000;
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

Reflect.setPrototypeOf(IS_RELIABLE_LOOKUP, null);
Reflect.setPrototypeOf(IS_SEQUENCED_LOOKUP, null);
Reflect.setPrototypeOf(IS_ORDERED_LOOKUP, null);