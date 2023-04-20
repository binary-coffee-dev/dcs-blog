'use strict';

const migrationCore = require('./db/migration-core');

module.exports = async () => {
  await migrationCore.run();
};
