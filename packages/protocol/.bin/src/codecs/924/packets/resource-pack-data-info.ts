import { Boolean, Buffer, SerializeAs, Uint32, Uint8, VarUint32, VarString, Uint64 } from '@carolina/binary';

import { PacketIds, PackType } from '../../../enums';
import { PacketCompilable, PacketType } from '../../../packet';

@PacketCompilable(PacketIds.ResourcePackDataInfo)
export class ResourcePackDataInfoPacket extends PacketType {
   /**
    * The unique identifier for the resource pack.
    */
   @SerializeAs(VarString)
   public uuid!: string;

   /**
    * The chunk size for the resource pack data.
    */
   @SerializeAs(Uint32, true)
   public chunkSize!: number;

   /**
    * The total number of chunks in the resource pack.
    */
   @SerializeAs(Uint32, true)
   public chunkCount!: number;

   /**
    * The file size of the resource pack in bytes.
    */
   @SerializeAs(Uint64, true)
   public fileSize!: bigint;

   /**
    * The hash of the file, used for verification.
    */
   @SerializeAs(Buffer(VarUint32))
   public fileHash!: Uint8Array;

   /**
    * Indicates whether the resource pack is a premium pack.
    */
   @SerializeAs(Boolean)
   public isPremium!: boolean;

   /**
    * The type of the resource pack, such as behavior or texture pack.
    */
   @SerializeAs(Uint8)
   public packType!: PackType;
}
