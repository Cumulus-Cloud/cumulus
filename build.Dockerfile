FROM wadjetz/scala-sbt-nodejs

RUN useradd -ms /bin/bash cumulus

VOLUME /home/cumulus/project
VOLUME /home/cumulus/.ivy2
VOLUME /home/cumulus/.sbt

#RUN chown -R cumulus:cumulus /home/cumulus

#USER cumulus

WORKDIR /home/cumulus/project

CMD cd client && npm install && npm test && npm run build && cd ../  && sbt test && sbt stage
