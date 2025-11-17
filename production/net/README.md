# Carolina Net - Raknet

- Provides customizability for highly efficient raknet in term of average JS
- Minimum Runtime Dependency - This packet is using minimum runtime specific apis, just pass socket as interface argument.
- Scalability single raknet-listener (server) is build to support multiple socket sources

# Why we don't use any serialization packages?

- Our goal is performance when using DataView directly with hardcoded offsets then we get the best performance
