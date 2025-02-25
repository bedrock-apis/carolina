import { suite, test } from 'vitest';
import {Address, FrameSet, OpenConnectionReply1, OpenConnectionReply2, OpenConnectionRequest1, OpenConnectionRequest2, UnconnectedPing, UnconnectedPong} from "@serenityjs/raknet";
import { RakNetUtils, RakNetConnection } from '@carolina/raknet';

const cases = 500_000;
const guid = 54654654n;
suite("Unconnected Pong",()=>{
    const packet = new UnconnectedPing();
    packet.timestamp = BigInt(Date.now());
    packet.client = 54654654n;
    const buf = packet.serialize();
    const MESSAGE = `qlweikfhalksdhfalseuhfewlouifhjasdljkfhasdlkfjhaseljkrfha welufhaweouf haweufhwiuefh aklsjhfklůahflajkshflakwej hrfiuaweh ioafuhewkfjhseldkahj íepuh`;
    const RAW_MESSAGE = Buffer.from(MESSAGE);
    test("Carolina", ()=>{
        let i = cases;
        while(i--) {
            const p = RakNetUtils.getUnconnectedPingTime(buf);
            RakNetUtils.rentUnconnectedPongBufferWith(p, guid, RAW_MESSAGE);
        }
    });

    test("SerenityJS", ()=>{
        let i = cases;
        while(i--) {
            const p = new UnconnectedPing(buf).deserialize();
            const ping = new UnconnectedPong();
            ping.guid = guid;
            ping.message = MESSAGE;
            ping.timestamp = p.timestamp;
            ping.serialize();
        }
    });

    //globalThis?.gc({execution:"sync"});
});


suite("OpenConnection 1",()=>{
    const packet = new OpenConnectionRequest1();
    packet.mtu = 288;
    packet.protocol = 11;
    const buf = packet.serialize();
    test("Carolina", ()=>{
        let i = cases;
        while(i--) {
            const p = buf.length;
            RakNetUtils.rentOpenConnectionReplyOneBufferWith(guid, p);
        }
    })
    test("SerenityJS", ()=>{
        let i = cases;
        while(i--) {
            const p = new OpenConnectionRequest1(buf).deserialize();
            const ping = new OpenConnectionReply1();
            ping.guid = guid;
            ping.mtu = p.mtu;
            ping.security = false;
            ping.serialize();
        }
    })
});


suite("OpenConnection 2",()=>{
    const receiver = {address: "25.0.0.25", family:"IPv4", "port": 6541};
    const packet = new OpenConnectionRequest2();
    packet.mtu = 288;
    packet.address = Address.fromIdentifier(receiver as any)
    packet.client = guid;
    const buf = packet.serialize();
    test("Carolina", ()=>{
        let i = cases;
        while(i--) {
            const {guid, mtu} = RakNetUtils.getDataFromOpenConnectionRequestTwo(buf);

            // Rent buffer for reply with specified properties
            RakNetUtils.rentOpenConnectionReplyTwoBufferWith(
                guid,
                receiver,
                mtu
            );
        }
    })
    test("SerenityJS", ()=>{
        let i = cases;
        while(i--) {
            const p = new OpenConnectionRequest2(buf).deserialize();
            const ping = new OpenConnectionReply2();
            ping.guid = guid;
            ping.mtu = p.mtu;
            ping.address = Address.fromIdentifier(receiver as any)
            ping.encryption = false;
            ping.serialize();
        }
    })
});


suite("FrameSet",()=>{
    const buf = new Uint8Array([0x84, 0x00, 0x00, 0x00, 0x40, 0x00, 0x90, 0x00, 0x00, 0x00, 0x09, 0x9b, 0x4f, 0x24, 0x5d, 0xc2, 0xb1, 0x5e, 0x17, 0x00, 0x00, 0x00, 0x00, 0x0e, 0x55, 0x07, 0x96, 0x00]);
    test("Carolina", ()=>{
        let i = cases;
        while(i--) {
            RakNetConnection.prototype.handleFrameSet(buf);
        }
    })
    test("SerenityJS", ()=>{
        let i = cases;
        while(i--) {
            new FrameSet(buf).deserialize();
        }
    })
});