import { Cursor } from '@carolina/binary';
import { CarolinaConnection } from './connection';
import { NetworkSettings, PacketIds } from '@carolina/protocol';
import { registerHandler } from '../handlers/base';

export class NetworkProtocolHandler {
   static [K: number]: (connection: CarolinaConnection, packetId: number, cursor: Cursor) => void;
   //This class is marked as not constructable, use static only
   private constructor() {}
   public static handlePacket(connection: CarolinaConnection, packetId: number, cursor: Cursor): void {
      if (!(packetId in this))
         return void console.error(
            '[PacketHandler][Error]',
            'Missing packet handler for',
            PacketIds[packetId] ?? packetId,
            cursor.getRemainingBytes(),
         );

      this[packetId](connection, packetId, cursor);
   }
}

registerHandler(NetworkSettings, () => {});
