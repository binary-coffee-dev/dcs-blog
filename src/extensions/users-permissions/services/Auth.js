module.exports = {
  findOrCreateProvide: async ({username, provider, scope, avatar, html_url, name, token}) => {
    let provide = await strapi.query('provider').findOne({username, provider});
    if (!provide) {
      provide = await strapi.query('provider').create({username, provider, scope, avatar, url: html_url, name, token});
    }
    return provide;
  },

  createUserByProvider: async (provider) => {
    let user, username = provider.username, count = 1;
    do {
      user = await strapi.query('user', 'users-permissions').findOne({username});
      if (user) {
        username = provider.username + (count++);
      }
    } while (user);
    const authenticatedRole = await strapi.query('role', 'users-permissions').findOne({type: 'authenticated'});
    return await strapi.query('user', 'users-permissions').create({
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
