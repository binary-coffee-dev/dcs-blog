'use strict';

const migration = {
  version: '3.2.0',
  description: 'Set unsubscribeToken default value for existing fields.',

  migrate: async () => {
    let subs = await strapi.query('api::subscription.subscription').findMany({where: {}});
    for (let sub of subs) {
      await strapi.query('api::subscription.subscription').update({
        where: {id: sub.id},
        data: {unsubscribeToken: strapi.config.functions.token.generate(100)}
      });
    }
  }
};

module.exports = migration;
