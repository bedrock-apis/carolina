import { dlopen, FFIType } from 'bun:ffi';
const a = dlopen('kernel32', {
   FreeConsole: {
      args: [],
      returns: FFIType.bool,
   },
   AllocConsole: {
      args: [],
      returns: FFIType.bool,
   },
});
a.symbols.FreeConsole();
a.symbols.AllocConsole();

console.log('OK1');
import { AddressInfo, ServerConnectionListener, SocketSource } from '@carolina/raknet';

const connectionListener = new ServerConnectionListener();
connectionListener.addListenerSource(await createSource());
export {};

async function createSource(): Promise<SocketSource> {
   const socket = await Bun.udpSocket({
      binaryType: 'uint8array',
      hostname: '0.0.0.0',
      port: 19132,
      socket: {
         data: (_, msg, port, address) => console.log(msg, address, fn?.(msg, { port, address, family: 'IPv4' })),
      },
   });
   let fn: null | ((uint8Array: Uint8Array, address: AddressInfo) => void) = null;
   return {
      onDataCallback: _ => (fn = _),
      send: async (buffer, endpoint) =>
         console.log('SAND', buffer, void socket.send(buffer, endpoint.port, endpoint.address)),
   };
}
console.log('Started . . .');
