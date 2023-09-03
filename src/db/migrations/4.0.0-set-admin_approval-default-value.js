'use strict';

const migration = {
  version: '4.0.0',
  description: 'Set adminApproval default value into post table.',

  migrate: async () => {
    await strapi.query('api::post.post').updateMany({
      data: {
        adminApproval: true,
      }
    });
  }
};

module.exports = migration;
