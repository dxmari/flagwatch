# Configuration Reference

Flagwatch can be configured via a configuration file or command-line flags. Configuration files take precedence over defaults, and command-line flags override configuration files.

---

## Configuration File Location

Flagwatch looks for configuration files in the following order:

1. Path specified by `--config` flag
2. `flagwatch.config.json` in project root
3. `flagwatch.config.js` in project root
4. `flagwatch.config.yaml` in project root (future)
5. `flagwatch` field in `package.json`

---

## Configuration File Formats

### JSON Configuration

Create `flagwatch.config.json`:

```json
{
  "include": ["src/**/*.{ts,tsx,js,jsx}"],
  "exclude": ["**/node_modules/**", "**/dist/**"],
  "flagPatterns": [
    "process\\.env\\.([A-Z_]+)",
    "featureFlags\\.([a-zA-Z]+)"
  ],
  "envVarPrefixes": ["FEATURE_", "ENABLE_"],
  "strict": false
}
```

### JavaScript Configuration

Create `flagwatch.config.js`:

```javascript
module.exports = {
  include: ['src/**/*.{ts,tsx,js,jsx}'],
  exclude: ['**/node_modules/**', '**/dist/**'],
  flagPatterns: [
    /process\.env\.([A-Z_]+)/,
    /featureFlags\.([a-zA-Z]+)/,
  ],
  envVarPrefixes: ['FEATURE_', 'ENABLE_'],
  strict: false,
};
```

### Package.json Configuration

Add to `package.json`:

```json
{
  "name": "my-project",
  "flagwatch": {
    "include": ["src/**/*.{ts,tsx}"],
    "exclude": ["**/test/**"],
    "flagPatterns": ["process\\.env\\.([A-Z_]+)"]
  }
}
```

---

## Configuration Options

### `include`

**Type:** `string[]`  
**Default:** `["**/*.{ts,tsx,js,jsx}"]`  
**Description:** File patterns to include in analysis.

**Examples:**

```json
{
  "include": [
    "src/**/*.{ts,tsx}",
    "lib/**/*.js",
    "app/**/*.{js,jsx}"
  ]
}
```

**Pattern syntax:**
- Uses glob patterns (same as `.gitignore`)
- `**` matches any directory depth
- `*` matches any characters except `/`
- `{ext1,ext2}` matches multiple extensions

---

### `exclude`

**Type:** `string[]`  
**Default:** `["**/node_modules/**", "**/dist/**", "**/build/**"]`  
**Description:** File patterns to exclude from analysis.

**Examples:**

```json
{
  "exclude": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/coverage/**"
  ]
}
```

**Note:** Exclude patterns take precedence over include patterns.

---

### `flagPatterns`

**Type:** `string[]` (regex patterns) or `RegExp[]` (JavaScript config)  
**Default:** See below  
**Description:** Regular expressions to detect feature flags in code.

**Default patterns:**

```json
{
  "flagPatterns": [
    "process\\.env\\.([A-Z_]+)",
    "featureFlags\\.([a-zA-Z]+)",
    "flags\\.([a-zA-Z]+)",
    "config\\.flags\\.([a-zA-Z]+)",
    "isEnabled\\(['\"]([^'\"]+)['\"]\\)"
  ]
}
```

**Custom patterns:**

```json
{
  "flagPatterns": [
    "process\\.env\\.([A-Z_]+)",
    "getFlag\\(['\"]([^'\"]+)['\"]\\)",
    "FeatureToggle\\.([a-zA-Z]+)"
  ]
}
```

**Pattern requirements:**
- Must include a capture group `()` for the flag name
- Use `\\.` to match literal dots
- Use `['\"]` to match single or double quotes
- Use `[^'\"]+` to match flag names (non-quote characters)

**JavaScript config with RegExp:**

```javascript
module.exports = {
  flagPatterns: [
    /process\.env\.([A-Z_]+)/,
    /getFlag\(['"]([^'"]+)['"]\)/,
    /FeatureToggle\.([a-zA-Z]+)/,
  ],
};
```

---

### `envVarPrefixes`

**Type:** `string[]`  
**Default:** `["FEATURE_", "ENABLE_"]`  
**Description:** Prefixes for environment variables to consider as feature flags.

**Examples:**

```json
{
  "envVarPrefixes": [
    "FEATURE_",
    "ENABLE_",
    "FLAG_",
    "TOGGLE_"
  ]
}
```

**Behavior:**
- Only environment variables matching these prefixes are analyzed
- Variables like `process.env.FEATURE_NEW_UI` will be detected
- Variables like `process.env.NODE_ENV` will be ignored (unless prefix matches)

---

### `strict`

**Type:** `boolean`  
**Default:** `false`  
**Description:** Enable strict mode (future feature).

**Current behavior:**
- When `false`: Always exits with code `0` (informational only)
- When `true`: Will exit with code `1` on violations (future)

**Example:**

```json
{
  "strict": false
}
```

---

## Advanced Configuration

### Monorepo Configuration

For monorepos, configure per-package:

```json
{
  "include": ["packages/*/src/**/*.{ts,tsx}"],
  "exclude": [
    "**/node_modules/**",
    "packages/*/dist/**",
    "packages/*/build/**"
  ]
}
```

### TypeScript-Only Projects

```json
{
  "include": ["src/**/*.{ts,tsx}"],
  "exclude": [
    "**/node_modules/**",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

### JavaScript-Only Projects

```json
{
  "include": ["src/**/*.{js,jsx}"],
  "exclude": [
    "**/node_modules/**",
    "**/dist/**",
    "**/*.test.js"
  ]
}
```

### Custom Flag Detection

Detect flags from a custom feature flag library:

```json
{
  "flagPatterns": [
    "process\\.env\\.([A-Z_]+)",
    "myFlagLib\\.isEnabled\\(['\"]([^'\"]+)['\"]\\)",
    "FeatureFlags\\.get\\(['\"]([^'\"]+)['\"]\\)"
  ]
}
```

---

## Command-Line Overrides

Command-line flags override configuration file settings:

```bash
# Override include patterns
npx flagwatch --ignore "**/test/**" --ignore "**/node_modules/**"

# Use different config file
npx flagwatch --config .flagwatchrc.json

# Override strict mode
npx flagwatch --strict
```

---

## Environment Variables

Some configuration can be set via environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `FLAGWATCH_CONFIG` | Path to config file | `FLAGWATCH_CONFIG=.flagwatchrc.json npx flagwatch` |
| `FLAGWATCH_STRICT` | Enable strict mode | `FLAGWATCH_STRICT=true npx flagwatch` |

---

## Configuration Validation

Flagwatch validates configuration and reports errors:

```bash
# Invalid config will show error
npx flagwatch --config invalid.config.json

# Error: Invalid configuration: "include" must be an array
```

**Common validation errors:**
- `include` must be an array of strings
- `exclude` must be an array of strings
- `flagPatterns` must be an array of strings or RegExp
- `envVarPrefixes` must be an array of strings
- `strict` must be a boolean

---

## Configuration Examples

### Minimal Configuration

```json
{
  "include": ["src/**/*.ts"]
}
```

### Comprehensive Configuration

```json
{
  "include": [
    "src/**/*.{ts,tsx,js,jsx}",
    "lib/**/*.{ts,js}"
  ],
  "exclude": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/*.test.{ts,js}",
    "**/*.spec.{ts,js}",
    "**/coverage/**",
    "**/__tests__/**"
  ],
  "flagPatterns": [
    "process\\.env\\.([A-Z_]+)",
    "featureFlags\\.([a-zA-Z]+)",
    "flags\\.([a-zA-Z]+)",
    "isEnabled\\(['\"]([^'\"]+)['\"]\\)"
  ],
  "envVarPrefixes": [
    "FEATURE_",
    "ENABLE_",
    "FLAG_"
  ],
  "strict": false
}
```

---

## Best Practices

1. **Exclude test files** - Tests often use flags differently than production code
2. **Exclude build outputs** - No need to analyze compiled code
3. **Use specific patterns** - Narrow flag patterns reduce false positives
4. **Version control config** - Commit `flagwatch.config.json` to your repo
5. **Document custom patterns** - Add comments explaining custom flag patterns

---

## Migration Guide

### From Defaults to Config File

If you've been using defaults and want to customize:

1. Create `flagwatch.config.json`
2. Start with minimal config (just `include`)
3. Add exclusions as needed
4. Refine flag patterns based on your codebase

### Updating Existing Config

When updating configuration:

1. Test with `--verbose` to see what's being scanned
2. Verify patterns match your code style
3. Check exclude patterns aren't too broad
4. Validate with `--config` flag before committing

