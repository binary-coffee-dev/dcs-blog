const canCreatePost = require('../policies/canCreatePost');
const canModifyPost = require('../policies/canModifyPost');
const canPublishPost = require('../policies/canPublishPost');
const validateFindMethod = require('../policies/validateFindMethod');

module.exports = (strapi) => {
  const extensionService = strapi.plugin('graphql').service('extension');

  extensionService.use(({nexus}) => {
    const postByName = nexus.extendType({
      type: 'Query',
      definition(t) {
        t.field('postByName', {
          type: 'Post',
          args: {name: nexus.nonNull('String'), noUpdate: 'Boolean'},
          resolve(parent, args, context) {
            const {name, noUpdate} = args;
            return strapi.service('api::post.post').findOneByName(context, name, noUpdate);
          }
        });
      }
    });

    const countPosts = nexus.extendType({
      type: 'Query',
      definition(t) {
        t.field('countPosts', {
          type: nexus.nonNull('Int'),
          args: {where: 'JSON'},
          resolve(parent, args, context) {
            return strapi.controller('api::post.post').count(context);
          }
        });
      }
    });

    const similarPosts = nexus.extendType({
      type: 'Query',
      definition(t) {
        t.field('similarPosts', {
          type: nexus.nonNull(nexus.list('Post')),
          args: {id: nexus.nonNull('ID'), limit: 'Int'},
          resolve(parent, args) {
            const {id, limit} = args;
            return strapi.service('api::post.post').findSimilarPosts(id, limit);
          }
        });
      }
    });

    return {types: [postByName, countPosts, similarPosts]};
  });

  extensionService.use(() => ({
    resolversConfig: {
      'Query.similarPosts': {
        auth: {
          scope: ['api::post.post.findSimilarPosts']
        }
      },
      'Query.posts': {
        policies: [validateFindMethod]
      },
      'Mutation.createPost': {
        policies: [canPublishPost, canCreatePost]
      },
      'Mutation.updatePost': {
        policies: [canPublishPost, canModifyPost]
      }
    }
  }));
};

/*module.exports = {
  query: `
    postByName(name: String!, noUpdate: Boolean): Post!
    countPosts(where: JSON): Int!
    similarPosts(id: ID!, limit: Int): [Post]!
  `,
  resolver: {
    Query: {
      postByName: {
        resolver: 'application::post.post.findOneByName'
      },
      countPosts: {
        resolver: 'application::post.post.count'
      },
      similarPosts: {
        resolver: 'application::post.post.findSimilarPosts'
      }
    },
    Mutation: {
      createPost: {
        resolver: 'application::post.post.create',
        policies: [
          'canPublishPost',
          'canCreatePost'
        ]
      },
      updatePost: {
        resolver: 'application::post.post.update',
        policies: [
          'canModifyPost',
          'canPublishPost'
        ]
      }
    }
  }
};*/
