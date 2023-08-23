'use strict';

const migration = {
  version: '3.1.1',
  description: 'Set unsubscribeToken default value for existing fields.',

  migrate: async () => {
    await strapi.query('api::subscription.subscription').updateMany({
      data: {unsubscribeToken: strapi.config.functions.token.generate(100)}
    });
  }
};

module.exports = migration;
