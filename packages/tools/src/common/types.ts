export interface BlockMetadata {
   uid: string;
   tgs: string[];
   com: string[];
   //lid: string | null;
   sta: { name: string; valid_values: number[] | string[] | boolean[] }[];
   mac: number;
   flg: number;
}
