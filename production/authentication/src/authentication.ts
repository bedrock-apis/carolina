import { AuthenticationType } from './authentication-type';
import { OpenConfiguration } from './open-configuration';

export class Authentication {
   public static UTF8_TEXT_DECODER: TextDecoder = new TextDecoder('utf8');
   public static UTF8_TEXT_ENCODER: TextEncoder = new TextEncoder();
   public static AUDIENCE_API: string = 'api://auth-minecraft-services/multiplayer';
   public static CACHED_PIK_KEYS: [];
   public static parse(authentication: string): BaseAuthenticationPayload {
      const { AuthenticationType: authType, Certificate, Token } = JSON.parse(authentication);
      if (typeof authType !== 'number') throw new Error('Type of Authentication must be number: ' + authType);
      if (!(authType in AuthenticationType)) throw new Error('Unknown Authentication type: ' + authType);
      if (typeof Token !== 'string') throw new Error('Token has to be type of string: ' + authType);
      return { AuthenticationType: authType, Certificate, Token: Token };
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
         { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
         false,
         ['verify']
      );
      const valid = await crypto.subtle.verify(
         { name: 'RSASSA-PKCS1-v1_5' },
         verifyKey,
         Uint8Array.fromBase64(tail, { alphabet: 'base64url' }),
         Authentication.UTF8_TEXT_ENCODER.encode(`${head}.${body}`)
      );
      if (!valid) throw new Error('Spoofed token, verification failed!');
      return data;
   }
   public static async verify<T extends object>(token: string, cpk: string): Promise<T> {
      // split JWT
      const [hB64, pB64, sB64] = Authentication.split(token);

      // import public key (raw P-384)
      const publicKey = await crypto.subtle.importKey(
         'spki',
         Uint8Array.fromBase64(cpk),
         { name: 'ECDSA', namedCurve: 'P-384' },
         false,
         ['verify']
      );

      // verify ES384 signature
      const isValid = await crypto.subtle.verify(
         { name: 'ECDSA', hash: 'SHA-384' },
         publicKey,
         Uint8Array.fromBase64(sB64, { alphabet: 'base64url' }),
         Authentication.UTF8_TEXT_ENCODER.encode(`${hB64}.${pB64}`)
      );
      if (!isValid) throw new Error('Invalid JWT Token, failed to verify');

      return this.partialParse<T>(pB64);
   }
   public static split(token: string): [string, string, string] {
      const fI = token.indexOf('.'),
         lI = token.lastIndexOf('.');
      if (fI === -1 || lI === -1 || fI >= lI) throw new SyntaxError('Malformed JWT Token');
      return [token.substring(0, fI), token.substring(fI + 1, lI), token.substring(lI + 1)];
   }
   public static partialParse<T extends object>(payload: string): T {
      const data = JSON.parse(
         Authentication.UTF8_TEXT_DECODER.decode(Uint8Array.fromBase64(payload, { alphabet: 'base64url' }), {
            stream: false,
         })
      );
      if (data && typeof data !== 'object')
         throw new Error('Unexpected JWT data type, expected object, but received: ' + typeof data);
      return data;
   }
}
export interface JWTHeadObject {
   alg: string;
   kid: string;
   typ: string;
}
export interface JWTBodyObject {
   /**Xbox Gamer Tag */
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
