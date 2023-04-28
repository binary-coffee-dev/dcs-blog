const userController = require('./controllers/user');
const authController = require('./controllers/auth');
const userService = require('./services/user');
const authService = require('./services/auth');

module.exports = (plugin) => {

  userController(plugin.controllers.user);
  authController(plugin.controllers.auth);

  userService(plugin.services.user);
  authService(plugin.services.user);

  return plugin;
};
