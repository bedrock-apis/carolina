import { nextTick } from "node:process";
import {io} from "@carolina/internal";
if(false){

    const nodeBuf = Buffer.alloc(256);
    const ecmaBuf = new Uint8Array(256);
    
    const c = 50_000;
    let i = c, t = performance.now();
    
    await io.readFile("./package.json");
    
    nextTick(console.log, "Next tick");
    setImmediate(console.log, "Set setImmediate");
    setTimeout(console.log, 0, "Set setTimeout");
    queueMicrotask(()=>console.log("Microtask"));
    Promise.resolve("Promise resolve").then(console.log);
    
    
    nextTick(console.log, "Next tick2");
    setImmediate(console.log, "Set setImmediate2");
    setTimeout(console.log, 0, "Set setTimeout2");
    queueMicrotask(()=>console.log("Microtask2"));
    Promise.resolve("Promise resolve2").then(console.log);
    
    
    
    const f1 = (res)=>i--?nextTick(f1,res):res(performance.now());
    const f2 = (res)=>i--?setImmediate(f2,res):res(performance.now());
    const f3 = (res)=>i--?setTimeout(f3,0,res):res(performance.now());
    const f4 = (res)=>i--?Promise.resolve(res).then(f4):res(performance.now());
    
    i = c, t = performance.now();
    console.log((await new Promise<number>(f2)) - t);
    
    i = c, t = performance.now();
    console.log((await new Promise<number>(f4)) - t);
    
    i = c, t = performance.now();
    console.log((await new Promise<number>(f1)) - t);
    
    i = 100, t = performance.now();
    console.log((await new Promise<number>(f3)) - t);
    
    i = 100, t = performance.now();
    setTimeout(()=>console.log("Timeout: ", performance.now() - t), 35);
    //runGenerator(game());
}