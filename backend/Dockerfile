FROM node:24.7.0-alpine
RUN apk add --no-cache sqlite
WORKDIR /app/
COPY /. .
RUN tree


RUN npm install


CMD [ "node", "admin-service"]
