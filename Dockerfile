# FROM openiap/nodeagent:0.0.91-43
FROM openiap/nodeagent:0.0.111-4

# Add package definition
COPY --chown=openiapuser:root noderedagent.json /home/openiapuser/.openiap/packages/noderedagent.json
COPY --chown=openiapuser:root tsconfig.json /home/openiapuser/.openiap/packages/noderedagent/tsconfig.json
COPY --chown=openiapuser:root package.json /home/openiapuser/.openiap/packages/noderedagent/package.json

# Install dependencies
RUN cd /home/openiapuser/.openiap/packages/noderedagent && npm i

# Copy source code
COPY --chown=openiapuser:root src /home/openiapuser/.openiap/packages/noderedagent/src

USER root
# Set the correct permissions for OpenShift
RUN chown -R openiapuser:root /home/openiapuser/.openiap/packages && \
    chmod -R 775 /home/openiapuser/.openiap/packages && \
    chmod -R 775 /home/openiapuser/.openiap/packages/noderedagent

# Openshift hack
RUN chmod -R 777 /home/openiapuser
RUN rm -r /home/openiapuser/.npm/*

USER openiapuser

ENV forcedpackageid=noderedagent
