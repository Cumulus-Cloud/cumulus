# --- !Ups

  -- User
  CREATE TABLE cumulus_user (
    id       UUID         PRIMARY KEY,
    email    VARCHAR(255) NOT NULL,
    login    VARCHAR(64)  NOT NULL,
    metadata JSONB        NOT NULL      -- Contains metadata about the user (security info, etc...)
  );

  CREATE UNIQUE INDEX user_mail_unique ON cumulus_user (LOWER(email));
  CREATE UNIQUE INDEX user_login_unique ON cumulus_user (LOWER(login));

  -- File system
  CREATE TABLE fs_node (
    id           UUID      PRIMARY KEY,
    path         TEXT      NOT NULL,
    name         TEXT      NOT NULL,
    node_type    TEXT      NOT NULL,
    creation     TIMESTAMP NOT NULL,
    modification TIMESTAMP NOT NULL,
    hidden       BOOLEAN   NOT NULL,
    user_id      UUID      REFERENCES cumulus_user(id), -- Owner
    metadata     JSONB     NOT NULL                     -- Contains metadata about the node and its content
  );

  -- Each fs node should be unique for each user
  CREATE UNIQUE INDEX fs_node_unique_path ON fs_node (path, user_id);

  -- Sharing
  CREATE TABLE sharing (
    id                  UUID          PRIMARY KEY,
    reference           VARCHAR(64)   NOT NULL,
    user_id             UUID          REFERENCES cumulus_user(id), -- Owner
    fsNode_id           UUID          REFERENCES fs_node(id),      -- Node shared
    metadata            JSONB         NOT NULL                     -- Contains metadata about the sharing
  );

  CREATE UNIQUE INDEX sharing_reference_unique ON sharing (reference);

  CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

# --- !Downs

  DROP INDEX IF EXISTS user_mail_unique;
  DROP INDEX IF EXISTS user_login_unique;
  DROP INDEX IF EXISTS fs_node_unique_path;
  DROP INDEX IF EXISTS sharing_reference_unique;

  DROP TABLE IF EXISTS sharing;
  DROP TABLE IF EXISTS fs_node;
  DROP TABLE IF EXISTS cumulus_user;

  DROP EXTENSION IF EXISTS fuzzystrmatch;
