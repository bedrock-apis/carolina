import { createWriteStream } from 'node:fs';
import { Writable } from 'node:stream';

export class FileBuilder implements AsyncDisposable {
   private _writer: WritableStreamDefaultWriter<string>;
   private _task: Promise<void>;

   public constructor(path: URL) {
      const nodeStream = createWriteStream(path);
      const webStream = Writable.toWeb(nodeStream);
      const encoder = new TextEncoderStream();

      this._task = encoder.readable.pipeTo(webStream);
      this._writer = encoder.writable.getWriter();
   }

   public w(text: string): this {
      this._writer.write(text);
      return this;
   }

   public ln(text: string = ''): this {
      this._writer.write(text + '\n');
      return this;
   }

   public each<T>(items: T[], callback: (_: this, item: T) => this | string): this {
      for (const item of items) {
         const result = callback(this, item);
         if (typeof result === 'string') {
            this.ln(result);
         }
      }
      return this;
   }

   public map<T extends Record<string | number | symbol, unknown>, K extends keyof T>(
      map: T,
      callback: (_: this, key: K, value: T[K]) => this | string
   ): this {
      for (const key of Object.keys(map) as K[]) {
         const result = callback(this, key, map[key] as T[K]);
         if (typeof result === 'string') {
            this.ln(result);
         }
      }
      return this;
   }

   public async [Symbol.asyncDispose](): Promise<void> {
      await this._writer.close();
      await this._task;
   }

   public async dispose(): Promise<void> {
      await this[Symbol.asyncDispose]();
   }
}

export function file(path: URL): FileBuilder {
   return new FileBuilder(path);
}
