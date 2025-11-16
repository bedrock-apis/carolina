const OPENID_CONFIG_URL = 'https://authorization.franchise.minecraft-services.net/.well-known/openid-configuration';
let jwksCache = { keys: [], fetchedAt: 0 };

export async function fetchJWKS(): Promise<object> {
   const now = Date.now();
   // Refresh JWKS if not fetched or older than 1 hour
   if (jwksCache.keys.length && now - jwksCache.fetchedAt < 3600_000) {
      return jwksCache;
   }
   const cfgRes = await fetch(OPENID_CONFIG_URL);
   if (!cfgRes.ok) throw new Error('Failed to fetch OpenID configuration');
   const cfg = await cfgRes.json();
   console.log(cfg);
   const keysRes = await fetch(cfg.jwks_uri);
   if (!keysRes.ok) throw new Error('Failed to fetch JWKS');
   const jwks = await keysRes.json();
   console.log(jwks);
   jwksCache = { keys: jwks.keys, fetchedAt: now };
   return jwksCache;
}
await fetchJWKS();
