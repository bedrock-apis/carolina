import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { RolldownOptions } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';
const PACKAGE_PATH = './package.json';

if (!PACKAGE_PATH) throw Error('package.json not found');
const FILE_DATA = await readFile(PACKAGE_PATH).then(
   _ => JSON.parse(_.toString()),
   _ => null
);
if (!FILE_DATA) throw Error('Failed to read package.json');
const { rolldown } = FILE_DATA;
if (typeof rolldown !== 'object') throw Error('Invalid rolldown configuration.');

const { entries = {}, external = 'dependencies', declarations = false, dir = './dist' } = rolldown;
if (Object.keys(entries).length <= 0) throw ReferenceError('No entries found');
let dependencies: string[] = [];
if (Array.isArray(external)) dependencies = external;
else if (external === 'dependencies') dependencies = Object.keys(FILE_DATA['dependencies'] ?? {});
else if (external === 'devDependencies') dependencies = Object.keys(FILE_DATA['devDependencies'] ?? {});
const _external = new RegExp(`^(${['node:', '@carolina', '@bedrock-apis', ...dependencies].join('|')})`);

export default {
   input: Object.fromEntries(Object.entries(entries).map(e => [e[0], resolve(e[1] as string)])),
   external: _external,
   transform: { decorator: { legacy: true } },
   plugins: declarations ? [dts({ tsgo: false, tsconfig: resolve('./tsconfig.json') })] : [],
   output: { cleanDir: true, dir: resolve(dir), minify: true, keepNames: true, sourcemap: 'inline' },
   treeshake: true,
} satisfies RolldownOptions;
