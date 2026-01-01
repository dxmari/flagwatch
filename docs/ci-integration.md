# CI Integration Guide

Flagwatch is designed to run in CI/CD pipelines to surface feature flag issues early. This guide provides step-by-step instructions for integrating Flagwatch into popular CI platforms.

---

## General CI Best Practices

Before setting up Flagwatch in your CI:

1. **Use `--ci` flag** - Provides deterministic, emoji-free output
2. **Use `--json` for parsing** - If you need to process results programmatically
3. **Set appropriate exit codes** - Currently always `0` (informational), future versions may support `--strict`
4. **Cache node_modules** - Speed up runs by caching dependencies
5. **Run early in pipeline** - Catch issues before expensive build steps

---

## GitHub Actions

### Basic Setup

Add Flagwatch to your GitHub Actions workflow:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  flagwatch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Flagwatch
        run: npx flagwatch --ci
```

### With Configuration File

If you have a configuration file:

```yaml
- name: Run Flagwatch
  run: npx flagwatch --ci --config flagwatch.config.json
```

### With JSON Output and Artifacts

Save results as artifacts for later analysis:

```yaml
- name: Run Flagwatch
  run: npx flagwatch --ci --json > flagwatch-results.json
  
- name: Upload Flagwatch results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: flagwatch-results
    path: flagwatch-results.json
```

### Complete Workflow Example

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run Flagwatch
        run: npx flagwatch --ci
        continue-on-error: true  # Don't fail build (v1 behavior)
      
      - name: Run linter
        run: npm run lint
```

### Future: PR Comments (Post-v1)

Future versions may support automatic PR comments:

```yaml
- name: Run Flagwatch
  id: flagwatch
  run: npx flagwatch --ci --json > flagwatch-results.json
  
- name: Comment PR
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v6
  with:
    script: |
      // Future: Post flagwatch results as PR comment
```

---

## GitLab CI

### Basic Setup

Add Flagwatch to your `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - flagwatch

variables:
  NODE_VERSION: "18"

flagwatch:
  stage: flagwatch
  image: node:${NODE_VERSION}
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  before_script:
    - npm ci
  script:
    - npx flagwatch --ci
  only:
    - merge_requests
    - main
    - develop
```

### With Configuration File

```yaml
flagwatch:
  stage: flagwatch
  image: node:${NODE_VERSION}
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  before_script:
    - npm ci
  script:
    - npx flagwatch --ci --config flagwatch.config.json
  artifacts:
    when: always
    paths:
      - flagwatch-results.json
    reports:
      # Future: GitLab merge request reports
```

### Complete Pipeline Example

```yaml
stages:
  - install
  - test
  - flagwatch
  - build

variables:
  NODE_VERSION: "18"

install_dependencies:
  stage: install
  image: node:${NODE_VERSION}
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  script:
    - npm ci
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

test:
  stage: test
  image: node:${NODE_VERSION}
  dependencies:
    - install_dependencies
  script:
    - npm test

flagwatch:
  stage: flagwatch
  image: node:${NODE_VERSION}
  dependencies:
    - install_dependencies
  script:
    - npx flagwatch --ci --json > flagwatch-results.json
  artifacts:
    when: always
    paths:
      - flagwatch-results.json
    expire_in: 1 week
  allow_failure: true  # Don't fail pipeline (v1 behavior)

build:
  stage: build
  image: node:${NODE_VERSION}
  dependencies:
    - install_dependencies
  script:
    - npm run build
```

---

## CircleCI

### Basic Setup

Add Flagwatch to your `.circleci/config.yml`:

```yaml
version: 2.1

jobs:
  flagwatch:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "package-lock.json" }}
      - run:
          name: Install dependencies
          command: npm ci
      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package-lock.json" }}
      - run:
          name: Run Flagwatch
          command: npx flagwatch --ci
```

### With Configuration File

```yaml
- run:
    name: Run Flagwatch
    command: npx flagwatch --ci --config flagwatch.config.json
```

### Complete Workflow Example

```yaml
version: 2.1

jobs:
  test:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "package-lock.json" }}
      - run:
          name: Install dependencies
          command: npm ci
      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package-lock.json" }}
      - run:
          name: Run tests
          command: npm test
      - run:
          name: Run Flagwatch
          command: npx flagwatch --ci
          no_output_timeout: 10m

workflows:
  version: 2
  test_and_flagwatch:
    jobs:
      - test
```

---

## Jenkins

### Pipeline Script

Add to your `Jenkinsfile`:

```groovy
pipeline {
    agent any
    
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Flagwatch') {
            steps {
                sh 'npx flagwatch --ci'
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'flagwatch-results.json', allowEmptyArchive: true
        }
    }
}
```

### With Configuration

```groovy
stage('Flagwatch') {
    steps {
        sh 'npx flagwatch --ci --config flagwatch.config.json'
    }
}
```

---

## Azure DevOps

### YAML Pipeline

Add to your `azure-pipelines.yml`:

```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
    displayName: 'Install Node.js'
  
  - script: npm ci
    displayName: 'Install dependencies'
  
  - script: npm test
    displayName: 'Run tests'
  
  - script: npx flagwatch --ci
    displayName: 'Run Flagwatch'
    continueOnError: true  # Don't fail build (v1 behavior)
```

### With Artifacts

```yaml
- script: npx flagwatch --ci --json > flagwatch-results.json
  displayName: 'Run Flagwatch'
  continueOnError: true

- task: PublishBuildArtifacts@1
  inputs:
    pathToPublish: 'flagwatch-results.json'
    artifactName: 'flagwatch-results'
  condition: always()
```

---

## Pre-commit Hooks

### Using Husky

Add to `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx flagwatch --ci
```

### Using lint-staged

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "npx flagwatch --ci"
    ]
  }
}
```

**Note:** Pre-commit hooks run locally, so use `--ci` for consistent output.

---

## CI-Specific Considerations

### Caching

All CI platforms benefit from caching `node_modules`:

**GitHub Actions:**
```yaml
- uses: actions/setup-node@v3
  with:
    cache: 'npm'
```

**GitLab CI:**
```yaml
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
```

**CircleCI:**
```yaml
- restore_cache:
    keys:
      - v1-dependencies-{{ checksum "package-lock.json" }}
```

### Exit Codes

Currently, Flagwatch always exits with code `0` (informational mode). To handle future strict mode:

```yaml
# Future: Strict mode will exit 1 on violations
- name: Run Flagwatch
  run: npx flagwatch --ci --strict
  # Will fail build on violations
```

### Performance

For large codebases:

1. **Use exclusions** - Exclude test files and build outputs
2. **Run in parallel** - Flagwatch can run alongside tests
3. **Cache results** - Save JSON output for comparison

### Security

Flagwatch is safe for CI:

- No shell execution
- No network calls
- Read-only file access
- No side effects

---

## Troubleshooting CI Issues

### Issue: Flagwatch not found

**Solution:** Ensure Node.js is set up before running Flagwatch:

```yaml
- uses: actions/setup-node@v3
  with:
    node-version: '18'
```

### Issue: Slow CI runs

**Solutions:**
- Cache `node_modules`
- Exclude unnecessary files in config
- Run Flagwatch in parallel with other checks

### Issue: Inconsistent results

**Solutions:**
- Always use `--ci` flag for deterministic output
- Ensure consistent Node.js version
- Check that configuration file is committed

### Issue: Results not appearing

**Solutions:**
- Check that `--json` output is saved correctly
- Verify artifact uploads are configured
- Ensure `continue-on-error: true` isn't hiding failures

---

## Best Practices Summary

1. ✅ **Always use `--ci` flag** for deterministic output
2. ✅ **Cache dependencies** to speed up runs
3. ✅ **Run early** in pipeline to catch issues fast
4. ✅ **Save JSON output** for programmatic processing
5. ✅ **Use `continue-on-error`** in v1 (informational mode)
6. ✅ **Commit config file** to version control
7. ✅ **Document custom setup** in your team's CI docs

---

## Next Steps

- Set up Flagwatch in your CI pipeline
- Configure exclusions for your codebase
- Review results regularly
- Plan for strict mode when available (post-v1)

For more examples, see [Examples](examples.md). For configuration options, see [Configuration Reference](configuration.md).

