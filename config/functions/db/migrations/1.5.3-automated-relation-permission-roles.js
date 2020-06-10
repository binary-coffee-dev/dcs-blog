'use strict';

module.exports = {
  version: '1.5.3',
  description: 'Automated relation between permission and roles (upload)',
  migrate: async () => {
    const publicRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'public'});
    await strapi.plugins['users-permissions'].models.permission
      .updateMany({controller: 'post', action: ['find', 'count'], role: publicRole.id}, {$set: {enabled: true}});
  },
};
