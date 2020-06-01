'use strict';

const axios = require('axios');

module.exports = {
  user: async (token) => {
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
  },
  auth: async (code) => {
    const req = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: strapi.config.githubClientId,
      client_secret: strapi.config.githubClientSecret,
      code,
    }, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return req.data;
  }
};
