# Scriptinel – NPM Plugin Coding Rules & Conventions

> **File type:** `.mdc` (Cursor rules file)  
> **Purpose:** Enforce clean, readable, secure, and maintainable code while building npm plugins.

This document is intentionally **opinionated**. Deviations must be justified.

---

## 1. Core Engineering Principles

### 1.1 Readability > Cleverness
- Code is read **10× more than it is written**
- Prefer explicit logic over abstractions
- A junior engineer should understand the intent without context

> If a line needs a comment to explain *what* it does, rewrite it.

---

### 1.2 DRY (Don’t Repeat Yourself)

**Allowed duplication:**
- Small conditionals
- String literals scoped to one file

**Not allowed:**
- Repeated business rules
- Repeated validation logic
- Copy‑pasted error handling

**Rule:**
> Duplicate logic → extract a function

---

### 1.3 Determinism First

- Same input → same output
- No reliance on:
  - system time (unless injected)
  - environment side effects
  - filesystem ordering

**Mandatory:**
- Sort arrays before processing
- Stable JSON serialization

---

## 2. File & Folder Conventions

### 2.1 One Responsibility Per File

✅ Good:
```ts
policy/validatePolicy.ts
installer/detectScripts.ts
```

❌ Bad:
```ts
policyUtils.ts // mixed logic
```

---

### 2.2 File Size Limits

- ≤ 200 lines per file
- ≤ 25 lines per function

If exceeded → refactor.

---

## 3. TypeScript Rules

### 3.1 Strict Typing

- `strict: true` is mandatory
- `any` is forbidden
- Use union types and enums instead of strings

❌ Bad:
```ts
function run(data: any) {}
```

✅ Good:
```ts
function run(data: InstallContext) {}
```

---

### 3.2 Explicit Return Types

Public functions **must** declare return types.

```ts
export function detectScripts(): DetectedScript[] {}
```

---

## 4. Function Design Rules

### 4.1 Pure Functions by Default

- No I/O
- No logging
- No mutation of external state

If I/O is required, isolate it.

---

### 4.2 Single Exit Strategy

- Prefer one return statement
- Early returns allowed only for guards

---

## 5. Error Handling Standards

### 5.1 Structured Errors Only

- No raw `throw new Error('string')`
- Use typed error objects

```ts
throw new PolicyViolationError({
  package: 'esbuild',
  script: 'postinstall'
})
```

---

### 5.2 Exit Codes (Frozen)

| Code | Meaning |
|----|----|
| 0 | Success |
| 1 | Policy violation |
| 2 | Internal failure |

Never reuse exit codes.

---

## 6. Logging & Output

### 6.1 Logging Rules

- No `console.log` in core logic
- Logging only via `logger.ts`
- Logs must be user‑actionable

---

### 6.2 CLI Output Rules

- Short
- Deterministic
- No emojis in CI mode

---

## 7. Security‑First Coding Rules

- Never execute shell commands with `shell: true`
- Validate all external inputs
- No dynamic `require()` or `eval`
- No network calls during install phase

> Scriptinel must be safer than npm itself.

---

## 8. Dependency Management

- Zero runtime dependencies unless unavoidable
- Dev dependencies must be justified
- No dependency with unknown maintainer trust

---

## 9. Naming Conventions

### 9.1 Variables & Functions

- Use verbs for functions (`detectScripts`)
- Use nouns for data (`policy`, `context`)
- No abbreviations (`ctx`, `cfg`) unless scoped

---

### 9.2 Files

- kebab‑case for filenames
- verb‑based filenames for actions

---

## 10. Testing Discipline

- Tests must describe **behavior**, not implementation
- One assertion per test where possible
- No shared mutable fixtures

---

## 11. Cursor‑Specific Rules

### 11.1 Prompt Discipline

✅ Good:
> Refactor this function to remove side effects and improve determinism.

❌ Bad:
> Rewrite this file in a better way.

---

### 11.2 AI Trust Boundary

- Cursor may suggest code
- **You own correctness and security**
- Always re‑read generated code

---

## 12. Architectural Guardrails

- CLI layer orchestrates only
- Business logic must be framework‑agnostic
- Reporters must not affect execution flow

---

## 13. Final Rule (Non‑Negotiable)

> If you cannot explain a piece of code in one sentence, it does not belong.

---

**Status:** Active coding rules for Scriptinel

