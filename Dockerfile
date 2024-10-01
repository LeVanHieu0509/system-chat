###################################
# Base stage
###################################

FROM node:14 AS base
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile
COPY .env ./
COPY prisma ./
RUN yarn prisma generate

###################################
# Build stage
###################################

FROM base AS dist
COPY . ./
RUN yarn build:gateway \
    && yarn build:auth \
    && yarn build:cashback \
    && yarn build:minigame \
    && yarn build:bitfarm \
    && yarn build:cms \
    && yarn build:cronjob \
    && yarn build:thirdparty \
    && yarn build:wallet

###################################
# Optimize node_modules stage
###################################

FROM dist as node_modules
# Clean up packages and only install prod
RUN yarn --production

###################################
# Final stage
###################################

FROM node:14 as final

WORKDIR /app
COPY . /app
COPY --from=dist /app/dist /app/dist
COPY --from=node_modules /app/node_modules /app/node_modules

ARG SERVICE_NAME
ENV SERVICE_NAME=$SERVICE_NAME

CMD yarn "start:${SERVICE_NAME}"
