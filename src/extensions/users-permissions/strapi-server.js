const userController = require('./controllers/user');
const authController = require('./controllers/auth');
const userService = require('./services/user');

function createRoute(actionName, controller, method) {
  return {method, path: `/${actionName}`, handler: `${controller}.${actionName}`,};
}

module.exports = (plugin) => {
  userController(plugin.controllers.user);
  authController(plugin.controllers.auth);

  userService(plugin.services);

  plugin.routes['content-api'].routes.push(createRoute('topPopularUsers', 'user', 'GET'));
  plugin.routes['content-api'].routes.push(createRoute('topActiveUsers', 'user', 'GET'));
  plugin.routes['content-api'].routes.push(createRoute('users', 'user', 'GET'));
  plugin.routes['content-api'].routes.push(createRoute('loginWithProvider', 'auth', 'POST'));

  return plugin;
};
