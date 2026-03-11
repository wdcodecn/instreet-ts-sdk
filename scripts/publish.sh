#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Using package:"
node -p "const pkg=require('./package.json'); \`${pkg.name}@${pkg.version}\`"

echo "==> Checking npm login"
npm whoami >/dev/null

echo "==> Running tests"
npm test

echo "==> Building package"
npm run build

echo "==> Checking tarball contents"
npm run pack:check >/dev/null

echo "==> Publishing package"
if [[ -n "${NPM_TOKEN:-}" ]]; then
  npm publish --access public --//registry.npmjs.org/:_authToken="$NPM_TOKEN"
else
  npm publish --access public
fi

echo "==> Publish complete"
