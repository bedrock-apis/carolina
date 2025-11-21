import { RolldownOptions } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';
import { glob, readFile } from 'node:fs/promises';
import { workspaces } from './package.json' with { type: 'json' };
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

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

export async function createEntry(base: string): Promise<RolldownOptions | RolldownOptions[] | null> {
   const packagePath = join(base, 'package.json');
   if (!existsSync(packagePath)) return null;
   const content = JSON.parse((await readFile(packagePath)).toString());
   if (typeof content.rolldown !== 'object') return null;
   const { entries = {}, external = 'dependencies', declarations = false, dir = './dist' } = content.rolldown;
   if (Object.keys(entries).length <= 0) return null;
   let dependencies: string[] = [];
   if (Array.isArray(external)) dependencies = external;
   else if (external === 'dependencies') dependencies = Object.keys(content['dependencies'] ?? {});
   else if (external === 'devDependencies') dependencies = Object.keys(content['devDependencies'] ?? {});
   const _external = new RegExp(`^(${['node:', ...dependencies].join('|')})`);
   return {
      input: Object.fromEntries(Object.entries(entries).map(e => [e[0], resolve(base, e[1] as string)])),
      external: _external,
      transform: {
         decorator: {
            legacy: true,
         },
      },
      plugins: declarations ? [dts({ tsgo: true, tsconfig: resolve(base, 'tsconfig.json') })] : [],
      output: {
         cleanDir: true,
         dir: resolve(base, dir),
         minify: true,
         keepNames: true,
      },
      treeshake: true,
   } satisfies RolldownOptions;
}
