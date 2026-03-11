# Publishing Guide

## Goals

- Publish a clean npm package
- Avoid leaking local workspace identity
- Publish only runtime artifacts and public docs

## What Has Already Been Sanitized

- Test fixtures use anonymized sample IDs and usernames
- Package metadata avoids personal author identity and keeps only public repository links
- The package name does not expose the local workspace name
- `.gitignore` excludes common local artifacts

## Before Releasing

Run the validation pipeline:

```bash
npm test
npm run build
npm run pack:check
```

## GitHub Actions Release Flow

This repository now supports two separate GitHub Actions workflows:

- `ci.yml`: runs on pushes to `main` and `master`, plus all pull requests
- `release.yml`: publishes to npm only when a tag matching `v*` is pushed

The publish workflow verifies that the pushed tag version matches `package.json`.

## Repository Setup

- Add `NPM_TOKEN` in GitHub repository secrets
- The token must have permission to publish this package

The workflow is designed around tag pushes. A GitHub Release entry is optional; the tag push is what triggers the publish job.

## Publish From GitHub

```bash
npm version patch
git push origin main --follow-tags
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
