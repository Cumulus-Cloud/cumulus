<p align="center"><img src="https://cumulus-cloud.github.io/assets/img/logo3.png" width="280" /></p>
<p align="center">
  <span><img style="display: inline-block; width: 50%" src="https://cumulus-cloud.github.io/assets/img/logos/scala.png"></span>
  <span style="margin-right: 30px"><img src="https://cumulus-cloud.github.io/assets/img/logos/play.png"></span>
  <span><img src="https://cumulus-cloud.github.io/assets/img/logos/akka.png"></span>
  <span><img src="https://cumulus-cloud.github.io/assets/img/logos/postgresql.png"></span>
</p>

# Cumulus Server

API of the **Cumulus Web Application**. The API is responsible for handling the virtual file system and the multiple upload storages. The Cumulus API is moslty REST-like and made with ease of use in mind.


The web server used is [Play Framework](https://www.playframework.com/) in [embed mode](https://www.playframework.com/documentation/2.6.x/ScalaEmbeddingPlayAkkaHttp) ; giving us more flexibility and control on how to start/restart/stop programmatically the server.

[Akka Stream](https://akka.io/) is used (through Play) for all the operations on the upload/download files (encryption, compression, splitting in chunks, integrity tests and upload).

Metadata storage is handled by [Anorm](https://playframework.github.io/anorm/) with [PostgreSQL](https://www.postgresql.org/).

### Modules structure

```
cumulus
   |
   +--> cumulus-server
   |       |
   |       +----> cumulus-main-module -------+----> cumulus-core
   |       |                                 |
   |       +----> cumulus-recovery-module ---+
   |       |
   |       +----> cumulus-server-resources
   |       
   +--> cumulus-server-dev
           |
           +----> cumulus-main-module ------------> cumulus-core
           |
           +----> cumulus-server-resources      
```

- `cumulus-server` Embed Play server, with a custom recovery server and a watchdog to allow to restart the server if its first launch failed;
- `cumulus-server-dev` Play server, allowing to have hot reload during development;
- `cumulus-main-module` Main application module, containing the server's routes and controllers;
- `cumulus-recovery-module` Recovery application module;
- `cumulus-server-resources` Contains the shared resources across both version of the Play server;
- `cumulus-core` Core of the application, containing the application's logic.

### Building the server

#### Prerequisites
You'll need :

- SBT, to build the application

For installation instruction for SBT please refers to [SBT own instructions page](https://www.scala-sbt.org/1.0/docs/Getting-Started.html).

> Since SBT is used as the only build tool, you should be able to import the project in your favorite IDE without any problem (Intellij, etc..).

#### Developpement
To build & start the server using Play SBT plugin:
```bash
$ sbt runDev # Alias to cumulusServerDev/run
```
If you wish to see/use/test the custom recovery and installation server, launch the server using directly `run`:
```bash
$ sbt run # Or cumulusServer/run
```
You may also simply build the server:
```bash
$ sbt compile # Or cumulusServer/compile
```
> Both command will also compile the `routes` file and the twirls templates. Note that since this project is using an embed Play server, routes are compiled with a custom plugin and may not reload automatically the server even while using `runDev`. 

#### Production
The SBT plugin **sbt-native-packager** (which is used by default by Play as the build plugin) is used to generate the build packages.

> While we would be happy to also use **sbt-assembly** to generate a standalone Jar file containing everything needed to run the project (a.k.a. a fat Jar), this is not possible due to the fact that we use Bouncy Castle as a security provider. As a security provider, the Bouncy Castle's Jar file is signed and thus cannot be unzipped like the other Jars.

For example, to generate a non-compressed app ready to run:
```
$ sbt stage # To generate a non-compressed app ready to run
```
Once generated, the app can be directly used:
```
$ ./cumulus-server/target/universal/stage/bin/cumulus-server
```
For more information, refers to the [own projet page](https://github.com/sbt/sbt-native-packager).

> Note that the server will need some environement variable to be set in production mode, or to customise the HTTP binding. See the part on the configuration file for more information.

### Launching & using the server

#### Prerequisites
You'll need :

- SBT, to build the application (see the building part)
- PostreSQL 10.x or docker & docker-compose

> Even if we recommend to use docker, you still can configure the server to use your own services. The development configuration override should be done inside the custom configuration file `local.conf`, based on `local.example.conf`.

#### With docker
A docker compose file in `devtools/docker` is already defined, mounting the storage point and starting a PostgreSQL server (and also a mail server, not used for now).

```
$ cd devtools/docker
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
