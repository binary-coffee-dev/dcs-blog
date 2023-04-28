const migrationCore = require('./db/migration-core');

const graphqlComment = require('./api/comment/config/schema.graphql');
const graphqlImage = require('./api/image/config/schema.graphql');
const graphqlOpinion = require('./api/opinion/config/schema.graphql');
const graphqlPodcast = require('./api/podcast/config/schema.graphql');

module.exports = {
  async register({strapi}) {
    graphqlComment(strapi);
    graphqlImage(strapi);
    graphqlOpinion(strapi);
    graphqlPodcast(strapi);
  },
  async bootstrap() {
    await migrationCore.run();
  },
  async destroy() {
  }
};
