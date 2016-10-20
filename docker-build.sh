#!/bin/bash

docker build -f dev.Dockerfile -t wadjetz/cumulus-dev .

docker run --name postgres-test -e POSTGRES_PASSWORD=cumulus_test -e POSTGRES_USER=cumulus -d postgres

docker run \
-v `pwd`:/home/cumulus/project \
-v $HOME/.ivy2:/home/cumulus/.ivy2 \
-v $HOME/.npm:/home/cumulus/.npm \
-v $HOME/.sbt:/home/cumulus/.sbt \
-v $HOME/.npm:/home/cumulus/.npm \
--name cumulus \
--link postgres-test:postgres \
-e DB_URL="jdbc:postgresql://postgres-test/cumulus" \
-e DB_USER="cumulus" \
-e DB_PASSWORD="cumulus_test" \
-it wadjetz/cumulus-dev

docker stop postgres-test
