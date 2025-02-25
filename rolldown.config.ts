import { existsSync, readdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { defineConfig, RolldownOptions } from 'rolldown';




let dirs = await Promise.all(readdirSync("./packages", {withFileTypes: true}).filter(e=>e.isDirectory() && existsSync("./packages/" + e.name + "/package.json")).map(e=>`./packages/${e.name}`));
dirs.push("./app");
const mods = await Promise.all(dirs.map(async e=>{
    const data = await readJson<typeof import("./package.json") & {types:string}>(`${e}/package.json`);
    if(!data) throw ReferenceError("Failed to parse package.json, " + e);
    return {path: e, info: data};
}));

export default defineConfig(mods.filter(e=>!("napi" in e.info)).map(e=>{
    console.log(e.path, e.info.types);
    return {
        external: [ /node:|^@serenity|^@carolina/ ],
        input: resolve(e.path,e.info.types),
        output: (e.info as any).carolina?.["is-dynamic"]?
            {
                minify: true,
                dir: dirname(resolve(e.path, e.info.main)),
            }:{
                minify: true,
                file: resolve(e.path, e.info.main)
            }
    } satisfies RolldownOptions;
}));

async function readJson<T>(src: string): Promise<T | null> {
    return await readFile(src).then(e=>JSON.parse(e.toString())).catch(_=>null) as T;
}