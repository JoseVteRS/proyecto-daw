#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCHEMA_FILE="${ROOT_DIR}/apps/api/src/server/db/schema.sql"
COMPOSE_FILE="${COMPOSE_FILE:-${ROOT_DIR}/compose.yml}"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"

DB_NAME="${DB_NAME:-proyecto_daw}"
DB_USER="${DB_USER:-proyecto_daw}"
DB_PASSWORD="${DB_PASSWORD:-proyecto_daw}"

if [[ ! -f "${SCHEMA_FILE}" ]]; then
  echo "No se encontro el schema SQL en: ${SCHEMA_FILE}"
  exit 1
fi

if ! docker compose -f "${COMPOSE_FILE}" ps --status running "${POSTGRES_SERVICE}" | rg -q "${POSTGRES_SERVICE}"; then
  echo "El servicio '${POSTGRES_SERVICE}' no esta corriendo."
  echo "Inicia la base con: docker compose up -d ${POSTGRES_SERVICE}"
  exit 1
fi

echo "Creando base de datos '${DB_NAME}' (si no existe)..."
docker compose -f "${COMPOSE_FILE}" exec -T \
  -e PGPASSWORD="${DB_PASSWORD}" \
  "${POSTGRES_SERVICE}" \
  psql -v ON_ERROR_STOP=1 -U "${DB_USER}" -d postgres <<SQL
SELECT 'CREATE DATABASE "${DB_NAME}"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')
\gexec
SQL

echo "Aplicando esquema..."
docker compose -f "${COMPOSE_FILE}" exec -T \
  -e PGPASSWORD="${DB_PASSWORD}" \
  "${POSTGRES_SERVICE}" \
  psql -v ON_ERROR_STOP=1 -U "${DB_USER}" -d "${DB_NAME}" < "${SCHEMA_FILE}"

echo "Base de datos lista: ${DB_NAME}"
