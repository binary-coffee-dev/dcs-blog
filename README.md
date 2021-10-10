# Binary Coffee API

|branch|`master`|`develop`|
|---|---|---|
|build|![Build Status](https://github.com/binary-coffee-dev/dcs-blog/actions/workflows/deployment.yml/badge.svg?branch=master)|![Build Status](https://github.com/binary-coffee-dev/dcs-blog/actions/workflows/deployment.yml/badge.svg?branch=develop)|
|coverage|[![codecov](https://codecov.io/gh/binary-coffee-dev/dcs-blog/branch/master/graph/badge.svg?token=p4GAR0FbLK)](https://codecov.io/gh/binary-coffee-dev/dcs-blog)|[![codecov](https://codecov.io/gh/binary-coffee-dev/dcs-blog/branch/develop/graph/badge.svg?token=p4GAR0FbLK)](https://codecov.io/gh/binary-coffee-dev/dcs-blog)|

This the API application of the website [binary-coffee.dev](https://binary-coffee.dev). This API is based in [strapi](https://strapi.io).

## Setup project

Before start the project, make sure that mongodb is properly working in the 27017 port, or you can use the database configuration of this project in this repository: [blog-database](https://github.com/dcs-community/blog-database)

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

Any contribution is welcome, but please first read the CONTRIBUTING guide: [CONTRIBUTING.md](./CONTRIBUTING.md)

You can also support the community donating money for our infrastructure and other related expenses:

|Donation method|Badge|
|-------------|----|
|Github sponsor|[![GitHub Sponsors](https://img.shields.io/github/sponsors/binary-coffee-dev?style=for-the-badge&color=success&logo=githubsponsors)](https://github.com/sponsors/binary-coffee-dev/sponsorships?preview=false&frequency=recurring&amount=5)|
|Paypal|[![paypal](https://img.shields.io/badge/paypal-donate-success?style=for-the-badge&logo=paypal)](https://www.paypal.com/donate?hosted_button_id=66HG7ANLYHYZ4)|
|Patreon|[![patreon](https://img.shields.io/badge/patreon-join-success?style=for-the-badge&logo=patreon)](https://www.patreon.com/join/7569568/checkout?ru=undefined)|
|Bitcoin|[![Donate with Bitcoin](https://en.cryptobadges.io/badge/big/bc1q3vszxqvms8snh72qdp8a20v79n4c838zw0n9jg)](https://en.cryptobadges.io/donate/bc1q3vszxqvms8snh72qdp8a20v79n4c838zw0n9jg)|
|Etherium|[![Donate with Ethereum](https://en.cryptobadges.io/badge/big/0x2f2EB4006Bb9b5fd20369691103B97fA13980a58)](https://en.cryptobadges.io/donate/0x2f2EB4006Bb9b5fd20369691103B97fA13980a58)|
|Invite us to a coffee|[![](https://cdn.buymeacoffee.com/buttons/arial-green.png)](https://www.buymeacoffee.com/binarycoffee)|

Thank you for the help!!!

## License

The license of this application can be found here [LICENSE.md](./LICENSE.md)
