'use strict';

module.exports = {
  version: '1.3.0',
  description: 'Populating the tags table with the initial values',
  migrate: async () => {
    await strapi.models.tag.create({name: 'angular'});
    await strapi.models.tag.create({name: 'algorithms'});
    await strapi.models.tag.create({name: 'angularjs'});
    await strapi.models.tag.create({name: 'bitcoin'});
    await strapi.models.tag.create({name: 'binary_coffee'});
    await strapi.models.tag.create({name: 'bash'});
    await strapi.models.tag.create({name: 'blazor'});
    await strapi.models.tag.create({name: 'bot'});
    await strapi.models.tag.create({name: 'crypto_currency'});
    await strapi.models.tag.create({name: 'c'});
    await strapi.models.tag.create({name: 'chrome'});
    await strapi.models.tag.create({name: 'cors'});
    await strapi.models.tag.create({name: 'c++'});
    await strapi.models.tag.create({name: 'c#'});
    await strapi.models.tag.create({name: 'data_structure'});
    await strapi.models.tag.create({name: 'django'});
    await strapi.models.tag.create({name: 'docker'});
    await strapi.models.tag.create({name: 'expressjs'});
    await strapi.models.tag.create({name: 'firefox'});
    await strapi.models.tag.create({name: 'git'});
    await strapi.models.tag.create({name: 'github'});
    await strapi.models.tag.create({name: 'gitlab'});
    await strapi.models.tag.create({name: 'graphql'});
    await strapi.models.tag.create({name: 'graphene'});
    await strapi.models.tag.create({name: 'hack'});
    await strapi.models.tag.create({name: 'heroku'});
    await strapi.models.tag.create({name: 'icpc'});
    await strapi.models.tag.create({name: 'java'});
    await strapi.models.tag.create({name: 'javascript'});
    await strapi.models.tag.create({name: 'kotlin'});
    await strapi.models.tag.create({name: 'linux'});
    await strapi.models.tag.create({name: 'markdown'});
    await strapi.models.tag.create({name: 'math'});
    await strapi.models.tag.create({name: 'microsoft'});
    await strapi.models.tag.create({name: 'mongodb'});
    await strapi.models.tag.create({name: 'nodejs'});
    await strapi.models.tag.create({name: 'php'});
    await strapi.models.tag.create({name: 'python'});
    await strapi.models.tag.create({name: 'qt'});
    await strapi.models.tag.create({name: 'react'});
    await strapi.models.tag.create({name: 'rss'});
    await strapi.models.tag.create({name: 'ruby'});
    await strapi.models.tag.create({name: 'shell'});
    await strapi.models.tag.create({name: 'telegram'});
    await strapi.models.tag.create({name: 'typescript'});
    await strapi.models.tag.create({name: 'vue'});
    await strapi.models.tag.create({name: 'windows'});
  }
};
