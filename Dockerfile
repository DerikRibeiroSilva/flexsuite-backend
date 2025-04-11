FROM node:lts-alpine

RUN apk add --no-cache bash

WORKDIR /home/node/app

COPY express .

RUN yarn

ENTRYPOINT ["yarn", "start"]