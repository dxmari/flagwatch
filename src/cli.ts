#!/usr/bin/env node

import { parseArgs, printHelp, printVersion } from './cli/parse-args';
import { loadConfig } from './config/load-config';
import { run } from './index';
import { ReporterOptions } from './types';
import { InternalError, ConfigurationError } from './errors';
import { createLogger } from './logger';

const EXIT_CODE_SUCCESS = 0;
const EXIT_CODE_POLICY_VIOLATION = 1;
const EXIT_CODE_INTERNAL_FAILURE = 2;

function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    printHelp();
    process.exit(EXIT_CODE_SUCCESS);
  }

  if (options.version) {
    printVersion();
    process.exit(EXIT_CODE_SUCCESS);
  }

  const reporterOptions: ReporterOptions = {
    ci: options.ci,
    json: options.json,
    verbose: options.verbose,
  };

  try {
    const config = loadConfig(options.config, options.ignore);

    const { result, exitCode } = run({
      config,
      reporterOptions,
    });

    console.log(result);

    if (exitCode === EXIT_CODE_POLICY_VIOLATION && !config.strict) {
      process.exit(EXIT_CODE_SUCCESS);
    } else {
      process.exit(exitCode);
    }
  } catch (error) {
    const logger = createLogger(options.verbose);

    if (error instanceof ConfigurationError) {
      logger.error(`Configuration error: ${error.message}`);
      if (error.configPath) {
        logger.error(`Config path: ${error.configPath}`);
      }
      process.exit(EXIT_CODE_INTERNAL_FAILURE);
    } else if (error instanceof InternalError) {
      logger.error(`Internal error: ${error.message}`);
      if (options.verbose && error.cause) {
        logger.debug(`Cause: ${error.cause.message}`);
      }
      process.exit(EXIT_CODE_INTERNAL_FAILURE);
    } else {
      logger.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(EXIT_CODE_INTERNAL_FAILURE);
    }
  }
}

main();

