'use strict';

module.exports = {
  version: '1.5.9',
  description: 'Automated relation between permission and roles (comment model)',
  migrate: async () => {
    const publicRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'public'});
    const writerRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'authenticated'});
    const staffRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'staff'});
    const adminRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'administrator'});
    const roles = [writerRole, staffRole, adminRole, publicRole];
    for (let role of roles) {
      await strapi.plugins['users-permissions'].models.permission.updateMany({
        controller: 'ad',
        action: ['find'],
        role: role.id
      }, {$set: {enabled: true}});
      await strapi.plugins['users-permissions'].models.permission.updateMany({
        controller: 'ad',
        action: ['findrandom'],
        role: role.id
      }, {$set: {enabled: true}});
    }
  },
};
