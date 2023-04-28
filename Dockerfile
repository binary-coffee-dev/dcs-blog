FROM node:16.19.1-alpine3.17

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY src/api ./api
COPY config ./config
COPY src/extensions ./extensions
COPY public ./public
COPY docker-compose.yml Dockerfile .editorconfig .eslintignore .env start.sh favicon.png .eslintrc ./

RUN npm run build

CMD ["/bin/sh", "start.sh"]
