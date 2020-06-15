'use strict';

module.exports = {
  version: '1.5.4',
  description: 'Automated relation between permission and roles (opinion model)',
  migrate: async () => {
    const publicRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'public'});
    const writerRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'authenticated'});
    const staffRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'staff'});
    const adminRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'administrator'});
    const roles = [writerRole, staffRole, adminRole];
    await strapi.plugins['users-permissions'].models.permission.updateMany({
      controller: 'opinion',
      action: ['find', 'count', 'findone'],
      role: publicRole.id
    }, {$set: {enabled: true}});
    for (let role of roles) {
      await strapi.plugins['users-permissions'].models.permission.updateMany({
        controller: 'opinion',
        action: ['find', 'count', 'findone', 'create', 'delete'],
        role: role.id
      }, {$set: {enabled: true}});
    }
  },
};
