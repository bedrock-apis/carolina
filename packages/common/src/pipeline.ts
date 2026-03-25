import { ObjectOverTakesJS } from './inject-utils';
import { Logger } from './logger';

const GENERAL = new Logger('FALLBACK_LOGGER');
// oxlint-disable typescript/no-explicit-any
export abstract class Pipeline {
   public initialize(): void {}
   public static create<S extends Pipeline, T extends new (...params: A) => S, A extends Array<unknown>>(
      this: T,
      ...args: A
   ): S {
      return new this(...args);
   }
   public onError(error: Error): void {
      GENERAL.error(error, error.stack);
   }
}

/**
 * Class Decorator
 * Targets only classes that extend Pipeline to inject proper code
 */
export function OverTakes<T extends abstract new (...args: any[]) => Pipeline>(constructor: T): void {
   //ObjectOverTakesJS(getPrototypeOf(constructor), constructor);
   ObjectOverTakesJS(Object.getPrototypeOf(constructor.prototype), constructor.prototype);
}
