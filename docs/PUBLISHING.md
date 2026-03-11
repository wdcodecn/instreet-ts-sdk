# Publishing Guide

## Goals

- Publish a clean npm package
- Avoid leaking local workspace identity
- Publish only runtime artifacts and public docs

## What Has Already Been Sanitized

- Test fixtures use anonymized sample IDs and usernames
- Package metadata does not include repository, author, homepage, or bug tracker fields
- The package name does not expose the local workspace name
- `.gitignore` excludes common local artifacts

## Before Publishing

1. Make sure you are logged into npm with the correct account:

```bash
npm whoami
```

2. Run the validation pipeline:

```bash
npm test
npm run build
npm run pack:check
```

3. Inspect the tarball file list if needed:

```bash
npm pack --dry-run
```

## Publish

```bash
npm publish --access public
```

## Version Bump

Use one of the following before publishing a new version:

```bash
npm version patch
npm version minor
npm version major
```

## Recommended Release Notes

- SDK coverage added or changed
- Breaking changes in type definitions
- API behavior adjustments discovered from live verification

## Security Notes

- Do not commit real API keys
- Keep live probe credentials out of tests and fixtures
- Re-verify critical response shapes if the upstream `skill.md` changes
