export interface NetworkServer {
   // Basic And Efficient event handlers
   onConnectionConnected: ((connection: NetworkConnection) => void) | null;
   onConnectionDisconnected: ((connection: NetworkConnection) => void) | null;
   onConnectionMessaged: ((connection: NetworkConnection, message: Uint8Array) => void) | null;
   onError: ((error: unknown) => void) | null;
   onLog: ((message: string) => void) | null;
   // General Methods
   dispose(): void;
   disconnect(connection: NetworkConnection): void;
   send(connection: NetworkConnection, message: Uint8Array): void;

   // Status Methods
   getAllConnections(): Iterable<NetworkConnection>;
   getConnectionById(id: string): NetworkConnection | null;
   setAddressBlackList(list: Set<string> | null): void;
   getAddressBlackList(): Set<string> | null;
   getCurrentCapacity(): number;
}

export interface NetworkConnection {
   // Unique Identifier
   readonly uniqueId: string;
   readonly runtimeId: number;
   getAddress(): string | null;
   getPort(): number | null;
   getPing(): number | null;
}

export interface ConnectionEndpoint {
   address: string;
   port: number;
}
