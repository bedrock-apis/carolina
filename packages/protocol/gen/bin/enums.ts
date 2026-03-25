export enum PrimitiveType {
   Uint8 = 'uint8',
   Uint16 = 'uint16',
   Uint32 = 'uint32',
   Uint64 = 'uint64',

   Int8 = 'int8',
   Int16 = 'int16',
   Int32 = 'int32',
   Int64 = 'int64',

   Float16 = 'float16',
   Float32 = 'float32',
   Float64 = 'float64',

   Bool = 'bool',
   String = 'string',
   Optional = 'optional',
   Array = 'array',
}
export enum NumberEncoding {
   None = 'none',
   Variable = 'variable',
   ZigZag = 'zigzag',
   BigEndian = 'big-endian',
   LittleEndian = 'little-endian',
}
