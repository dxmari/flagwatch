import { matchesGlob, matchesAnyGlob } from '../scanner/glob-matcher';

describe('glob-matcher', () => {
  describe('matchesGlob', () => {
    it('should match simple file patterns', () => {
      expect(matchesGlob('src/index.ts', 'src/index.ts')).toBe(true);
      expect(matchesGlob('src/index.ts', 'src/other.ts')).toBe(false);
    });

    it('should match wildcard patterns', () => {
      expect(matchesGlob('src/index.ts', 'src/*.ts')).toBe(true);
      expect(matchesGlob('src/utils/helper.ts', 'src/*.ts')).toBe(false);
      expect(matchesGlob('src/utils/helper.ts', 'src/**/*.ts')).toBe(true);
    });

    it('should match brace patterns', () => {
      expect(matchesGlob('src/index.ts', 'src/*.{ts,js}')).toBe(true);
      expect(matchesGlob('src/index.js', 'src/*.{ts,js}')).toBe(true);
      expect(matchesGlob('src/index.tsx', 'src/*.{ts,js}')).toBe(false);
    });

    it('should match recursive patterns', () => {
      expect(matchesGlob('src/utils/helper.ts', '**/*.ts')).toBe(true);
      expect(matchesGlob('src/utils/helper.ts', 'src/**/*.ts')).toBe(true);
    });
  });

  describe('matchesAnyGlob', () => {
    it('should return true if any pattern matches', () => {
      const patterns = ['src/*.ts', 'lib/*.js'];
      expect(matchesAnyGlob('src/index.ts', patterns)).toBe(true);
      expect(matchesAnyGlob('lib/index.js', patterns)).toBe(true);
      expect(matchesAnyGlob('src/index.js', patterns)).toBe(false);
    });
  });
});

