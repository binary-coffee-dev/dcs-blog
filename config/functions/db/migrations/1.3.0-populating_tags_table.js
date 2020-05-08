'use strict';

module.exports = {
  version: '1.3.0',
  description: 'Populating the tags table with the initial values',
  migrate: async () => {
    await Tag.create({name: 'angular'});
    await Tag.create({name: 'algorithms'});
    await Tag.create({name: 'angularjs'});
    await Tag.create({name: 'bitcoin'});
    await Tag.create({name: 'binary_coffee'});
    await Tag.create({name: 'bash'});
    await Tag.create({name: 'blazor'});
    await Tag.create({name: 'bot'});
    await Tag.create({name: 'crypto_currency'});
    await Tag.create({name: 'c'});
    await Tag.create({name: 'chrome'});
    await Tag.create({name: 'cors'});
    await Tag.create({name: 'c++'});
    await Tag.create({name: 'c#'});
    await Tag.create({name: 'data_structure'});
    await Tag.create({name: 'django'});
    await Tag.create({name: 'docker'});
    await Tag.create({name: 'expressjs'});
    await Tag.create({name: 'firefox'});
    await Tag.create({name: 'git'});
    await Tag.create({name: 'github'});
    await Tag.create({name: 'gitlab'});
    await Tag.create({name: 'graphql'});
    await Tag.create({name: 'graphene'});
    await Tag.create({name: 'hack'});
    await Tag.create({name: 'heroku'});
    await Tag.create({name: 'icpc'});
    await Tag.create({name: 'java'});
    await Tag.create({name: 'javascript'});
    await Tag.create({name: 'kotlin'});
    await Tag.create({name: 'linux'});
    await Tag.create({name: 'markdown'});
    await Tag.create({name: 'math'});
    await Tag.create({name: 'microsoft'});
    await Tag.create({name: 'mongodb'});
    await Tag.create({name: 'nodejs'});
    await Tag.create({name: 'php'});
    await Tag.create({name: 'python'});
    await Tag.create({name: 'qt'});
    await Tag.create({name: 'react'});
    await Tag.create({name: 'rss'});
    await Tag.create({name: 'ruby'});
    await Tag.create({name: 'shell'});
    await Tag.create({name: 'telegram'});
    await Tag.create({name: 'typescript'});
    await Tag.create({name: 'vue'});
    await Tag.create({name: 'windows'});
  }
};
