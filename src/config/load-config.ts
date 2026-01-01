import * as fs from 'fs';
import * as path from 'path';
import { FlagwatchConfig } from '../types';
import { ConfigurationError } from '../errors';

const DEFAULT_CONFIG: FlagwatchConfig = {
  include: ['**/*.{ts,tsx,js,jsx}'],
  exclude: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  flagPatterns: [
    'process\\.env\\.([A-Z_]+)',
    'featureFlags\\.([a-zA-Z]+)',
    'flags\\.([a-zA-Z]+)',
    'config\\.flags\\.([a-zA-Z]+)',
    'isEnabled\\([\'"]([^\'"]+)[\'"]\\)',
  ],
  envVarPrefixes: ['FEATURE_', 'ENABLE_'],
  strict: false,
};

function readJsonFile(filePath: string): unknown {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new ConfigurationError(
      `Failed to read configuration file: ${filePath}`,
      filePath
    );
  }
}

function readJsFile(filePath: string): unknown {
  try {
    delete require.cache[require.resolve(filePath)];
    return require(filePath);
  } catch (error) {
    throw new ConfigurationError(
      `Failed to load JavaScript configuration file: ${filePath}`,
      filePath
    );
  }
}

function readPackageJson(): unknown {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }
  const packageJson = readJsonFile(packageJsonPath) as { flagwatch?: unknown };
  return packageJson.flagwatch || null;
}

function validateConfig(config: unknown): FlagwatchConfig {
  if (typeof config !== 'object' || config === null) {
    throw new ConfigurationError('Configuration must be an object');
  }

  const configObj = config as Record<string, unknown>;
  const result: FlagwatchConfig = { ...DEFAULT_CONFIG };

  if (Array.isArray(configObj.include)) {
    result.include = configObj.include.filter(
      (item): item is string => typeof item === 'string'
    );
  }

  if (Array.isArray(configObj.exclude)) {
    result.exclude = configObj.exclude.filter(
      (item): item is string => typeof item === 'string'
    );
  }

  if (Array.isArray(configObj.flagPatterns)) {
    result.flagPatterns = configObj.flagPatterns.filter(
      (item): item is string => typeof item === 'string'
    );
  }

  if (Array.isArray(configObj.envVarPrefixes)) {
    result.envVarPrefixes = configObj.envVarPrefixes.filter(
      (item): item is string => typeof item === 'string'
    );
  }

  if (typeof configObj.strict === 'boolean') {
    result.strict = configObj.strict;
  }

  return result;
}

export function loadConfig(configPath?: string, cliExcludes: string[] = []): FlagwatchConfig {
  let config: unknown = null;

  if (configPath) {
    const fullPath = path.isAbsolute(configPath)
      ? configPath
      : path.join(process.cwd(), configPath);

    if (!fs.existsSync(fullPath)) {
      throw new ConfigurationError(`Configuration file not found: ${fullPath}`, fullPath);
    }

    const ext = path.extname(fullPath);
    if (ext === '.json') {
      config = readJsonFile(fullPath);
    } else if (ext === '.js') {
      config = readJsFile(fullPath);
    } else {
      throw new ConfigurationError(
        `Unsupported configuration file format: ${ext}`,
        fullPath
      );
    }
  } else {
    const configJsonPath = path.join(process.cwd(), 'flagwatch.config.json');
    const configJsPath = path.join(process.cwd(), 'flagwatch.config.js');

    if (fs.existsSync(configJsonPath)) {
      config = readJsonFile(configJsonPath);
    } else if (fs.existsSync(configJsPath)) {
      config = readJsFile(configJsPath);
    } else {
      const packageJsonConfig = readPackageJson();
      if (packageJsonConfig) {
        config = packageJsonConfig;
      }
    }
  }

  const finalConfig = config ? validateConfig(config) : DEFAULT_CONFIG;

  if (cliExcludes.length > 0) {
    finalConfig.exclude = [...finalConfig.exclude, ...cliExcludes];
  }

  return finalConfig;
}

