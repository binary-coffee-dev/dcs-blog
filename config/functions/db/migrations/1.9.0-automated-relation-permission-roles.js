'use strict';

module.exports = {
  version: '1.9.0',
  description: 'Automated relation between permission and roles (podcast/episode models permissions)',
  migrate: async () => {
    const publicRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'public'});
    const writerRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'authenticated'});
    const staffRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'staff'});
    const adminRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'administrator'});

    // podcast model
    for (let role of [publicRole, writerRole, staffRole, adminRole]) {
      await strapi.plugins['users-permissions'].models.permission.updateMany({
        controller: 'podcast',
        action: ['count', 'findone', 'find', 'podcastbyidentifier'],
        role: role.id
      }, {$set: {enabled: true}});
    }
    // episode model
    for (let role of [publicRole, writerRole, staffRole, adminRole]) {
      await strapi.plugins['users-permissions'].models.permission.updateMany({
        controller: 'episode',
        action: ['count', 'findone', 'find'],
        role: role.id
      }, {$set: {enabled: true}});
    }
  },
};
