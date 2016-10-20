FROM wadjetz/scala-sbt-nodejs

RUN useradd -ms /bin/bash cumulus

VOLUME /home/cumulus/project
VOLUME /home/cumulus/.ivy2
VOLUME /home/cumulus/.sbt
VOLUME /home/cumulus/.npm

RUN chown -R cumulus:cumulus /home/cumulus

USER cumulus

WORKDIR /home/cumulus/project

CMD npm install && npm test && npm run build && sbt test && sbt stage
