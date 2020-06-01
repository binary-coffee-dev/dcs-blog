/* eslint-disable */
const Strapi = require('strapi');

const dropDB = require('./helpers/dropDB');

before(async function () {
  this.timeout(10000);
  await Strapi().start();
});

after(async () => {
  await dropDB(strapi);
  await strapi.stop();
});
