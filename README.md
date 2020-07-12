# Binary Coffee API

[![codecov](https://codecov.io/gh/dcs-community/dcs-blog/branch/master/graph/badge.svg)](https://codecov.io/gh/dcs-community/dcs-blog)
[![Build Status](https://travis-ci.com/dcs-community/dcs-blog.svg?branch=master)](https://travis-ci.com/dcs-community/dcs-blog)

This the API application of the website [binary-coffee.dev](https://binary-coffee.dev). This API is based in [strapi](https://strapi.io).


## Setup project

The project depend of mongodb. Before start the project, make sure that mongodb is properly working in the 27018 port or you can use the database configuration of this project in this repository: [blog-database](https://github.com/dcs-community/blog-database)

### Start project

**Via docker**

```
docker-compose up -d
```

**Via command line**
```
npm start
```

## Run tests

```
npm test
```

## Environment variables

- `DATABASE_NAME`: database name, default: `blog-dev`
- `DATABASE_HOST`: database host, default: `127.0.0.1`
- `DATABASE_PORT`: database port, default: `27018`
- `DATABASE_USERNAME`: database username, *OPTIONAL*
- `DATABASE_PASSWORD`: database password, *OPTIONAL*
- `CAPTCHA_SECRET`: secret use for generate the captcha
- `API_URL`: API url
- `SITE_URL`: website url

## Contributing

Any contribution is welcome, but please first read the CONTRIBUTING guide: [CONTRIBUTING.md](https://github.com/dcs-community/dcs-frontend/blob/master/CONTRIBUTING.md)

And remember that you can invite us to a coffee:

[![](https://cdn.buymeacoffee.com/buttons/arial-green.png)](https://www.buymeacoffee.com/binarycoffee)
