FROM java:8u111-jre-alpine

LABEL maintainer="Wadjetz <egor.neon@gmail.com>"

RUN apk add --no-cache bash

COPY server/target/universal/stage /opt/cumulus

ENV STORAGE_PATH /opt/cumulus/storage

VOLUME [ "/opt/cumulus/log", "/opt/cumulus/storage" ]

EXPOSE 9000

WORKDIR /opt/cumulus

CMD /opt/cumulus/bin/cumulus-server
