import * as fs from 'fs';
import * as path from 'path';
import { matchesAnyGlob } from './glob-matcher';
import { FileScanError } from '../errors';

function shouldIncludeFile(
  filePath: string,
  includePatterns: string[],
  excludePatterns: string[]
): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  if (excludePatterns.length > 0 && matchesAnyGlob(normalizedPath, excludePatterns)) {
    return false;
  }

  if (includePatterns.length === 0) {
    return true;
  }

  return matchesAnyGlob(normalizedPath, includePatterns);
}

function scanDirectory(
  dirPath: string,
  includePatterns: string[],
  excludePatterns: string[],
  files: string[]
): void {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    const sortedEntries = entries.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    for (const entry of sortedEntries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (shouldIncludeFile(fullPath, includePatterns, excludePatterns)) {
          scanDirectory(fullPath, includePatterns, excludePatterns, files);
        }
      } else if (entry.isFile()) {
        if (shouldIncludeFile(fullPath, includePatterns, excludePatterns)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    throw new FileScanError(
      `Failed to scan directory: ${dirPath}`,
      dirPath,
      error instanceof Error ? error : undefined
    );
  }
}

export function scanFiles(
  rootPath: string,
  includePatterns: string[],
  excludePatterns: string[]
): string[] {
  const files: string[] = [];

  if (!fs.existsSync(rootPath)) {
    throw new FileScanError(`Root path does not exist: ${rootPath}`, rootPath);
  }

  const stats = fs.statSync(rootPath);
  if (stats.isFile()) {
    if (shouldIncludeFile(rootPath, includePatterns, excludePatterns)) {
      files.push(rootPath);
    }
    return files;
  }

  scanDirectory(rootPath, includePatterns, excludePatterns, files);

  return files.sort();
}

