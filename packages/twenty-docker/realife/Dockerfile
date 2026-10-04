# Realife build: the official image with only the frontend replaced.
# The server is left exactly as released so that upgrades stay a matter of
# bumping BASE_IMAGE and rebasing the frontend changes.
ARG BASE_IMAGE=twentycrm/twenty:v2.44.0
FROM ${BASE_IMAGE}

USER root
RUN rm -rf /app/packages/twenty-server/dist/front
COPY --chown=1000 ./packages/twenty-front/build /app/packages/twenty-server/dist/front
USER 1000

LABEL org.opencontainers.image.source="https://github.com/REALIFE-HD/twenty"
LABEL org.opencontainers.image.description="Twenty with Realife mobile UI changes."
