const { log } = globalThis.console;
export class Logger {
   public constructor(name: string, base?: Logger) {
      this.base = base?.text ?? '';
      this.text = this.base + `[\x1b[41;30m ${name} \x1b[39;49m]`;
   }
   private readonly text: string;
   private readonly base: string;
   public log(...params: unknown[]): void {
      log(
         `\x1b[2m${this.textPadding(this.getTimeFormatted(), 22)}${this.text} ${params.join(' ')}\x1b[${Logger.softReset}m`
      );
   }
   public info(...params: unknown[]): void {
      log(`${this.textPadding(this.getTimeFormatted(), 22)}${this.text} ${params.join(' ')}\x1b[${Logger.softReset}m`);
   }
   public getTimeFormatted(): string {
      const date = new Date();
      return `[${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`;
   }
   public textPadding(text: string, length: number, char = ' '): string {
      if (text.length >= length) return text.toString();
      return text + char.repeat(length - text.length);
   }
   public static readonly softReset = [
      //0,  // Hard Reset / Normal (all attributes off)
      21, // Bold off or Double Underline
      22, // Normal color or intensity
      23, // Not italic, not Fraktur
      24, // Underline off
      25, // Blink off
      27, // Inverse off
      28, // Reveal (conceal off)
      29, // Not crossed out
      39, // Default foreground color
      49, // Default background color
      54, // Not framed or encircled
      55, // Not overline
      65, // Ideogram attributes off
   ].join(';');
}
const logger = new Logger('WARNING');
setInterval(() => (Math.random() > 0.5 ? logger.log : logger.info).call(logger, 'Hello'), 3000);

/*
for (let i = 0; i < 120; i++) {
   console.log(`\x1b[${i}mHere is example test for ${i}\x1b[0m`);
}*/
