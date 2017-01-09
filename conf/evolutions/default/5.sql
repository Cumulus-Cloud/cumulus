# --- Fifth database schema

# --- !Ups

CREATE TABLE filemetadata (
  id                      UUID         PRIMARY KEY,
  size                    BIGINT       NOT NULL,
  mime_type               VARCHAR(255) NOT NULL,
  file_id                 UUID         REFERENCES fsnode(id) ON DELETE CASCADE
);

ALTER TABLE filechunk ADD COLUMN cipher varchar(32);
ALTER TABLE filechunk ADD COLUMN compression varchar(32);

# --- !Downs

DROP TABLE IF EXISTS filemetadata;

ALTER TABLE filechunk DROP COLUMN cipher RESTRICT;
ALTER TABLE filechunk DROP COLUMN compression RESTRICT;