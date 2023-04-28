module.exports = (service) => {
  service.findOrCreateProvide = async function ({username, provider, scope, avatar, html_url, name, token}) {
    let provide = await strapi.query('provider').findOne({username, provider});
    if (!provide) {
      provide = await strapi.query('provider').create({username, provider, scope, avatar, url: html_url, name, token});
    }
    return provide;
  };

  service.createUserByProvider = async function (provider) {
    let user, username = provider.username, count = 1;
    do {
      user = await strapi.query('plugin::users-permissions.user').findOne({username});
      if (user) {
        username = provider.username + (count++);
      }
    } while (user);
    const authenticatedRole = await strapi.query('role', 'users-permissions').findOne({type: 'authenticated'});
    return await strapi.query('plugin::users-permissions.user').create({
      username,
      confirmed: true,
      blocked: false,
      name: provider.name || username,
      page: provider.url,
      avatarUrl: provider.avatar,
      providers: [provider.id],
      role: authenticatedRole.id
    });
  };

  service.provider = {
    github: {
      auth: () => strapi.service('api::provider.github').auth
    }
  };
};
