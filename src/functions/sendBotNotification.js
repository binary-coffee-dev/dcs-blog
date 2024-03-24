const axios = require('axios');

/**
 *
 * @param strapi
 * @param message
 * @return {Promise<void>}
 */
module.exports = async (strapi, message) => {
  if (strapi && message) {
    try {
      await axios.post(strapi.config.custom.botNotifierUrl, {message}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(strapi.config.custom.botNotificationToken).toString('base64')}`
        }
      });
    } catch (e) {
      console.error('Fail to send bot notification', e);
    }
  }
};
