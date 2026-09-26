ARG APP_DIR
FROM docker.io/library/node:22-alpine AS build
ARG APP_DIR
WORKDIR /workspace
COPY elinea-sdk ./elinea-sdk
COPY elinea-ui ./elinea-ui
COPY ${APP_DIR} ./${APP_DIR}
WORKDIR /workspace/${APP_DIR}
RUN npm ci \
    && ln -s /workspace/${APP_DIR}/node_modules /workspace/node_modules \
    && npm run build

FROM docker.io/library/node:22-alpine
ARG APP_DIR
ENV NODE_ENV=production NITRO_HOST=0.0.0.0 NITRO_PORT=3000
WORKDIR /app
COPY --from=build /workspace/${APP_DIR}/.output ./
USER node
EXPOSE 3000
CMD ["node", "server/index.mjs"]
