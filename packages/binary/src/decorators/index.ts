import { SerializableType } from '../types';
import { AbstractType } from './abstract-type';

export * from './abstract-type';
export interface PropertyInfo {
   key: string;
   type?: SerializableType<unknown>;
   lengthEncoding?: SerializableType<number>;
   typeParams?: unknown[];
   lengthEncodingParams?: unknown[];
   conditions?: ConditionCase[];
}
export interface ConditionCase {
   inlined?: string;
   key?: string;
   value?: unknown;
   operator: string;
   isValuePresent: boolean;
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
   internalCompileToString(target as unknown as SerializableType<undefined>, meta.entries.values(), 'new this');
}
function internalCompileToString(
   type: SerializableType<unknown>,
   propertyInfo: Iterable<PropertyInfo>,
   objectCreation: string
): void {
   const types: SerializableType<unknown>[] = [];
   const deserializationCode: string[] = [];
   const serializationCode: string[] = [];
   let arraysFlags = false;
   for (const m of propertyInfo) {
      const { key, type, lengthEncoding, lengthEncodingParams, typeParams, conditions } = m;
      if (!type) throw new ReferenceError('Serialization type is not specified, but required.');
      const keyAccess = `$0.${key}`;

      let sc: string, dc: string;
      if (lengthEncoding) {
         arraysFlags = true;
         const { deserializer: dl, serializer: sl } = getSerializationCodeFor(
            lengthEncoding,
            C_LENGTH_CONSTANT,
            types,
            ...lengthEncodingParams!
         );
         const { deserializer: dm, serializer: sm } = getSerializationCodeFor(
            type,
            C_SINGLE_ELEMENT_CONSTANT,
            types,
            ...typeParams!
         );

         dc = `${dl}${C_ARRAY_CONSTANT}=${keyAccess}=new Array(${C_LENGTH_CONSTANT});for(let i=0,${C_SINGLE_ELEMENT_CONSTANT};i<${C_LENGTH_CONSTANT};${C_ELEMENT_ACCESS}=${C_SINGLE_ELEMENT_CONSTANT},i++){${dm}}`;
         sc = `${C_ARRAY_CONSTANT}=${keyAccess};${C_LENGTH_CONSTANT}=(${C_ARRAY_CONSTANT}).length;${sl}for(let i=0,${C_SINGLE_ELEMENT_CONSTANT}=${C_ELEMENT_ACCESS};i<${C_LENGTH_CONSTANT};i++,${C_SINGLE_ELEMENT_CONSTANT}=${C_ELEMENT_ACCESS}){${sm}}`;
      } else {
         const { deserializer: dm, serializer: sm } = getSerializationCodeFor(type, keyAccess, types);
         dc = dm;
         sc = sm;
      }
      if (conditions) {
         let text = `if(${conditions.map(e => (e.inlined ? `(${e.inlined})` : e.isValuePresent ? `($0.${e.key}${e.operator}${JSON.stringify(e.value)})` : `($0.${e.key})`)).join('&&')})`;
         dc = `${text}{${dc}}`;
         sc = `${text}{${sc}}`;
      }
      serializationCode.push(sc);
      deserializationCode.push(dc);
   }
   type.deserialize = new Function(
      ...types.map((_, i) => '$' + (i + 1)),
      `function deserialize($){const $0=${objectCreation};${arraysFlags ? C_ARRAY_RUNTIME_HELPER : ''}\n${deserializationCode.join('\n')}\nreturn $0;};return deserialize;`
   )(...types) as () => unknown;

   type.serialize = new Function(
      ...types.map((_, i) => '$' + (i + 1)),
      `function serialize($, $0){${arraysFlags ? C_ARRAY_RUNTIME_HELPER : ''}${serializationCode.join('\n')}};return serialize;`
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

export function Conditional<T extends AbstractType>(
   key: StringKeyOf<T>,
   valueToCompare?: string | number | bigint | boolean,
   operator?: ValidOperators
): (target: T, property: string) => void {
   return (target, property) => {
      let meta = METADATA_MAP.get(target);
      if (!meta) METADATA_MAP.set(target, (meta = new CompilationInformation()));
      let value = meta.entries.get(property);
      if (!value) meta.entries.set(property, (value = { key: property }));

      value.conditions ??= [];
      value.conditions.push({
         key: key as unknown as string,
         isValuePresent: arguments.length >= 2,
         operator: operator ?? '===',
         value: valueToCompare,
      });
   };
}

export type ValidOperators = '===' | '==' | '<=' | '>=' | '>' | '<' | '||' | '&&' | '!==' | '!=';
export function createStructSerializable<T extends Record<string, SerializableType<unknown>>>(
   definition: T
): SerializableType<{ [P in keyof T]: SerializationTypeFor<T[P]> }> {
   const type = {} as SerializableType<unknown>;
   internalCompileToString(
      type,
      Object.keys(definition).map(e => ({ key: e, type: definition[e] })),
      '{}'
   );
   return type as any;
}

export type SerializationTypeFor<T extends SerializableType<unknown>> = T extends SerializableType<infer R> ? R : never;
