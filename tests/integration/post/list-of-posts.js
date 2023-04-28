const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const createPost = require('../../helpers/create-post');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY = {
  operationName: 'pageQuery',
  variables: {
    limit: 10,
    start: 0,
    where: {},
    sort: 'created_at:DESC',
  },
  query: 'query pageQuery($limit: Int\u0021, $start: Int\u0021, $where: JSON\u0021, $sort: String\u0021) {\n  postsConnection(sort: $sort, limit: $limit, start: $start, where: $where) {\n    values {\n      id\n      name\n      title\n      enable\n      body\n      comments\n      published_at\n      views\n      banner {\n        name\n        url\n        __typename\n      }\n      author {\n        id\n        username\n        email\n        page\n        __typename\n      }\n      tags {\n        name\n        __typename\n      }\n      __typename\n    }\n    aggregate {\n      count\n      __typename\n    }\n    __typename\n  }\n  countPosts(where: $where)\n}\n'
};

describe('Post list (dashboard list) INTEGRATION', () => {

  let authUser;
  let staffUser;
  let adminUser;

  before(async () => {
    await createPost(strapi);

    authUser = await createUser({strapi});
    await createPost(strapi, {author: authUser, published_at: null});

    staffUser = await createUser({strapi, roleType: 'staff'});
    await createPost(strapi, {author: staffUser, published_at: null});

    adminUser = await createUser({strapi, roleType: 'administrator'});
    await createPost(strapi, {author: adminUser, published_at: null});
  });

  after(async () => {
    await strapi.query('api::post.post').delete({});
    await strapi.query('plugin::users-permissions.user').delete({});
  });

  it('should get the not published articles for the not authenticated users', async () => {
    await requestArticles(null, 1);
  });

  it('should get the articles of the current auth user', async () => {
    const jwt = generateJwt(strapi, authUser);
    await requestArticles(jwt, 2);
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
      const action = chai.request(strapi.server).post('/graphql');
      if (jwt) {
        action.set('Authorization', `Bearer ${jwt}`);
      }
      action.send(QUERY)
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(res.body.data.countPosts).to.equal(expectedValue);
    expect(res.body.data.postsConnection.values.length).to.equal(expectedValue);
  }
});
