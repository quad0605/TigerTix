FROM node:24.7.0-alpine
RUN apk add --no-cache sqlite
WORKDIR /app/
COPY /. .
RUN tree


RUN npm install


CMD sh -c "\
    node admin-service & \
    node user-service & \
    node client-service & \
    node llm-driven-booking & \
    wait \
"