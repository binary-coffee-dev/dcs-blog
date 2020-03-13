'use strict';

const _ = require('lodash');

const Auth = require('strapi-plugin-users-permissions/controllers/Auth');

const AuthNew = _.merge(Auth, {
  loginWithProvider: async (ctx) => {
    const {provider, code} = ctx.request.body;
    const authData = await AuthNew.provider[provider].auth()(code);
    if (authData.access_token) {
      const userData = await strapi.services.github.user(authData.access_token);
      const providerItem = await AuthNew.findOrCreateProvide({
        ...userData,
        provider,
        scope: authData.scope,
        token: authData.access_token
      });
      let user = await strapi.plugins['users-permissions'].models.user.findOne({providers: [providerItem.id]});
      if (!user) {
        user = await AuthNew.createUserByProvider(providerItem);
      }
      return strapi.plugins['users-permissions'].services.jwt.issue({id: user.id});
    }
    return 'test';
  },

  findOrCreateProvide: async ({username, provider, scope, avatar, url, name, token}) => {
    let provide = await strapi.services.provider.findOne({username, provider});
    if (!provide) {
      provide = await strapi.services.provider.create({username, provider, scope, avatar, url, name, token});
    }
    return provide;
  },

  createUserByProvider: async (provider) => {
    let user, username = provider.username, count = 1;
    do {
      user = await strapi.plugins['users-permissions'].models.user.findOne({username});
      if (user) {
        username = provider.username + (count++);
      }
    } while (user);
    const authenticatedRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'authenticated'});
    return await strapi.plugins['users-permissions'].models.user.create({
      username,
      email: 'no@email.com',
      confirmed: true,
      blocked: false,
      name: provider.name,
      page: provider.url,
      avatarUrl: provider.avatar,
      providers: [provider.id],
      role: authenticatedRole.id
    });
  },

  provider: {
    github: {
      auth: () => strapi.services.github.auth
    }
  }
});

module.exports = AuthNew;
