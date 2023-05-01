const cronTasks = require("./cron-tasks");

module.exports = ({env}) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // cron: {
  //   enabled: true,
  //   tasks: cronTasks
  // },
  app: {
    keys: [env('SECRET1', 'mySecretKey1'), env('SECRET2', 'mySecretKey2')]
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  }
});
