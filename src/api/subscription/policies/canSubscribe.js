'use strict';

module.exports = async (ctx, config, {strapi}) => {
  if (!(ctx && ctx.args && ctx.args.email)) {
    return false;
  }

  const {email} = ctx.args;
  const value = await strapi.query('api::subscription.subscription').findMany({where: {email}});

  if (value.length === 0) {
    return true;
  } else if (!strapi.service('api::subscription.subscription').isSubscribedToday(value[0].lastSubscriptionTime)) {
    return true;
  }

  return false;
};
