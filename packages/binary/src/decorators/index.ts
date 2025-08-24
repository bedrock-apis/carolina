import { SerializableType } from '../types';
import { AbstractType } from './abstract-type';

export interface PropertyInfo {
   key: string;
   type?: SerializableType<unknown>;
   lengthEncoding?: SerializableType<number>;
   typeParams?: unknown[];
   lengthEncodingParams?: unknown[];
}
export class CompilationInformation {
   public readonly entries: Map<string, PropertyInfo> = new Map();
}
const METADATA_MAP: Map<AbstractType, CompilationInformation> = new Map();
export function SerializeAs<T extends SerializableType<unknown>>(
   type: T,
   ...params: T extends SerializableType<unknown, infer P> ? P : []
): (target: AbstractType, property: string) => void {
   return (target, property) => {
      let meta = METADATA_MAP.get(target);
      if (!meta) METADATA_MAP.set(target, (meta = new CompilationInformation()));

      let value = meta.entries.get(property);
      if (!value) meta.entries.set(property, (value = { key: property }));
      value.type = type;
      value.typeParams = params;
   };
}
export function Compilable<T extends { new (): unknown }>(target: T): void {
   const meta = METADATA_MAP.get(target.prototype);
   METADATA_MAP.delete(target.prototype);
   if (!meta) throw new ReferenceError('No fields metadata assigned');
   const type = target as unknown as SerializableType<unknown>;
   const types: SerializableType<unknown>[] = [];
   const deserializationCode: string[] = [];
   const serializationCode: string[] = [];
   let arraysFlags = false;
   for (const m of meta.entries.values()) {
      const { key, type, lengthEncoding, lengthEncodingParams, typeParams } = m;
      if (!type) throw new ReferenceError('Serialization type is not specified, but required.');
      const keyAccess = `$0.${key}`;

      if (lengthEncoding) {
         arraysFlags = true;
         const { deserializer: dl, serializer: sl } = getSerializationCodeFor(
            lengthEncoding,
            C_LENGTH_CONSTANT,
            types,
            ...lengthEncodingParams!,
         );
         const { deserializer: dm, serializer: sm } = getSerializationCodeFor(
            type,
            C_SINGLE_ELEMENT_CONSTANT,
            types,
            ...typeParams!,
         );

         deserializationCode.push(
            `${dl}${C_ARRAY_CONSTANT}=${keyAccess}=new Array(${C_LENGTH_CONSTANT});for(let i=0,${C_SINGLE_ELEMENT_CONSTANT};i<${C_LENGTH_CONSTANT};${C_ELEMENT_ACCESS}=${C_SINGLE_ELEMENT_CONSTANT},i++){${dm}}`,
         );
         serializationCode.push(
            `${C_ARRAY_CONSTANT}=${keyAccess};${C_LENGTH_CONSTANT}=(${C_ARRAY_CONSTANT}).length;${sl}for(let i=0,${C_SINGLE_ELEMENT_CONSTANT}=${C_ELEMENT_ACCESS};i<${C_LENGTH_CONSTANT};i++,${C_SINGLE_ELEMENT_CONSTANT}=${C_ELEMENT_ACCESS}){${sm}}`,
         );
         continue;
      }
      const { deserializer: dm, serializer: sm } = getSerializationCodeFor(type, keyAccess, types);
      deserializationCode.push(dm);
      serializationCode.push(sm);
   }
   type.deserialize = new Function(
      ...types.map((_, i) => '$' + (i + 1)),
      `function deserialize($){const $0=new this;${arraysFlags ? C_ARRAY_RUNTIME_HELPER : ''}\n${deserializationCode.join('\n')}\nreturn $0;};return deserialize;`,
   )(...types) as () => unknown;

   type.serialize = new Function(
      ...types.map((_, i) => '$' + (i + 1)),
      `function serialize($, $0){${arraysFlags ? C_ARRAY_RUNTIME_HELPER : ''}${serializationCode.join('\n')}};return serialize;`,
   )(...types) as () => unknown;
}
export function LengthEncodeAs<T extends SerializableType<number>>(
   type: T,
   ...params: T extends SerializableType<number, infer P> ? P : []
): (target: AbstractType, property: string) => void {
   return (target, property) => {
      let meta = METADATA_MAP.get(target);
      if (!meta) METADATA_MAP.set(target, (meta = new CompilationInformation()));

      let value = meta.entries.get(property);
      if (!value) meta.entries.set(property, (value = { key: property }));
      value.lengthEncoding = type;
      value.lengthEncodingParams = params;
   };
}

function getSerializationCodeFor(
   type: SerializableType<unknown>,
   access: string,
   usedTypes: SerializableType<unknown>[],
   ...params: unknown[]
): { deserializer: string; serializer: string } {
   if (inlineCode && type.inliner)
      return {
         deserializer: `${access}=${type.inliner.inlineDeserializableCode(...params)};`,
         serializer: type.inliner.inlineSerializableCode(access, ...params) + ';',
      };
   const name = '$' + addAndGetIndex(type, usedTypes);
   return {
      deserializer: `${access}=${name}.deserialize(${['$', ...params.map(_ => JSON.stringify(_))].join(',')});`,
      serializer: `${name}.serialize(${['$', access, ...params.map(_ => JSON.stringify(_))].join(',')});`,
   };
}
const C_SINGLE_ELEMENT_CONSTANT = '$e';
const C_ARRAY_CONSTANT = '$a';
const C_LENGTH_CONSTANT = '$l';
const C_ELEMENT_ACCESS = C_ARRAY_CONSTANT + '[i]';
const C_ARRAY_RUNTIME_HELPER = `let ${C_ARRAY_CONSTANT}=null,${C_LENGTH_CONSTANT}=0;`;
function addAndGetIndex<T>(type: T, array: T[]): number {
   const i = array.indexOf(type);
   if (i === -1) return array.push(type);
   return i + 1;
}
let inlineCode = true;
export function setCompilationInliningEnabled(enabled: boolean): void {
   inlineCode = enabled;
}

export * from './abstract-type';
