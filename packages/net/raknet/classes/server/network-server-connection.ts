import { ConnectionEndpoint } from '../../../api/interface';
import { RakNetConnectedPacketId, RakNetReliability } from '../../enums';
import { FrameDescriptor } from '../../interfaces';
import {
   getDataViewFromBuffer,
   readConnectedPingTime,
   readConnectionRequestInfo,
   rentConnectedPongBufferWith,
   rentConnectionRequestAcceptPacketWith,
} from '../../proto';
import { EndpointHandle } from '../endpoint';
import { RakNetNetworkConnection } from '../network-connection/base';
import { RakNetNetworkServer } from './network-server';

export class RakNetNetworkServerConnection extends RakNetNetworkConnection {
   public readonly server: RakNetNetworkServer;
   public readonly serverEndpoint: ConnectionEndpoint;
   public constructor(
      server: RakNetNetworkServer,
      handle: EndpointHandle,
      endpoint: ConnectionEndpoint,
      guid: bigint,
      serverEndpoint: ConnectionEndpoint
   ) {
      super(handle, endpoint, guid);
      this.server = server;
      this.serverEndpoint = serverEndpoint;
   }
   public override disconnect(): void {
      super.disconnect();
      this.server.onConnectionDisconnected?.(this);
   }
   public override dispose(): void {
      super.dispose();
      this.server.connections.delete(this.uniqueId);
   }
   public override processFrame(desc: FrameDescriptor): void {
      // Make sure we call parent logic as well
      super.processFrame(desc);
      // First byte is Packet id
      const packetId = desc.body[0];

      // Unknown packet, maybe better to crash? I don't know
      if (!(packetId in this))
         this.server.onError?.(new SyntaxError('No handler for packet with id: 0x' + packetId.toString(16)));

      this[packetId as RakNetConnectedPacketId.ConnectionRequest](desc.body);
   }
   /* Base Handlers for connected packet */
   protected [9 /*RakNetConnectedPacketId.ConnectionRequest*/](message: Uint8Array): void {
      // Gather info
      const { time, guid } = readConnectionRequestInfo(new DataView(message.buffer, message.byteOffset));

      // Check for client guid
      if (guid !== this.guid)
         this.server.onError?.(new Error('Fatal security error, infected client trying to connect.'));

      // rent buffer to send
      const buffer = rentConnectionRequestAcceptPacketWith(
         this.endpoint,
         this.serverEndpoint,
         time,
         BigInt(Date.now())
      );

      // Send
      this.enqueueFrame(buffer, RakNetReliability.ReliableOrdered);
   }
   protected [21 /*RakNetConnectedPacketId.Disconnect*/](_: Uint8Array): void {
      this.dispose();
      this.server.onConnectionDisconnected?.(this);
   }
   protected [0 /*RakNetConnectedPacketId.ConnectedPing*/](_: Uint8Array): void {
      const time = readConnectedPingTime(getDataViewFromBuffer(_));
      this.enqueueFrame(rentConnectedPongBufferWith(time, BigInt(Date.now())), RakNetReliability.Unreliable);
   }
   protected [0x13 /*RakNetConnectedPacketId.NewIncomingConnection*/](_: Uint8Array): void {
      this.server.onConnectionConnected?.(this);
   }
   protected [0xfe /*Game Data Header*/](message: Uint8Array): void {
      this.server.onConnectionMessaged?.(this, message);
   }
}
