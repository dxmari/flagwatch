# Flagwatch

> **CI-first visibility into feature flags and conditional code paths**  
> Detect unused, missing, and misleading flags *before* they turn into dead code or risky releases.

---

## Why Flagwatch?

Modern codebases rely heavily on feature flags, environment-based conditionals, and rollout toggles.

Over time, teams lose clarity on:
- Which flags are **still active**
- Which flags are **never enabled**
- Which flags are **referenced but undefined**
- Which conditionals are **always true or always false**

This leads to:
- Dead or unreachable code
- Confusing PR reviews
- Risky refactors
- Silent production bugs

**Flagwatch exists to make conditional logic visible, reviewable, and trustworthy.**

---

## What Flagwatch Does

Flagwatch statically analyzes your codebase and extracts feature-flag usage from conditional logic.

It produces a **clear, human-readable summary** focused on *what actually matters*.

Example output:

```
🚩 Feature Flag Summary

• 11 flags detected
• 3 flags never enabled anywhere
• 2 flags referenced but undefined
• 1 flag always true (dead conditional)

Review recommended
```

---

## Core Features

- 🔍 Detects feature flags in conditional logic
- ❌ Identifies flags that are never enabled
- ⚠️ Flags always-true / always-false conditionals
- 🧠 Static, deterministic analysis (no execution)
- 🤖 CI-first, PR-friendly design

---

## Installation

No global installation required.

```bash
npx flagwatch
```

---

## Usage

### Local Usage

```bash
npx flagwatch
```

Prints a feature-flag summary to stdout.

---

### CI Usage (Primary)

Flagwatch is designed to run in CI and surface conditional-risk early.

```yaml
- name: Flagwatch
  run: npx flagwatch --ci
```

See [CI Integration Guide](ci-integration.md) for detailed setup instructions.

---

## CLI Flags

### Core Flags

| Flag | Description | Example |
|------|-------------|---------|
| `--ci` | CI-friendly output (no emojis, deterministic) | `npx flagwatch --ci` |
| `--json` | Machine-readable JSON output | `npx flagwatch --json` |
| `--config <path>` | Path to configuration file | `npx flagwatch --config flagwatch.config.json` |
| `--ignore <pattern>` | Ignore file patterns (can be used multiple times) | `npx flagwatch --ignore "**/test/**"` |
| `--strict` | Enable strict mode (future: exit 1 on violations) | `npx flagwatch --strict` |
| `--verbose` | Verbose output for debugging | `npx flagwatch --verbose` |
| `--help` | Show help message | `npx flagwatch --help` |
| `--version` | Show version number | `npx flagwatch --version` |

### Usage Examples

```bash
# Basic usage
npx flagwatch

# CI mode with custom config
npx flagwatch --ci --config .flagwatchrc.json

# Ignore multiple patterns
npx flagwatch --ignore "**/test/**" --ignore "**/node_modules/**" --ignore "**/*.spec.ts"

# JSON output for scripting
npx flagwatch --json > flags.json

# Verbose mode for debugging
npx flagwatch --verbose
```

---

## Configuration

Flagwatch supports configuration via a configuration file or command-line flags.

### Configuration File

Create a `flagwatch.config.json` file in your project root:

```json
{
  "include": ["src/**/*.{ts,tsx,js,jsx}"],
  "exclude": ["**/node_modules/**", "**/dist/**", "**/*.test.ts"],
  "flagPatterns": [
    "process\\.env\\.([A-Z_]+)",
    "featureFlags\\.([a-zA-Z]+)",
    "isEnabled\\(['\"]([^'\"]+)['\"]\\)"
  ],
  "envVarPrefixes": ["FEATURE_", "ENABLE_"],
  "strict": false
}
```

### Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `include` | `string[]` | File patterns to scan | `["**/*.{ts,tsx,js,jsx}"]` |
| `exclude` | `string[]` | File patterns to ignore | `["**/node_modules/**", "**/dist/**"]` |
| `flagPatterns` | `string[]` | Regex patterns for flag detection | See defaults below |
| `envVarPrefixes` | `string[]` | Environment variable prefixes | `["FEATURE_", "ENABLE_"]` |
| `strict` | `boolean` | Enable strict mode (future) | `false` |

### Default Flag Patterns

Flagwatch automatically detects:
- `process.env.*` expressions
- Common feature flag patterns (`featureFlags.*`, `flags.*`, `config.*`)
- Conditional expressions in `if`, `ternary`, and `switch` statements

### JavaScript Configuration

You can also use a JavaScript configuration file (`flagwatch.config.js`):

```javascript
module.exports = {
  include: ['src/**/*.{ts,tsx,js,jsx}'],
  exclude: ['**/node_modules/**', '**/dist/**'],
  flagPatterns: [
    /process\.env\.([A-Z_]+)/,
    /featureFlags\.([a-zA-Z]+)/,
  ],
  envVarPrefixes: ['FEATURE_', 'ENABLE_'],
};
```

See [Configuration Reference](configuration.md) for complete documentation.

---

## Operating Modes

| Mode | Behavior | Exit Code |
|----|----|----|
| Default | Report only | `0` |
| `--ci` | CI-friendly output | `0` |
| `--json` | Machine-readable output | `0` |

> Flagwatch **does not block builds in v1**. It informs — it does not enforce.

---

## Exit Codes

Flagwatch follows a strict exit code convention aligned with npm plugin standards:

| Code | Meaning | Description |
|------|---------|-------------|
| `0` | Success | Analysis completed successfully (v1: always returns 0) |
| `1` | Policy violation | Flags detected that violate configured policies (future) |
| `2` | Internal failure | Tool error, not a user code issue |

**Current behavior (v1):**
- Flagwatch always exits with code `0` to avoid blocking builds
- Future versions may introduce `--strict` mode that exits with `1` on violations

**Error handling:**
- All errors are structured and typed (not raw strings)
- Internal failures (exit code `2`) indicate tool bugs, not code issues
- User-facing errors provide actionable guidance

---

## How It Works

```text
Scan source files
        ↓
Detect conditional expressions
        ↓
Extract flag usage
        ↓
Analyze flag states
        ↓
Generate summary
```

---

## Signals Analyzed (v1 Scope)

- Feature flags in `if` / ternary conditions
- Environment-based flags (`process.env.*`)
- Flags that are always true / false
- Flags referenced but never defined

> No runtime evaluation. No mutation. No enforcement.

---

## Design Principles

- **Visibility before enforcement**
- **Static analysis only**
- **Deterministic output**
- **Zero side effects**
- **Readable over exhaustive**

---

## Security & Determinism

Flagwatch is built with security and determinism as core principles, following npm plugin coding standards.

### Security-First Design

- **No shell execution** - Never uses `shell: true` or executes arbitrary commands
- **No network calls** - Analysis is completely offline, no external API calls
- **Input validation** - All external inputs are validated before processing
- **No dynamic code execution** - No `eval()`, `Function()`, or dynamic `require()`
- **Safe file operations** - Read-only file access, no modifications

### Deterministic Analysis

- **Same input → same output** - Identical codebase always produces identical results
- **Sorted processing** - Arrays are sorted before processing to ensure consistent order
- **Stable JSON serialization** - Output is always consistently formatted
- **No time dependencies** - Analysis does not rely on system time or timestamps
- **No environment side effects** - Results are not affected by environment state

### Static Analysis Only

- **No runtime evaluation** - Code is never executed, only parsed
- **No mutation** - Source files are never modified
- **No side effects** - Analysis has zero impact on your codebase
- **Pure functions** - Core logic uses pure functions without I/O

### Error Handling

- **Structured errors** - All errors are typed objects, never raw strings
- **Actionable messages** - Errors provide clear guidance for resolution
- **Graceful degradation** - Tool continues analysis even when encountering issues

---

## Comparison

| Tool | Focus | Flagwatch Advantage |
|----|----|----|
| ESLint | Style & rules | Semantic flag analysis |
| Feature platforms | Runtime | Code-level visibility |
| Flagwatch | Analysis | Review-ready insights |

---

## Intended Audience

- Engineers reviewing complex PRs
- Tech leads managing long-lived flags
- Teams reducing dead code risk

---

## Non-Goals (v1)

- Blocking builds
- Flag lifecycle management
- Runtime flag evaluation
- Framework-specific SDKs

---

## Troubleshooting

### Common Issues

#### Issue: No flags detected

**Possible causes:**
- Files are excluded by default patterns
- Flag patterns don't match your code style
- Configuration file is not being loaded

**Solutions:**
```bash
# Check what files are being scanned
npx flagwatch --verbose

# Verify configuration
npx flagwatch --config flagwatch.config.json --verbose

# Adjust include patterns in config
```

#### Issue: Too many false positives

**Possible causes:**
- Flag patterns are too broad
- Environment variables are being flagged incorrectly

**Solutions:**
- Refine `flagPatterns` in configuration
- Add specific exclusions for known patterns
- Use `envVarPrefixes` to narrow environment variable detection

#### Issue: Performance is slow

**Possible causes:**
- Scanning too many files
- Large codebase without exclusions

**Solutions:**
```json
{
  "exclude": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

#### Issue: CI integration not working

**Possible causes:**
- Exit codes not handled correctly
- Output format not suitable for CI

**Solutions:**
```bash
# Use CI mode for deterministic output
npx flagwatch --ci

# Use JSON output for parsing
npx flagwatch --json | jq '.flags'
```

### Debug Mode

Enable verbose output to debug issues:

```bash
npx flagwatch --verbose
```

Verbose mode shows:
- Files being scanned
- Patterns being matched
- Configuration being used
- Detailed analysis steps

### Getting Help

- Check [Examples](examples.md) for common patterns
- Review [Configuration Reference](configuration.md) for options
- Open an issue on GitHub with:
  - Verbose output (`--verbose`)
  - Configuration file (if used)
  - Relevant code snippets

---

## Contributing

Contributions are welcome.

1. Fork the repo
2. Create a feature branch
3. Add tests
4. Submit a PR

---

## Roadmap (Post-v1)

- PR comments (GitHub Actions)
- Optional enforcement mode
- Config-file based flags
- Monorepo support

---

## Final Note

> Dead code is rarely intentional — it’s forgotten.

Flagwatch restores **clarity, intent, and confidence** to feature-flag driven codebases.

