export class FlagwatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FlagwatchError';
    Object.setPrototypeOf(this, FlagwatchError.prototype);
  }
}

export class ConfigurationError extends FlagwatchError {
  constructor(message: string, public readonly configPath?: string) {
    super(message);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

export class FileScanError extends FlagwatchError {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'FileScanError';
    Object.setPrototypeOf(this, FileScanError.prototype);
  }
}

export class ParseError extends FlagwatchError {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly line?: number,
    public readonly column?: number
  ) {
    super(message);
    this.name = 'ParseError';
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}

export class InternalError extends FlagwatchError {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'InternalError';
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}

