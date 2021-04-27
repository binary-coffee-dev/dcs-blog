'use strict';

module.exports = {
  version: '1.5.9',
  description: 'Automated relation between permission and roles (comment model)',
  migrate: async () => {
    const writerRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'authenticated'});
    const staffRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'staff'});
    const adminRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'administrator'});
    const roles = [writerRole, staffRole, adminRole];
    for (let role of roles) {
      await strapi.plugins['users-permissions'].models.permission.updateMany({
        controller: 'image',
        action: ['find'],
        role: role.id
      }, {$set: {enabled: true}});
      await strapi.plugins['users-permissions'].models.permission.updateMany({
        controller: 'image',
        action: ['findExtra'],
        role: role.id
      }, {$set: {enabled: true}});
    }
  },
};
