import {RakNetServer} from "@carolina/raknet";
import {NETWORK_LAN_PORT4, NETWORK_LAN_PORT6, NETWORK_LOOPBACK_ADDRESS4, NETWORK_LOOPBACK_ADDRESS6} from "@carolina/base";

const raknet = new RakNetServer();
//raknet.addSource(await RakNetServer.createSource("udp4", NETWORK_LOOPBACK_ADDRESS4, NETWORK_LAN_PORT4));
raknet.addSource(await RakNetServer.createSource("udp6", NETWORK_LOOPBACK_ADDRESS6, NETWORK_LAN_PORT6));