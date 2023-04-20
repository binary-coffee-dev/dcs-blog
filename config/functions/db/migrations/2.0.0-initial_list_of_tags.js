'use strict';

module.exports = {
  version: '2.0.0',
  description: 'Populating tags',

  migrate: async () => {
    const tags = ['angular', 'algorithms', 'angularjs', 'bitcoin', 'binary_coffee', 'bash', 'blazor', 'bot',
      'crypto_currency', 'c', 'chrome', 'cors', 'c++', 'c#', 'data_structure', 'django', 'docker', 'expressjs',
      'firefox', 'git', 'github', 'gitlab', 'graphql', 'graphene', 'hack', 'heroku', 'icpc', 'java', 'javascript',
      'kotlin', 'linux', 'markdown', 'math', 'microsoft', 'mongodb', 'nodejs', 'php', 'python', 'qt', 'react', 'rss',
      'ruby', 'shell', 'telegram', 'typescript', 'vue', 'windows'];
    for (let name of tags) {
      await strapi.query('tag').create({name});
    }
  }
};