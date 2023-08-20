'use strict';

const migration1_0_0 = require('./1.0.0-initial_migration');

const migration = {
  version: '3.0.0',
  description: 'Setting up subscription permissions.',

  migrate: async () => {
    let publicRole = await migration1_0_0.createRoleIfNotExist('public');
    let authRole = await migration1_0_0.createRoleIfNotExist('authenticated');
    let staffRole = await migration1_0_0.createRoleIfNotExist('staff');
    let adminRole = await migration1_0_0.createRoleIfNotExist('administrator');

    const controllers = [
      {
        roles: [authRole, publicRole, staffRole, adminRole],
        controller: 'subscription.subscription',
        actions: ['subscribe', 'verify', 'unsubscribe'],
        type: 'api'
      }
    ];

    await migration1_0_0.executePermissionMigrations(controllers);
  }
};

module.exports = migration;
