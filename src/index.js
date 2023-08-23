const migrationCore = require('./db/migration-core');

const graphqlComment = require('./api/comment/config/schema.graphql');
const graphqlImage = require('./api/image/config/schema.graphql');
const graphqlOpinion = require('./api/opinion/config/schema.graphql');
const graphqlPodcast = require('./api/podcast/config/schema.graphql');
const graphqlPost = require('./api/post/config/schema.graphql');
const graphqlSubscription = require('./api/subscription/config/schema.graphql');
const graphqlUser = require('./extensions/users-permissions/config/schema.graphql');
const graphqlUpload = require('./extensions/upload/config/schema.graphql');

module.exports = {
  async register({strapi}) {
    graphqlComment(strapi);
    graphqlImage(strapi);
    graphqlOpinion(strapi);
    graphqlPodcast(strapi);
    graphqlPost(strapi);
    graphqlSubscription(strapi);
    graphqlUser(strapi);
    graphqlUpload(strapi);

    strapi.config.functions = {
      dateUtil: require('./functions/dateUtil'),
      subscriptionsEmails: require('./functions/subscriptions.emails'),
      token: require('./functions/token'),
      // sendBotNotification: require('./functions/sendBotNotification'),
    };
  },
  async bootstrap() {
    await migrationCore.run();
  },
  async destroy() {
  }
};
