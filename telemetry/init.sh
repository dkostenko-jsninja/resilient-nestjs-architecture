#!/usr/bin/env bash

BASE_DIR="$(dirname "$0")"

sh "$BASE_DIR/volumes/static/grafana/download-dashboards.sh"
sh "$BASE_DIR/render-templates.sh"
