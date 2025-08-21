import { RolldownOptions, defineConfig as df } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

export function defineConfig(
   entries: Record<string, string>,
   dependencies: Record<string, string>,
   output = './dist/',
   emitDeclarationFiles = true,
): RolldownOptions[] {
   const externalNames = Object.getOwnPropertyNames(dependencies).filter(_ => dependencies[_].startsWith('workspace:'));
   const external = new RegExp(`^(${['node:', ...externalNames].join('|')})`);

   const baseOptions: RolldownOptions = {
      input: entries,
      external,
      transform: {
         decorator: {
            legacy: true,
         },
      },
      output: { dir: output },
      keepNames: true,
   };
   const steps: RolldownOptions[] = [baseOptions];
   if (emitDeclarationFiles) steps.push({ ...baseOptions, plugins: [dts({ emitDtsOnly: true, tsgo: true })] });
   return steps;
}
