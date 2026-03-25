import { Context } from '../context';

export interface EncodingCompilable {
   compile(context: Context, ...params: unknown[]): EncodingResults;
}
export interface EncodingResults {
   deserialization: string;
   serialization: string;
   kind: OutputKind;
}
export enum OutputKind {
   Normal,
   BareBone,
}
