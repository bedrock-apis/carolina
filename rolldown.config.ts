import { RolldownOptions } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';
import { glob, readFile } from 'node:fs/promises';
import { workspaces } from './package.json' with { type: 'json' };
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const entries: Promise<RolldownOptions[] | RolldownOptions | null>[] = [];
for (const bPath of workspaces)
   for await (const folder of glob(bPath)) entries.push(createEntry(folder).catch(_ => null));

const options = await Promise.all(entries);

export default options.flat().filter(_ => _);
export function defineConfig(
   entries: Record<string, string>,
   dependencies: Record<string, string>,
   output = './dist/',
   emitDeclarationFiles = true,
   tsconfig: string = './tsconfig.json',
): RolldownOptions[] {
   const externalNames = Object.getOwnPropertyNames(dependencies);
   const external = new RegExp(`^(${['node:', ...externalNames].join('|')})`);
   const baseOptions: RolldownOptions = {
      input: entries,
      external,
      plugins: [dts({ tsgo: true, tsconfig })],
      transform: {
         decorator: {
            legacy: true,
         },
      },
      output: {
         cleanDir: true,
         dir: output,
         minify: true,
         keepNames: true,
         sourcemap: 'inline',
      },
      treeshake: true,
   };
   return [baseOptions];
}

export async function createEntry(path: string): Promise<RolldownOptions | RolldownOptions[] | null> {
   const packageJSON = `${path}\\package.json`;
   if (!existsSync(packageJSON)) return null;
   const content = JSON.parse((await readFile(packageJSON)).toString());
   if (typeof content.rolldown !== 'object') return null;
   return defineConfig(
      Object.fromEntries(Object.entries(content.rolldown.sources).map(e => [e[0], resolve(path, e[1] as string)])),
      content[content.rolldown.external ?? 'dependencies'] ?? {},
      resolve(path, './dist/'),
      true,
      resolve(path, './tsconfig.json'),
   );
}
