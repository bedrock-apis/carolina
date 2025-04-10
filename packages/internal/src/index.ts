import type { IO } from "./wrappers/io";

const io: typeof IO = globalThis?.process?.versions?.node ? (await import("./node/io")).NodeIO : null!;
if (!io) throw new ReferenceError("Unsupported Runtime");

export {io};