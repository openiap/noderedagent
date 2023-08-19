FROM openiap/nodeagent:latest
# WORKDIR /root/.openiap/packages/noderedagent
RUN mkdir -p /root/.openiap/packages/noderedagent
# Add package definition
COPY noderedagent.json /root/.openiap/packages/noderedagent.json
# Fix node-red scan error
RUN mkdir -p /usr/local/lib/node_modules
COPY tsconfig.json /root/.openiap/packages/noderedagent/tsconfig.json
COPY package.json /root/.openiap/packages/noderedagent/package.json
RUN cd /root/.openiap/packages/noderedagent && npm i
COPY src /root/.openiap/packages/noderedagent/src
ENV forcedpackageid=noderedagent

# node dist/runagent.js
# cd /root/.openiap/packages/noderedagent
# node src/main.js