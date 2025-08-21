import { SerializableType } from '../types';
import { AbstractType } from './abstract-type';

export interface PropertyInfo {
   key: string;
   type: SerializableType<unknown>;
}
export class CompilationInformation {
   public readonly entries: Map<string, PropertyInfo> = new Map();
}
const METADATA_MAP: Map<AbstractType, CompilationInformation> = new Map();
export function Marshal(type: SerializableType<unknown>): (target: AbstractType, property: string) => void {
   return (target, property) => {
      let meta = METADATA_MAP.get(target);
      if (!meta) METADATA_MAP.set(target, (meta = new CompilationInformation()));

      meta.entries.set(property, { key: property, type });
   };
}
export function Compilable<T extends { new (): unknown }>(target: T): void {
   const meta = METADATA_MAP.get(target.prototype);
   METADATA_MAP.delete(target.prototype);
   if (!meta) throw new ReferenceError('No fields metadata assigned');
   console.log('Compiling: ' + target.name);
   const type = target as unknown as SerializableType<unknown>;
   const paramNames: string[] = [];
   const paramTypes: SerializableType<unknown>[] = [];
   const deserializationCode: string[] = [];
   const serializationCode: string[] = [];
   let index = 0;
   for (const m of meta.entries.values()) {
      const { key, type } = m;

      const keyAccess = `$0.${key}`;
      if (type.inliner) {
         deserializationCode.push(`${keyAccess}=${type.inliner.inlineDeserializableCode()};`);
         serializationCode.push(type.inliner.inlineDeserializableCode(keyAccess) + ';');
         continue;
      }
      // Should start from 1, as o  is reserved for this value
      const name = `$${++index}`;
      paramNames.push(name);
      paramTypes.push(type);
      deserializationCode.push(`${keyAccess}=${name}.deserialize($);`);
      serializationCode.push(`${name}.serialize($, ${keyAccess});`);
   }
   type.deserialize = new Function(
      ...paramNames,
      `function deserialize($){const $0=new this;\n${deserializationCode.join('\n')}\nreturn $0;};return deserialize;`,
   )(...paramTypes) as () => unknown;

   type.serialize = new Function(
      ...paramNames,
      `function serialize($, $0){${serializationCode.join('\n')}};return serialize;`,
   )(...paramTypes) as () => unknown;
}
