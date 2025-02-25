export abstract class IO {
    public abstract readFile(src: string): Promise<Uint8Array | null>;
    public abstract readFileStream(src: string): ReadableStream<Uint8Array>;
    public abstract exists(src: string): Promise<boolean>;
    public abstract createDirectory(src: string, recursive: boolean): Promise<boolean>;
    public abstract readDirectoryFolders(src: string, recursive: boolean): AsyncIterable<string>;
    public abstract readDirectoryFiles(src: string, recursive: boolean): AsyncIterable<string>;
    public abstract writeFile(src: string, data: string | Uint8Array): Promise<boolean>;
    public abstract writeFileStream(src: string, data: ReadableStream<Uint8Array | string>): Promise<void>;
}