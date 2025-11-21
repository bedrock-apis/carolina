import { Cursor } from '@carolina/binary';
import { NetworkSettingsPacket, PacketIds } from '@carolina/protocol';

import { registerHandlers } from '../handlers/base';
import { NetworkConnection } from './connection';

export class NetworkProtocolHandler {
   static [K: number]: (connection: NetworkConnection, packetId: number, cursor: Cursor) => void;
   //This class is marked as not constructable, use static only
   private constructor() {}
   public static handlePacket(connection: NetworkConnection, packetId: number, cursor: Cursor): void {
      if (!(packetId in this))
         return void console.error(
            '[PacketHandler][Error]',
            'Missing packet handler for',
            PacketIds[packetId] ?? packetId,
            cursor.getRemainingBytes()
         );

      this[packetId](connection, packetId, cursor);
   }
}

registerHandlers(NetworkSettingsPacket, () => {});
