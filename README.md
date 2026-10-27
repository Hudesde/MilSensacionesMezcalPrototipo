# Mezcal Mil Sensaciones

Sitio web y plataforma de ventas de Mezcal Mil Sensaciones.

```
frontend/   sitio web: páginas .html y assets/ (css, js, img, video)
server/     backend en Go: API de catálogo y pedidos; también sirve el frontend en desarrollo
deploy/     archivos para publicar en el VPS (Caddy, systemd, scripts)
docs/       Plan de Producción y Presupuesto, SRS y material del cliente
```

## Desarrollo local

Requisitos: [Go](https://go.dev/dl/) 1.25 o superior y PostgreSQL 16 (`winget install PostgreSQL.PostgreSQL.16`, incluye pgAdmin). No hace falta Docker. Copia `server/.env.example` a `server/.env` y pon la conexión a la base; sin ella, los datos se guardan en memoria.

```sh
cd server
go run ./cmd/api
```

- Sitio: http://localhost:8080
- Documentación de la API (Swagger): http://localhost:8080/api/docs
- Tablas: pgAdmin 4 → base `milsensaciones` (detalle en [server/README.md](server/README.md#base-de-datos))

Un solo proceso sirve el sitio y la API (`/api/...`). Las tablas se crean solas al arrancar.
Al cambiar un `.html`, `.css` o `.js` basta con recargar el navegador. Al cambiar código Go, detén con `Ctrl+C` y vuelve a correr el comando.

| Comando (dentro de `server/`) | Para qué |
| :--- | :--- |
| `go run ./cmd/api` | Prende el sitio y la API en el puerto 8080 |
| `go test ./...` | Corre las pruebas |
| `go vet ./...` | Revisa errores comunes |
| `$env:PORT=3000; go run ./cmd/api` | Usa otro puerto (PowerShell) |

Detalle de la API en [server/README.md](server/README.md).

## Producción

En el VPS, **Caddy** entrega el frontend y el HTTPS, y pasa `/api/*` al binario de Go, que corre como servicio de `systemd`.

```
navegador ──HTTPS──> Caddy ──┬── frontend/ (archivos)
                             └── /api/* ──> api (Go, 127.0.0.1:8080)
```

1. **Una sola vez**, preparar el VPS (Ubuntu 24.04): instala Caddy, PostgreSQL (crea la base y guarda la conexión en `/opt/milsensaciones/.env`), firewall y swap:
   ```sh
   ssh root@IP_DEL_VPS 'bash -s' < deploy/setup-vps.sh
   ```
2. Apuntar el dominio al VPS en Cloudflare (registro `A` hacia la IP).
3. **Cada vez que haya cambios**, desde Git Bash en la raíz del repo:
   ```sh
   VPS=root@IP_DEL_VPS ./deploy/deploy.sh
   ```
   Corre las pruebas, compila para Linux, sube todo y reinicia la API.

Comandos útiles en el VPS:

```sh
systemctl status milsensaciones     # ¿está corriendo la API?
journalctl -u milsensaciones -f     # logs en vivo
systemctl restart milsensaciones    # reiniciar la API
systemctl reload caddy              # recargar Caddy tras cambiar el Caddyfile
```

## Documentación

Cada documento vive en su carpeta dentro de `docs/`. Para recompilar un PDF, entra a su carpeta y corre `latexmk`: los auxiliares quedan en `build/` y el PDF a un lado del `.tex`.
