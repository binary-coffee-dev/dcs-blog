'use strict';

module.exports = {
  version: '1.5.1',
  description: 'Automated relation between permission and roles (post.findonebyname)',
  migrate: async () => {
    const writerRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'authenticated'});
    const staffRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'staff'});
    const adminRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'administrator'});
    await strapi.plugins['users-permissions'].models.permission
      .updateMany({controller: 'post', action: ['findonebyname', 'findone', 'feed', 'findsimilarposts'], role: writerRole.id}, {$set: {enabled: true}});
    await strapi.plugins['users-permissions'].models.permission
      .updateMany({controller: 'post', action: ['findonebyname', 'findone', 'feed', 'findsimilarposts'], role: staffRole.id}, {$set: {enabled: true}});
    await strapi.plugins['users-permissions'].models.permission
      .updateMany({controller: 'post', action: ['findonebyname', 'findone', 'feed', 'findsimilarposts'], role: adminRole.id}, {$set: {enabled: true}});
  },
};
