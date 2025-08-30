import { RolldownOptions, defineConfig as df } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

export function defineConfig(
   entries: Record<string, string>,
   dependencies: Record<string, string>,
   output = './dist/',
   emitDeclarationFiles = true,
): RolldownOptions[] {
   const externalNames = Object.getOwnPropertyNames(dependencies);
   const external = new RegExp(`^(${['node:', ...externalNames].join('|')})`);
   console.log(external);
   const baseOptions: RolldownOptions = {
      input: entries,
      external,
      transform: {
         decorator: {
            legacy: true,
         },
      },
      output: {
         dir: output,
         minify: true,
         //sourcemap: 'hidden',
      },
      treeshake: true,
      keepNames: true,
   };
   const steps: RolldownOptions[] = [baseOptions];
   if (emitDeclarationFiles) steps.push({ ...baseOptions, plugins: [dts({ emitDtsOnly: true, tsgo: true })] });
   return steps;
}
