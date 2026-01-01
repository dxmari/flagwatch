# Flagwatch

[![npm version](https://img.shields.io/npm/v/flagwatch)](https://www.npmjs.com/package/flagwatch)
[![License](https://img.shields.io/npm/l/flagwatch)](LICENSE)
[![CI Status](https://img.shields.io/github/workflow/status/your-org/flagwatch/CI)](https://github.com/your-org/flagwatch/actions)

> **CI-first visibility into feature flags and conditional code paths**  
> Detect unused, missing, and misleading flags *before* they turn into dead code or risky releases.

---

## Quick Start

```bash
# Run analysis
npx flagwatch

# CI-friendly output
npx flagwatch --ci

# JSON output
npx flagwatch --json
```

No installation required. Works with any Node.js project.

---

## What Flagwatch Does

Flagwatch statically analyzes your codebase to extract feature-flag usage from conditional logic. It identifies:

- **Unused flags** - Never enabled anywhere
- **Missing flags** - Referenced but undefined
- **Dead conditionals** - Always true or always false
- **Flag patterns** - Environment variables, feature flags, and conditional logic

**Example output:**

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

- 🔍 **Static Analysis** - Detects feature flags in conditional logic
- ❌ **Dead Code Detection** - Identifies flags that are never enabled
- ⚠️ **Conditional Analysis** - Flags always-true / always-false conditionals
- 🧠 **Deterministic** - Same input always produces same output
- 🤖 **CI-First** - Designed for continuous integration workflows
- 🔒 **Secure** - No shell execution, no network calls, no side effects

---

## Why Flagwatch?

Modern codebases rely heavily on feature flags, environment-based conditionals, and rollout toggles. Over time, teams lose clarity on which flags are active, which are never enabled, and which conditionals are always true or false.

This leads to:
- Dead or unreachable code
- Confusing PR reviews
- Risky refactors
- Silent production bugs

**Flagwatch exists to make conditional logic visible, reviewable, and trustworthy.**

---

## Usage

### Local Development

```bash
# Basic usage
npx flagwatch

# With configuration file
npx flagwatch --config flagwatch.config.json

# Ignore specific patterns
npx flagwatch --ignore "**/test/**" --ignore "**/node_modules/**"
```

### CI Integration

Flagwatch is designed to run in CI and surface conditional-risk early.

```yaml
# GitHub Actions example
- name: Flagwatch
  run: npx flagwatch --ci
```

See [CI Integration Guide](docs/ci-integration.md) for detailed setup instructions.

---

## Documentation

- **[Comprehensive Guide](docs/flagwatch_readme.md)** - Full documentation and feature overview
- **[Configuration Reference](docs/configuration.md)** - Configuration options and examples
- **[CI Integration](docs/ci-integration.md)** - Step-by-step CI setup guides
- **[Examples](docs/examples.md)** - Practical code examples and patterns

---

## Design Principles

- **Visibility before enforcement** - Inform, don't block (v1)
- **Static analysis only** - No runtime evaluation
- **Deterministic output** - Same input → same output
- **Zero side effects** - No file modifications, no network calls
- **Readable over exhaustive** - Clear, actionable insights

---

## Operating Modes

| Mode | Behavior | Exit Code |
|------|----------|-----------|
| Default | Report only | `0` |
| `--ci` | CI-friendly output (no emojis) | `0` |
| `--json` | Machine-readable output | `0` |

> **Note:** Flagwatch does not block builds in v1. It informs — it does not enforce.

**Exit Codes:** `0` = Success, `1` = Policy violation (future), `2` = Internal failure. See [Exit Codes](docs/flagwatch_readme.md#exit-codes) for details.

---

## Signals Analyzed (v1 Scope)

- Feature flags in `if` / ternary conditions
- Environment-based flags (`process.env.*`)
- Flags that are always true / false
- Flags referenced but never defined

> No runtime evaluation. No mutation. No enforcement.

---

## Contributing

Contributions are welcome! Please see our [Contributing Guidelines](docs/flagwatch_readme.md#contributing) for details.

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

## License

See [LICENSE](LICENSE) file for details.

---

> **Remember:** Dead code is rarely intentional — it's forgotten.  
> Flagwatch restores **clarity, intent, and confidence** to feature-flag driven codebases.
