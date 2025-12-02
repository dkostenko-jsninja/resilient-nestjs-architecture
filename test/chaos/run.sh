#!/usr/bin/env bash

# Run one chaos scenario using toxiproxy.
#
# Structure:
#   1) Validate requirements
#   2) Stabilize system
#   3) Run selected chaos scenario
#   4) Stabilize system again

set -euo pipefail

TOXIPROXY_API_URL="http://localhost:8474"
STAGE_DURATION=60 # seconds to observe scenario impact

SELECTED_STAGE=""

VALID_STAGES=(
  postgres-latency
  postgres-down
  redis-down
  redis-latency
  rabbitmq-down
  rabbitmq-latency
  postgres-and-rabbitmq-down
  postgres-and-worker-down
)

# ------------------------------------------------------------
# Argument Parsing
# ------------------------------------------------------------

usage() {
  echo ""
  echo "Usage: $0 -n <scenario>"
  echo ""
  echo "Valid scenarios:"
  for scenario in "${VALID_STAGES[@]}"; do
    echo "  - $scenario"
  done
  echo ""
  echo "Example:"
  echo "  npm run chaos -- -n postgres-latency"
  echo ""
}

parse_args() {
  local count=0

  if [[ $# -eq 0 ]]; then
    usage
    exit 1
  fi

  while getopts ":n:h" opt; do
    case "$opt" in
      n)
        count=$((count + 1))
        if [[ $count -gt 1 ]]; then
          echo "Error: Only one scenario may be provided."
          echo "Hint: Run separate commands for multiple scenarios."
          exit 1
        fi
        SELECTED_STAGE="$OPTARG"
        ;;
      h)
        usage; exit 0;;
      \?)
        echo "Unknown option: -$OPTARG"; usage; exit 1;;
      :)
        echo "Option -$OPTARG requires a value."; usage; exit 1;;
    esac
  done

  shift $((OPTIND - 1))

  if [[ -z "$SELECTED_STAGE" ]]; then
    echo "Error: No scenario specified."
    usage
    exit 1
  fi

  if [[ $# -gt 0 ]]; then
    echo "Unexpected extra arguments: $*"
    usage
    exit 1
  fi
}

# ------------------------------------------------------------
# Toxiproxy Helpers
# ------------------------------------------------------------

POST_TOXIC() {
  local proxy="$1"
  local toxic_name="$2"
  local payload="$3"

  echo "Applying toxic $toxic_name to proxy '$proxy'"
  curl -s -X POST "$TOXIPROXY_API_URL/proxies/$proxy/toxics" \
       -H "Content-Type: application/json" \
       -d "$payload" >/dev/null || echo "Warning: Failed to apply toxic."
  echo ""
}

RESET_TOXICS() {
  echo "Resetting all toxics..."
  curl -s -X POST "$TOXIPROXY_API_URL/reset" >/dev/null
  echo "All toxics cleared."
  echo ""
}

add_latency() {
  local proxy="$1"
  local latency="$2"
  local jitter="$3"
  local stream="${4:-upstream}"

  local payload="{
    \"type\":\"latency\",
    \"name\":\"${proxy}_${stream}_latency\",
    \"stream\":\"${stream}\",
    \"attributes\":{
      \"latency\":${latency},
      \"jitter\":${jitter}
    }
  }"

  POST_TOXIC "$proxy" "${proxy}_${stream}_latency" "$payload"
}

# ------------------------------------------------------------
# Docker Helpers
# ------------------------------------------------------------

stop_service() {
  docker stop "$1" >/dev/null 2>&1
  echo "Stopped service: $1"
}

start_service() {
  docker start "$1" >/dev/null 2>&1
  echo "Started service: $1"
}

# ------------------------------------------------------------
# Scenario Execution Helpers
# ------------------------------------------------------------

run_scenario() {
  case "$1" in
    postgres-down) scenario_postgres_down ;;
    postgres-latency) scenario_postgres_latency ;;
    redis-down) scenario_redis_down ;;
    redis-latency) scenario_redis_latency ;;
    rabbitmq-down) scenario_rabbitmq_down ;;
    rabbitmq-latency) scenario_rabbitmq_latency ;;
    postgres-and-rabbitmq-down) scenario_postgres_and_rabbitmq_down ;;
    postgres-and-worker-down) scenario_postgres_and_worker_down ;;
    *)
      echo "Unknown scenario: '$1'"
      echo "Valid scenarios: ${VALID_STAGES[*]}"
      exit 1
      ;;
  esac
}

observe_scenario() {
  local label="$1"
  echo "Observing scenario: $label (${STAGE_DURATION}s)"
  sleep "$STAGE_DURATION"
}

cleanup() {
  echo ""
  echo "Cleanup triggered..."
  RESET_TOXICS
  start_service postgres || true
  start_service worker || true
  start_service redis || true
  start_service rabbitmq || true
  echo "Cleanup complete."
  exit 0
}

trap cleanup INT TERM

# ------------------------------------------------------------
# Scenario Implementations
# ------------------------------------------------------------

scenario_postgres_down() {
  echo "Scenario: postgres down"
  stop_service postgres
}

scenario_postgres_latency() {
  echo "Scenario: postgres latency spike"
  add_latency "postgres" 500 1000 "upstream"
}

scenario_redis_down() {
  echo "Scenario: redis"
  stop_service "redis"
}

scenario_redis_latency() {
  echo "Scenario: redis latency spike"
  add_latency "redis" 500 1000 "upstream"
}

scenario_rabbitmq_down() {
  echo "Scenario: rabbitmq down"
  stop_service rabbitmq
}

scenario_rabbitmq_latency() {
  echo "Scenario: rabbitmq latency spike"
  add_latency "rabbitmq" 500 1000 "upstream"
}

scenario_postgres_and_rabbitmq_down() {
  echo "Scenario: postgres and rabbitmq down"
  stop_service rabbitmq
  stop_service postgres
}

scenario_postgres_and_worker_down() {
  echo "Scenario: postgres and worker down"
  stop_service worker
  stop_service postgres
}

# ------------------------------------------------------------
# Main Program Flow
# ------------------------------------------------------------

parse_args "$@"

echo ""
echo "========================================="
echo " CHAOS RUNNER"
echo " Scenario: $SELECTED_STAGE"
echo " Duration: ${STAGE_DURATION}s"
echo "========================================="
echo ""

echo "Pre-scenario stabilization..."
RESET_TOXICS

run_scenario "$SELECTED_STAGE"
observe_scenario "$SELECTED_STAGE"

echo "Post-scenario stabilization..."
cleanup

echo ""
echo "Chaos scenario completed."
