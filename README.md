# Cumulus Cloud

## Deploy and use Cumulus

We recomand using `docker` and `docker-compose` to easily manage and deploy the Cumulus app

### Using docker compose

To run the cumulus server with `docker-compose` using the latest build you will need a `docker-compose.yml` file looking like this: 

```yaml
version: '3.4'
services:

  cumulus_app:
    image: wadjetz/cumulus:latest
    ports:
      - 80:9000
    environment:
      DB_URL: "jdbc:postgresql://cumulus_db/cumulus"
      DB_USER: cumulus
      DB_PASSWORD: cumulus
      APPLICATION_SECRET: <Your app secret>
    volumes:
      - ./cumulus-storage:/opt/cumulus/storage
      - ./cumulus-log:/opt/cumulus/log
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

Alternatively, you can also build the docker yourself by compiling the project:

```bash
cd server && sbt stage
```

And then using the provided `Dockerfile` in your `docker-compose` file:

```yaml
...
  cumulus_app:
    build: .
...
```
For more information on how to build the app, please refer to the corresponding section of this readme.

### Manually

> TODO

## Building

### Webapp (Font)

Refer to the [corresponding readme](client/README.md)

### Server (Back)

Refer to the [corresponding readme](server/README.md)
