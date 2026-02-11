import { Carolina } from '@carolina/core';

import { Logger } from '../../packages/common/src/logger';

Logger.level = Logger.OutputLoggerLevel.Debug;
const carolina = new Carolina();
await carolina.start();

carolina.server.events.add('connected', c => {
   carolina.logger.debug(c.client.clientId);
});
