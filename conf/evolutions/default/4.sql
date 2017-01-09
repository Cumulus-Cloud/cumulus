# --- Forth database schema

# --- !Ups

ALTER TABLE filechunk ADD COLUMN hash varchar(32) NOT NULL;

# --- !Downs

ALTER TABLE filechunk DROP COLUMN hash RESTRICT;
