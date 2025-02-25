import { relative, resolve } from "node:path";

Error.prepareStackTrace = function prepareStackTrace(error: Error, stacks: NodeJS.CallSite[]){
    const output = {output: [] as string[], stack: [] as string[]};
    let i = 0;
    for(const call of stacks.reverse()) {

        output.stack.push(call.isNative()?"<native>":call.getFunctionName()??"<anonymous>");

        
        const pathLike = call.getScriptNameOrSourceURL();
        if(call.isNative() || (pathLike && pathLike.startsWith("node:"))) continue;

        const modifiers = [];
        if(call.isAsync()) modifiers.push("async");
        if(call.isToplevel()) modifiers.push("module");
        if(call.isEval()) modifiers.push("eval");
        let src;


        if(call.isEval()) src = "\x1b[90m<string>"
        else 
        {
            const url = new URL(pathLike??"file://");
            src = `\x1b[34m.\\${relative(resolve("."), url.pathname.substring(1))}`;
        }

        output.output.push(`${"  ".repeat(i++)}\x1b[90m╰─˃ <${modifiers.join("/")}>\x1b[39m ${src}\x1b[90m:${call.getLineNumber()}:${call.getColumnNumber()}\x1b[39m`);
    }
    return error instanceof CarolinaError?output:output.output.join("\n ");
}

export class CarolinaError extends Error {
    public constructor(
        public readonly id: number,
        message: string){
            super(message);
            this.name = new.target.name;
    }
    public toString(){
        let num = this.id.toString(16);
        //@ts-expect-error
        return `\x1b[90m[0x${'0'.repeat(4-num.length) + num}]\x1b[31m ${this.name??CarolinaError.name}: \x1b[33m${this.message}\x1b[39m\n ${this.stack.output.join("\n ")}`;
    }
    public panic(): never{
        console.error(this.toString());
        process.exit(this.id);
    }
}
process.on("uncaughtException", (e)=>{
    if(e instanceof CarolinaError) e.panic();
});
