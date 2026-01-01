import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { detectFlagsInFile, detectFlagDefinitions } from '../detector/detect-flags';

describe('detect-flags', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flagwatch-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('detectFlagsInFile', () => {
    it('should detect process.env flags', () => {
      const testFile = path.join(testDir, 'test.ts');
      fs.writeFileSync(
        testFile,
        `if (process.env.FEATURE_NEW_UI === 'true') {
  renderNewUI();
}`
      );

      const flags = detectFlagsInFile(testFile, ['process\\.env\\.([A-Z_]+)'], ['FEATURE_']);
      expect(flags).toHaveLength(1);
      expect(flags[0].name).toBe('FEATURE_NEW_UI');
    });

    it('should filter by envVarPrefixes', () => {
      const testFile = path.join(testDir, 'test.ts');
      fs.writeFileSync(
        testFile,
        `if (process.env.NODE_ENV === 'production') {
  // This should not be detected
}
if (process.env.FEATURE_TEST === 'true') {
  // This should be detected
}`
      );

      const flags = detectFlagsInFile(testFile, ['process\\.env\\.([A-Z_]+)'], ['FEATURE_']);
      expect(flags).toHaveLength(1);
      expect(flags[0].name).toBe('FEATURE_TEST');
    });

    it('should detect featureFlags patterns', () => {
      const testFile = path.join(testDir, 'test.ts');
      fs.writeFileSync(
        testFile,
        `if (featureFlags.newDashboard) {
  renderDashboard();
}`
      );

      const flags = detectFlagsInFile(testFile, ['featureFlags\\.([a-zA-Z]+)'], []);
      expect(flags).toHaveLength(1);
      expect(flags[0].name).toBe('newDashboard');
    });
  });

  describe('detectFlagDefinitions', () => {
    it('should detect flag definitions in .env files', () => {
      const testFile = path.join(testDir, '.env');
      fs.writeFileSync(
        testFile,
        `FEATURE_NEW_UI=true
ENABLE_ANALYTICS=false
NODE_ENV=production`
      );

      const definitions = detectFlagDefinitions(testFile, ['FEATURE_', 'ENABLE_']);
      expect(definitions.length).toBeGreaterThanOrEqual(2);
      const names = definitions.map((d) => d.name);
      expect(names).toContain('FEATURE_NEW_UI');
      expect(names).toContain('ENABLE_ANALYTICS');
      expect(names).not.toContain('NODE_ENV');
    });
  });
});

