const Request = require('request');

/**
 *
 * @param strapi
 * @param message
 * @param channelName
 * @return {Promise<void>}
 */
module.exports = async (strapi, {message, channelName = 'bcStaffs'}) => {
  if (strapi && message && channelName) {
    Request.post({
      'headers': {'content-type': 'application/json'},
      'url': strapi.config.custom.botNotifierUrl,
      'body': JSON.stringify({
        'Message': message,
        'ChannelName': channelName
      })
    });
  }
};
