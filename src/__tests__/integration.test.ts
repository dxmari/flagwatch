import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { run } from '../index';
import { ReporterOptions } from '../types';

describe('integration', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flagwatch-integration-'));
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should analyze a simple codebase with flags', () => {
    const srcDir = path.join(testDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });

    fs.writeFileSync(
      path.join(srcDir, 'app.ts'),
      `if (process.env.FEATURE_NEW_UI === 'true') {
  renderNewUI();
}

if (process.env.FEATURE_MISSING === 'true') {
  renderMissing();
}`
    );

    fs.writeFileSync(
      path.join(testDir, '.env'),
      `FEATURE_NEW_UI=true
FEATURE_UNUSED=false`
    );

    const reporterOptions: ReporterOptions = {
      ci: false,
      json: false,
      verbose: false,
    };

    const { result, exitCode } = run({
      rootPath: testDir,
      reporterOptions,
    });

    expect(exitCode).toBe(0);
    expect(result).toContain('Feature Flag Summary');
    expect(result).toContain('flags detected');
  });

  it('should generate JSON output', () => {
    const srcDir = path.join(testDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });

    fs.writeFileSync(
      path.join(srcDir, 'app.ts'),
      `if (process.env.FEATURE_TEST === 'true') {
  doSomething();
}`
    );

    const reporterOptions: ReporterOptions = {
      ci: false,
      json: true,
      verbose: false,
    };

    const { result, exitCode } = run({
      rootPath: testDir,
      reporterOptions,
    });

    expect(exitCode).toBe(0);
    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty('flagsDetected');
    expect(parsed).toHaveProperty('flagsUnused');
    expect(parsed).toHaveProperty('flagsMissing');
    expect(parsed).toHaveProperty('deadConditionals');
  });
});

