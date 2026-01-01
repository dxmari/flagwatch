import * as fs from 'fs';
import { FlagReference, FlagDefinition } from '../types';
import { ParseError } from '../errors';

function getLineAndColumn(content: string, index: number): { line: number; column: number } {
  const beforeMatch = content.substring(0, index);
  const lines = beforeMatch.split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

function extractFlagName(match: RegExpMatchArray, patternIndex: number): string | null {
  if (match.length > patternIndex + 1 && match[patternIndex + 1]) {
    return match[patternIndex + 1];
  }
  return null;
}

export function detectFlagsInFile(
  filePath: string,
  flagPatterns: string[],
  envVarPrefixes: string[]
): FlagReference[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const flags: FlagReference[] = [];

  for (const patternStr of flagPatterns) {
    try {
      const regex = new RegExp(patternStr, 'g');
      let match: RegExpMatchArray | null;

      while ((match = regex.exec(content)) !== null) {
        if (match.index === undefined) {
          continue;
        }

        const flagName = extractFlagName(match, 0);
        if (!flagName) {
          continue;
        }

        const { line, column } = getLineAndColumn(content, match.index);

        if (patternStr.includes('process\\.env')) {
          if (!envVarPrefixes.some((prefix) => flagName.startsWith(prefix))) {
            continue;
          }
        }

        flags.push({
          name: flagName,
          file: filePath,
          line,
          column,
          pattern: patternStr,
        });
      }
    } catch (error) {
      throw new ParseError(
        `Failed to parse pattern: ${patternStr}`,
        filePath,
        undefined,
        undefined
      );
    }
  }

  return flags;
}

export function detectFlagDefinitions(
  filePath: string,
  envVarPrefixes: string[]
): FlagDefinition[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const definitions: FlagDefinition[] = [];

  const envVarPattern = /(?:^|\s)([A-Z_][A-Z0-9_]*)\s*=/gm;
  let match: RegExpMatchArray | null;

  while ((match = envVarPattern.exec(content)) !== null) {
    if (match.index === undefined || !match[1]) {
      continue;
    }

    const varName = match[1];
    if (envVarPrefixes.some((prefix) => varName.startsWith(prefix))) {
      const { line, column } = getLineAndColumn(content, match.index);
      definitions.push({
        name: varName,
        file: filePath,
        line,
        column,
      });
    }
  }

  const dotEnvPattern = /^([A-Z_][A-Z0-9_]*)\s*=/gm;
  while ((match = dotEnvPattern.exec(content)) !== null) {
    if (match.index === undefined || !match[1]) {
      continue;
    }

    const varName = match[1];
    if (envVarPrefixes.some((prefix) => varName.startsWith(prefix))) {
      const { line, column } = getLineAndColumn(content, match.index);
      definitions.push({
        name: varName,
        file: filePath,
        line,
        column,
      });
    }
  }

  return definitions;
}

