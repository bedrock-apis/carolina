import { LoginTokensPayload } from '@carolina/protocol';

export class Authentication {
   public constructor(public readonly payload: LoginTokensPayload) {}
   public async getUserModuleData(): Promise<AuthenticationData> {
      return {
         xid: '',
         mid: '',
      };
   }
}
export interface AuthenticationData {
   xid: string;
   mid: string;
}
