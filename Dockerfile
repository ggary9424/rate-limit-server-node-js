FROM node:14.15.4-alpine3.12

ENV NODE_ENV production

RUN apk update && apk upgrade && \
  apk add --no-cache bash tini git

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN chown -R node:node .
USER node

COPY --chown=node:node ./package.json package.json
COPY --chown=node:node ./package-lock.json package-lock.json

RUN npm install --production --quiet

COPY --chown=node:node . .

EXPOSE 5000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index"]