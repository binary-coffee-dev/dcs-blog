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
    sort: 'published_at:DESC',
  },
  query: 'query pageQuery($limit: Int!, $start: Int!, $where: JSON!, $sort: String!) {\n  postsConnection(sort: $sort, limit: $limit, start: $start, where: $where) {\n    values {\n      id\n      name\n      title\n      enable\n      body\n      comments\n      published_at\n      views\n      banner {\n        name\n        url\n      }\n      author {\n        id\n        username\n        email\n        page\n      }\n      tags {\n        name\n        __typename\n      }\n      __typename\n    }\n    aggregate {\n      count\n      __typename\n    }\n    __typename\n  }\n  countPosts(where: $where)\n}\n'
};

describe('Post list filtered (dashboard list) INTEGRATION', () => {

  after(async () => {
    await strapi.query('api::post.post').delete({});
    await strapi.query('plugin::users-permissions.user').delete({});
  });

  it('should get the list of post filter by user', async () => {
    const authUser = await createUser({strapi});
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
      expect(post.author).not.null;
      expect(+post.author.id).to.be.equal(authUser.id);
    }
    expect(res.body.data.countPosts).to.equal(2);
  });

  it('should get the list of post filter by a different user', async () => {
    const authUser = await createUser({strapi});
    const authUser2 = await createUser({strapi});
    await createPost(strapi, {author: authUser.id});
    await createPost(strapi, {author: authUser.id});
    await createPost(strapi, {author: authUser.id, published_at: null});
    await createPost(strapi, {author: authUser.id, enable: false});
    await createPost(strapi, {author: authUser.id, published_at: null, enable: false});

    const jwt = generateJwt(strapi, authUser2);
    const res = await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...QUERY, variables: {...QUERY.variables, where: {author: authUser.id}}})
        .end((err, res) => resolve(res));
    });

    for (let post of res.body.data.postsConnection.values) {
      expect(post.author).not.null;
      expect(+post.author.id).to.be.equal(authUser.id);
    }
    expect(res.body.data.countPosts).to.equal(2);
  });

  it('should get the list of post filter by title', async () => {
    const authUser = await createUser({strapi});
    await createPost(strapi, {author: authUser.id, title: 'TEST', published_at: null});
    await createPost(strapi, {author: authUser.id, title: 'TEST'});
    await createPost(strapi, {author: authUser.id, title: 'TEST SOME'});
    await createPost(strapi, {author: authUser.id, title: 'SOME TEST'});
    await createPost(strapi, {author: authUser.id, title: 'SOME TEST SOME'});
    await createPost(strapi, {author: authUser.id, title: 'SOME'});

    const res = await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .send({...QUERY, variables: {...QUERY.variables, where: {enable: true, title: 'tEst'}}})
        .end((err, res) => resolve(res));
    });

    expect(res.body.data.postsConnection.values.length).to.equal(4);
    expect(res.body.data.countPosts).to.equal(4);
  });
});
