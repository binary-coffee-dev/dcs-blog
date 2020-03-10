'use strict';

const User = require('strapi-plugin-users-permissions/controllers/User');

const UserNew = {
  ...User,
  async me(ctx) {
    await User.me(ctx);
    if (!ctx.body.avatar) {
      const FIRST_PROVIDER = 0;
      const providerId = ctx.state.user.providers[FIRST_PROVIDER];
      const provider = await strapi.services.provider.findOne({id: providerId});
      ctx.body.avatar = {
        url: provider.avatar
      };
    }
  },
};

module.exports = UserNew;
