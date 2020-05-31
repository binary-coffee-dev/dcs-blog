'use strict';

module.exports = {
  version: '1.4.0',
  description: 'Fix accounts with the user name null in the provider',
  migrate: async () => {
    const providers = await strapi.models.provider.find();
    for (let provider of providers) {
      let user = await strapi.plugins['users-permissions'].models.user.findOne({providers: [provider.id]});
      if (!user) {
        await module.exports.createUser(provider);
      }
    }
  },

  /**
   * This is a duplicated code, but is necessary, because if in the future the original code change,
   * this script will change, and this can't happen, this code should be the same because is a migration
   * script.
   * @param provider {Provider}
   * @returns {Promise<User>}
   */
  createUser: async (provider) => {
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
  }
};
