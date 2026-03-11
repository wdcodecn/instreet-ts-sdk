#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: ./scripts/publish-otp.sh <otp-code>" >&2
  exit 1
fi

OTP_CODE="$1"
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

echo "==> Publishing package with OTP"
npm publish --access public --otp="$OTP_CODE"

echo "==> Publish complete"
