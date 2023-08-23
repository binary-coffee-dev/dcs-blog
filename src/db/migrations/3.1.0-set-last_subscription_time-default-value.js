'use strict';

const migration = {
  version: '3.1.0',
  description: 'Set lastSubscriptionTime default value for existing fields.',

  migrate: async () => {
    await strapi.query('api::subscription.subscription').updateMany({
      data: {lastSubscriptionTime: new Date()}
    });
  }
};

module.exports = migration;
