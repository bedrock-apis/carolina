# Block Palette and Permutation Hashing

Matching the Bedrock palette requires precise NBT serialization and a specific hashing algorithm for block permutations. While hashing is a convenient way to identify blocks across game versions, it is important to handle potential hash collisions, even though they are rare.

## NBT Serialization

The hash is calculated by serializing the block permutation into a Little-Endian NBT format. The root compound tag must have an empty name (`""`) and contains the following structure:

- `name`: A string tag containing the block's internal ID.
- `states`: A compound tag containing the block's state values.

### State Types
Only three NBT types are allowed for block states:
- `boolean` -> `NBT_Byte` (Tag 1)
- `int` -> `NBT_Int32` (Tag 3)
- `string` -> `NBT_String` (Tag 8)

Permutations with no states still require an empty `states` compound tag.

## Hashing Algorithm

The permutation hash follows a custom FNV-1a 32-bit implementation. It starts with an initial offset of `0x811c9dc5` and processes the raw NBT bytes through a XOR and shuffle loop:

```properties
int hash = 0x81_1c_9d_c5;
for each byte of nbt_data;
  hash = hash ^ byte;
  hash = hash + (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
```

### Reference Hashes
You can verify your implementation using these expected results:
- `minecraft:dirt` (no states): `-2108756090`
- `minecraft:bedrock` (`infiniburn_bit: false`): `-173245189`

## Finalizing the Palette

The block palette is finalized by first sorting block types by their ID hash (FNV-1 64-bit). The `networkHashId` generated from the NBT is assigned to each permutation for identification, but the actual palette alignment also depends on the presence of all technical and deprecated blocks (like `end_gateway`) which are often missing from standard vanilla data dumps.
