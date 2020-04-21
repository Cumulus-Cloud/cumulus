
DROP INDEX IF EXISTS user_mail_unique;
DROP INDEX IF EXISTS user_login_unique;
DROP INDEX IF EXISTS fs_node_unique_path;
DROP INDEX IF EXISTS sharing_reference_unique;

DROP TABLE IF EXISTS sharing;
DROP TABLE IF EXISTS fs_node;
DROP TABLE IF EXISTS cumulus_session;
DROP TABLE IF EXISTS cumulus_user;
DROP TABLE IF EXISTS cumulus_event;

DROP EXTENSION IF EXISTS fuzzystrmatch;
