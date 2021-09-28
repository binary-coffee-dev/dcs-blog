FROM node:14.16-alpine3.11

WORKDIR /app

COPY package.json ./package.json
RUN npm install

COPY api ./api
COPY config ./config
COPY extensions ./extensions
COPY public ./public
COPY docker-compose.yml ./docker-compose.yml
COPY Dockerfile ./Dockerfile
COPY .editorconfig ./.editorconfig
COPY .eslintignore ./.eslintignore
COPY .eslintrc ./.eslintrc
COPY .env ./.env
COPY favicon.png ./favicon.png
COPY start.sh ./start.sh

RUN npm run build

CMD ["/bin/bash", "start.sh"]
