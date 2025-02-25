export interface FrameDescriptor{
    body: Uint8Array,
    reliableIndex?: number
    sequenceIndex?: number,
    orderIndex?: number,
    orderChannel?: number
    fragment?: {
        id: number,
        length: number,
        index: number,
    }
}