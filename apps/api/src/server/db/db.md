# Modelo de base de datos - Agenda normalizada a 3FN

Documento base para crear el esquema SQL de la agenda.

## Convenciones

- Motor objetivo: PostgreSQL.
- Normalización aplicada hasta Tercera Forma Normal (3FN).
- Identificadores primarios: `UUID` generados con `gen_random_uuid()`.
- Fechas: `TIMESTAMPTZ`.
- Tablas en plural para evitar palabras reservadas.
- Catálogos independientes para valores repetidos (`roles`, `priorities`).
- Campos `created_at` y `updated_at` con valor por defecto `now()`.
- `updated_at` se actualiza automáticamente mediante trigger.

## Normalización 3FN

- 1FN: todos los campos son atómicos y no existen grupos repetidos.
- 2FN: todos los atributos no clave dependen de la clave primaria completa.
- 3FN: no hay dependencias transitivas; los datos descriptivos de roles y prioridades se separan en tablas catálogo.

## TABLES

## ROLES

| property    | type        | constraints               |
| :---------- | :---------- | :------------------------ |
| id          | SMALLINT    | PRIMARY KEY               |
| code        | VARCHAR(30) | NOT NULL, UNIQUE          |
| name        | VARCHAR(60) | NOT NULL                  |
| description | TEXT        | NULL                      |
| created_at  | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` |
| updated_at  | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` |

## PRIORITIES

| property    | type        | constraints               |
| :---------- | :---------- | :------------------------ |
| id          | SMALLINT    | PRIMARY KEY               |
| code        | VARCHAR(30) | NOT NULL, UNIQUE          |
| name        | VARCHAR(60) | NOT NULL                  |
| description | TEXT        | NULL                      |
| sort_order  | SMALLINT    | NOT NULL, UNIQUE          |
| created_at  | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` |
| updated_at  | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` |

## USERS

| property      | type         | constraints                         |
| :------------ | :----------- | :---------------------------------- |
| id            | UUID         | PRIMARY KEY                         |
| role_id       | SMALLINT     | NOT NULL, FOREIGN KEY -> `roles.id` |
| name          | VARCHAR(100) | NOT NULL                            |
| email         | VARCHAR(255) | NOT NULL, UNIQUE                    |
| password_hash | VARCHAR(255) | NOT NULL                            |
| created_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT `now()`           |
| updated_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT `now()`           |

## CATEGORIES

| property    | type         | constraints                         |
| :---------- | :----------- | :---------------------------------- |
| id          | UUID         | PRIMARY KEY                         |
| user_id     | UUID         | NOT NULL, FOREIGN KEY -> `users.id` |
| name        | VARCHAR(100) | NOT NULL                            |
| description | TEXT         | NULL                                |
| color       | VARCHAR(20)  | NULL, formato HEX (`#RRGGBB`)       |
| created_at  | TIMESTAMPTZ  | NOT NULL, DEFAULT `now()`           |
| updated_at  | TIMESTAMPTZ  | NOT NULL, DEFAULT `now()`           |

Notas:

- Una categoría pertenece a un usuario.
- El nombre de categoría no se puede repetir para el mismo usuario.

## EVENTS

| property         | type        | constraints                              |
| :--------------- | :---------- | :--------------------------------------- |
| id               | UUID        | PRIMARY KEY                              |
| user_id          | UUID        | NOT NULL, FOREIGN KEY -> `users.id`      |
| category_id      | UUID        | NULL, FOREIGN KEY -> `categories.id`     |
| priority_id      | SMALLINT    | NOT NULL, FOREIGN KEY -> `priorities.id` |
| name             | VARCHAR(150)| NOT NULL                                 |
| description      | TEXT        | NULL                                     |
| event_date_start | TIMESTAMPTZ | NOT NULL                                 |
| event_date_end   | TIMESTAMPTZ | NOT NULL                                 |
| created_at       | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`                |
| updated_at       | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`                |

Notas:

- Un evento pertenece a un usuario.
- Un evento puede tener categoría, pero no es obligatorio.
- Si tiene categoría, la categoría debe pertenecer al mismo usuario del evento.
- `event_date_end` debe ser posterior a `event_date_start`.
