FROM node:24.7.0-alpine
RUN apk add --no-cache sqlite
RUN mkdir -p /shared-db
RUN chmod 777 /shared-db
WORKDIR /app/admin-service
COPY backend/admin-service/package*.json ./
RUN npm install
COPY backend/admin-service .
COPY shared-db/init.sql ./init.sql
CMD ["node", "setup.js", "&&", "node", "server.js"]