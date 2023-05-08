FROM node:16.19.1-alpine3.17

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY src ./src
COPY config ./config
COPY public ./public
COPY database ./database
COPY .env start.sh favicon.png ./

RUN npm run build

CMD ["/bin/sh", "start.sh"]
