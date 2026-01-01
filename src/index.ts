import { FlagwatchConfig } from './types';
import { loadConfig } from './config/load-config';
import { scanFiles } from './scanner/scan-files';
import { detectFlagsInFile, detectFlagDefinitions } from './detector/detect-flags';
import { analyzeFlags } from './analyzer/analyze-flags';
import { reportResults } from './reporter/report-results';
import { ReporterOptions } from './types';
import { InternalError } from './errors';
import { createLogger } from './logger';

export interface RunOptions {
  config?: FlagwatchConfig;
  rootPath?: string;
  reporterOptions: ReporterOptions;
}

export function run(options: RunOptions): { result: string; exitCode: number } {
  const logger = createLogger(options.reporterOptions.verbose);
  const rootPath = options.rootPath || process.cwd();

  try {
    const config = options.config || loadConfig();

    logger.debug(`Scanning files in: ${rootPath}`);
    logger.debug(`Include patterns: ${config.include.join(', ')}`);
    logger.debug(`Exclude patterns: ${config.exclude.join(', ')}`);

    const files = scanFiles(rootPath, config.include, config.exclude);
    logger.debug(`Found ${files.length} files to analyze`);

    const allReferences: Array<{ name: string; file: string; line: number; column: number; pattern: string }> = [];
    const allDefinitions: Array<{ name: string; file: string; line: number; column: number }> = [];

    for (const file of files) {
      try {
        const references = detectFlagsInFile(file, config.flagPatterns, config.envVarPrefixes);
        allReferences.push(...references);

        const definitions = detectFlagDefinitions(file, config.envVarPrefixes);
        allDefinitions.push(...definitions);
      } catch (error) {
        logger.warn(`Failed to analyze file: ${file}`);
        if (options.reporterOptions.verbose && error instanceof Error) {
          logger.debug(error.message);
        }
      }
    }

    const analysisResult = analyzeFlags(files, allReferences, allDefinitions);
    const report = reportResults(analysisResult, options.reporterOptions);

    let exitCode = 0;
    if (config.strict) {
      if (
        analysisResult.flagsUnused.length > 0 ||
        analysisResult.flagsMissing.length > 0 ||
        analysisResult.deadConditionals.length > 0
      ) {
        exitCode = 1;
      }
    }

    return { result: report, exitCode };
  } catch (error) {
    if (error instanceof InternalError) {
      throw error;
    }
    throw new InternalError(
      `Internal error during analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

