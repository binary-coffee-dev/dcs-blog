const canCreatePost = require('../policies/canCreatePost');
const canModifyPost = require('../policies/canModifyPost');
const canPublishPost = require('../policies/canPublishPost');
const canSeePost = require('../policies/canSeePost');
const validateFindMethod = require('../policies/validateFindMethod');

module.exports = (strapi) => {
  const extensionService = strapi.plugin('graphql').service('extension');

  extensionService.use(({nexus}) => {
    const PostEntityResponse2 = nexus.objectType({
      name: 'PostEntityResponse2',
      definition(t) {
        t.field('data', {type: 'PostEntity'});
      }
    });

    const postByName = nexus.extendType({
      type: 'Query',
      definition(t) {
        t.field('postByName', {
          type: nexus.nonNull('PostEntityResponse2'),
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

    return {types: [PostEntityResponse2, postByName, countPosts, similarPosts]};
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
      'Query.postByName': {
        policies: [canSeePost],
        auth: {
          scope: ['api::post.post.findOneByName']
        }
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
