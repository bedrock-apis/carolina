export interface FrameDescriptor {
   body: Uint8Array;
   reliableIndex?: number;
   sequenceIndex?: number;
   orderIndex?: number;
   orderChannel?: number;
   fragment?: { id: number; length: number; index: number };
}
export interface AddressInfo {
   address: string;
   port: number;
   family: 'IPv4' | 'IPv6';
}
export interface SocketSource {
   onDataCallback(callback: (data: Uint8Array, endpoint: AddressInfo) => void): void;
   send(buffer: Uint8Array, endpoint: AddressInfo): Promise<void>;
}
