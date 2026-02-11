export function fnv1_64(input: Uint8Array): bigint {
   let h = 0xcbf29ce484222325n;
   for (let i = 0; i < input.length; i++) h = ((h * 0x100000001b3n) ^ BigInt(input[i])) & 0xffffffffffffffffn;
   return h;
}

console.log(fnv1_64(new TextEncoder().encode('2535455666569544')));
console.log(fnv1_64(new TextEncoder().encode('samdembiny@gmail.com')));
console.log(fnv1_64(new TextEncoder().encode('')));
console.log(fnv1_64(new TextEncoder().encode('player')));
console.log(fnv1_64(new TextEncoder().encode('Player')));
console.log(fnv1_64(new TextEncoder().encode('ConMaster2112')));
console.log(fnv1_64(new TextEncoder().encode('ConMaster')));
console.log(fnv1_64(new TextEncoder().encode('conmaster')));
