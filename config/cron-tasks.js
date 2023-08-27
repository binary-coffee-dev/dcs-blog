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
      rule: '0 18 16 * * *',
    },
  },
};
