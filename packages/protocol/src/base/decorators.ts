
interface PropertyMarshalInfo {
    key: string;
    type: BuildIn | ISerializableType;
    condition?: string;
}
const METADATA_MAP = new WeakMap<SerializableInstance, Map<string, PropertyMarshalInfo>>();
export function Marshal(type: SerializableInstance | BuildIn): <T extends SerializableInstance>(target: T, property: string) => void {
    return (target, property) => {
        const data = METADATA_MAP.get(target) ?? new Map;
        const v: PropertyMarshalInfo = data.get(property) ?? {};
        v.key = property;
        v.type = type;
        data.set(property, v);
        METADATA_MAP.set(target, data);
    }
};
export function Serializable<T extends new () => SerializableInstance>(target: T): void {
    console.log(target);
    console.log(METADATA_MAP.get(target.prototype)?.values().toArray());
};