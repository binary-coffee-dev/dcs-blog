'use strict';

module.exports = (controller) => {
  controller.loginWithProvider = async function(ctx) {
    const authService = strapi.service('plugin::users-permissions.extra');
    const {provider, code} = ctx.args.data || ctx.args;
    const providerLogic = authService.provider[provider];
    const authData = await providerLogic.auth()(code);
    if (authData.access_token) {
      const userData = await providerLogic.user()(authData.access_token);
      const providerItem = await authService.findOrCreateProvide({
        ...userData,
        provider,
        scope: authData.scope,
        token: authData.access_token
      });
      let user;
      if (!providerItem.user) {
        user = await authService.createUserByProvider(providerItem, userData.email);
      } else {
        await strapi.query('plugin::users-permissions.user').update({
          where: {id: providerItem.user.id},
          data: {email: userData.email}
        });
        user = {id: providerItem.user.id};
      }
      user = await strapi.query('plugin::users-permissions.user').findOne({where: {id: user.id}, populate: ['role']});
      return strapi.service('plugin::users-permissions.jwt').issue({id: user.id, role: user.role.type});
    }
    return {};
  };
};
