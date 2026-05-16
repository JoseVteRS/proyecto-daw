-- Schema SQL para la agenda normalizada a 3FN
-- Motor objetivo: PostgreSQL

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS roles (
  id SMALLINT PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(60) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS priorities (
  id SMALLINT PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(60) NOT NULL,
  description TEXT,
  sort_order SMALLINT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id SMALLINT NOT NULL DEFAULT 1 REFERENCES roles(id),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT categories_user_name_unique UNIQUE (user_id, name),
  CONSTRAINT categories_color_format CHECK (
    color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'
  )
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  priority_id SMALLINT NOT NULL DEFAULT 2 REFERENCES priorities(id),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  event_date_start TIMESTAMPTZ NOT NULL,
  event_date_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT events_date_range_valid CHECK (event_date_end > event_date_start)
);

INSERT INTO roles (id, code, name, description)
VALUES
  (1, 'NORMAL', 'Normal', 'Usuario estándar'),
  (2, 'ADMIN', 'Administrador', 'Usuario administrador')
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO priorities (id, code, name, description, sort_order)
VALUES
  (1, 'LOW', 'Baja', 'Prioridad baja', 1),
  (2, 'MEDIUM', 'Media', 'Prioridad media', 2),
  (3, 'HIGH', 'Alta', 'Prioridad alta', 3)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_category_id ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_priority_id ON events(priority_id);
CREATE INDEX IF NOT EXISTS idx_events_date_range ON events(event_date_start, event_date_end);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_event_category_owner()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM categories
    WHERE categories.id = NEW.category_id
      AND categories.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'La categoría del evento debe pertenecer al mismo usuario';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_roles_updated_at ON roles;
CREATE TRIGGER trg_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_priorities_updated_at ON priorities;
CREATE TRIGGER trg_priorities_updated_at
BEFORE UPDATE ON priorities
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_events_updated_at ON events;
CREATE TRIGGER trg_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_events_validate_category_owner ON events;
CREATE TRIGGER trg_events_validate_category_owner
BEFORE INSERT OR UPDATE OF user_id, category_id ON events
FOR EACH ROW
EXECUTE FUNCTION validate_event_category_owner();
