'use strict';

const fs = require('fs');
const path = require('path');

const migrationTableName = 'migrations';

const MigrationCore = {
  run: async () => {
    const versionsQuery = await MigrationCore.getVersions();
    const versions = new Set();
    for (let entity of versionsQuery) {
      versions.add(entity.version);
    }

    const migrationsPath = path.join(__dirname, 'migrations');
    const dirs = fs.readdirSync(migrationsPath) || [];
    const migrations = [];

    await dirs
      .map(dir => {
        const filePath = path.join(migrationsPath, dir);
        return require(filePath);
      })
      .filter(migrationInstance => !versions.has(migrationInstance.version))
      .reduce((promise, migrationInstance) => {
        migrations.push({
          version: migrationInstance.version,
          description: migrationInstance.description || ''
        });
        return promise.then(() => migrationInstance.migrate());
      }, Promise.resolve());

    await MigrationCore.saveNewMigrations(migrations);
  },

  saveNewMigrations: async (migrations) => {
    const db = strapi.db.connection;
    migrations = migrations || [];
    for(let migration of migrations) {
      await db.raw(
        `INSERT INTO ${migrationTableName} (version, description) VALUES (?,?);`,
        [migration.version, migration.description]);
    }
  },

  getVersions: async () => {
    const db = strapi.db.connection;
    if (process.env.NODE_ENV === 'test') {
      await db.raw(`CREATE TABLE IF NOT EXISTS ${migrationTableName} (id INTEGER NOT NULL, version VARCHAR(255) UNIQUE, description VARCHAR(255), PRIMARY KEY(id AUTOINCREMENT));`);
      return await db.raw(`SELECT * FROM ${migrationTableName};`);
    } else {
      await db.raw(`CREATE TABLE IF NOT EXISTS ${migrationTableName} (id INTEGER NOT NULL AUTO_INCREMENT, version VARCHAR(255) UNIQUE, description VARCHAR(255), PRIMARY KEY(id));`);
      const res = await db.raw(`SELECT * FROM ${migrationTableName};`);
      return res[0];
    }
  }
};

module.exports = MigrationCore;
