#!/usr/bin/env bash
# Preparación única del VPS (Ubuntu 24.04). Se corre una sola vez como root:
#   ssh root@IP_DEL_VPS 'bash -s' < deploy/setup-vps.sh
set -euo pipefail

apt-get update
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl ufw

# Caddy (proxy HTTPS)
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy

# Usuario sin privilegios para la API
id milsensaciones >/dev/null 2>&1 || useradd --system --home /opt/milsensaciones --shell /usr/sbin/nologin milsensaciones
mkdir -p /opt/milsensaciones/bin /opt/milsensaciones/frontend
chown -R milsensaciones:milsensaciones /opt/milsensaciones

# PostgreSQL 16 (solo escucha en localhost) con base y usuario propios
apt-get install -y postgresql
if [ ! -f /opt/milsensaciones/.env ]; then
  DB_PASS="$(openssl rand -hex 24)"
  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
CREATE ROLE milsensaciones LOGIN PASSWORD '${DB_PASS}';
CREATE DATABASE milsensaciones OWNER milsensaciones;
SQL
  cat > /opt/milsensaciones/.env <<ENV
DATABASE_URL=postgres://milsensaciones:${DB_PASS}@127.0.0.1:5432/milsensaciones?sslmode=disable
ENV
  chmod 600 /opt/milsensaciones/.env
fi

# Memoria de intercambio de 1 GB para el plan de 1 GB de RAM
if [ ! -f /swapfile ]; then
  fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Firewall: solo SSH y web
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable

echo "VPS listo. Ahora corre deploy/deploy.sh desde tu computadora."
