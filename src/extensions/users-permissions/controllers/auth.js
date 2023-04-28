'use strict';

module.exports = (controller) => {
  controller.loginWithProvider = async function(ctx) {
    const authService = strapi.service('plugin::users-permissions.user').auth;
    const {provider, code} = ctx.request.body;
    const authData = await authService.provider[provider].auth()(code);
    if (authData.access_token) {
      const userData = await strapi.service('api::provider.github').user(authData.access_token);
      const providerItem = await authService.findOrCreateProvide({
        ...userData,
        provider,
        scope: authData.scope,
        token: authData.access_token
      });
      let user = await strapi.query('plugin::users-permissions.user').findOne({id: providerItem.user.id});
      if (!user) {
        user = await authService.createUserByProvider(providerItem);
        user = await strapi.query('plugin::users-permissions.user').findOne({id: user.id});
      }
      return strapi.service('plugin::users-permissions.jwt').issue({id: user.id, role: user.role.type});
    }
    return {};
  };
};
