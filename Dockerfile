FROM java:8u111-jre-alpine

RUN apk add --no-cache bash

COPY server/target/universal/stage /opt/cumulus

VOLUME /usr/logs/cumulus

WORKDIR /opt/cumulus

CMD /opt/cumulus/bin/cumulus-server
