FROM node:24.21.0-alpine3.23

WORKDIR /client

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 4200

ENTRYPOINT ["/bin/sh", "entrypoint.sh"]
