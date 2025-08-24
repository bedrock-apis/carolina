import { ClientConnection, ServerConnectionListener, SocketSource } from '@carolina/raknet';
import { createSocket } from 'node:dgram';

const connectionListener = new ServerConnectionListener();
connectionListener.addListenerSource(await createSource());

/*
const client = ClientConnection.create(await createSource(), { address: '127.0.0.1', port: 19142, family: 'IPv4' });
console.log(await client.sendUnconnectedPong());
*/
async function createSource(): Promise<SocketSource> {
   const socket = createSocket('udp4');
   const { promise, reject, resolve } = Promise.withResolvers();
   socket.bind(19132, resolve);
   socket.on('error', reject);
   await promise;
   return {
      onDataCallback: _ =>
         socket.on('message', (buffer, { address, port }) => _(buffer, { address, family: 'IPv4', port })),
      send: async (data, endpoint) => void socket.send(data, endpoint.port, endpoint.address),
   };
   /*
   const socket = await Bun.udpSocket({
      binaryType: 'uint8array',
      hostname: '0.0.0.0',
      port: 19132,
      socket: {
         data: (_, msg, port, address) => fn?.(msg, { port, address, family: 'IPv4' }),
      },
   });
   let fn: null | ((uint8Array: Uint8Array, address: AddressInfo) => void) = null;
   return {
      onDataCallback: _ => (fn = _),
      send: async (buffer, endpoint) => void socket.send(buffer, endpoint.port, endpoint.address),
   };*/
}
console.log('Started . . .');
