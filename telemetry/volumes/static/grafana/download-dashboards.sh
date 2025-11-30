#!/usr/bin/env sh
set -e

DASHBOARD_URL="https://raw.githubusercontent.com/grafana/xk6-output-prometheus-remote/refs/heads/main/grafana/dashboards/k6-prometheus.json"
TARGET="./telemetry/volumes/static/grafana/dashboards/generated-k6-prometheus.json"

if [ -f "$TARGET" ]; then
  exit 0
fi

echo "Downloading k6 Prometheus dashboard..."
curl -fsSL "$DASHBOARD_URL" -o "$TARGET"
echo "Dashboard saved to: $TARGET"