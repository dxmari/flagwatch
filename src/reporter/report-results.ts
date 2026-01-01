import { AnalysisResult, ReporterOptions } from '../types';

function formatJsonResult(result: AnalysisResult): string {
  return JSON.stringify(result, null, 2);
}

function formatHumanReadable(result: AnalysisResult, options: ReporterOptions): string {
  const lines: string[] = [];

  if (!options.ci) {
    lines.push('🚩 Feature Flag Summary');
    lines.push('');
  } else {
    lines.push('Feature Flag Summary');
    lines.push('');
  }

  lines.push(`• ${result.flagsDetected} flags detected`);

  if (result.flagsUnused.length > 0) {
    lines.push(`• ${result.flagsUnused.length} flags never enabled anywhere`);
  }

  if (result.flagsMissing.length > 0) {
    lines.push(`• ${result.flagsMissing.length} flags referenced but undefined`);
  }

  if (result.deadConditionals.length > 0) {
    const alwaysTrue = result.deadConditionals.filter((dc) => dc.alwaysTrue).length;
    const alwaysFalse = result.deadConditionals.filter((dc) => dc.alwaysFalse).length;
    lines.push(`• ${alwaysTrue} flag always true (dead conditional)`);
    if (alwaysFalse > 0) {
      lines.push(`• ${alwaysFalse} flag always false (dead conditional)`);
    }
  }

  if (result.flagsUnused.length === 0 && result.flagsMissing.length === 0 && result.deadConditionals.length === 0) {
    lines.push('');
    if (!options.ci) {
      lines.push('✅ No issues detected');
    } else {
      lines.push('No issues detected');
    }
  } else {
    lines.push('');
    lines.push('Review recommended');
  }

  if (options.verbose) {
    lines.push('');
    lines.push('Details:');
    lines.push('');

    if (result.flagsUnused.length > 0) {
      lines.push('Unused flags:');
      for (const flag of result.flagsUnused) {
        lines.push(`  - ${flag.name} (${flag.file}:${flag.line})`);
      }
      lines.push('');
    }

    if (result.flagsMissing.length > 0) {
      lines.push('Missing flags:');
      for (const flag of result.flagsMissing) {
        lines.push(`  - ${flag.name} (${flag.file}:${flag.line})`);
      }
      lines.push('');
    }

    if (result.deadConditionals.length > 0) {
      lines.push('Dead conditionals:');
      for (const dc of result.deadConditionals) {
        const type = dc.alwaysTrue ? 'always true' : 'always false';
        lines.push(`  - ${dc.file}:${dc.line} (${type})`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

export function reportResults(result: AnalysisResult, options: ReporterOptions): string {
  if (options.json) {
    return formatJsonResult(result);
  }
  return formatHumanReadable(result, options);
}

