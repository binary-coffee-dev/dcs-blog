FROM node:10.16.3

ARG DATABASE_HOST=127.0.0.1
ARG DATABASE_PORT=27018

ENV DATABASE_HOST $DATABASE_HOST
ENV DATABASE_PORT $DATABASE_PORT

WORKDIR /app

COPY api ./api
COPY config ./config
COPY extensions ./extensions
COPY public ./public
COPY docker-compose.yml ./docker-compose.yml
COPY Dockerfile ./Dockerfile
COPY .editorconfig ./.editorconfig
COPY .eslintignore ./.eslintignore
COPY .eslintrc ./.eslintrc
COPY favicon.ico ./favicon.ico
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json

RUN npm install
RUN npm run build

CMD ["npm", "start"]