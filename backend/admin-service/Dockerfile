FROM node:24.7.0-alpine
RUN apk add --no-cache sqlite
WORKDIR /app/
COPY /. .
RUN tree

WORKDIR admin-service

CMD [ "node", "server.js"]
