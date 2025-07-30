import { existsSync, readdirSync, readFileSync} from "node:fs"
import { extname, resolve, basename } from 'node:path';
import { RolldownOptions } from 'rolldown';
import { dependencies, devDependencies} from "./package.json";
import {dts} from "rolldown-plugin-dts";

// Create external sum of packages that should not be bundled
const libNames = Object.getOwnPropertyNames(dependencies).concat(Object.getOwnPropertyNames(devDependencies));
const externals = new RegExp(`^(${libNames.join("|")}|node:|@carolina|@serenity)`);

// Get the workspace packages
const packages = readdirSync("./packages").filter(e=>existsSync(`.\\packages\\${e}\\package.json`)).map(e=>`.\\packages\\${e}`);
packages.push("app");

// Build rolldown options
const options: RolldownOptions[] = [];
export default options;

for(const projectRootFolder of packages) {
    // Package.json info of the sub-package
    const packageData = JSON.parse(readFileSync(`${projectRootFolder}/package.json`).toString()) as {main?: string, types?: string};

    // Skip packages without entry point
    if(!packageData.main) continue;

    // Skip packages without types
    if(!packageData.types) continue;

    const entry = resolve(projectRootFolder, "./src/main.ts");
    console.log(entry);
    options.push({
        input: {
            main: entry
        },
        plugins: [dts({isolatedDeclarations: true})],
        transform: {
            decorator: {
                legacy: false,
                emitDecoratorMetadata: true
            }
        },
        output: {
            dir: resolve(projectRootFolder, "dist")
        },
        external: externals,
        keepNames: true,
        treeshake: true,
    });
}
function filename(e: string): string{return basename(e, extname(e));}