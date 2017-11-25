## Cumulus Cloud

# Docker compose
```yaml
version: '3'
services:
  cumulus_app:
    image: wadjetz/cumulus:latest
    ports:
      - 9004:9000
    environment:
      DB_URL: "jdbc:postgresql://cumulus_db/cumulus"
      DB_USER: cumulus
      DB_PASSWORD: cumulus
      APPLICATION_SECRET: qAHPkyB6>e]V@HX>oN9tI?Y9a/uDElwGOvP>avPuzz/k9pjZGJE:3aWNq?/>cssJ
    depends_on:
      - cumulus_db
    restart: on-failure
    command: /opt/cumulus/bin/cumulus-server

  cumulus_db:
    image: postgres:10-alpine
    ports:
      - 5432:5432
    environment:
      POSTGRES_DB: cumulus
      POSTGRES_USER: cumulus
      POSTGRES_PASSWORD: cumulus
    volumes:
      - ./db_data:/var/lib/postgresql/data

```
