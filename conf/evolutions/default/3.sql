# --- Third database schema

# --- !Ups

CREATE TABLE filechunk (
  id                      UUID      PRIMARY KEY,
  size                    BIGINT    NOT NULL,
  storage_engine          TEXT      NOT NULL,
  storage_engine_version  TEXT      NOT NULL,
  creation                TIMESTAMP NOT NULL,
  position                INT       NOT NULL,
  file_id                 UUID      REFERENCES fsnode(id) ON DELETE CASCADE
);

# --- !Downs

DROP TABLE IF EXISTS filechunk;
