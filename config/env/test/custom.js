const mainCustom = require('../../custom');

module.exports = ({env}) => ({
  ...mainCustom({env}),

  enableBotNotifications: false,
});
