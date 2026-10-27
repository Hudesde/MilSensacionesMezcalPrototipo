#!/usr/bin/env bash
# Publica una versión nueva en el VPS. Se corre desde la raíz del repo en Git Bash:
#   VPS=root@IP_DEL_VPS ./deploy/deploy.sh
set -euo pipefail

: "${VPS:?Define VPS, por ejemplo VPS=root@203.0.113.10}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/server/bin"

echo "==> Pruebas"
(cd "$ROOT/server" && go test ./...)

echo "==> Compilando para Linux"
mkdir -p "$OUT"
(cd "$ROOT/server" && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o "$OUT/api" ./cmd/api)

echo "==> Subiendo archivos"
tar -C "$ROOT" -czf - frontend | ssh "$VPS" 'rm -rf /opt/milsensaciones/frontend && tar -C /opt/milsensaciones -xzf -'
scp "$OUT/api" "$VPS:/opt/milsensaciones/bin/api.new"
scp "$ROOT/deploy/Caddyfile" "$VPS:/etc/caddy/Caddyfile"
scp "$ROOT/deploy/milsensaciones.service" "$VPS:/etc/systemd/system/milsensaciones.service"

echo "==> Reiniciando servicios"
ssh "$VPS" 'set -e
  mv /opt/milsensaciones/bin/api.new /opt/milsensaciones/bin/api
  chmod +x /opt/milsensaciones/bin/api
  chown -R milsensaciones:milsensaciones /opt/milsensaciones
  systemctl daemon-reload
  systemctl enable --now milsensaciones
  systemctl restart milsensaciones
  systemctl reload caddy
  sleep 1
  curl -fsS http://127.0.0.1:8080/api/health'

echo
echo "==> Publicado."
