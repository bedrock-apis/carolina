import { random64 } from '../constants';
import { RakNetUnconnectedPacketId } from '../enums';
import { AddressInfo, FrameDescriptor, SocketSource } from '../interfaces';
import { getUnconnectedPongInfo, rentUnconnectedPingBufferWith } from '../proto';
import { getDataViewFromBuffer } from '../proto/uint24';
import { BaseConnection } from './base-connection';

/**
 * We have to ask Bananoo more about his implementation
 */
export class ClientConnection extends BaseConnection {
   protected readonly unconnectedPings: Map<
      bigint,
      PromiseWithResolvers<{ latency: number; message: string }> & { timeout?: ReturnType<typeof setTimeout> }
   > = new Map();
   private constructor(source: SocketSource, serverEndpoint: AddressInfo) {
      super(source, serverEndpoint, random64());
   }
   protected handleFrame(desc: FrameDescriptor): void {
      super.handleFrame(desc);
      throw new Error('Method not implemented.');
   }
   protected handleRaw(message: Uint8Array, _: AddressInfo): void {
      const packetId = message[0];
      if (packetId & 0x80) {
         // Connected packet
      }

      switch (packetId) {
         case RakNetUnconnectedPacketId.UnconnectedPong: {
            const { message: msg, pingTime } = getUnconnectedPongInfo(getDataViewFromBuffer(message));
            const result = this.unconnectedPings.get(pingTime);
            this.unconnectedPings.delete(pingTime);
            clearTimeout(result?.timeout);
            result?.resolve({ latency: Date.now() - Number(pingTime), message: new TextDecoder().decode(msg) });
            break;
         }
         default:
            console.log('Handle: ', message);
      }
   }
   public sendUnconnectedPong(): Promise<{ latency: number; message: string }> {
      const pingTime = BigInt(Date.now());
      console.log(pingTime);
      const timeout = setTimeout(() => {
         const d = this.unconnectedPings.get(pingTime);
         this.unconnectedPings.delete(pingTime);
         if (d) d.reject(new Error('Ping timed out.'));
      }, 3_000).unref?.();

      const rs = Promise.withResolvers<bigint>() as any;
      rs.timeout = timeout;
      this.unconnectedPings.set(pingTime, rs);
      this.source.send(rentUnconnectedPingBufferWith(pingTime, this.guid), this.endpoint);
      return rs.promise;
   }
   public static create(source: SocketSource, serverEndpoint: AddressInfo): ClientConnection {
      const $ = new this(source, serverEndpoint);
      source.onDataCallback($.handleRaw.bind($));
      return $;
   }
}
