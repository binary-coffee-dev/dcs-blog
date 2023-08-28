/*
Cron fromat:

*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)

 */

module.exports = {
  subscriptionEmails: {
    task: ({strapi}) => {
      console.log('Sending emails to the subscribers');
      strapi.config.functions.subscriptionsEmails
        .sendEmailWithLatestPosts('Últimos artículos publicados en BinaryCoffee', 7).then();
    },
    options: {
      // every friday
      // rule: "0 18 16 * * 5",
      rule: '0 30 * * * *',
    },
  },
};
