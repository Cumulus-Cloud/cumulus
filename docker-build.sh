#!/bin/bash

npm run build

sbt test

sbt stage

docker build -t wadjetz/cumulus .

docker push wadjetz/cumulus
