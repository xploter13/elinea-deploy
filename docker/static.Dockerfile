ARG APP_DIR
FROM docker.io/library/node:22-alpine AS build
ARG APP_DIR
ARG NUXT_PUBLIC_API_BASE
ARG NUXT_PUBLIC_SITE=default
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE NUXT_PUBLIC_SITE=$NUXT_PUBLIC_SITE
WORKDIR /workspace
COPY elinea-sdk ./elinea-sdk
COPY elinea-ui ./elinea-ui
COPY ${APP_DIR} ./${APP_DIR}
WORKDIR /workspace/${APP_DIR}
RUN npm ci \
    && ln -s /workspace/${APP_DIR}/node_modules /workspace/node_modules \
    && npm run generate

FROM docker.io/library/nginx:1.28-alpine
ARG APP_DIR
COPY elinea-deploy/docker/nginx/static.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/${APP_DIR}/.output/public /usr/share/nginx/html
