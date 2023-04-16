const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const createPost = require('../../helpers/create-post');

chai.use(chaiHttp);

const expect = chai.expect;

const LIST_LIMIT = 10;
const QUERY = {
  operationName: 'pageQuery',
  variables: {
    limit: LIST_LIMIT,
    start: 5,
    where: {enable: true},
    sort: 'published_at:DESC',
  },
  query: 'query pageQuery($limit: Int\u0021, $start: Int\u0021, $where: JSON\u0021, $sort: String\u0021) {\n  postsConnection(sort: $sort, limit: $limit, start: $start, where: $where) {\n    values {\n      id\n      name\n      title\n      enable\n      body\n      comments\n      published_at\n      views\n      banner {\n        name\n        url\n        __typename\n      }\n      author {\n        id\n        username\n        email\n        page\n        __typename\n      }\n      tags {\n        name\n        __typename\n      }\n      __typename\n    }\n    aggregate {\n      count\n      __typename\n    }\n    __typename\n  }\n  countPosts(where: $where)\n}\n'
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

    authUser = await createUser({strapi});
    staffUser = await createUser({strapi, roleType: 'staff'});
    adminUser = await createUser({strapi, roleType: 'administrator'});
  });

  after(async () => {
    await strapi.query('post').delete({});
    await strapi.query('user', 'users-permissions').delete({});
  });

  it('should get public articles (public)', async () => {
    const res = await requestArticles(null);
    expect(res.body.data.postsConnection.values.length).to.equal(LIST_LIMIT);
    expect(res.body.data.countPosts).to.equal(PUBLISHED_ARTICLES);
  });

  it('should get public articles (auth)', async () => {
    const jwt = generateJwt(strapi, authUser);
    const res = await requestArticles(jwt);
    expect(res.body.data.postsConnection.values.length).to.equal(LIST_LIMIT);
    expect(res.body.data.countPosts).to.equal(PUBLISHED_ARTICLES);
  });

  it('should get public articles (staff)', async () => {
    const jwt = generateJwt(strapi, staffUser);
    const res = await requestArticles(jwt);
    expect(res.body.data.postsConnection.values.length).to.equal(LIST_LIMIT);
    expect(res.body.data.countPosts).to.equal(PUBLISHED_ARTICLES);
  });

  it('should get public articles (admin)', async () => {
    const jwt = generateJwt(strapi, adminUser);
    const res = await requestArticles(jwt);
    expect(res.body.data.postsConnection.values.length).to.equal(LIST_LIMIT);
    expect(res.body.data.countPosts).to.equal(PUBLISHED_ARTICLES);
  });

  async function requestArticles(jwt) {
    return await new Promise((resolve, reject) => {
      const action = chai.request(strapi.server).post('/graphql');
      if (jwt) {
        action.set('Authorization', `Bearer ${jwt}`);
      }
      action.send(QUERY)
        .end((err, res) => err ? reject(err) : resolve(res));
    });
  }
});
