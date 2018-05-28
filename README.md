test
# <div align="center"><img src="https://cumulus-cloud.github.io/assets/img/logo3.png" width="280" /></div>

Our vision of the self-hosted cloud, done right. Using state of the art technologies and frameworks, Cumulus aims to be the flawless experience you always wanted. Easy to deploy, fast, secure and with a beautiful UI.

[![Build Status](https://travis-ci.org/Cumulus-Cloud/cumulus.svg?branch=master)](https://travis-ci.org/Cumulus-Cloud/cumulus)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/3faffc97b343404bacff1902e1e78012)](https://www.codacy.com/app/Cumulus/cumulus?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Cumulus-Cloud/cumulus&amp;utm_campaign=Badge_Grade)
[![Docker Badge](https://img.shields.io/badge/docker-up_to_date-blue.svg)](https://hub.docker.com/r/cumuluscloud/cumulus/)

## Deploy and use Cumulus

We recommend using `docker` and `docker-compose` to easily manage and deploy the Cumulus app.

### Official docker image

[cumuluscloud/cumulus](https://hub.docker.com/r/cumuluscloud/cumulus/)

### Using docker compose

To run the cumulus server with `docker-compose` using the latest build you will need a `docker-compose.yml` file looking like this:

```yaml
version: '3.4'
services:

  cumulus_app:
    image: cumuluscloud/cumulus:latest
    ports:
      - 80:9000
    environment:
      DB_URL: "jdbc:postgresql://cumulus_db/cumulus"
      DB_USER: cumulus
      DB_PASSWORD: <Your password>
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
    environment:
      POSTGRES_DB: cumulus
      POSTGRES_USER: cumulus
      POSTGRES_PASSWORD: <Your password>
    volumes:
      - ./cumulus-db:/var/lib/postgresql/data

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
