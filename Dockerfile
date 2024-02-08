FROM openiap/nodeagent:0.0.91-25

# Add package definition
COPY --chown=openiapuser:root noderedagent.json /home/openiap/.openiap/packages/noderedagent.json
COPY --chown=openiapuser:root tsconfig.json /home/openiap/.openiap/packages/noderedagent/tsconfig.json
COPY --chown=openiapuser:root package.json /home/openiap/.openiap/packages/noderedagent/package.json

# Install dependencies
RUN cd /home/openiap/.openiap/packages/noderedagent && npm i

# Copy source code
COPY --chown=openiapuser:root src /home/openiap/.openiap/packages/noderedagent/src

USER root
# Set the correct permissions for OpenShift
RUN chown -R openiapuser:root /home/openiap/.openiap/packages && \
    chmod -R 775 /home/openiap/.openiap/packages && \
    chmod -R 775 /home/openiap/.openiap/packages/noderedagent

USER openiapuser

ENV forcedpackageid=noderedagent
