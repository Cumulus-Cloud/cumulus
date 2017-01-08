# --- Forth database schema

# --- !Ups

ALTER TABLE filechunk ADD COLUMN hash varchar(32);

# --- !Downs

ALTER TABLE filechunk DROP COLUMN hash RESTRICT;
