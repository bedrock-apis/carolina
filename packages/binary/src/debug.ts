import { Cursor } from './cursor';
import { mergeSourceWithInheritance, SerializableType } from './types';
export const knownTypes: Set<SerializableType<unknown>> = new Set();
export class DebugOptions {
   public static readonly isDebugModeEnabled: boolean = false;
   public static setDebugModeEnabled(enabled: boolean): void {
      //@ts-expect-error
      this.isDebugModeEnabled = enabled;
      if (enabled)
         for (const type of knownTypes) {
            mergeSourceWithInheritance(type, {
               serialize(cursor, value) {
                  (cursor as DebugCursor).push(this as SerializableType<unknown>);
                  super.serialize(...arguments);
                  (cursor as DebugCursor).pop();
               },
               deserialize(cursor) {
                  (cursor as DebugCursor).push(this as SerializableType<unknown>);
                  super.deserialize(...arguments);
                  (cursor as DebugCursor).pop();
               },
            });
         }
   }
}
export class DebugCursor extends Cursor<ArrayBuffer> {
   public readonly internalStack: { type: SerializableType<unknown>; pointer: number }[] = [];
   public push(type: SerializableType<unknown>) {
      this.internalStack.push({ type, pointer: this.pointer });
   }
   public pop() {
      this.internalStack.pop();
   }
}
/*process.stdout.write(
         `\x1b[48;2;${(h >> 16) & 0xff};${(h >> 8) & 0xff};${h & 0xff}m${Buffer.prototype.toString.call(slice, 'hex')}\x1b[0m`,
      );*/
export function hash24(str: string): number {
   let hash = 0;
   for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) & 0xffff_ffff;
   }
   return hash;
}
