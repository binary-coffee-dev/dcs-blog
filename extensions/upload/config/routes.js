const {routes} = require('../../../node_modules/strapi-plugin-upload/config/routes');

routes.forEach(route => {
  if (route.handler === 'Upload.destroy') {
    route.config = {
      ...route.config,
      policies: [
        ...route.config.policies,
        'canRemoveFile'
      ]
    };
  }
});

module.exports = {routes};
