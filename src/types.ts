export interface FlagwatchConfig {
  include: string[];
  exclude: string[];
  flagPatterns: string[];
  envVarPrefixes: string[];
  strict: boolean;
}

export interface FlagReference {
  name: string;
  file: string;
  line: number;
  column: number;
  pattern: string;
}

export interface FlagDefinition {
  name: string;
  file: string;
  line: number;
  column: number;
}

export interface DeadConditional {
  file: string;
  line: number;
  column: number;
  condition: string;
  alwaysTrue: boolean;
  alwaysFalse: boolean;
}

export interface AnalysisResult {
  flagsDetected: number;
  flagsUnused: FlagDefinition[];
  flagsMissing: FlagReference[];
  deadConditionals: DeadConditional[];
  allFlags: FlagReference[];
}

export interface CliOptions {
  ci: boolean;
  json: boolean;
  config?: string;
  ignore: string[];
  strict: boolean;
  verbose: boolean;
  help: boolean;
  version: boolean;
}

export interface ReporterOptions {
  ci: boolean;
  json: boolean;
  verbose: boolean;
}

