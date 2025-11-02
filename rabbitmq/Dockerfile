FROM rabbitmq:3.13-management

# Hardcoded for reproducibility
ARG RABBITMQ_DELAYED_EXCHANGE_VERSION=3.13.0
ARG RABBITMQ_DELAYED_EXCHANGE_SHA256=3479180df03fa830fd59ccf638a60eee8f0e8261524a8616685522d7b8d9a9ee

# Install curl, download plugin, verify, and enable it
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && plugin_file="rabbitmq_delayed_message_exchange-${RABBITMQ_DELAYED_EXCHANGE_VERSION}.ez" \
    # Download plugin to temp dir
    && tmp_dir="$(mktemp -d)" \
    && curl -fsSL -o "${tmp_dir}/${plugin_file}" \
    "https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/v${RABBITMQ_DELAYED_EXCHANGE_VERSION}/${plugin_file}" \
    # Integrity check
    && echo "${RABBITMQ_DELAYED_EXCHANGE_SHA256}  ${tmp_dir}/${plugin_file}" | sha256sum -c - \
    # Move plugin and enable it
    && mv "${tmp_dir}/${plugin_file}" "/opt/rabbitmq/plugins/${plugin_file}" \
    && rabbitmq-plugins enable --offline rabbitmq_delayed_message_exchange \
    # Clean up
    && rm -rf "${tmp_dir}" \
    && apt-get purge -y curl \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*