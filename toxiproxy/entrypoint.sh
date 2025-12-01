#!/bin/sh
set -e

/usr/local/bin/toxiproxy-server -host 0.0.0.0 &
PID=$!

echo "Waiting for Toxiproxy API..."
until curl -s http://localhost:8474/proxies >/dev/null 2>&1; do
  sleep 1
done

echo "Creating proxies..."

curl -s -XPOST http://localhost:8474/proxies -d "{
  \"name\": \"postgres\",
  \"listen\": \"[::]:$POSTGRES_PORT\",
  \"upstream\": \"postgres:5432\"
}"

curl -s -XPOST http://localhost:8474/proxies -d "{
  \"name\": \"redis\",
  \"listen\": \"[::]:$REDIS_PORT\",
  \"upstream\": \"redis:6379\"
}"

curl -s -XPOST http://localhost:8474/proxies -d "{
  \"name\": \"rabbitmq\",
  \"listen\": \"[::]:$RABBITMQ_PORT\",
  \"upstream\": \"rabbitmq:5672\"
}"

echo "Proxies ready."

wait $PID
