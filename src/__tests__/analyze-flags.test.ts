import { analyzeFlags } from '../analyzer/analyze-flags';
import { FlagReference, FlagDefinition } from '../types';

describe('analyze-flags', () => {
  it('should identify unused flags', () => {
    const files = ['src/test.ts'];
    const references: FlagReference[] = [];
    const definitions: FlagDefinition[] = [
      { name: 'FEATURE_UNUSED', file: '.env', line: 1, column: 1 },
    ];

    const result = analyzeFlags(files, references, definitions);
    expect(result.flagsUnused).toHaveLength(1);
    expect(result.flagsUnused[0].name).toBe('FEATURE_UNUSED');
  });

  it('should identify missing flags', () => {
    const files = ['src/test.ts'];
    const references: FlagReference[] = [
      { name: 'FEATURE_MISSING', file: 'src/test.ts', line: 1, column: 1, pattern: '' },
    ];
    const definitions: FlagDefinition[] = [];

    const result = analyzeFlags(files, references, definitions);
    expect(result.flagsMissing).toHaveLength(1);
    expect(result.flagsMissing[0].name).toBe('FEATURE_MISSING');
  });

  it('should count unique flags', () => {
    const files = ['src/test.ts'];
    const references: FlagReference[] = [
      { name: 'FEATURE_A', file: 'src/test.ts', line: 1, column: 1, pattern: '' },
      { name: 'FEATURE_A', file: 'src/test.ts', line: 2, column: 1, pattern: '' },
      { name: 'FEATURE_B', file: 'src/test.ts', line: 3, column: 1, pattern: '' },
    ];
    const definitions: FlagDefinition[] = [];

    const result = analyzeFlags(files, references, definitions);
    expect(result.flagsDetected).toBe(2);
  });
});

