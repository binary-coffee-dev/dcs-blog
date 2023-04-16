'use strict';

async function createRoleIfNotExist(type, name, description) {
  let role = await strapi.query('role', 'users-permissions').findOne({type});
  if (!role) {
    role = await strapi.query('role', 'users-permissions').create({name, description, type});
  }
  return role;
}

async function updateOrCreateRolePermissions(role, controller, action, enabled, type) {
  const permission = await strapi.query('permission', 'users-permissions')
    .find({role: role.id, controller, action});
  if (permission.length) {
    await strapi.query('permission', 'users-permissions')
      .update({role: role.id, controller, action}, {enabled});
  } else {
    await strapi.query('permission', 'users-permissions')
      .create({role: role.id, controller, action, enabled, type});
  }
}

module.exports = {
  version: '1.0.0',
  description: 'Initial setting up after migrations from mongodb to mysql.',

  migrate: async () => {
    let authRole = await createRoleIfNotExist(
      'authenticated', 'Authenticated', 'Default role given to authenticated user.');
    let publicRole = await createRoleIfNotExist(
      'public', 'Public', 'Default role given to unauthenticated user.');
    let staffRole = await createRoleIfNotExist(
      'staff', 'Staff', 'Users that can review the all the articles.');
    let adminRole = await createRoleIfNotExist(
      'administrator', 'Administrator', 'Administration control in the application.');

    const controllers = [
      {
        roles: [authRole, publicRole, staffRole, adminRole],
        controller: 'podcast',
        actions: ['count', 'find', 'findone', 'podcastbyidentifier'],
        enabled: true,
        type: 'application'
      },
      {
        roles: [authRole, staffRole, adminRole],
        controller: 'post',
        actions: ['create', 'update'],
        enabled: true,
        type: 'application'
      },
      {
        roles: [authRole, publicRole, staffRole, adminRole],
        controller: 'post',
        actions: ['count', 'find', 'findone', 'feedbyusername', 'findonebyname', 'findsimilarposts', 'getpostbodybyname', 'feed'],
        enabled: true,
        type: 'application'
      },
      {
        roles: [authRole, publicRole, staffRole, adminRole],
        controller: 'opinion',
        actions: ['count', 'find', 'findone'],
        enabled: true,
        type: 'application'
      }
    ];

    for (let controller of controllers) {
      for (let action of controller.actions) {
        for (let role of controller.roles) {
          await updateOrCreateRolePermissions(role, controller.controller, action, controller.enabled, controller.type);
        }
      }
    }
  }
};
