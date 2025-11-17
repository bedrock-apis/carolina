import { UDP_HEADER_SIZE } from '../constants';
import { RakNetConnectedPacketId, RakNetReliability } from '../enums';
import { AddressInfo, FrameDescriptor, SocketSource } from '../interfaces';
import { getConnectedPingTime, rentConnectedPongBufferWith } from '../proto';
import { getConnectionRequestInfo } from '../proto/connection-request';
import { rentConnectionRequestAcceptPacketWith } from '../proto/connection-request-accepted';
import { getDataViewFromBuffer } from '../proto/uint24';
import { BaseConnection } from './base-connection';

export class ServerConnection extends BaseConnection {
   public constructor(
      source: SocketSource,
      endpoint: AddressInfo,
      public readonly serverAddress: AddressInfo,
      guid: bigint,
      mtuSize: number,
   ) {
      super(source, endpoint, guid);
      this.outgoingMTU = mtuSize - UDP_HEADER_SIZE;
   }
   /**@internal */
   public onDisconnect?: () => void;
   /**@internal */
   public onGamePacket?: (message: Uint8Array) => void;
   public override disconnect(): void {
      super.disconnect();
      this.onDisconnect?.();
   }
   public override handleFrame(desc: FrameDescriptor): void {
      // Make sure we call parent logic as well
      super.handleFrame(desc);
      // First byte is Packet id
      const packetId = desc.body[0];

      // Unknown packet, maybe better to crash? I don't know
      if (!(packetId in this))
         this.onErrorHandle?.(new SyntaxError('No handler for packet with id: 0x' + packetId.toString(16)));

      this[packetId as RakNetConnectedPacketId.ConnectionRequest](desc.body);
   }
   /* Base Handlers for connected packet */
   protected [9 /*RakNetConnectedPacketId.ConnectionRequest*/](message: Uint8Array): void {
      // Gather info
      const { time, guid } = getConnectionRequestInfo(new DataView(message.buffer, message.byteOffset));

      // Check for client guid
      if (guid !== this.guid)
         this.onErrorHandle?.(new Error('Fatal security error, infected client trying to connect.'));

      // rent buffer to send
      const buffer = rentConnectionRequestAcceptPacketWith(this.endpoint, this.serverAddress, time, BigInt(Date.now()));

      // Send
      this.enqueueFrame(buffer, RakNetReliability.ReliableOrdered);
   }
   protected [21 /*RakNetConnectedPacketId.Disconnect*/](_: Uint8Array): void {
      this.close();
      this.onDisconnect?.();
   }
   protected [0 /*RakNetConnectedPacketId.ConnectedPing*/](_: Uint8Array): void {
      const time = getConnectedPingTime(getDataViewFromBuffer(_));
      this.enqueueFrame(rentConnectedPongBufferWith(time, BigInt(Date.now())), RakNetReliability.Unreliable);
   }
   protected [0x13 /*RakNetConnectedPacketId.NewIncomingConnection*/](_: Uint8Array): void {
      this.onConnectionEstablishedHandle?.();
   }
   protected [0xfe /*Game Data Header*/](message: Uint8Array): void {
      this.onGamePacket?.(message);
   }
}
