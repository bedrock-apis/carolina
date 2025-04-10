import {RakNetServer} from "@carolina/raknet";

const raknet = new RakNetServer();
raknet.addSource(await RakNetServer.createSource("udp6", "255.255.255.255", 19138));