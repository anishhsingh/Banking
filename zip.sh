#!/usr/bin/env zsh
set -euo pipefail

# Clean build outputs
./mvnw -q clean || true

# Name zip with timestamp
ZNAME="demobank-$(date +%Y%m%d-%H%M%S).zip"

# Create a lean zip excluding heavy/irrelevant files
zip -r "$ZNAME" . \
  -x "target/*" \
  -x ".git/*" \
  -x "*.DS_Store" \
  -x ".idea/*" \
  -x "*.iml" \
  -x ".vscode/*" \
  -x "logs/*"

echo "Created $ZNAME"

