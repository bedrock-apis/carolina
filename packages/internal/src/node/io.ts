import { readFile, writeFile } from "node:fs/promises";
import { IO } from "../wrappers/io";
import { createReadStream, createWriteStream, existsSync } from "node:fs";

export class NodeIO extends IO {
    public readFile(src: string): Promise<Uint8Array | null> {return readFile(src).catch(_=>null);}
    public readFileStream(src: string): ReadableStream<Uint8Array> {return ReadableStream.from(createReadStream(src));}
    public async exists(src: string): Promise<boolean> {return existsSync(src);}
    public createDirectory(src: string, recursive: boolean): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    public readDirectoryFolders(src: string, recursive: boolean): AsyncIterable<string> {
        throw new Error("Method not implemented.");
    }
    public readDirectoryFiles(src: string, recursive: boolean): AsyncIterable<string> {
        throw new Error("Method not implemented.");
    }
    public writeFile(src: string, data: string | Uint8Array): Promise<boolean> {
        return writeFile(src, data).then(_=>true, _=>false);
    }
    public writeFileStream(src: string, data: ReadableStream<Uint8Array | string>): Promise<void> {
        const writable = createWriteStream(src);
        return data.pipeTo(new WritableStream({
            write:c=>(writable.write(c), void 0),
            close:()=>(writable.end(), void 0)
        }));
    }
    
}