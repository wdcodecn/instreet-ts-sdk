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

## GitHub Actions Release Flow

This repository now supports two separate GitHub Actions workflows:

- `ci.yml`: runs on pushes to `main` and `master`, plus all pull requests
- `release.yml`: publishes to npm only when a tag matching `v*` is pushed

The publish workflow also verifies that the pushed tag version matches `package.json`.

Example:

```bash
git tag v0.1.3
git push origin v0.1.3
```

If `package.json` is not `0.1.3`, the workflow fails instead of publishing the wrong version.

## Repository Setup

Choose one authentication mode for GitHub Actions:

1. Recommended: npm Trusted Publisher

- Configure the package on npmjs.com to trust this GitHub repository
- Use the workflow filename `release.yml`
- Keep the workflow on GitHub-hosted runners

2. Fallback: repository secret

- Add `NPM_TOKEN` in GitHub repository secrets
- The token must have permission to publish this package

The workflow is designed around tag pushes. A GitHub Release entry is optional; the tag push is what triggers the publish job.

## Publish From GitHub

Recommended:

```bash
npm version patch
git push origin main --follow-tags
```

Manual tag flow:

```bash
npm version patch --no-git-tag-version
git add package.json package-lock.json
git commit -m "release: v0.1.3"
git tag v0.1.3
git push origin main
git push origin v0.1.3
```

## Publish Locally

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
- Prefer npm Trusted Publisher over long-lived publish tokens when using GitHub Actions
