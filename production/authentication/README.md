## README

Lightweight authentication utilities for validating Minecraft protocol login tokens.

The `Authentication` class provides JWT parsing, header/body extraction, and signature validation against OpenID configuration and JWK sets.
`AuthenticationType` defines supported token modes: Online, SubClient, and OfflineSelfSigned.
`OpenConfiguration` retrieves and caches OpenID metadata and keys used to verify incoming tokens.
Use `Authentication.authenticate()` to validate a token and obtain a typed `JWTBodyObject` for downstream protocol handling.

### Usage Example
```ts
const parsed = Authentication.parse(data.authentication);
const { AuthenticationType: type, Token } = parsed;

if (type !== AuthenticationType.Online) {
   // Prevent connections that are not authenticated
  player.connection.disconnect();
  return;
}

const userIdentity = await Authentication.authenticate(Token).catch(() => {
   // Authentication failed
  player.connection.disconnect();
  return null;
});

if (!userIdentity) return;

console.log("XUID:", userIdentity.xid);
console.log("CPK:", userIdentity.cpk);
```
