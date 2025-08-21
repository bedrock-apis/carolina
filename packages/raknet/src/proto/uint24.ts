export function readUint24(view: DataView, offset: number = 0): number {
   return view.getUint16(offset, true) | (view.getUint8(offset + 2) << 16);
}
export function writeUint24(view: DataView, offset: number, value: number): void {
   view.setUint16(offset, value & 0xffff, true);
   view.setUint8(offset + 2, value >> 16);
}
export function getDataViewFromBuffer<T extends ArrayBufferLike>(source: ArrayBufferView<T>): DataView {
   return new DataView(source.buffer, source.byteOffset, source.byteLength);
}
