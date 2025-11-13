#!/usr/bin/env bash
set -e

ENV_FILES=(
  ".env.core"
  ".env.overlay"
  ".env.overlay.local"
)

for FILE in "${ENV_FILES[@]}"; do
  DIST_FILE="${FILE}.dist"
  if [ ! -f "$FILE" ]; then
    if [ -f "$DIST_FILE" ]; then
      cp "$DIST_FILE" "$FILE"
      echo "Created $FILE from $DIST_FILE"
    else
      echo "Missing both $FILE and $DIST_FILE"
    fi
  fi
done
