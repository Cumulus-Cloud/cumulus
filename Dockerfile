FROM openjdk:8-jre-alpine

COPY target/universal/stage /opt/cumulus

VOLUME /usr/logs/cumulus

WORKDIR /opt/cumulus

CMD /opt/cumulus/bin/cumulus
