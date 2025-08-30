import { dump } from './dump';
import { exit } from 'node:process';

dump()
   .catch(e => {
      console.error(e);
      return -1;
   })
   .then(exit);
