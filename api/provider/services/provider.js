'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
  async getProviderAvatar(providers) {
    for (let provider of providers) {
      const prov = await strapi.services.provider.findOne({id: provider});
      if (prov.avatar) {
        return prov.avatar;
      }
    }
  }
};
