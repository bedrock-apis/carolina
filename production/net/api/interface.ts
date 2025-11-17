export interface ServerListener {
   onPayloadReceived?: (connection: Connection, payload: Uint8Array) => void;
   onConnectionDisconnect?: (connection: Connection) => void;
   onNewConnection?: (connection: Connection) => void;
   onError?: (error: unknown) => void;
}
export interface Connection {
   readonly id: string;
   send(payload: Uint8Array): void;
   disconnect(): void;
}
