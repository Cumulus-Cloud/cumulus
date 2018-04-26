<p align="center"><img src="https://cumulus-cloud.github.io/assets/img/logo3.png" width="280" /></p>
<p align="center">
  <span><img style="display: inline-block; width: 50%" src="https://cumulus-cloud.github.io/assets/img/logos/scala.png"></span>
  <span style="margin-right: 30px"><img src="https://cumulus-cloud.github.io/assets/img/logos/play.png"></span>
  <span><img src="https://cumulus-cloud.github.io/assets/img/logos/akka.png"></span>
  <span><img src="https://cumulus-cloud.github.io/assets/img/logos/postgresql.png"></span>
</p>

# Cumulus Server

API of the **Cumulus Web Application**. The API is responsible for handling the virtual file system and the multiple upload storages. The Cumulus API is moslty REST-like and made with ease of use in mind.


The web server used is [Play! Framework](https://www.playframework.com/) in [embed mode](https://www.playframework.com/documentation/2.6.x/ScalaEmbeddingPlayAkkaHttp) ; giving us more flexibility and control on how to start/restart/stop programatically the server.

[Akka Stream](https://akka.io/) is used (through Play!) for all the operations on the upload/download files (encryption, compression, splitting in chunks, integrity tests and upload).

Metadata storage is handled by [Anorm](https://playframework.github.io/anorm/) with [PostgreSQL](https://www.postgresql.org/).

### Building the server
#### Developpement
To build & start the server using sbt:
```
$ sbt run
```
You may also simply build the server:
```
$ sbt compile
```
> Both command will also compile the `routes` file and the twirls templates. Note that since this project is using an embed Play! server, there is unfortunately no Play!'s like hot-reload mecanism ; but `~run` can still be used. 

#### Production
Both **sbt-native-packager** and **sbt-assembly** are available as sbt commands.

If you wish to generate a standalone Jar file containing everything needed to run the project (a.k.a. a fat Jar) , you can use **sbt-assembly**:
```
$ sbt assembly
```
The generated fat Jar will be available in the `target/scala-2.12` directory, and can be directly used:
```
$ java -jar /target/scala-2.12/cumulus-server-assembly-0.1-SNAPSHOT.jar
```
For more informations, refers to the [own projet page](https://github.com/sbt/sbt-assembly).

If instead you want to create an installer or a launching app, you  can use **sbt-native-packager** (which is used by default by Play! as the build plugin):
```
$ sbt universal:packageBin # To generate a zip
$ sbt stage                # To generate a non-compressed app ready to run
```
Once generated, the app can also be directly used:
```
$ ./target/universal/stage/bin/cumulus-server
```
For more informations, refers to the [own projet page](https://github.com/sbt/sbt-native-packager).

> Note that the server will need some environement variable to be set in production mode, or to customise the HTTP binding. See the part on the configuration file for more information.

### Launching & using the server

#### Prerequisites
You'll need :

- SBT, to build the application (see the building part)
- PostreSQL 10.x or docker & docker-compose

> Even if we recommend to use docker, you still can configure the server to use your own services. The development configuration override should be done inside the custom configuration file `local.conf`, based on `local.example.conf`.

#### With docker
A docker compose file in `/devtools/docker` is already defined, mounting the storage point and starting a PostgreSQL server (and also a mail server, not used for now).

```
$ cd /devtools/docker
$ docker-compose up -d
```

#### Without docker
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

> For now, only the local storage is available. Note that the configuration inside the docker compose provided is already configured using environment variables.

> In the future replication will be available, allowing to define multiple source with priorities. 

### Configuration file
> TODO

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
