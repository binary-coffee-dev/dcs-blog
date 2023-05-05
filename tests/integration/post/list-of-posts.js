const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const createPost = require('../../helpers/create-post');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY = {
  operationName: null,
  variables: {
    limit: 10,
    start: 0,
    filters: {},
    sort: ['publishedAt:desc'],
  },
  // language=GraphQL
  query: 'query ($limit: Int!, $start: Int!, $filters: PostFiltersInput!, $sort: [String]){\n    posts(filters: $filters, pagination: {limit: $limit, start: $start}, sort: $sort, publicationState: PREVIEW) {\n        data {\n            id\n            attributes {\n                title\n                name\n                body\n                comments\n                likes\n                views\n                createdAt\n                updatedAt\n                publishedAt\n                enable\n                banner {\n                    data {\n                        id\n                        attributes {\n                            url\n                        }\n                    }\n                }\n                author {\n                    data {\n                        id\n                        attributes {\n                            username\n                            email\n                            page\n                        }\n                    }\n                }\n                tags {\n                    data {\n                        id\n                        attributes {\n                            name\n                        }\n                    }\n                }\n            }\n        }\n        meta {\n            pagination {\n                total\n            }\n        }\n    }\n}'
};

describe('Post list (dashboard list) INTEGRATION', () => {

  let authUser;
  let staffUser;
  let adminUser;

  before(async () => {
    await createPost(strapi);

    authUser = await createUser({strapi});
    await createPost(strapi, {author: authUser, publishedAt: null});

    staffUser = await createUser({strapi, roleType: 'staff'});
    await createPost(strapi, {author: staffUser, publishedAt: null});

    adminUser = await createUser({strapi, roleType: 'administrator'});
    await createPost(strapi, {author: adminUser, publishedAt: null});
  });

  after(async () => {
    await strapi.query('api::post.post').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
  });

  it('should get the not published articles for the not authenticated users', async () => {
    await requestArticles(null, 1);
  });

  it('should get the articles of the current auth user', async () => {
    const jwt = generateJwt(strapi, authUser);
    await requestArticles(jwt, 1);
  });

  it('should get the articles of the current staff user', async () => {
    const jwt = generateJwt(strapi, staffUser);
    await requestArticles(jwt, 4);
  });

  it('should get the articles of the current admin user', async () => {
    const jwt = generateJwt(strapi, adminUser);
    await requestArticles(jwt, 4);
  });

  async function requestArticles(jwt, expectedValue) {
    const res = await new Promise((resolve, reject) => {
      const action = chai.request(strapi.server.httpServer).post('/graphql');
      if (jwt) {
        action.set('Authorization', `Bearer ${jwt}`);
      }
      action.send(QUERY)
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(res.body.data.posts.meta.pagination.total).to.equal(expectedValue);
    expect(res.body.data.posts.data.length).to.equal(expectedValue);
  }
});
