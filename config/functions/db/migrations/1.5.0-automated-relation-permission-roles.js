'use strict';

module.exports = {
  version: '1.5.0',
  description: 'Automated relation between permission and roles (post.find)',
  migrate: async () => {
    const writerRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'authenticated'});
    const staffRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'staff'});
    const adminRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'administrator'});
    await strapi.plugins['users-permissions'].models.permission
      .updateMany({controller: 'post', action: ['find', 'count', 'create', 'update'], role: writerRole.id}, {$set: {enabled: true}});
    await strapi.plugins['users-permissions'].models.permission
      .updateMany({controller: 'post', action: ['find', 'count', 'create', 'update'], role: staffRole.id}, {$set: {enabled: true}});
    await strapi.plugins['users-permissions'].models.permission
      .updateMany({controller: 'post', action: ['find', 'count', 'create', 'update', 'delete'], role: adminRole.id}, {$set: {enabled: true}});
  },
};
