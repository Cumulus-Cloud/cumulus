# --- First database schema

# --- !Ups

-- Account
  CREATE TABLE account (
    id       UUID          PRIMARY KEY,
    mail     VARCHAR(255)  NOT NULL,
    login    VARCHAR(64)   NOT NULL,
    password VARCHAR(64)   NOT NULL,
    creation TIMESTAMP     NOT NULL,
    roles    VARCHAR(64)[] NOT NULL,
    home     TEXT
  );

  CREATE UNIQUE INDEX account_mail_unique ON account (LOWER(mail));
  CREATE UNIQUE INDEX account_login_unique ON account (LOWER(login));

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

-- File system
  CREATE TABLE fsnode (
    id           UUID      PRIMARY KEY,
    location     TEXT      NOT NULL,
    name         TEXT      NOT NULL,
    node_type    TEXT      NOT NULL,
    creation     TIMESTAMP NOT NULL,
    modification TIMESTAMP NOT NULL,
    hidden       BOOLEAN   NOT NULL,
    account_id   UUID      REFERENCES account(id)
  );

  CREATE TABLE permission (
    account_id   UUID          REFERENCES account(id)   ON DELETE CASCADE,
    directory_id UUID          REFERENCES fsnode(id) ON DELETE CASCADE,
    permissions  VARCHAR(64)[] NOT NULL
  );

  -- Create the root directory
  INSERT INTO fsnode (id, location, name, node_type, creation, modification, account_id)
  VALUES (
    uuid_generate_v4(),
    '/',
    '',
    'directory',
    NOW(),
    NOW(),
    FALSE,
    (SELECT id FROM account WHERE login = 'admin')
  );

  CREATE TABLE filemetadata (
    id                      UUID         PRIMARY KEY,
    size                    BIGINT       NOT NULL, -- File size
    hash                    VARCHAR(32)  NOT NULL, -- File hash
    mime_type               VARCHAR(255) NOT NULL,
    file_id                 UUID         REFERENCES fsnode(id) ON DELETE CASCADE
  );

  CREATE TABLE filesource (
    id                      UUID        PRIMARY KEY,
    size                    BIGINT      NOT NULL, -- Real size
    hash                    VARCHAR(32) NOT NULL, -- Real hash
    cipher                  VARCHAR(32),
    compression             VARCHAR(32),
    secretKey               VARCHAR(256),
    storage_engine          TEXT        NOT NULL,
    storage_engine_version  TEXT        NOT NULL,
    creation                TIMESTAMP   NOT NULL,
    file_id                 UUID        REFERENCES fsnode(id) ON DELETE CASCADE
  );

# --- !Downs

  DROP TABLE IF EXISTS filesource;
  DROP TABLE IF EXISTS filemetadata;
  DROP TABLE IF EXISTS permission;
  DROP TABLE IF EXISTS fsnode;
  DROP TABLE IF EXISTS account;