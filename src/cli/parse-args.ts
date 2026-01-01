import { CliOptions } from '../types';

export function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    ci: false,
    json: false,
    ignore: [],
    strict: false,
    verbose: false,
    help: false,
    version: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--ci') {
      options.ci = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--config' && i + 1 < args.length) {
      options.config = args[i + 1];
      i++;
    } else if (arg === '--ignore' && i + 1 < args.length) {
      options.ignore.push(args[i + 1]);
      i++;
    } else if (arg === '--strict') {
      options.strict = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--version' || arg === '-v') {
      options.version = true;
    }

    i++;
  }

  return options;
}

export function printHelp(): void {
  console.log(`
Flagwatch - CI-first visibility into feature flags

Usage:
  npx flagwatch [options]

Options:
  --ci              CI-friendly output (no emojis, deterministic)
  --json            Machine-readable JSON output
  --config <path>   Path to configuration file
  --ignore <pattern> Ignore file patterns (can be used multiple times)
  --strict          Enable strict mode (future: exit 1 on violations)
  --verbose         Verbose output for debugging
  --help, -h        Show this help message
  --version, -v     Show version number

Examples:
  npx flagwatch
  npx flagwatch --ci
  npx flagwatch --json > flags.json
  npx flagwatch --config flagwatch.config.json
  npx flagwatch --ignore "**/test/**" --ignore "**/node_modules/**"

Exit Codes:
  0  Success
  1  Policy violation (future)
  2  Internal failure

For more information, see: https://github.com/dxmari/flagwatch
`);
}

import * as fs from 'fs';
import * as path from 'path';

export function printVersion(): void {
  const packageJsonPath = path.join(__dirname, '../../package.json');
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(packageJsonContent) as { version: string };
  console.log(packageJson.version);
}

