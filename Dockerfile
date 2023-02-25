FROM node:lts-alpine
RUN apk update
RUN apk add git
RUN addgroup -S openiapgroup && adduser -S openiapuser -G openiapgroup
USER openiapuser
# WORKDIR /home/openiapuser
# COPY --chown=openiapuser:openiapgroup tsconfig.json /home/openiapuser/tsconfig.json
# COPY --chown=openiapuser:openiapgroup package.json /home/openiapuser/package.json
WORKDIR /tmp
COPY --chown=openiapuser:openiapgroup tsconfig.json /tmp/tsconfig.json
COPY --chown=openiapuser:openiapgroup package.json /tmp/package.json
# RUN npm i && npm i ts-node ts-proto
RUN npm i
ENV HOME=.
# COPY --chown=openiapuser:openiapgroup src /home/openiapuser/src
COPY --chown=openiapuser:openiapgroup src /tmp/src
# CMD [ "/usr/local/bin/npm", "run", "agent" ]
# CMD ["npm", "run", "start"]
CMD ["node", "./src/main.js"]

