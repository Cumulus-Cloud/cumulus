FROM java:8u111-jre-alpine

COPY server/target/universal/stage /opt/cumulus

VOLUME /usr/logs/cumulus

WORKDIR /opt/cumulus

CMD /opt/cumulus/bin/cumulus
