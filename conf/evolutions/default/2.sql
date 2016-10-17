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
  account_id   UUID          REFERENCES account(id),
  directory_id UUID          REFERENCES directory(id),
  permissions  VARCHAR(64)[] NOT NULL
);

# --- !Downs

DROP TABLE IF EXISTS directory_permission;
DROP TABLE IF EXISTS directory;