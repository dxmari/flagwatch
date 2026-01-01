import { reportResults } from '../reporter/report-results';
import { AnalysisResult, ReporterOptions } from '../types';

describe('reporter', () => {
  const baseResult: AnalysisResult = {
    flagsDetected: 5,
    flagsUnused: [],
    flagsMissing: [],
    deadConditionals: [],
    allFlags: [],
  };

  it('should generate JSON output', () => {
    const options: ReporterOptions = { ci: false, json: true, verbose: false };
    const output = reportResults(baseResult, options);
    const parsed = JSON.parse(output);
    expect(parsed.flagsDetected).toBe(5);
  });

  it('should generate human-readable output', () => {
    const options: ReporterOptions = { ci: false, json: false, verbose: false };
    const output = reportResults(baseResult, options);
    expect(output).toContain('Feature Flag Summary');
    expect(output).toContain('5 flags detected');
  });

  it('should not include emojis in CI mode', () => {
    const options: ReporterOptions = { ci: true, json: false, verbose: false };
    const output = reportResults(baseResult, options);
    expect(output).not.toContain('🚩');
    expect(output).not.toContain('✅');
  });

  it('should include details in verbose mode', () => {
    const result: AnalysisResult = {
      ...baseResult,
      flagsUnused: [
        { name: 'FEATURE_TEST', file: 'test.ts', line: 1, column: 1 },
      ],
    };
    const options: ReporterOptions = { ci: false, json: false, verbose: true };
    const output = reportResults(result, options);
    expect(output).toContain('Details:');
    expect(output).toContain('FEATURE_TEST');
  });
});

