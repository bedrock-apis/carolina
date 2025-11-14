import { NetworkSettingsPacket } from '@carolina/protocol';

export class CarolinaKernel {
   public static readonly id = 'carolina:base_kernel' as const;
   public onNetworkSettingsRequest(): NetworkSettingsPacket {
      return new NetworkSettingsPacket();
   }
}
