const userController = require('./controllers/user');
const authController = require('./controllers/auth');
const userService = require('./services/user');

const canUpdate = require('./policies/canUpdate');
const updateUser = require('./policies/updateUser');

function createRoute(actionName, controller, method) {
  return {method, path: `/${actionName}`, handler: `${controller}.${actionName}`};
}

const policies = [['canUpdate', canUpdate], ['updateUser', updateUser]];
const policiesMap = [
  {routeName: 'user.update', policies: ['canUpdate', 'updateUser']}
].reduce((m, p) => {
  m.set(p.routeName, p.policies);
  return m;
}, new Map());

module.exports = (plugin) => {
  userController(plugin.controllers.user);
  authController(plugin.controllers.auth);

  userService(plugin.services);

  policies.forEach(ps => plugin.policies[ps[0]] = ps[1]);

  plugin.routes['content-api'].routes.push(createRoute('topPopularUsers', 'user', 'GET'));
  plugin.routes['content-api'].routes.push(createRoute('topActiveUsers', 'user', 'GET'));
  plugin.routes['content-api'].routes.push(createRoute('users', 'user', 'GET'));
  plugin.routes['content-api'].routes.push(createRoute('loginWithProvider', 'auth', 'POST'));

  plugin.routes['content-api'].routes.forEach(route => {
    if (policiesMap.has(route.handler)) {
      if (!route.config) {
        route.config = {};
      }
      if (!route.config.policies) {
        route.config.policies = [];
      }
      policiesMap.get(route.handler).forEach(p => route.config.policies.push(p));
    }
  });

  return plugin;
};
