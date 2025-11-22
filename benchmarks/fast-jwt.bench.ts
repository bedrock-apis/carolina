import { createDecoder } from 'fast-jwt';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { bench, describe } from 'vitest';

import { Authentication } from '@bedrock-apis/carolina-authentication';

describe('ClientData Token Parse', () => {
   const rawClientData = readFileSync(resolve(import.meta.dirname, './test.clientData.txt')).toString();
   bench('fast-jwt', () => void createDecoder()(rawClientData), { iterations: 10_000 });
   bench('carolina', () => void Authentication.partialParse(Authentication.split(rawClientData)[1]), {
      iterations: 10_000,
   });
});
