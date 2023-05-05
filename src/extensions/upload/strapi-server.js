const canRemoveFilePolicy = require('./policies/canRemoveFile');
const canUploadPolicy = require('./policies/canUpload');
const lifecycles = require('./lifecycles');

function includePoliciesIfMissing(route) {
  if (!route.config) {
    route.config = {policies: []};
  }
  if (!route.config.policies) {
    route.config.policies = [];
  }
}

module.exports = (plugin) => {
  lifecycles(plugin);

  plugin.policies['canRemoveFile'] = canRemoveFilePolicy;
  plugin.policies['canUpload'] = canUploadPolicy;

  plugin.routes['content-api'].routes.forEach(route => {
    if (route.handler === 'content-api.destroy') {
      includePoliciesIfMissing(route);
      route.config.policies.push('canRemoveFile');
    }
    if (route.handler === 'content-api.upload') {
      includePoliciesIfMissing(route);
      route.config.policies.push('canUpload');
    }
  });

  return plugin;
};
