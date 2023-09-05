const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const createPost = require('../../helpers/create-post');

chai.use(chaiHttp);

const expect = chai.expect;

const LIST_LIMIT = 10;
const QUERY = {
  operationName: null,
  variables: {
    limit: LIST_LIMIT,
    start: 5,
    filters: {},
    sort: ['publishedAt:desc'],
  },
  // language=GraphQL
  query: 'query ($limit: Int!, $start: Int!, $filters: PostFiltersInput!, $sort: [String]){\n    posts(filters: $filters, pagination: {limit: $limit, start: $start}, sort: $sort, publicationState: LIVE) {\n        data {\n            id\n            attributes {\n                title\n                name\n                body\n                comments\n                likes\n                views\n                createdAt\n                updatedAt\n                publishedAt\n                enable\n                banner {\n                    data {\n                        id\n                        attributes {\n                            url\n                        }\n                    }\n                }\n                author {\n                    data {\n                        id\n                        attributes {\n                            username\n                            email\n                            page\n                        }\n                    }\n                }\n                tags {\n                    data {\n                        id\n                        attributes {\n                            name\n                        }\n                    }\n                }\n            }\n        }\n        meta {\n            pagination {\n                total\n            }\n        }\n    }\n}'
};

describe('Post list (public articles) INTEGRATION', () => {
  let authUser;
  let staffUser;
  let adminUser;

  const PUBLISHED_ARTICLES = 30;

  before(async () => {
    for (let i = 0; i < PUBLISHED_ARTICLES; i++) {
      await createPost(strapi);
    }
    await createPost(strapi, {enable: false});
    await createPost(strapi, {publishedAt: null});
    await createPost(strapi, {adminApproval: false});

    authUser = await createUser({strapi});
    staffUser = await createUser({strapi, roleType: 'staff'});
    adminUser = await createUser({strapi, roleType: 'administrator'});
  });

  after(async () => {
    await strapi.query('api::post.post').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
  });

  it('should get public articles (public)', async () => {
    const res = await requestArticles(null);
    expect(res.body.data.posts.data.length).to.equal(LIST_LIMIT);
    expect(res.body.data.posts.meta.pagination.total).to.equal(PUBLISHED_ARTICLES);
  });

  it('should get public articles (auth)', async () => {
    const jwt = generateJwt(strapi, authUser);
    const res = await requestArticles(jwt);
    expect(res.body.data.posts.data.length).to.equal(LIST_LIMIT);
    expect(res.body.data.posts.meta.pagination.total).to.equal(PUBLISHED_ARTICLES);
  });

  it('should get public articles (staff)', async () => {
    const jwt = generateJwt(strapi, staffUser);
    const res = await requestArticles(jwt);
    expect(res.body.data.posts.data.length).to.equal(LIST_LIMIT);
    expect(res.body.data.posts.meta.pagination.total).to.equal(PUBLISHED_ARTICLES);
  });

  it('should get public articles (admin)', async () => {
    const jwt = generateJwt(strapi, adminUser);
    const res = await requestArticles(jwt);
    expect(res.body.data.posts.data.length).to.equal(LIST_LIMIT);
    expect(res.body.data.posts.meta.pagination.total).to.equal(PUBLISHED_ARTICLES);
  });

  async function requestArticles(jwt) {
    return await new Promise((resolve, reject) => {
      const action = chai.request(strapi.server.httpServer).post('/graphql');
      if (jwt) {
        action.set('Authorization', `Bearer ${jwt}`);
      }
      action.send(QUERY)
        .end((err, res) => err ? reject(err) : resolve(res));
    });
  }
});
