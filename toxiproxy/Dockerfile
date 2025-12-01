FROM alpine:3.20

RUN apk add --no-cache curl

ADD https://github.com/Shopify/toxiproxy/releases/download/v2.12.0/toxiproxy-server-linux-amd64 /usr/local/bin/toxiproxy-server
RUN chmod +x /usr/local/bin/toxiproxy-server

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
