function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function globToRegex(pattern: string): RegExp {
  const parts = pattern.split('/');
  const regexParts = parts.map((part) => {
    if (part === '**') {
      return '.*';
    }
    
    let processed = part;
    
    // Handle brace patterns first (before escaping)
    processed = processed.replace(/\{([^}]+)\}/g, (_match, content) => {
      const alternatives = content.split(',').map((alt: string) => escapeRegex(alt.trim()));
      return `(${alternatives.join('|')})`;
    });
    
    // Replace ** wildcards
    processed = processed.replace(/\*\*/g, 'PLACEHOLDER_DOUBLE_STAR');
    
    // Replace * wildcards
    processed = processed.replace(/\*/g, 'PLACEHOLDER_SINGLE_STAR');
    
    // Escape all special characters
    processed = escapeRegex(processed);
    
    // Restore our placeholders with actual regex
    processed = processed.replace(/PLACEHOLDER_DOUBLE_STAR/g, '.*');
    processed = processed.replace(/PLACEHOLDER_SINGLE_STAR/g, '[^/]*');
    
    // Unescape the patterns we created from braces
    processed = processed.replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\|/g, '|');
    
    return processed;
  });

  const regexStr = `^${regexParts.join('/')}$`;
  return new RegExp(regexStr);
}

export function matchesGlob(filePath: string, pattern: string): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const regex = globToRegex(pattern);
  return regex.test(normalizedPath);
}

export function matchesAnyGlob(filePath: string, patterns: string[]): boolean {
  return patterns.some((pattern) => matchesGlob(filePath, pattern));
}
