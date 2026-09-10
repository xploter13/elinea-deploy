FROM docker.io/library/node:22-alpine AS build
ARG APP_DIR
ARG NUXT_PUBLIC_API_BASE
ARG NUXT_PUBLIC_SITE=default
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE NUXT_PUBLIC_SITE=$NUXT_PUBLIC_SITE
WORKDIR /app
COPY ${APP_DIR}/package.json ${APP_DIR}/package-lock.json ./
RUN npm ci
COPY ${APP_DIR}/ ./
RUN npm run generate

FROM docker.io/library/nginx:1.28-alpine
COPY elinea-deploy/docker/nginx/static.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/.output/public /usr/share/nginx/html
