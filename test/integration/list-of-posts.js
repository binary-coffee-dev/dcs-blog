const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../helpers/create-user');
const deleteUser = require('../helpers/delete-user');
const deletePost = require('../helpers/delete-post');
const randomName = require('../helpers/random-name');
const generateJwt = require('../helpers/generate-jwt-by-user');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY = {
  operationName: 'pageQuery',
  variables: {
    limit: 10,
    start: 0,
    where: {},
    sort: 'createdAt:desc',
  },
  query: 'query pageQuery($limit: Int\u0021, $start: Int\u0021, $where: JSON\u0021, $sort: String\u0021) {\n  postsConnection(sort: $sort, limit: $limit, start: $start, where: $where) {\n    values {\n      id\n      name\n      title\n      enable\n      body\n      comments\n      description\n      publishedAt\n      views\n      banner {\n        name\n        url\n        __typename\n      }\n      author {\n        id\n        username\n        email\n        page\n        __typename\n      }\n      tags {\n        name\n        __typename\n      }\n      __typename\n    }\n    aggregate {\n      count\n      __typename\n    }\n    __typename\n  }\n  countPosts(where: $where)\n}\n'
};

describe('Post list (dashboard list) INTEGRATION', () => {
  let posts = [];

  let authUser;
  let staffUser;
  let adminUser;

  before(async () => {
    posts.push(await strapi.models.post.create({
      title: 'TITLE 1',
      name: randomName(),
      body: 'SOME',
      description: 'SOME 1',
      enable: true,
      publishedAt: new Date(new Date() - 10)
    }));

    authUser = await createUser({strapi});
    posts.push(await strapi.models.post.create({
      title: 'TITLE 2',
      body: 'SOME',
      name: randomName(),
      description: 'SOME 1',
      enable: true,
      author: authUser
    }));

    staffUser = await createUser({strapi, roleType: 'staff'});
    posts.push(await strapi.models.post.create({
      title: 'TITLE 3',
      body: 'SOME',
      name: randomName(),
      description: 'SOME 1',
      enable: true,
      author: staffUser
    }));

    adminUser = await createUser({strapi, roleType: 'administrator'});
    posts.push(await strapi.models.post.create({
      title: 'TITLE 4',
      body: 'SOME',
      name: randomName(),
      description: 'SOME 1',
      enable: true,
      author: adminUser
    }));
  });

  after(async () => {
    for (let post of posts) {
      await deletePost(strapi, post);
    }
    await deleteUser(strapi, authUser);
    await deleteUser(strapi, staffUser);
    await deleteUser(strapi, adminUser);
  });

  it('should get the not published articles to the not authenticated users', (done) => {
    chai.request(strapi.server)
      .get('/graphql')
      .send(QUERY)
      .end((err, res) => {
        expect(res.body).to.deep.equal({});
        done();
      });
  });

  it('should get the articles of the current auth user', (done) => {
    const jwt = generateJwt(strapi, authUser);
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send(QUERY)
      .end((err, res) => {
        expect(res.body.data.countPosts).to.equal(2);
        done();
      });
  });

  it('should get the articles of the current staff user', (done) => {
    const jwt = generateJwt(strapi, staffUser);
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send(QUERY)
      .end((err, res) => {
        expect(res.body.data.countPosts).to.equal(4);
        done();
      });
  });

  it('should get the articles of the current admin user', (done) => {
    const jwt = generateJwt(strapi, adminUser);
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send(QUERY)
      .end((err, res) => {
        expect(res.body.data.countPosts).to.equal(4);
        done();
      });
  });
});
