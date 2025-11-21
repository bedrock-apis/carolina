import { AuthenticationType } from './authentication-type';
import { OpenConfiguration } from './open-configuration';

export class Authentication {
   public static AUDIENCE_API: string = 'api://auth-minecraft-services/multiplayer';
   public static CACHED_PIK_KEYS: [];
   public static parse(authentication: string): BaseAuthenticationPayload {
      const { AuthenticationType: authType, Certificate, Token } = JSON.parse(authentication);
      if (typeof authType !== 'number') throw new Error('Type of Authentication must be number: ' + authType);
      if (!(authType in AuthenticationType)) throw new Error('Unknown Authentication type: ' + authType);
      if (typeof Token !== 'string') throw new Error('Token has to be type of string: ' + authType);
      return {
         AuthenticationType: authType,
         Certificate,
         Token: Token,
      };
   }
   public static async authenticate(token: string): Promise<JWTBodyObject> {
      const [head, body, tail] = this.split(token);
      const { alg, kid, typ } = this.partialParse<JWTHeadObject>(head);
      if (typ !== 'JWT') throw new Error('Unexpected token type, expected JWT token, received: ' + typ);
      const config = await OpenConfiguration.getConfig();
      if (!config) throw new Error('OpenConfig not available.');
      if (!config.id_token_signing_alg_values_supported.includes(alg)) throw new Error('Unsupported algorithm');
      const data = this.partialParse<JWTBodyObject>(body);
      if (data.exp * 1000 < Date.now()) throw new Error('Expired token!');
      if (data.aud !== this.AUDIENCE_API) throw new Error('Invalid Audience API!');
      if (data.iss !== config.issuer) throw new Error('Issuer mismatch!');
      const key = await OpenConfiguration.GetKeyForKID(kid);
      if (!key) throw new Error('Authentication unknown KID!');

      if (alg !== 'RS256') throw new Error('Not implemented verification algorithm: ' + alg);
      const verifyKey = await crypto.subtle.importKey(
         'jwk',
         key,
         {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256',
         },
         false,
         ['verify'],
      );
      const valid = await crypto.subtle.verify(
         { name: 'RSASSA-PKCS1-v1_5' },
         verifyKey,
         Uint8Array.fromBase64(tail, { alphabet: 'base64url' }),
         new TextEncoder().encode(`${head}.${body}`),
      );
      if (!valid) throw new Error('Spoofed token, verification failed!');
      return data;
   }
   public static split(token: string): [string, string, string] {
      const slices = token.split('.');
      if (slices.length !== 3)
         throw new SyntaxError('Invalid JWT syntax, expected 3 parts, received: ' + slices.length);
      return slices as [string, string, string];
   }
   public static partialParse<T extends object>(payload: string): T {
      const data = JSON.parse(atob(payload));
      if (data && typeof data !== 'object')
         throw new Error('Unexpected JWT data type, expected object, but received: ' + typeof data);
      return data;
   }
}
/*
function getJWTData<T extends object>(src: string): T {
   let indexOf = src.indexOf('.'),
      lastIndexOf = src.lastIndexOf('.');
   console.log(src.split('.').map(e => new TextDecoder().decode(Uint8Array.fromBase64(e))));
   console.log(new TextDecoder().decode(Uint8Array.fromBase64(src.substring(indexOf + 1, lastIndexOf))));
}*/
export interface JWTHeadObject {
   alg: string;
   kid: string;
   typ: string;
}
export interface JWTBodyObject {
   /**Xbox Gamer Tag */
   xname: string;
   /**Xbox UID */
   xid: string;
   /**PlayFabId */
   mid: string;
   aud: string;
   iss: string;
   exp: number;
   cpk: string;
}
export interface BaseAuthenticationPayload {
   AuthenticationType: AuthenticationType;
   Certificate?: string;
   Token: string;
}
