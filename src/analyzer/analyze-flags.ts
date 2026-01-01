import * as fs from 'fs';
import { FlagReference, FlagDefinition, DeadConditional, AnalysisResult } from '../types';

function findUnusedFlags(
  definitions: FlagDefinition[],
  references: FlagReference[]
): FlagDefinition[] {
  const referencedNames = new Set(references.map((ref) => ref.name));
  return definitions.filter((def) => !referencedNames.has(def.name));
}

function findMissingFlags(
  definitions: FlagDefinition[],
  references: FlagReference[]
): FlagReference[] {
  const definedNames = new Set(definitions.map((def) => def.name));
  return references.filter((ref) => !definedNames.has(ref.name));
}

function detectDeadConditionals(filePath: string): DeadConditional[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const deadConditionals: DeadConditional[] = [];

  const alwaysTruePattern = /if\s*\(\s*(true|1|"true"|'true')\s*\)/g;
  let match: RegExpMatchArray | null;

  while ((match = alwaysTruePattern.exec(content)) !== null) {
    if (match.index === undefined) {
      continue;
    }

    const beforeMatch = content.substring(0, match.index);
    const lines = beforeMatch.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;

    deadConditionals.push({
      file: filePath,
      line,
      column,
      condition: match[0],
      alwaysTrue: true,
      alwaysFalse: false,
    });
  }

  const alwaysFalsePattern = /if\s*\(\s*(false|0|"false"|'false'|null|undefined)\s*\)/g;
  while ((match = alwaysFalsePattern.exec(content)) !== null) {
    if (match.index === undefined) {
      continue;
    }

    const beforeMatch = content.substring(0, match.index);
    const lines = beforeMatch.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;

    deadConditionals.push({
      file: filePath,
      line,
      column,
      condition: match[0],
      alwaysTrue: false,
      alwaysFalse: true,
    });
  }

  const constTruePattern = /const\s+([A-Z_][A-Z0-9_]*)\s*=\s*(true|1|"true"|'true')\s*;[\s\S]*?if\s*\(\s*\1\s*\)/g;
  while ((match = constTruePattern.exec(content)) !== null) {
    if (match.index === undefined || !match[1]) {
      continue;
    }

    const beforeMatch = content.substring(0, match.index);
    const lines = beforeMatch.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;

    deadConditionals.push({
      file: filePath,
      line,
      column,
      condition: `const ${match[1]} = ${match[2]}`,
      alwaysTrue: true,
      alwaysFalse: false,
    });
  }

  const constFalsePattern = /const\s+([A-Z_][A-Z0-9_]*)\s*=\s*(false|0|"false"|'false')\s*;[\s\S]*?if\s*\(\s*\1\s*\)/g;
  while ((match = constFalsePattern.exec(content)) !== null) {
    if (match.index === undefined || !match[1]) {
      continue;
    }

    const beforeMatch = content.substring(0, match.index);
    const lines = beforeMatch.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;

    deadConditionals.push({
      file: filePath,
      line,
      column,
      condition: `const ${match[1]} = ${match[2]}`,
      alwaysTrue: false,
      alwaysFalse: true,
    });
  }

  return deadConditionals;
}

export function analyzeFlags(
  files: string[],
  references: FlagReference[],
  definitions: FlagDefinition[]
): AnalysisResult {
  const sortedReferences = [...references].sort((a, b) => {
    if (a.file !== b.file) {
      return a.file.localeCompare(b.file);
    }
    if (a.line !== b.line) {
      return a.line - b.line;
    }
    return a.column - b.column;
  });

  const sortedDefinitions = [...definitions].sort((a, b) => {
    if (a.file !== b.file) {
      return a.file.localeCompare(b.file);
    }
    if (a.line !== b.line) {
      return a.line - b.line;
    }
    return a.column - b.column;
  });

  const unusedFlags = findUnusedFlags(sortedDefinitions, sortedReferences);
  const missingFlags = findMissingFlags(sortedDefinitions, sortedReferences);

  const allDeadConditionals: DeadConditional[] = [];
  for (const file of files) {
    try {
      const deadConditionals = detectDeadConditionals(file);
      allDeadConditionals.push(...deadConditionals);
    } catch {
      // Skip files that can't be read
    }
  }

  const uniqueFlags = new Set(references.map((ref) => ref.name));
  const flagsDetected = uniqueFlags.size;

  return {
    flagsDetected,
    flagsUnused: unusedFlags,
    flagsMissing: missingFlags,
    deadConditionals: allDeadConditionals,
    allFlags: sortedReferences,
  };
}

