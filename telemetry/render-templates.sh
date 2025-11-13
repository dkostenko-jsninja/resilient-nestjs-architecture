#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$BASE_DIR/templates"
OUTPUT_DIR="$BASE_DIR/volumes/generated"

rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

find "$SOURCE_DIR" -type f \( -name "*.yml" \) | while read -r template; do
  rel_path="${template#$SOURCE_DIR/}"
  output_path="$OUTPUT_DIR/$rel_path"

  mkdir -p "$(dirname "$output_path")"

  echo "Rendering $output_path"
  envsub "$template" "$output_path"
done

echo "All telemetry templates rendered successfully."