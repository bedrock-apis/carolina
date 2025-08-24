# Carolina Raknet
- Provides customizability for highly efficient raknet in term of average JS
- Runtime Independent - This packet is using no-runtime specific apis, just pass socket as interface argument
- Scalability single raknet-listener (server) is build to support multiple socket sources
- Requires manual queue flushing, we don't know when its the best time to flush it on your needs, so just it your self and be happier
