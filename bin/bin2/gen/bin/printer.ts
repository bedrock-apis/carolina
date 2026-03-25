import { ProtocolPacket } from './types';

export class Printer {
   public static *printPacket(packet: ProtocolPacket): Generator<string> {
      yield `export function ${packet.name}Serialize(packet: IPacket, cursor: Cursor): void {`;
      for (const field of packet.fields) yield `${field.type.name}.serialize(packet.${field.name}, cursor);`;
      yield '}';
   }
}
