FROM node:10.16.3

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

CMD ["npm start"]
