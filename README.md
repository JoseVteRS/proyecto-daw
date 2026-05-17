# PROYECTO-DAW-V2

Monorepo con `pnpm workspaces` para una agenda personal.

- `apps/api`: API con Express.
- `apps/web`: aplicación web con TanStack Start.
- `packages/shared`: contratos y validaciones compartidas.

## Requisitos

| Herramienta | Versión |
| --- | --- |
| Node.js | LTS superior a 22. En Docker se usa `node:24-bookworm-slim`. |
| pnpm | `11.x`. El proyecto fija `pnpm@11.1.2`. |
| Docker | Docker Engine con Docker Compose v2. |

> Si usas Docker, no necesitas instalar Node ni pnpm localmente para iniciar la aplicación.

## Puertos por defecto

| Servicio | URL / puerto |
| --- | --- |
| Web | <http://localhost:3000> |
| API | <http://localhost:4000> |
| PostgreSQL | `localhost:5432` |
| pgAdmin | <http://localhost:5050> |

Credenciales de desarrollo:

| Servicio | Usuario | Contraseña |
| --- | --- | --- |
| PostgreSQL | `proyecto_daw` | `proyecto_daw` |
| pgAdmin | `admin@example.com` | `admin` |

## Iniciar en desarrollo con Docker

El modo desarrollo inicia cuatro servicios:

- PostgreSQL
- pgAdmin
- API
- Web

Comando recomendado:

```bash
docker compose up -d --build
```

Ver registros:

```bash
docker compose logs -f
```

Ver registros de un servicio concreto:

```bash
docker compose logs -f api-dev
docker compose logs -f web-dev
docker compose logs -f postgres
docker compose logs -f pgadmin
```

Detener los servicios:

```bash
docker compose down
```

Detener y borrar volúmenes de datos de desarrollo:

```bash
docker compose down -v
```

> `down -v` borra la base PostgreSQL, la configuración de pgAdmin y los volúmenes de dependencias usados por Docker.

## Configurar pgAdmin

Accede a:

```text
http://localhost:5050
```

Inicio de sesión:

```text
Email: admin@example.com
Contraseña: admin
```

Para registrar el servidor PostgreSQL:

| Campo | Valor |
| --- | --- |
| Name | `Proyecto DAW` |
| Host name/address | `postgres` |
| Port | `5432` |
| Maintenance database | `proyecto_daw` |
| Username | `proyecto_daw` |
| Password | `proyecto_daw` |

Importante: dentro de Docker, pgAdmin debe conectarse a `postgres`, no a `localhost`. `localhost` dentro del contenedor de pgAdmin apunta al propio contenedor de pgAdmin.

## Iniciar en producción con Docker

Producción inicia solo:

- API
- Web

La base de datos no se inicia en producción desde este compose. Se espera una base PostgreSQL externa y se configura con `DATABASE_URL`.

Comando recomendado:

```bash
DATABASE_URL="postgresql://usuario:password@host:5432/base" \
JWT_SECRET="cambia-este-secreto-de-32-caracteres-minimo" \
CORS_ORIGIN="https://tu-dominio.com" \
docker compose --profile prod up -d --build api web
```

¿Por qué se indican `api web` al final?

Porque los servicios de desarrollo son los servicios por defecto para que `docker compose up -d` funcione sin opciones adicionales durante el desarrollo. Los servicios de producción están dentro del perfil `prod`. Al indicar explícitamente `api web`, Docker Compose inicia solo esos dos servicios de producción.

Ver registros de producción:

```bash
docker compose logs -f api web
```

Detener producción:

```bash
docker compose down
```

## Variables de entorno principales

### Desarrollo

En desarrollo, el `compose.yml` define valores por defecto para facilitar el arranque local:

```yaml
DATABASE_URL: postgresql://proyecto_daw:proyecto_daw@postgres:5432/proyecto_daw
JWT_SECRET: 01234567890123456789012345678901
CORS_ORIGIN: http://localhost:3000
```

### Producción

En producción configura estas variables al ejecutar Docker Compose o mediante un archivo `.env` local no versionado:

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `DATABASE_URL` | Sí | URL de conexión a PostgreSQL. |
| `JWT_SECRET` | Sí | Secreto para firmar tokens. Usar un valor fuerte. |
| `CORS_ORIGIN` | Recomendado | Origen permitido para la web. |

Ejemplo de `.env` local para producción:

```env
DATABASE_URL=postgresql://usuario:password@host:5432/base
JWT_SECRET=cambia-este-secreto-de-32-caracteres-minimo
CORS_ORIGIN=https://tu-dominio.com
```

Después puedes ejecutar:

```bash
docker compose --profile prod up -d --build api web
```

No incluyas en commits archivos `.env` con secretos reales.

## Qué hace `x-node-dev` en `compose.yml`

En el compose existe este bloque:

```yaml
x-node-dev: &node-dev
```

No es un servicio. Es una plantilla YAML reutilizable.

- Todo lo que empieza con `x-` es una extensión de Compose.
- Docker Compose no lo inicia como contenedor.
- `&node-dev` define un ancla YAML.
- `<<: *node-dev` copia esa configuración dentro de `api-dev` y `web-dev`.

Se usa para no repetir configuración común de desarrollo, por ejemplo:

- imagen Node LTS;
- directorio `/app`;
- volúmenes del monorepo;
- cache de pnpm;
- variables `PNPM_HOME` y `PATH`.

## Volúmenes Docker

El compose define volúmenes nombrados:

| Volumen | Uso |
| --- | --- |
| `postgres-data` | Datos de PostgreSQL de desarrollo. |
| `pgadmin-data` | Configuración interna de pgAdmin. |
| `pnpm-store` | Cache de paquetes pnpm dentro de Docker. |
| `root-node-modules` | `node_modules` raíz dentro de Docker. |
| `api-node-modules` | Dependencias de `apps/api` dentro de Docker. |
| `web-node-modules` | Dependencias de `apps/web` dentro de Docker. |
| `shared-node-modules` | Dependencias de `packages/shared` dentro de Docker. |

Estos volúmenes evitan que Docker escriba miles de archivos de dependencias dentro del repositorio.

Si aparece una carpeta `.pnpm-store/` o `pnpm-store/` en el proyecto, puedes borrarla:

```bash
rm -rf .pnpm-store pnpm-store
```

Ya están ignoradas por Git.

## Comandos locales sin Docker

Si prefieres ejecutar el proyecto localmente:

```bash
pnpm install
pnpm dev
```

Comandos disponibles:

```bash
pnpm dev
pnpm dev:api
pnpm dev:web
pnpm build
pnpm typecheck
```

Para ejecutar sin Docker necesitas configurar una base PostgreSQL y definir `DATABASE_URL` para la API.
