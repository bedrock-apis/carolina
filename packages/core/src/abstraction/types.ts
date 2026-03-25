/**
 * Represents a type that removes the `readonly` modifier from all properties of `T`.
 */
export type InternalAccess<T> = {
   -readonly [K in keyof T]: T[K];
};

/**
 * Represents a class identity (value) without its constructor signature.
 * Maintains `instanceof` compatibility and static properties, but prevents `new` calls.
 */
// oxlint-disable-next-line typescript/no-explicit-any
export type PublicClass<T extends new (...args: any[]) => unknown> = {
   readonly [K in keyof T]: T[K];
} & { readonly prototype: T extends { prototype: infer P } ? P : never } & (abstract new () => never);
