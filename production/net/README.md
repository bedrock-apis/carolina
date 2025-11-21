# Carolina Net - Raknet

- Provides customizability for highly efficient raknet in term of average JS
- Minimum Runtime Dependency - This packet is using minimum runtime specific apis, just pass socket as interface argument.
- Scalability single raknet-listener (server) is build to support multiple socket sources

# Why we don't use any serialization packages?

- Our goal is performance when using DataView directly with hardcoded offsets then we get the best performance


### Warning
When creating socket source in nodeJS make sure you copy the contents you send, we internally reuse the buffer, so make sure you copy it when needed. 
Bun APIs doesn't require the buffer to be copied so thats why we choose reusing the buffer
```ts
const copy = new Uint8Array(data.byteLength);
copy.set(data);
return copy;
```
