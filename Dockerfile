###
# image chung có thể sử dụng cho tất cả các service.

###

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
# Kết quả biên dịch của từng service sẽ được lưu trong thư mục dist.
# Image chứa mã nguồn và bản build của tất cả các service, làm tăng kích thước.
# Nếu một service thay đổi, bạn phải build lại toàn bộ image.
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

# Sử dụng ARG SERVICE_NAME để chỉ định service cần chạy
ARG SERVICE_NAME
ENV SERVICE_NAME=$SERVICE_NAME

CMD yarn "start:${SERVICE_NAME}"
