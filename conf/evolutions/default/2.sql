# --- Second database schema

# --- !Ups

CREATE TABLE directory (
  id           UUID      PRIMARY KEY,
  location     TEXT      NOT NULL,
  name         TEXT      NOT NULL,
  creation     TIMESTAMP NOT NULL,
  modification TIMESTAMP NOT NULL,
  account_id   UUID      REFERENCES account(id)
);

CREATE TABLE directory_permission (
  account_id   UUID          REFERENCES account(id)   ON DELETE CASCADE,
  directory_id UUID          REFERENCES directory(id) ON DELETE CASCADE,
  permissions  VARCHAR(64)[] NOT NULL
);

-- Insert the root and the admin
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the admin
INSERT INTO account (id, mail, login, password, creation, roles)
VALUES (
  uuid_generate_v4(),
  'admin@admin.tld',
  'admin',
  'unusable', -- Since password are bcrypted, nobody will be able to use this account
  NOW(),
  '{"admin", "user"}'
);

-- Create the root directory
INSERT INTO directory (id, location, name, creation, modification, account_id)
VALUES (
  uuid_generate_v4(),
  '/',
  '',
  NOW(),
  NOW(),
  (SELECT id FROM account WHERE login = 'admin')
);

# --- !Downs

DROP TABLE IF EXISTS directory_permission;
DROP TABLE IF EXISTS directory;