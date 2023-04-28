'use strict';

async function createRoleIfNotExist(type, name, description) {
  let role = await strapi.query('plugin::users-permissions.role').findOne({where: {type}});
  if (!role) {
    role = await strapi.query('plugin::users-permissions.role').create({data: {name, description, type}});
  }
  return role;
}

async function updateOrCreateRolePermissions(role, type, controller, action) {
  const searchAction = `${type}::${controller}.${action}`;
  let permission = await strapi.query('plugin::users-permissions.permission')
    .findOne({where: {action: searchAction, role: role.id}});
  if (!permission) {
    await strapi.query('plugin::users-permissions.permission')
      .create({data: {action: searchAction, role: role.id}});
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
        controller: 'podcast.podcast',
        actions: ['count', 'find', 'findone', 'podcastbyidentifier'],
        type: 'api'
      },
      {
        roles: [authRole, publicRole, staffRole, adminRole],
        controller: 'episode.episode',
        actions: ['count', 'find', 'findone'],
        type: 'api'
      },
      {
        roles: [authRole, staffRole, adminRole],
        controller: 'post.post',
        actions: ['create', 'update'],
        type: 'api'
      },
      {
        roles: [authRole, publicRole, staffRole, adminRole],
        controller: 'post.post',
        actions: ['count', 'find', 'findone', 'feedbyusername', 'findonebyname', 'findsimilarposts', 'getpostbodybyname', 'feed'],
        type: 'api'
      },
      {
        roles: [authRole, publicRole, staffRole, adminRole],
        controller: 'upload.upload',
        actions: ['count', 'find', 'findone', 'findconnection', 'search'],
        type: 'plugin'
      },
      {
        roles: [authRole, staffRole, adminRole],
        controller: 'upload.upload',
        actions: ['upload', 'destroy'],
        type: 'plugin'
      },
      {
        roles: [authRole, publicRole, staffRole, adminRole],
        controller: 'opinion.opinion',
        actions: ['count', 'find', 'findone'],
        type: 'api'
      },
      {
        roles: [authRole, staffRole, adminRole],
        controller: 'opinion.opinion',
        actions: ['create', 'delete'],
        type: 'api'
      },
      {
        roles: [publicRole, authRole, staffRole, adminRole],
        controller: 'users-permissions.user',
        actions: ['toppopularusers', 'topactiveusers', 'find', 'findone', 'find2', 'update'],
        type: 'plugin'
      },
      {
        roles: [publicRole, authRole, staffRole, adminRole],
        controller: 'users-permissions.auth',
        actions: ['loginwithprovider'],
        type: 'plugin'
      },
      {
        roles: [authRole, publicRole, staffRole, adminRole],
        controller: 'comment.comment',
        actions: ['count', 'find', 'findone', 'recentcomments'],
        type: 'api'
      },
      {
        roles: [authRole, staffRole, adminRole],
        controller: 'comment.comment',
        actions: ['create', 'update', 'delete'],
        type: 'api'
      },
      {
        roles: [authRole, publicRole, staffRole, adminRole],
        controller: 'image.image',
        actions: ['find', 'findone', 'findextra', 'count'],
        type: 'api'
      },
      {
        roles: [authRole, publicRole, staffRole, adminRole],
        controller: 'tag.tag',
        actions: ['find', 'findone', 'count'],
        type: 'api'
      },
    ];

    for (let controller of controllers) {
      for (let action of controller.actions) {
        for (let role of controller.roles) {
          await updateOrCreateRolePermissions(role, controller.type, controller.controller, action);
        }
      }
    }
  }
};
