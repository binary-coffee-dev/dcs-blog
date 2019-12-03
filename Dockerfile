FROM node:10.16.3

WORKDIR /app

COPY api ./
COPY config ./
COPY extensions ./
COPY public ./
COPY docker-compose.yml ./
COPY Dockerfile ./
COPY .editorconfig ./
COPY .eslintignore ./
COPY .eslintrc ./
COPY favicon.ico ./
COPY package.json ./
COPY package-lock.json ./

RUN npm install
RUN npm run build

CMD ["npm start"]
