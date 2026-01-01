# Examples

This document provides practical examples of how Flagwatch detects and analyzes feature flags in your codebase.

---

## Basic Flag Detection

### Environment Variables

Flagwatch detects environment variable usage in conditionals:

```typescript
// ✅ Detected: process.env.FEATURE_NEW_UI
if (process.env.FEATURE_NEW_UI === 'true') {
  renderNewUI();
}

// ✅ Detected: process.env.ENABLE_ANALYTICS
const analyticsEnabled = process.env.ENABLE_ANALYTICS === '1';

// ✅ Detected: process.env.FEATURE_DARK_MODE
const theme = process.env.FEATURE_DARK_MODE ? 'dark' : 'light';
```

**Flagwatch output:**
```
🚩 Feature Flag Summary

• 3 flags detected
  - FEATURE_NEW_UI (referenced in src/components/App.tsx:5)
  - ENABLE_ANALYTICS (referenced in src/utils/analytics.ts:12)
  - FEATURE_DARK_MODE (referenced in src/theme.ts:8)
```

---

## Feature Flag Objects

### Simple Flag Object

```typescript
// ✅ Detected: featureFlags.newDashboard
const flags = {
  newDashboard: process.env.FEATURE_DASHBOARD === 'true',
  analytics: true,
};

if (flags.newDashboard) {
  renderDashboard();
}
```

### Nested Flag Objects

```typescript
// ✅ Detected: config.features.newFeature
const config = {
  features: {
    newFeature: process.env.FEATURE_NEW === 'true',
    legacyFeature: false,
  },
};

if (config.features.newFeature) {
  enableNewFeature();
}
```

---

## Common Patterns

### Ternary Operators

```typescript
// ✅ Detected: process.env.FEATURE_BETA
const apiUrl = process.env.FEATURE_BETA === 'true'
  ? 'https://beta.api.com'
  : 'https://api.com';
```

### Logical Operators

```typescript
// ✅ Detected: process.env.FEATURE_A and process.env.FEATURE_B
if (process.env.FEATURE_A === 'true' && process.env.FEATURE_B === 'true') {
  enableBothFeatures();
}

// ✅ Detected: process.env.FEATURE_X or process.env.FEATURE_Y
const enabled = process.env.FEATURE_X === 'true' || process.env.FEATURE_Y === 'true';
```

### Switch Statements

```typescript
// ✅ Detected: process.env.FEATURE_MODE
switch (process.env.FEATURE_MODE) {
  case 'new':
    renderNewVersion();
    break;
  case 'legacy':
    renderLegacyVersion();
    break;
  default:
    renderDefault();
}
```

---

## Dead Code Detection

### Always True Conditionals

```typescript
// ⚠️ Flagwatch detects: Always true conditional
const FEATURE_ENABLED = true;  // Hardcoded true

if (FEATURE_ENABLED) {  // This is always true
  doSomething();
}
```

**Flagwatch output:**
```
⚠️ Dead conditional detected
  - src/utils/feature.ts:5
  - Condition is always true
  - Consider removing conditional or flag
```

### Always False Conditionals

```typescript
// ⚠️ Flagwatch detects: Always false conditional
const FEATURE_DISABLED = false;  // Hardcoded false

if (FEATURE_DISABLED) {  // This is always false
  doSomething();  // Dead code - never executed
}
```

**Flagwatch output:**
```
⚠️ Dead conditional detected
  - src/utils/feature.ts:8
  - Condition is always false
  - Code is unreachable
```

---

## Missing Flag Detection

### Referenced but Undefined

```typescript
// ⚠️ Flagwatch detects: Flag referenced but never defined
if (process.env.FEATURE_MISSING === 'true') {
  // This flag is never set anywhere
  enableFeature();
}
```

**Flagwatch output:**
```
⚠️ Missing flag detected
  - FEATURE_MISSING (referenced in src/components/Feature.tsx:3)
  - Flag is referenced but never defined
  - Consider adding to environment configuration
```

---

## Unused Flag Detection

### Defined but Never Used

```typescript
// Environment configuration
process.env.FEATURE_UNUSED = 'true';  // Set but never checked

// No code references FEATURE_UNUSED
```

**Flagwatch output:**
```
⚠️ Unused flag detected
  - FEATURE_UNUSED (defined in .env:12)
  - Flag is defined but never referenced
  - Consider removing if no longer needed
```

---

## Before and After Examples

### Example 1: Cleaning Up Dead Flags

**Before:**

```typescript
// Old feature flag - always enabled now
const OLD_FEATURE_ENABLED = true;

if (OLD_FEATURE_ENABLED) {
  renderOldFeature();  // Always executes
}

// New feature flag
if (process.env.FEATURE_NEW === 'true') {
  renderNewFeature();
}
```

**Flagwatch detects:**
- `OLD_FEATURE_ENABLED` is always true (dead conditional)
- `FEATURE_NEW` is referenced but may be undefined

**After:**

```typescript
// Removed dead conditional - feature is always enabled
renderOldFeature();

// New feature flag with proper check
if (process.env.FEATURE_NEW === 'true') {
  renderNewFeature();
}
```

---

### Example 2: Consolidating Flag Patterns

**Before:**

```typescript
// Inconsistent flag checking
if (process.env.FEATURE_A === 'true') { }
if (process.env['FEATURE_B'] === '1') { }
if (process.env.FEATURE_C) { }  // Truthy check
if (getFlag('feature-d')) { }  // Custom function
```

**Flagwatch detects:**
- Multiple flag patterns used inconsistently
- Some flags may not be detected if pattern doesn't match

**After:**

```typescript
// Consistent flag checking pattern
function isFeatureEnabled(name: string): boolean {
  return process.env[`FEATURE_${name.toUpperCase()}`] === 'true';
}

if (isFeatureEnabled('A')) { }
if (isFeatureEnabled('B')) { }
if (isFeatureEnabled('C')) { }
if (isFeatureEnabled('D')) { }
```

**Configuration:**
```json
{
  "flagPatterns": [
    "isFeatureEnabled\\(['\"]([^'\"]+)['\"]\\)"
  ]
}
```

---

### Example 3: Removing Unused Flags

**Before:**

```typescript
// .env file
FEATURE_EXPERIMENTAL_UI=true
FEATURE_OLD_DASHBOARD=false
FEATURE_DEPRECATED_API=true

// Code only uses one flag
if (process.env.FEATURE_EXPERIMENTAL_UI === 'true') {
  renderExperimentalUI();
}
```

**Flagwatch detects:**
- `FEATURE_OLD_DASHBOARD` is defined but never used
- `FEATURE_DEPRECATED_API` is defined but never used

**After:**

```typescript
// .env file - cleaned up
FEATURE_EXPERIMENTAL_UI=true

// Code unchanged
if (process.env.FEATURE_EXPERIMENTAL_UI === 'true') {
  renderExperimentalUI();
}
```

---

## Real-World Scenarios

### Scenario 1: Feature Rollout

```typescript
// Gradual rollout flag
const rolloutPercentage = parseInt(process.env.FEATURE_ROLLOUT_PERCENTAGE || '0', 10);
const userIdHash = hashUserId(user.id);
const isEnabled = userIdHash % 100 < rolloutPercentage;

if (isEnabled) {
  enableNewFeature();
}
```

**Flagwatch detects:**
- `FEATURE_ROLLOUT_PERCENTAGE` flag usage
- Complex conditional logic (may need review)

---

### Scenario 2: A/B Testing

```typescript
const experimentGroup = process.env.FEATURE_EXPERIMENT_GROUP;

if (experimentGroup === 'A') {
  renderVariantA();
} else if (experimentGroup === 'B') {
  renderVariantB();
} else {
  renderControl();
}
```

**Flagwatch detects:**
- `FEATURE_EXPERIMENT_GROUP` flag usage
- Multiple conditional branches

---

### Scenario 3: Environment-Specific Features

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const debugMode = process.env.FEATURE_DEBUG === 'true';

if (isDevelopment || debugMode) {
  enableDebugFeatures();
}

if (isProduction && process.env.FEATURE_ANALYTICS === 'true') {
  enableAnalytics();
}
```

**Flagwatch detects:**
- `FEATURE_DEBUG` flag usage
- `FEATURE_ANALYTICS` flag usage
- Note: `NODE_ENV` may not be detected if not in `envVarPrefixes`

**Configuration:**
```json
{
  "envVarPrefixes": ["FEATURE_", "ENABLE_"]
}
```

---

## Anti-Patterns

### ❌ Hardcoded Flags

```typescript
// Bad: Hardcoded flag value
const FEATURE_ENABLED = true;

if (FEATURE_ENABLED) {
  // Always executes - dead conditional
}
```

**Better:**
```typescript
// Good: Environment-based flag
if (process.env.FEATURE_ENABLED === 'true') {
  // Can be controlled via environment
}
```

---

### ❌ Inconsistent Flag Checking

```typescript
// Bad: Inconsistent patterns
if (process.env.FEATURE_A === 'true') { }
if (process.env.FEATURE_B === '1') { }
if (process.env.FEATURE_C) { }  // Truthy - different pattern
```

**Better:**
```typescript
// Good: Consistent pattern
function isEnabled(flag: string): boolean {
  return process.env[flag] === 'true';
}

if (isEnabled('FEATURE_A')) { }
if (isEnabled('FEATURE_B')) { }
if (isEnabled('FEATURE_C')) { }
```

---

### ❌ Magic Strings

```typescript
// Bad: Magic strings scattered throughout code
if (process.env.FEATURE_NEW_UI === 'true') { }
if (process.env.FEATURE_NEW_UI === 'true') { }  // Duplicated
if (process.env.FEATURE_NEW_UI === 'true') { }  // Again
```

**Better:**
```typescript
// Good: Centralized flag definitions
const FLAGS = {
  NEW_UI: process.env.FEATURE_NEW_UI === 'true',
} as const;

if (FLAGS.NEW_UI) { }
if (FLAGS.NEW_UI) { }
if (FLAGS.NEW_UI) { }
```

---

## Flag Naming Conventions

### Recommended Patterns

**Environment Variables:**
- `FEATURE_*` - Feature flags (e.g., `FEATURE_NEW_DASHBOARD`)
- `ENABLE_*` - Enable/disable flags (e.g., `ENABLE_ANALYTICS`)
- `FLAG_*` - Generic flags (e.g., `FLAG_EXPERIMENTAL`)

**Code Patterns:**
- `featureFlags.*` - Feature flag objects
- `flags.*` - Generic flag objects
- `config.flags.*` - Configuration-based flags

### Examples

```typescript
// ✅ Good: Clear, descriptive names
process.env.FEATURE_NEW_DASHBOARD
process.env.ENABLE_USER_ANALYTICS
process.env.FLAG_EXPERIMENTAL_API

// ❌ Bad: Unclear or ambiguous names
process.env.FLAG1
process.env.ENABLE
process.env.NEW
```

---

## Configuration Examples

### TypeScript Project

```json
{
  "include": ["src/**/*.{ts,tsx}"],
  "exclude": [
    "**/node_modules/**",
    "**/dist/**",
    "**/*.test.ts"
  ],
  "flagPatterns": [
    "process\\.env\\.([A-Z_]+)",
    "featureFlags\\.([a-zA-Z]+)"
  ],
  "envVarPrefixes": ["FEATURE_", "ENABLE_"]
}
```

### JavaScript Project

```json
{
  "include": ["src/**/*.{js,jsx}"],
  "exclude": [
    "**/node_modules/**",
    "**/dist/**",
    "**/*.test.js"
  ],
  "flagPatterns": [
    "process\\.env\\.([A-Z_]+)"
  ],
  "envVarPrefixes": ["FEATURE_"]
}
```

### Custom Flag Library

If you use a custom feature flag library:

```typescript
// Custom flag library usage
import { isEnabled } from './flags';

if (isEnabled('new-feature')) {
  // ...
}
```

**Configuration:**
```json
{
  "flagPatterns": [
    "isEnabled\\(['\"]([^'\"]+)['\"]\\)"
  ]
}
```

---

## Summary

Flagwatch helps you:

1. **Detect flags** - Find all feature flag usage in your codebase
2. **Identify dead code** - Find conditionals that are always true/false
3. **Find missing flags** - Detect flags referenced but never defined
4. **Clean up unused flags** - Remove flags that are no longer needed
5. **Standardize patterns** - Encourage consistent flag usage

For more information, see:
- [Configuration Reference](configuration.md)
- [CI Integration Guide](ci-integration.md)
- [Main Documentation](flagwatch_readme.md)

