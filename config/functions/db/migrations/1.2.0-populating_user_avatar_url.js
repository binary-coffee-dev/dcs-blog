'use strict';

module.exports = {
  version: '1.2.0',
  description: 'Populating the user avatarUrl parameter',
  migrate: async () => {
    const users = await strapi.plugins['users-permissions'].models.user.find().populate(['providers']);
    for (let user of users) {
      if (user.avatar) {
        user.avatarUrl = user.avatar.url;
        await user.save();
      } else if (user.providers && user.providers.length > 0) {
        const FIRST_PROVIDER = 0;
        user.avatarUrl = user.providers[FIRST_PROVIDER].avatar;
        await user.save();
      }
    }
  }
};
