const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const createPost = require('../../helpers/create-post');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY = {
  operationName: null,
  variables: {id: '', limit: 10},
  query: 'query ($id: ID!, $limit: Int) {\n    similarPosts(id: $id, limit: $limit) {\n        title\n        body\n        banner {\n            data{\n                attributes {\n                    url\n                }\n            }\n        }\n        tags {\n            data {\n                id\n                attributes {\n                    name\n                }\n            }\n        }\n        enable\n        name\n        views\n        readingTime\n        comments\n        likes\n        createdAt\n        updatedAt\n        publishedAt\n    }\n}\n'
};

describe('List of similar posts INTEGRATION', () => {
  const POST_QUERY_LIMIT = 15;
  let authUser;
  let post;
  let tagId;

  before(async () => {
    authUser = await createUser({strapi});

    const tag = await strapi.query('api::tag.tag').findOne({where: {name: 'chrome'}});
    tagId = tag.id;
    for (let i = 0; i < 50; i++) {
      post = await createPost(strapi, {author: authUser.id, tags: [tagId]});
    }
    await createPost(strapi, {author: authUser.id});
  });

  after(async () => {
    await strapi.query('api::post.post').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
  });

  it('should get the list of similar post (public user)', async () => {
    const res = await requestSimilarPosts(null, POST_QUERY_LIMIT);
    expect(res.body.data.similarPosts).not.null;
    expect(res.body.data.similarPosts.length).to.be.equal(POST_QUERY_LIMIT);
    validateTags(res.body.data.similarPosts);
  });

  it('should get the list of similar post (auth user)', async () => {
    const jwt = generateJwt(strapi, authUser);
    const res = await requestSimilarPosts(jwt, POST_QUERY_LIMIT);
    expect(res.body.data.similarPosts).not.null;
    expect(res.body.data.similarPosts.length).to.be.equal(POST_QUERY_LIMIT);
    validateTags(res.body.data.similarPosts);
  });

  it('should get the list of similar post (staff user)', async () => {
    const staffUser = await createUser({strapi, roleType: 'staff'});
    const jwt = generateJwt(strapi, staffUser);
    const res = await requestSimilarPosts(jwt, POST_QUERY_LIMIT);
    expect(res.body.data.similarPosts).not.null;
    expect(res.body.data.similarPosts.length).to.be.equal(POST_QUERY_LIMIT);
    validateTags(res.body.data.similarPosts);
  });

  it('should get the list of similar post (admin user)', async () => {
    const adminUser = await createUser({strapi, roleType: 'administrator'});
    const jwt = generateJwt(strapi, adminUser);
    const res = await requestSimilarPosts(jwt, POST_QUERY_LIMIT);
    expect(res.body.data.similarPosts).not.null;
    expect(res.body.data.similarPosts.length).to.be.equal(POST_QUERY_LIMIT);
    validateTags(res.body.data.similarPosts);
  });

  it('should get the list of similar post limited by the max list allowed in the api', async () => {
    const res = await requestSimilarPosts(null, 50);
    expect(res.body.data.similarPosts).not.null;
    expect(res.body.data.similarPosts.length).to.be.equal(strapi.config.custom.maxSimilarPostRequestLimit);
    validateTags(res.body.data.similarPosts);
  });

  async function requestSimilarPosts(jwt = null, limit) {
    return await new Promise((resolve, reject) => {
      const action = chai.request(strapi.server.httpServer).post('/graphql');
      if (jwt) {
        action.set('Authorization', `Bearer ${jwt}`);
      }
      action.send({...QUERY, variables: {...QUERY.variables, id: post.id, limit}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
  }

  function validateTags(articles) {
    for (const article of articles) {
      expect(article.tags.data.map(t => +t.id)).to.include(tagId);
    }
  }
});
