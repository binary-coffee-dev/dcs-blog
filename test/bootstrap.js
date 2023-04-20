/* eslint-disable */
const Strapi = require('strapi');

const dropDB = require('./helpers/dropDB');

before(async function () {
  this.timeout(0);

  // await Strapi({autoReload: false, browser: false}).start();
  await Strapi().load();
  strapi.app
    .use(strapi.router.routes())
    .use(strapi.router.allowedMethods());

  // create initial admin by default
  await strapi.admin.services.user.create({
    blocked: false,
    username: "admin-test",
    password: "$2a$10$2c6VeLadgXmRk/CVqVs2h.GOl9llW46uCes0pMBR.Q55/r5HnZL0.",
    email: "guille@a.com"
  });
});

after(async () => {
  await dropDB(strapi);
  await strapi.stop(0);
});
