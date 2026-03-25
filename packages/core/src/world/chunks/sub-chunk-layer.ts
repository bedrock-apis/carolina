import { BaseLayer } from './base-layer';
export class SubChunkLayer extends BaseLayer {
   public constructor() {
      super();
      this.palette[0] = 2; //-604749536
      this.palette[1] = 1; //-2144268767;
      this.entries[0] = 1;
      for (let i = 0; i < this.entries.length; i++) this.entries[i] = Math.floor(Math.random() * 2);
   }
}
