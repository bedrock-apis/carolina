import { DIM, FormatCode } from './format-helper';

const { log, debug, warn, error, info } = globalThis.console;
const rgb = FormatCode.createForegroundRGB;

const BASE_COLOR = DIM.prefix;
const DEBUG_COLOR = rgb(179, 101, 224),
   DC_L = DEBUG_COLOR.prefix.length + DEBUG_COLOR.suffix.length;
const LOG_COLOR = rgb(0, 206, 221),
   LC_L = LOG_COLOR.prefix.length + LOG_COLOR.suffix.length;
const INFO_COLOR = rgb(140, 183, 216),
   IC_L = INFO_COLOR.prefix.length + INFO_COLOR.suffix.length;
const WARN_COLOR = rgb(230, 200, 60),
   WC_L = WARN_COLOR.prefix.length + WARN_COLOR.suffix.length;
const ERROR_COLOR = rgb(241, 80, 59),
   EC_L = ERROR_COLOR.prefix.length + ERROR_COLOR.suffix.length;

const PADDING = 17;
const DEBUG = `\x1b[90m[${DEBUG_COLOR.wrap(`DEBUG`)}\x1b[90m]`;
const LOG = `\x1b[90m[${LOG_COLOR.wrap(`LOG`)}\x1b[90m]`;
const INFO = `\x1b[90m[${INFO_COLOR.wrap(`INFO`)}\x1b[90m]`;
const WARN = `\x1b[90m[${WARN_COLOR.wrap(`WARN`)}\x1b[90m]`;
const ERROR = `\x1b[90m[${ERROR_COLOR.wrap(`ERROR`)}\x1b[90m]`;

enum OutputLoggerLevel {
   None = 0,
   Errors = 1,
   Warnings = 2,
   Info = 3,
   Log = 4,
   Debug = 5,
}
export class Logger {
   public static readonly OutputLoggerLevel = OutputLoggerLevel;
   public static level = 3;
   private readonly text: string;
   private readonly base: Logger | null;
   public constructor(name: string, base?: Logger) {
      this.base = base ?? null;
      if (name === '' && this.base === null) this.text = '';
      else this.text = (this.base?.text ?? '') + `\x1b[90m[${name}\x1b[90m]`;
   }
   public debug(...params: unknown[]): void {
      if (Logger.level >= 5)
         debug(
            `\x1b[0;3m${BASE_COLOR}${this.getTimeFormatted()} ${this.text} ${DEBUG.padEnd(PADDING + DC_L)} \x1b[39m${params.join(' ')}\x1b[0m`
         );
   }
   public log(...params: unknown[]): void {
      if (Logger.level >= 4)
         log(
            `\x1b[0m${BASE_COLOR}${this.getTimeFormatted()} ${this.text} ${LOG.padEnd(PADDING + LC_L)} \x1b[39m${params.join(' ')}\x1b[0m`
         );
   }
   public info(...params: unknown[]): void {
      if (Logger.level >= 3)
         info(
            `\x1b[0m${this.getTimeFormatted()} ${this.text} ${INFO.padEnd(PADDING + IC_L)} \x1b[39m${params.join(' ')}\x1b[0m`
         );
   }
   public warn(...params: unknown[]): void {
      if (Logger.level >= 2)
         warn(
            `\x1b[0m${this.getTimeFormatted()} ${this.text} ${WARN.padEnd(PADDING + WC_L)} \x1b[39m${params.join(' ')}\x1b[0m`
         );
   }
   public error(...params: unknown[]): void {
      if (Logger.level >= 1)
         error(
            `\n\x1b[0;1m${this.getTimeFormatted()} ${this.text} ${ERROR.padEnd(PADDING + EC_L)} \x1b[39m${params.join(' ')}\n\x1b[0m`
         );
   }
   public getTimeFormatted(): string {
      const date = new Date();
      return `\x1b[90m[\x1b[37m${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}\x1b[90m]`;
   }
}
/*
for (let i = 0; i < 120; i++) {
   console.log(`\x1b[${i}mHere is example test for ${i}\x1b[0m`);
}*/
