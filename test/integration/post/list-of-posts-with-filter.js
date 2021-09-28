const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const createPost = require('../../helpers/create-post');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const deleteUser = require('../../helpers/delete-user');
const deletePost = require('../../helpers/delete-post');

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
  query: 'query pageQuery($limit: Int!, $start: Int!, $where: JSON!, $sort: String!) {\n  postsConnection(sort: $sort, limit: $limit, start: $start, where: $where) {\n    values {\n      id\n      name\n      title\n      enable\n      body\n      comments\n      publishedAt\n      views\n      banner {\n        name\n        url\n      }\n      author {\n        id\n        username\n        email\n        page\n      }\n      tags {\n        name\n        __typename\n      }\n      __typename\n    }\n    aggregate {\n      count\n      __typename\n    }\n    __typename\n  }\n  countPosts(where: $where)\n}\n'
};

describe('Post list filtered (dashboard list) INTEGRATION', () => {
  const users = [];
  const posts = [];

  after(async () => {
    for (let post of posts) {
      await deletePost(strapi, post);
    }
    for (let user of users) {
      await deleteUser(strapi, user);
    }
  });

  it('should get the list of post filter by user', async () => {
    const authUser = await createUser({strapi});
    users.push(authUser);
    posts.push(await createPost(strapi, {author: authUser.id}));
    posts.push(await createPost(strapi, {author: authUser.id}));
    posts.push(await createPost(strapi));
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

  it('should get the list of post filter by a different user', async () => {
    const authUser = await createUser({strapi});
    const authUser2 = await createUser({strapi});
    users.push(authUser);
    users.push(authUser2);
    posts.push(await createPost(strapi, {author: authUser.id}));
    posts.push(await createPost(strapi, {author: authUser.id}));
    posts.push(await createPost(strapi, {author: authUser.id, publishedAt: undefined}));
    posts.push(await createPost(strapi, {author: authUser.id, enable: false}));
    posts.push(await createPost(strapi, {author: authUser.id, publishedAt: undefined, enable: false}));
    const jwt = generateJwt(strapi, authUser2);

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

  it('should get the list of post filter by title', async () => {
    const authUser = await createUser({strapi});
    users.push(authUser);
    posts.push(await createPost(strapi, {author: authUser.id, title: 'TEST'}));
    posts.push(await createPost(strapi, {author: authUser.id, title: 'TEST SOME'}));
    posts.push(await createPost(strapi, {author: authUser.id, title: 'SOME TEST'}));
    posts.push(await createPost(strapi, {author: authUser.id, title: 'SOME TEST SOME'}));
    posts.push(await createPost(strapi, {author: authUser.id, title: 'SOME'}));

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
