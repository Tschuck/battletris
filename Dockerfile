FROM node:16.13.0-alpine AS build
COPY . .
WORKDIR /app
RUN yarn install
# ensure correct enviroment is set for ui to be built in
ARG VUE_APP_BATTLETRIS_SERVER="http://localhost:5000"
ARG VUE_APP_BATTLETRIS_WS="ws://localhost:5000"
RUN yarn deploy

# copy the built sources
FROM node:16.13.0-alpine
COPY --from=build /app/.deploy /app
WORKDIR /app
RUN yarn install
EXPOSE 5000
CMD ["yarn", "start"]
