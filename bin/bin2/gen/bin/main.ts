import { resolve } from 'node:path';

import { Protocol } from './protocol';
import {
   ProtocolDescriptiveIdentity,
   ProtocolEnum,
   ProtocolInfoRoot,
   ProtocolPacket,
   ProtocolStruct,
} from './types';

const protocol = new Protocol();
const BASE = 'docs';
const {
   'minecraft-engine': engine,
   'protocol-version': proto,
   includes,
} = await Bun.file('./docs/.yaml')
   .text()
   .then(t => Bun.YAML.parse(t) as ProtocolInfoRoot);
includes.packets = resolve(BASE, includes.packets);
includes.structs = resolve(BASE, includes.structs);
includes.enums = resolve(BASE, includes.enums);

for (const key of Object.keys(includes) as (keyof ProtocolInfoRoot['includes'])[])
   for await (const file of new Bun.Glob('*.yaml').scan({ onlyFiles: true, cwd: includes[key] })) {
      const value = Bun.YAML.parse(
         await Bun.file(resolve(includes.packets, file)).text()
      ) as ProtocolDescriptiveIdentity;
      protocol[key].set(value.name, value as ProtocolPacket & ProtocolStruct & ProtocolEnum);
   }

console.log('Minecraft Version Target: ' + engine);
console.log('Protocol version generating: ' + proto);

console.log(
   Bun.YAML.stringify(
      {
         packets: Array.from(protocol.packets.values()),
         structs: Array.from(protocol.structs.values()),
         enums: Array.from(protocol.enums.values()),
      },
      null,
      3
   )
);
