'use strict';

const fs = require('fs');
const path = require('path');

const Mongoose = require('mongoose');

let MigrationVersion;

const MigrationCore = {
  run: async () => {
    const versions = (await MigrationCore.getVersions()).reduce((set, version) => {
      set.add(version.version);
      return set;
    }, new Set());

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
    migrations = migrations || [];
    await MigrationCore.connect(strapi.config.connections.default);
    const model = MigrationCore.getMigrationModel();
    await model.create(migrations);
    MigrationCore.disconnect();
  },

  getVersions: async () => {
    await MigrationCore.connect(strapi.config.connections.default);
    const model = MigrationCore.getMigrationModel();
    const versions = await model.find();
    MigrationCore.disconnect();
    return versions;
  },

  getMigrationModel: () => {
    if (!MigrationVersion) {
      const migrationVersionSchema = new Mongoose.Schema({
        version: String,
        description: String
      });
      MigrationVersion = Mongoose.model('migration_version', migrationVersionSchema);
    }
    return MigrationVersion;
  },

  connect: async (connection) => {
    const {username, password, srv} = connection.settings;
    const {authenticationDatabase, ssl} = connection.options;

    const connectOptions = {};

    if (username) {
      connectOptions.user = username;

      if (password) {
        connectOptions.pass = password;
      }
    }

    if (authenticationDatabase) {
      connectOptions.authSource = authenticationDatabase;
    }

    connectOptions.ssl = !!ssl;
    connectOptions.useNewUrlParser = true;
    connectOptions.dbName = connection.settings.database;

    return Mongoose.connect(
      `mongodb${srv ? '+srv' : ''}://${connection.settings.host}${
        !srv ? `:${connection.settings.port}` : ''
      }/`,
      connectOptions
    );
  },

  disconnect: () => {
    Mongoose.connection.close();
  }
};

module.exports = MigrationCore;
