export abstract class WorldProvider {
   public constructor() {}
   public toString(): string {
      return this?.constructor?.name ?? WorldProvider.name;
   }
   // This method should be able to pipe data from one world provider to this world provider
   public async pipe(_provider: WorldProvider): Promise<void> {
      throw new Error('No implementation');
   }
}
