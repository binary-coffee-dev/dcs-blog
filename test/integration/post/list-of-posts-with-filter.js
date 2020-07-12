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
    sort: 'createdAt:desc',
  },
  query: 'query pageQuery($limit: Int\u0021, $start: Int\u0021, $where: JSON\u0021, $sort: String\u0021) {\n  postsConnection(sort: $sort, limit: $limit, start: $start, where: $where) {\n    values {\n      id\n      name\n      title\n      enable\n      body\n      comments\n      description\n      publishedAt\n      views\n      banner {\n        name\n        url\n        __typename\n      }\n      author {\n        id\n        username\n        email\n        page\n        __typename\n      }\n      tags {\n        name\n        __typename\n      }\n      __typename\n    }\n    aggregate {\n      count\n      __typename\n    }\n    __typename\n  }\n  countPosts(where: $where)\n}\n'
};

describe('Post list filtered (dashboard list) INTEGRATION', () => {
  let authUser;

  before(async () => {
    authUser = await createUser({strapi});
  });

  after(async () => {
    await strapi.models.post.deleteMany({});
    await strapi.plugins['users-permissions'].models.user.deleteMany({});
  });

  it('should get the list of post filter by user', async () => {
    await createPost(strapi, {author: authUser.id});
    await createPost(strapi, {author: authUser.id});
    await createPost(strapi);
    const jwt = generateJwt(strapi, authUser);

    const res = await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...QUERY, variables: {...QUERY.variables, where: {author: authUser.id}}})
        .end((err, res) => resolve(res));
    });

    for (let post of res.body.data.postsConnection.values) {
      expect(!!post.author).to.be.true;
      expect(post.author.id).to.be.equal(authUser.id);
    }
    expect(res.body.data.countPosts).to.equal(2);
  });
});
