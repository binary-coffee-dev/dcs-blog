'use strict';

const bcrypt = require('bcryptjs');

const migration = {
  version: '5.0.0',
  description: 'Create testing users for dev environment (administrator, staff, authenticated).',

  migrate: async () => {
    if (process.env.NODE_ENV === 'development') {
      // create admin testing user
      const administratorRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'administrator' }
      });
      await strapi.query('plugin::users-permissions.user').create({
        data: {
          username: 'admin-testing',
          confirmed: true,
          blocked: false,
          name: 'Admin Testing',
          page: '',
          avatarurl: '',
          providers: [],
          provider: 'local',
          role: administratorRole.id,
          password: await bcrypt.hash(strapi.config.get('custom.testingUsersPassword'), 10),
          email: 'admin-testing@example.com'
        }
      });

      // create staff testing user
      const staffRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'staff' }
      });
      await strapi.query('plugin::users-permissions.user').create({
        data: {
          username: 'staff-testing',
          confirmed: true,
          blocked: false,
          name: 'Staff Testing',
          page: '',
          avatarurl: '',
          providers: [],
          provider: 'local',
          role: staffRole.id,
          password: await bcrypt.hash(strapi.config.get('custom.testingUsersPassword'), 10),
          email: 'staff-testing@example.com'
        }
      });

      // create authenticated testing user
      const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' }
      });
      await strapi.query('plugin::users-permissions.user').create({
        data: {
          username: 'authenticated-testing',
          confirmed: true,
          blocked: false,
          name: 'Authenticated Testing',
          page: '',
          avatarurl: '',
          providers: [],
          provider: 'local',
          role: authenticatedRole.id,
          password: await bcrypt.hash(strapi.config.get('custom.testingUsersPassword'), 10),
          email: 'authenticated-testing@example.com'
        }
      });

      // create authenticated blocked testing user
      await strapi.query('plugin::users-permissions.user').create({
        data: {
          username: 'authenticated-blocked-testing',
          confirmed: true,
          blocked: true,
          name: 'Authenticated Blocked Testing',
          page: '',
          avatarurl: '',
          providers: [],
          provider: 'local',
          role: authenticatedRole.id,
          password: await bcrypt.hash(strapi.config.get('custom.testingUsersPassword'), 10),
          email: 'authenticated-blocked-testing@example.com'
        }
      });

      // create authenticated unconfirmed testing user
      await strapi.query('plugin::users-permissions.user').create({
        data: {
          username: 'authenticated-unconfirmed-testing',
          confirmed: false,
          blocked: false,
          name: 'Authenticated Unconfirmed Testing',
          page: '',
          avatarurl: '',
          providers: [],
          provider: 'local',
          role: authenticatedRole.id,
          password: await bcrypt.hash(strapi.config.get('custom.testingUsersPassword'), 10),
          email: 'authenticated-unconfirmed-testing@example.com'
        }
      });
    }
  }
};

module.exports = migration;
