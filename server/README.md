## Cumulus Server

API of the Cumulus Webapp, handling the virtual file system and the multiple upload storages. The Cumulus API is moslty
REST-like and made with ease of use in mind.

### Launch the server

#### Prerequisites
You'll need :

- SBT, to build the application
- PostreSQL 10.x or docker & docker-compose

##### Without docker
Even if we recommend to use docker, you still can configure the server to use your own services. The development configuration override should be done inside the custom configuration file `local.conf`, based on `local.example.conf`.

You will need to at least update the configuration file to match the configuration of your database:

```hocon
db {
  default {
    driver = org.postgresql.Driver
    url = "jdbc:postgresql://yourUrl/yourDatabase"
    username = yourUsername
    password = yourPassword
  }
}
```

Note that the configuration inside the docker compose provided is already configured using environment variables.
This is only needed to use an external database.

You may also need to change the default storage location to suit your needs:

```hocon
cumulus {

  # Configuration for all storage engines
  storageEngines {

    default = "local"

    local {
      type = "LocalStorageEngine"
      version = "0.1"
      path = "yourPath/"
    }
 
  }

}
```

For now, only the local storage is done. Note that the configuration inside the docker compose provided is already configured using environment variables.

##### With docker
A docker compose file in `server/devtools/docker` is already defined, mounting the storage point and starting a PostgreSQL server (and also a mail server, not used for now).

```
$ cd server/devtools/docker
$ docker-compose up -d
```

#### Compile and build the server
To build & start the server using sbt:
```
$ sbt run
```
You may also simply build the server:
```
$ sbt compile
```
.. or clean the compilation results:
```
$ sbt clean
```

### Stack

- Web server
  - **Play Framework**
  - **Play Json**
  - **Akka Stream** for file handling
- Persistence
  - **PostgreSQL** as the main database
  - **Anorm** to access the database
- Thumbnail generation
  - **Scrimage** for images
  - **PDFBox** for PDFs
- Ciphers
  - **BouncyCastle** for Scrypt and AES
