import type { IO } from "./wrappers/io";

export const io: IO = (globalThis?.process?.versions?.node)?new (await import("./node/io").then(e=>e.NodeIO))():null!;
if(!io)
    throw new ReferenceError("Unsupported Runtime");