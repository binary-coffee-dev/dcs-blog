'use strict';

module.exports = {
  version: '1.5.2',
  description: 'Automated relation between permission and roles (upload)',
  migrate: async () => {
    const writerRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'authenticated'});
    const staffRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'staff'});
    const adminRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'administrator'});
    await strapi.plugins['users-permissions'].models.permission
      .updateMany({
        controller: 'upload',
        action: ['destroy', 'upload', 'find', 'findone', 'count', 'findconnection', 'search'],
        role: writerRole.id
      }, {$set: {enabled: true}});
    await strapi.plugins['users-permissions'].models.permission
      .updateMany({
        controller: 'upload',
        action: ['destroy', 'upload', 'find', 'findone', 'count', 'findconnection', 'search'],
        role: staffRole.id
      }, {$set: {enabled: true}});
    await strapi.plugins['users-permissions'].models.permission
      .updateMany({
        controller: 'upload',
        action: ['destroy', 'upload', 'find', 'findone', 'count', 'findconnection', 'search', 'updatesettings', 'getsettings'],
        role: adminRole.id
      }, {$set: {enabled: true}});
  },
};
