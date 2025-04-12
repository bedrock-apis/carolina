export function getConnectionRequestInfo(raw: DataView): {
    guid: bigint,
    time: bigint,
    useSecurity: boolean
}{
    return {
        // Skip first byte which is packet id
        guid: raw.getBigUint64(1, false),
        time: raw.getBigUint64(1 + 8, false),
        useSecurity: raw.getUint8(1 + 16) !== 0
    };
}