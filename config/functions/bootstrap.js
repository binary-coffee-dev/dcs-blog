'use strict';

const migrationCore = require('../../src/db/migration-core');

module.exports = async () => {
  await migrationCore.run();
};
