'use strict';

const Auth = require('strapi-plugin-users-permissions/controllers/Auth');

module.exports = {
  ...Auth,
  loginWithProvider: async (ctx) => {
    const authService = strapi.plugins['users-permissions'].services.auth;
    const {provider, code} = ctx.request.body;
    const authData = await authService.provider[provider].auth()(code);
    if (authData.access_token) {
      const userData = await strapi.services.github.user(authData.access_token);
      const providerItem = await authService.findOrCreateProvide({
        ...userData,
        provider,
        scope: authData.scope,
        token: authData.access_token
      });
      let user = await strapi.plugins['users-permissions'].models.user.findOne({providers: [providerItem.id]});
      if (!user) {
        user = await authService.createUserByProvider(providerItem);
      }
      return strapi.plugins['users-permissions'].services.jwt.issue({id: user.id});
    }
    return {};
  }
};
