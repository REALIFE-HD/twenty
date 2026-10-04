#!/usr/bin/env bash
# Ships packages/twenty-front/build to the CRM server and restarts Twenty on
# an image built there from the official one. Run from the repository root
# after `npx nx build twenty-front`.
#
#   bash packages/twenty-docker/realife/deploy.sh <tag>
#
# The restart takes about two minutes, during which the CRM is unavailable.
set -euo pipefail

SERVER=${REALIFE_SERVER:-root@187.127.214.178}
TAG=${1:?usage: deploy.sh <tag, e.g. v2.44.0-realife.1>}
HERE=packages/twenty-docker/realife
BUILD_DIR=/opt/twenty/realife-build

if [ ! -f packages/twenty-front/build/index.html ]; then
  echo "packages/twenty-front/build is missing; run npx nx build twenty-front first" >&2
  exit 1
fi

echo "Uploading the frontend build"
tar -czf /tmp/realife-front.tgz -C packages/twenty-front build
ssh "$SERVER" "rm -rf $BUILD_DIR && mkdir -p $BUILD_DIR/packages/twenty-front /opt/twenty/realife"
scp -q /tmp/realife-front.tgz "$HERE/Dockerfile" "$SERVER:$BUILD_DIR/"
scp -q "$HERE/realife-mobile.css" "$HERE/patch-index.sh" "$SERVER:/opt/twenty/realife/"
sed "s/REALIFE_IMAGE_TAG/$TAG/" "$HERE/docker-compose.override.yml" > /tmp/realife-override.yml
scp -q /tmp/realife-override.yml "$SERVER:/opt/twenty/docker-compose.override.yml.next"

echo "Building realife/twenty:$TAG on the server"
ssh "$SERVER" "set -e
  cd $BUILD_DIR
  tar -xzf realife-front.tgz -C packages/twenty-front
  docker build -q -t realife/twenty:$TAG -f Dockerfile .
  cd /opt/twenty
  cp docker-compose.override.yml docker-compose.override.yml.prev 2>/dev/null || true
  mv docker-compose.override.yml.next docker-compose.override.yml
  docker compose up -d server"

echo "Waiting for Twenty to become healthy"
ssh "$SERVER" 'for i in $(seq 1 90); do
  [ "$(docker inspect -f "{{.State.Health.Status}}" twenty-server-1)" = healthy ] && { echo "healthy after ~$((i*5))s"; exit 0; }
  sleep 5
done
echo "not healthy after 7.5 minutes; roll back with: cd /opt/twenty && mv docker-compose.override.yml.prev docker-compose.override.yml && docker compose up -d server" >&2
exit 1'
