# --- !Ups

-- Sharing
  CREATE TABLE sharing (
    id         UUID          PRIMARY KEY,
    code       VARCHAR(64)   NOT NULL,
    password   VARCHAR(255)          ,
    expiration TIMESTAMP             ,
    needAuth   BOOLEAN       NOT NULL,
    user_id    UUID          REFERENCES cumulus_user(id), -- Owner
    fsNode_id  UUID          REFERENCES fs_node(id)       -- Node shared
  );

  CREATE UNIQUE INDEX sharing_code_unique ON sharing (code);

# --- !Downs

  DROP INDEX IF EXISTS sharing_code_unique;

  DROP TABLE IF EXISTS sharing;
