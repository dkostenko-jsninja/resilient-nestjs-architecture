FROM node:20-alpine

RUN mkdir -p /app
WORKDIR /app

COPY src ./src
COPY nest-cli.json  ./
COPY package.json  ./
COPY package-lock.json  ./
COPY tsconfig.json  ./
COPY tsconfig.build.json  ./

RUN npm ci

RUN npm run build
