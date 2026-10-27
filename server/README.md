# Servidor de Mil Sensaciones (Go + PostgreSQL)

## Ejecutar

```sh
cd server
go run ./cmd/api
```

| URL | Qué es |
| :--- | :--- |
| http://localhost:8080 | El sitio |
| http://localhost:8080/api/docs | Documentación interactiva de la API (Swagger UI) |
| http://localhost:8080/api/health | Estado del servidor y de la base |

La configuración se lee de `server/.env` (copia `.env.example`). Sin `DATABASE_URL`, los datos se guardan en memoria.

| Variable | Por defecto | Uso |
| :--- | :--- | :--- |
| `PORT` | `8080` | Puerto HTTP |
| `SITE_DIR` | `../frontend` | Carpeta con los `.html` y `assets/` |
| `DATABASE_URL` | vacía | Conexión a PostgreSQL |
| `TEST_DATABASE_URL` | vacía | Base desechable para pruebas de integración |

## Base de datos

Al arrancar, el servidor aplica solo las migraciones pendientes de `internal/db/migrations/` y las registra en la tabla `schema_migrations`. Para cambiar el esquema, agrega un archivo nuevo con el siguiente número (`0002_lo_que_sea.sql`); nunca edites uno ya aplicado.

| Tabla | Contenido |
| :--- | :--- |
| `products` | Catálogo, precio en centavos e inventario |
| `orders` | Pedidos con folio, estado y datos del cliente |
| `order_items` | Productos de cada pedido con el precio al momento de la compra |
| `folio_counters` | Consecutivo de folio por año |
| `schema_migrations` | Migraciones aplicadas |

**Ver las tablas:** abre **pgAdmin 4** (menú Inicio) → Servers → PostgreSQL 16 → Databases → `milsensaciones` → Schemas → public → Tables → clic derecho en una tabla → *View/Edit Data*. O desde la terminal:

```sh
psql "$DATABASE_URL" -c "SELECT folio, status, total_cents FROM orders ORDER BY id DESC LIMIT 10;"
```

## Pruebas

```sh
go test ./...
```

Las pruebas de `internal/store` contra PostgreSQL solo corren si `TEST_DATABASE_URL` está definida; borran y recrean todas las tablas de esa base.

> **Smart App Control (Windows):** si `go test` falla con *"Una directiva de Control de aplicaciones bloqueó este archivo"*, compila cada paquete de pruebas con nombre propio y córrelo desde su carpeta:
> ```sh
> go test -c -o bin/apitests.exe ./internal/api && (cd internal/api && ../../bin/apitests.exe)
> ```

## Estructura

```
cmd/api/              arranque, configuración y .env
internal/api/         rutas HTTP, Swagger (openapi.yaml) y archivos del sitio
internal/shop/        reglas de negocio: validación y precios
internal/store/       modelo de datos; implementaciones en memoria y PostgreSQL
internal/db/          conexión y migraciones
```
