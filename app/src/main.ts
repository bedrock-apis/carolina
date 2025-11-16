import { Carolina } from '@carolina/core';

const carolina = new Carolina();
await carolina.server.bindV4();
console.log('Carolina Started . . .');
await carolina.start();
