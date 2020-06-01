const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../helpers/create-user');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY = {
  operationName: "pageQuery",
  variables: {
    limit: 10,
    start: 0,
    where: {},
    sort: "createdAt:desc",
  },
  query: "query pageQuery($limit: Int\u0021, $start: Int\u0021, $where: JSON\u0021, $sort: String\u0021) {\n  postsConnection(sort: $sort, limit: $limit, start: $start, where: $where) {\n    values {\n      id\n      name\n      title\n      enable\n      body\n      comments\n      description\n      publishedAt\n      views\n      banner {\n        name\n        url\n        __typename\n      }\n      author {\n        id\n        username\n        email\n        page\n        __typename\n      }\n      tags {\n        name\n        __typename\n      }\n      __typename\n    }\n    aggregate {\n      count\n      __typename\n    }\n    __typename\n  }\n  countPosts(where: $where)\n}\n"
};

describe('Post list (dashboard list) INTEGRATION', () => {
  let posts = [];
  let authUser;

  before(async () => {
    posts.push(await strapi.models.post.create({
      title: 'TITLE 1',
      name: 'title-1',
      body: 'SOME',
      description: 'SOME 1',
      enable: true,
      publishedAt: new Date(new Date() - 10)
    }));

    authUser = await createUser({strapi});

    posts.push(await strapi.models.post.create({
      title: 'TITLE 2',
      body: 'SOME',
      name: 'title-2',
      description: 'SOME 1',
      enable: true,
      author: authUser
    }));
  });

  after(async () => {
    for (let post of posts) {
      await strapi.models.post.deleteOne({_id: post._id});
    }
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


    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({id: authUser.id});
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send(QUERY)
      .end((err, res) => {
        console.log(res.body);
        expect(res.body.length).to.equal(1);
        console.log(res.body);
        done();
      });
  });
});
