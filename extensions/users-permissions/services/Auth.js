module.exports = {
  findOrCreateProvide: async ({username, provider, scope, avatar, html_url, name, token}) => {
    let provide = await strapi.services.provider.findOne({username, provider});
    if (!provide) {
      provide = await strapi.services.provider.create({username, provider, scope, avatar, url: html_url, name, token});
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
      confirmed: true,
      blocked: false,
      name: provider.name || username,
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
};
