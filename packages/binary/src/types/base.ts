import { SerializableType } from "./serializable-type";

export interface ValueTypeConstructor<T extends ValueType<any>, S = unknown> extends SerializableType<S> {
	new(): T;
	readonly prototype: T;
	readonly name: string;
}
export interface ValueType<T> {
	value: T;
	valueOf(): T;
	readonly type: ValueTypeConstructor<this>;
	readonly constructor: ValueTypeConstructor<this>;
}

const { create, setPrototypeOf, defineProperty, defineProperties, getOwnPropertyDescriptors, getPrototypeOf } = Object;

export const VALUE_TYPE_CONSTRUCTOR_FACTORY: <T>(name: string, $: T, base?: ValueTypeConstructor<ValueType<T>>) => ValueTypeConstructor<ValueType<T>> =
	<T>(name: string, $: T, base?: ValueTypeConstructor<ValueType<T>>) => {
		function TypedNumber(this: ValueType<T>, _: T): ValueType<T> {
			const value = this ?? create(prototype);
			value.value = _ ?? $;
			return value;
		}
		const { prototype } = TypedNumber;
		if (base) {
			setPrototypeOf(TypedNumber, base);
			setPrototypeOf(prototype, /*SHARED_PROTOTYPE*/ base.prototype);
		}
		defineProperty(TypedNumber, "name", {
			configurable: true,
			enumerable: false,
			writable: false,
			value: name
		});
		return TypedNumber as unknown as ValueTypeConstructor<ValueType<T>>;
	};

export function mergeSourceWithInheritance<T, S extends Partial<T>>(target: T, source: S): T & S {
	return defineProperties(
		target,
		getOwnPropertyDescriptors(
			setPrototypeOf(
				source,
				create(getPrototypeOf(target), getOwnPropertyDescriptors(target))
			)
		)
	) as T & S;
}
export function mergeSourceDirectNoEnumerable<T, S extends Partial<T>>(target: T, source: S): T & S {
	const raw = getOwnPropertyDescriptors(source);
	for(const key of Reflect.ownKeys(raw)) raw[key as keyof typeof raw].enumerable = false;
	return defineProperties(target, raw) as T & S;
}