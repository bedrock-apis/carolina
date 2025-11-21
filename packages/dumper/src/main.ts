import { exit } from 'node:process';

import { dump } from './dump';

dump()
   .catch(e => {
      console.error(e);
      return -1;
   })
   .then(exit);
