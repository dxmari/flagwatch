export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface Logger {
  error(message: string): void;
  warn(message: string): void;
  info(message: string): void;
  debug(message: string): void;
}

class ConsoleLogger implements Logger {
  constructor(private readonly level: LogLevel, private readonly verbose: boolean) {}

  error(message: string): void {
    if (this.level >= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`);
    }
  }

  warn(message: string): void {
    if (this.level >= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`);
    }
  }

  info(message: string): void {
    if (this.level >= LogLevel.INFO) {
      console.log(`[INFO] ${message}`);
    }
  }

  debug(message: string): void {
    if (this.verbose && this.level >= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${message}`);
    }
  }
}

export function createLogger(verbose: boolean = false): Logger {
  return new ConsoleLogger(LogLevel.INFO, verbose);
}

export function createSilentLogger(): Logger {
  return new ConsoleLogger(LogLevel.ERROR, false);
}

