import { NetworkDriver } from './driver';
import { NetworkEngine, NetworkEngineEventKeys } from './engine/network-engine';

export class SyncNetworkDriver<S extends NetworkEngine = NetworkEngine> extends NetworkDriver {
   public readonly engine: S;
   public constructor(engine: S) {
      super();
      this.engine = engine;
      this.engine.events.set(NetworkEngineEventKeys.Connect, ({ connection }) => {
         this.incoming.dispatch(NetworkEngineEventKeys.Connect, {
            clientId: connection.uniqueId,
            runtimeId: connection.runtimeId,
         });
      });
      this.engine.events.set(NetworkEngineEventKeys.Message, ({ connection, message }) => {
         this.incoming.dispatch(NetworkEngineEventKeys.Message, { message, runtimeId: connection.runtimeId });
      });
      this.engine.events.set(NetworkEngineEventKeys.Disconnect, ({ connection }) => {
         this.incoming.dispatch(NetworkEngineEventKeys.Disconnect, {
            clientId: connection.uniqueId,
            runtimeId: connection.runtimeId,
         });
      });
      this.outgoing.set(NetworkEngineEventKeys.Message, ({ message, runtimeId: uniqueId }) => {
         const client = this.engine.clients.get(uniqueId)?.connection;
         if (client) this.engine.server.send(client, message);
      });
      this.outgoing.set(NetworkEngineEventKeys.Disconnect, ({ runtimeId: uniqueId }) => {
         const connection = this.engine.clients.get(uniqueId);
         if (connection) this.engine.disconnect(connection);
      });
   }
   public override dispose(): void {
      this.engine.dispose();
   }
}
