'use strict';

const axios = require('axios');
const {createCoreService} = require('@strapi/strapi').factories;

module.exports = createCoreService('api::provider.provider', ({strapi}) => ({
  async getProviderAvatar(providers) {
    for (let provider of providers) {
      const prov = await strapi.query('api::provider.provider').findOne({where: {id: provider.id}});
      if (prov.avatar) {
        return prov.avatar;
      }
    }
  },
  github: {
    async auth(code) {
      const req = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: strapi.config.custom.githubClientId,
        client_secret: strapi.config.custom.githubClientSecret,
        code,
      }, {
        headers: {
          'Accept': 'application/json'
        }
      });
      return req.data;
    },
    async user(token) {
      const req = await axios.get('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`
        }
      });
      return {
        username: req.data.login,
        avatar: req.data.avatar_url,
        url: req.data.url,
        name: req.data.name,
        email: req.data.email
      };
    }
  }
}));
