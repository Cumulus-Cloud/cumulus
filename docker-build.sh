#!/bin/bash
set -e

docker build -f build.Dockerfile -t wadjetz/cumulus-dev .

docker run --name postgres-test -e POSTGRES_PASSWORD=cumulus_test -e POSTGRES_USER=cumulus -d postgres

docker run \
-v `pwd`:/home/cumulus/project \
-v $HOME/.ivy2:/home/cumulus/.ivy2 \
-v $HOME/.sbt:/home/cumulus/.sbt \
--name cumulus \
--link postgres-test:postgres \
-e DB_URL="jdbc:postgresql://postgres-test/cumulus" \
-e DB_USER="cumulus" \
-e DB_PASSWORD="cumulus_test" \
-it wadjetz/cumulus-dev

docker build -f prod.Dockerfile -t wadjetz/cumulus .

docker stop postgres-test
