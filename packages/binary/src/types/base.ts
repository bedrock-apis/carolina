export interface ValueTypeConstructor<T extends ValueType<any>> {
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

const { create } = Object, { setPrototypeOf, defineProperty } = Reflect;

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
		//NOTE - Proof of concept
		/*
		defineProperty(prototype, "type", {
			configurable: true, writable: true, enumerable: false,
			value: TypedNumber
		});*/
		defineProperty(TypedNumber, "name", {
			configurable: true,
			enumerable: false,
			writable: false,
			value: name
		});
		return TypedNumber as unknown as ValueTypeConstructor<ValueType<T>>;
	};