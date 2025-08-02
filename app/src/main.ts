import {RakNetServer, } from "@carolina/raknet";
const raknet = new RakNetServer();
const source = await RakNetServer.createSource("udp6", "::1", 19133);
raknet.addSource(source);
console.log("\x1b[32mIpv6 Server is running on:\x1b[39m", source.address());