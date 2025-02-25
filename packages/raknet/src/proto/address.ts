import type { AddressInfo } from "node:net";
export function writeAddress(dataview: DataView, offset: number, remoteInfo: AddressInfo): number {
    const isIpv4 = remoteInfo.family === "IPv4";
    dataview.setUint8(offset++, isIpv4 ? 4 : 6);
    if (isIpv4) {
        // Parse address like "0.0.0.0"
        const address_byte = remoteInfo.address.split(".", 4);

        // Convert each component to number and write to buffer
        for (let i = 0; i < 4; i++) dataview.setUint8(offset++, Number.parseInt(address_byte[i]));

        // write port
        dataview.setUint16(offset, remoteInfo.port);

        //return new offset
        return offset + 2;
    }

    //Write IPv6 address
    dataview.setUint16(offset, 23); // not sure what it is
    dataview.setUint16(offset += 2, remoteInfo.port); // port
    dataview.setUint32(offset += 2, 0); //Session ip6 component

    // correct the offset after writing 32bit int
    offset += 4;

    const address_part = remoteInfo.address.split(":", 8);
    for (let i = 0; i < 8; i++, offset += 2) {
        const part = address_part[i];

        // If there are zero numbers cut
        if (part === "") {
            for (let n = 0; n < (8 - address_part.length); i++, offset += 2, n++) dataview.setUint16(offset, 0);
            dataview.setUint16(offset, 0);
            continue;
        }

        //else way
        dataview.setUint16(offset, Number.parseInt(part, 16));
    }
    dataview.setUint32(offset, 0); //Session ip6 component but idk actually

    //return new offset
    return offset + 4;
}
export function  * parseIpv6AddressString(text: string): Generator<number>{
    const address_part = text.split(":", 8);
    for (let i = 0; i < 8; i++) {
        const part = address_part[i];

        // If there are zero numbers cut
        if (part === "") {
            for (let n = 0; n <= (8 - address_part.length) && i < 8; i++, n++) yield 0;
            continue;
        }

        //else way
        yield Number.parseInt(part, 16);
    }
}