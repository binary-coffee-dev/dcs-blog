const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const deleteUser = require('../../helpers/delete-user');
const deletePost = require('../../helpers/delete-post');
const randomName = require('../../helpers/random-name');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);

const expect = chai.expect;

const LIST_LIMIT = 10;
const QUERY = {
  operationName: 'pageQuery',
  variables: {
    limit: LIST_LIMIT,
    start: 0,
    where: {enable: true},
    sort: 'createdAt:desc',
  },
  query: 'query pageQuery($limit: Int\u0021, $start: Int\u0021, $where: JSON\u0021, $sort: String\u0021) {\n  postsConnection(sort: $sort, limit: $limit, start: $start, where: $where) {\n    values {\n      id\n      name\n      title\n      enable\n      body\n      comments\n      publishedAt\n      views\n      banner {\n        name\n        url\n        __typename\n      }\n      author {\n        id\n        username\n        email\n        page\n        __typename\n      }\n      tags {\n        name\n        __typename\n      }\n      __typename\n    }\n    aggregate {\n      count\n      __typename\n    }\n    __typename\n  }\n  countPosts(where: $where)\n}\n'
};

describe('Post list (public articles) INTEGRATION', () => {
  let posts = [];

  let authUser;
  let staffUser;
  let adminUser;

  const PUBLISHED_ARTICLES = 20;

  before(async () => {
    await strapi.models.post.deleteMany();

    for (let i = 0; i < PUBLISHED_ARTICLES; i++) {
      posts.push(await strapi.models.post.create({
        title: 'TITLE 1',
        name: randomName(),
        body: 'SOME',
        enable: true,
        publishedAt: new Date(new Date() - 10)
      }));
    }

    authUser = await createUser({strapi});
    staffUser = await createUser({strapi, roleType: 'staff'});
    adminUser = await createUser({strapi, roleType: 'administrator'});
  });

  after(async () => {
    for (let post of posts) {
      await deletePost(strapi, post);
    }
    await deleteUser(strapi, authUser);
    await deleteUser(strapi, staffUser);
    await deleteUser(strapi, adminUser);
  });

  it('should get public articles (public)', (done) => {
    chai.request(strapi.server)
      .post('/graphql')
      .send(QUERY)
      .end((err, res) => {
        expect(res.body.data.postsConnection.values.length).to.equal(LIST_LIMIT);
        expect(res.body.data.countPosts).to.equal(PUBLISHED_ARTICLES);
        done();
      });
  });

  it('should get public articles (auth)', (done) => {
    const jwt = generateJwt(strapi, authUser);
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send(QUERY)
      .end((err, res) => {
        expect(res.body.data.postsConnection.values.length).to.equal(LIST_LIMIT);
        expect(res.body.data.countPosts).to.equal(PUBLISHED_ARTICLES);
        done();
      });
  });

  it('should get public articles (staff)', (done) => {
    const jwt = generateJwt(strapi, staffUser);
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send(QUERY)
      .end((err, res) => {
        expect(res.body.data.postsConnection.values.length).to.equal(LIST_LIMIT);
        expect(res.body.data.countPosts).to.equal(PUBLISHED_ARTICLES);
        done();
      });
  });

  it('should get public articles (admin)', (done) => {
    const jwt = generateJwt(strapi, adminUser);
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send(QUERY)
      .end((err, res) => {
        expect(res.body.data.postsConnection.values.length).to.equal(LIST_LIMIT);
        expect(res.body.data.countPosts).to.equal(PUBLISHED_ARTICLES);
        done();
      });
  });
});
