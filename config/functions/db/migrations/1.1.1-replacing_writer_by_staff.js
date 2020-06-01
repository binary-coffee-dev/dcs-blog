'use strict';

module.exports = {
  version: '1.1.1',
  description: 'Replacing all users with writer role by the new staff role',
  migrate: async () => {
    const writerRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'writer'});
    const staffRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'staff'});
    if (writerRole) {
      await strapi.plugins['users-permissions'].models.user.updateMany({role: writerRole.id}, {$set: {role: staffRole}});
    }
  }
};
