'use strict';

const _ = require('lodash');

module.exports = {
  version: '1.1.0',
  description: 'Create default roles (authenticated|staff|administrator)',
  migrate: async () => {
    const rolesNames = [
      {type: 'authenticated', description: 'Default role given to authenticated user.'},
      {type: 'staff', description: 'Users that can review the all the articles'},
      {type: 'administrator', description: 'Administration control in the application'}
    ];
    const publicRole = await strapi.plugins['users-permissions'].models.role.findOne({type: 'public'});
    const basePermissions = await strapi.plugins['users-permissions'].models.permission.find({role: publicRole.id});
    const newPermissions = basePermissions.map(permission => ({
      type: permission.type,
      controller: permission.controller,
      action: permission.action,
      enabled: permission.enabled,
      policy: permission.policy
    }));
    for (let {type, description} of rolesNames) {
      const role = await strapi.plugins['users-permissions'].models.role.findOne({type});
      if (!role) {
        const newRole = await strapi.plugins['users-permissions'].models.role.create({name: _.capitalize(type), type, description});
        await strapi.plugins['users-permissions'].models.permission.create(newPermissions.map(permission => ({
          ...permission,
          role: newRole.id
        })));
      }
    }
  }
};
