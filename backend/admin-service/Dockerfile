FROM node:24.7.0-alpine
RUN apk add --no-cache sqlite
WORKDIR /app

COPY backend/admin-service admin-service
WORKDIR /app/admin-service
RUN npm install

WORKDIR /app
RUN mkdir /shared-db
RUN chmod 777 /shared-db


COPY backend/shared-db/ ./shared-db/init.sql
WORKDIR /app/admin-service
RUN node setup.js
CMD ["node", "server.js"]