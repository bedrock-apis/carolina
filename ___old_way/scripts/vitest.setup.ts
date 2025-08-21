import { beforeEach, afterEach } from "vitest";

let lastSuite = "";
beforeEach((ctx) => {
   if(ctx.task.suite?.name !== lastSuite) {
      console.log(`\n${ctx.task.suite?.name}`);
      lastSuite = ctx.task.suite?.name!;
   }
   if (ctx.task.type === 'test') {
      ctx.__start__time = performance.now();
   }
});

afterEach((ctx) => {
   if (ctx.task.type === 'test') {
      console.log(`\x1b[90m${ctx.task.name}: \x1b[32m${(performance.now() - ctx.__start__time).toFixed(2)}ms\x1b[39m`);
   }
});
