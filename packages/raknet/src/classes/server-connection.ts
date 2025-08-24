import { UDP_HEADER_SIZE } from '../constants';
import { RakNetConnectedPacketId, RakNetReliability } from '../enums';
import { AddressInfo, FrameDescriptor, SocketSource } from '../interfaces';
import { getConnectedPingTime, rentConnectedPongBufferWith } from '../proto';
import { getConnectionRequestInfo } from '../proto/connection-request';
import { rentConnectionRequestAcceptPacketWith } from '../proto/connection-request-accepted';
import { getDataViewFromBuffer } from '../proto/uint24';
import { BaseConnection } from './base-connection';

export class ServerConnection extends BaseConnection {
   protected override readonly maxPayloadSize: number;
   public constructor(
      source: SocketSource,
      endpoint: AddressInfo,
      public readonly serverAddress: AddressInfo,
      guid: bigint,
      mtuSize: number,
   ) {
      super(source, endpoint, guid);
      this.maxPayloadSize = mtuSize - UDP_HEADER_SIZE;
   }
   /**@internal */
   public onDisconnect?: () => void;
   public override disconnect(): void {
      super.disconnect();
      this.onDisconnect?.();
   }
   public override handleFrame(desc: FrameDescriptor): void {
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
      this.enqueueData(buffer, RakNetReliability.ReliableOrdered);

      // We want fast connect so lets flush it now
      this.flush();
   }
   protected [21 /*RakNetConnectedPacketId.Disconnect*/](_: Uint8Array): void {
      this.disconnect();
   }
   protected [0 /*RakNetConnectedPacketId.ConnectedPing*/](_: Uint8Array): void {
      const time = getConnectedPingTime(getDataViewFromBuffer(_));
      this.enqueueData(rentConnectedPongBufferWith(time, BigInt(Date.now())), RakNetReliability.Unreliable);
      this.flush();
   }
   protected [0x13 /*RakNetConnectedPacketId.NewIncomingConnection*/](message: Uint8Array): void {
      this.onConnectionEstablished?.();
   }
   protected [0xfe /*Game Data Header*/](message: Uint8Array): void {
      console.log('GameData: ', Buffer.from(message));
   }
}
