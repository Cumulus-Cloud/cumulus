
-- User
CREATE TABLE cumulus_user (
  id       UUID         PRIMARY KEY,
  email    VARCHAR(255) NOT NULL,
  login    VARCHAR(64)  NOT NULL,
  metadata JSONB        NOT NULL      -- Contains metadata about the user (security info, etc...)
);

CREATE UNIQUE INDEX user_mail_unique ON cumulus_user (LOWER(email));
CREATE UNIQUE INDEX user_login_unique ON cumulus_user (LOWER(login));

-- User's session
CREATE TABLE cumulus_session (
  id       UUID  PRIMARY KEY,
  user_id  UUID  REFERENCES cumulus_user(id), -- Owner
  metadata JSONB NOT NULL                     -- Contains metadata about the session
);

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

-- Events
CREATE TABLE cumulus_event (
  id         UUID          PRIMARY KEY,
  user_id    UUID          REFERENCES cumulus_user(id), -- Owner
  creation   TIMESTAMP NOT NULL,
  event_type VARCHAR(64)   NOT NULL,
  metadata   JSONB         NOT NULL                     -- Contains metadata about the events
);

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
