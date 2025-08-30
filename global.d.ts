declare type Mutable<T> = {
   -readonly [P in keyof T]: T[P];
};
declare type StringKeyOf<T> = keyof {
   [P in keyof T]: P extends string ? T[P] : never;
};
