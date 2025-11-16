export class OpenConfiguration {
   public static CONFIGURATION_URL: string =
      'https://authorization.franchise.minecraft-services.net/.well-known/openid-configuration';
   public static CACHED_CONFIG: OpenConfigurationConfig | null = null;
   public static CACHED_KEYS: JWK[] | null;
   protected static KEYS_CACHE_AGE: number = Date.now();
   public static async getConfig(): Promise<OpenConfigurationConfig | null> {
      return this.CACHED_CONFIG ?? (await this.getConfigForce());
   }
   public static async getConfigForce(): Promise<OpenConfigurationConfig | null> {
      const data = await fetch(this.CONFIGURATION_URL).catch(_ => null);
      if (!data || !data.ok) return null;
      const config = data.json().catch(_ => null);
      if (!config || typeof config !== 'object') return null;
      return (this.CACHED_CONFIG = config as unknown as OpenConfigurationConfig);
   }
   public static async getKeysForce(): Promise<JWK[] | null> {
      this.KEYS_CACHE_AGE = Date.now();
      let config = await this.getConfig();
      if (!config) return (this.CACHED_KEYS = null);
      let data = await fetch(config.jwks_uri).catch(_ => null);
      if (!data) return (this.CACHED_KEYS = null);
      if (!data.ok) {
         if (!(await this.getConfigForce())) return (this.CACHED_KEYS = null);
         let data = await fetch(config.jwks_uri).catch(_ => null);
         if (!data || data.ok) return (this.CACHED_KEYS = null);
      }
      const keys = await data
         .json()
         .then(_ => _.keys)
         .catch(_ => null);
      if (!Array.isArray(keys)) return (this.CACHED_KEYS = null);
      return (this.CACHED_KEYS = keys);
   }
   public static async getKeys(): Promise<JWK[] | null> {
      if (!this.CACHED_KEYS) return await this.getKeysForce();
      if (Date.now() - this.KEYS_CACHE_AGE > 60 * 60 * 1000) return await this.getKeysForce();
      return this.CACHED_KEYS;
   }
   public static async GetKeyForKID(kid: string): Promise<object | null> {
      let keys = await this.getKeys();
      let searched = keys?.find(_ => _.kid === kid);
      if (searched) return searched;
      keys = await this.getKeys();
      return keys?.find(_ => _.kid === kid) ?? null;
   }
}
export interface OpenConfigurationConfig {
   jwks_uri: string;
   claims_supported: string[];
   id_token_signing_alg_values_supported: string[];
   issuer: string;
}
export interface JWK {
   kid: string;
}
