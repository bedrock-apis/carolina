import { InjectAsNoEnumerableStruct } from '@carolina/common';

import { CompilableUtils } from '../compiler';
import { Target, MetaTargetCore, MetaCompilationResult } from '../compiler/meta';

const INTERNAL_MAP: Map<Target, MetaTargetCore> = new Map();
export const ConstructableSymbol: unique symbol = Symbol('Constructable');

export function ensureTarget(target: Target): MetaTargetCore {
   let meta = INTERNAL_MAP.get(target);
   if (meta) return meta;
   meta = new MetaTargetCore(target);
   INTERNAL_MAP.set(target, meta);
   return meta;
}

function compileSerialization(meta: MetaCompilationResult): (...params: unknown[]) => void {
   const [cursor, ...inputs] = meta.context.environments;
   return new Function(
      ...inputs.map(String),
      `return (${cursor},${meta.strategy.input})=>{${meta.serialize}}`
   )(...inputs.map(_ => _?.valueOf()));
}
function compileDeserializable(
   meta: MetaCompilationResult,
   returnCode: string
): (...params: unknown[]) => void {
   const [cursor, ...inputs] = meta.context.environments;
   return new Function(
      ...inputs.map(String),
      `return (${cursor})=>{${meta.deserialize};return ${returnCode}}`
   )(...inputs.map(_ => _?.valueOf()));
}

/**
 * Compiles the class metadata into highly optimized serialization and deserialization functions.
 */
export function Compilable<T extends Target>(target: T): void {
   const meta = ensureTarget(target);
   const raw = CompilableUtils.strip(meta.compile());
   const ctor = CompilableUtils.createConstructor(
      raw.properties.map(_ => _[0]),
      target.prototype
   );
   const serialize = compileSerialization(raw);

   const CTOR = raw.context.p(ctor);
   raw.context.environments.add(CTOR);
   const deserialize = compileDeserializable(
      raw,
      `new ${CTOR}(${raw.properties.map(_ => _[1].result).join(',')})`
   );
   InjectAsNoEnumerableStruct(target as unknown, { serialize, deserialize });
}

/**
 * Compiles the class metadata into highly optimized serialization and deserialization functions.
 */
export function CompilableInterface<T extends Target>(target: T): void {
   const meta = ensureTarget(target);
   const raw = CompilableUtils.strip(meta.compile());
   const literal = CompilableUtils.createObjectLiteral(raw.properties.map(_ => [_[0], _[1].result]));
   const serialize = compileSerialization(raw);
   const deserialize = compileDeserializable(raw, literal);
   InjectAsNoEnumerableStruct(target as unknown, { serialize, deserialize });
}
export type InterfaceOf<T> = {
   -readonly [K in keyof T]: T[K] extends (...params: unknown[]) => unknown ? never : T[K];
};
