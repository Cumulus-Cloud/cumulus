FROM java:8u102-jre

COPY target/universal/stage /opt/cumulus

VOLUME /usr/logs/cumulus

WORKDIR /opt/cumulus

CMD /opt/cumulus/bin/cumulus
