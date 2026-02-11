import { ConnectionEndpoint } from '../../api/interface';

export interface EndpointHandle {
   send: (message: Uint8Array, endpoint: ConnectionEndpoint) => void;
}
