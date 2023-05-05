const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const createComment = require('../../helpers/create-comment');
const createPost = require('../../helpers/create-post');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY_SEARCH_USERS = {
  operationName: null,
  variables: {},
  // language=GraphQL
  query: 'query ($filters: UsersPermissionsUserFiltersInput, $start: Int, $limit: Int){\n    users(filters: $filters, pagination: {start: $start, limit: $limit}, sort: ["createdAt:asc"]) {\n        id\n        createdAt\n        updatedAt\n        username\n        confirmed\n        blocked\n        role {\n            name\n            type\n        }\n        avatar {\n            url\n        }\n        avatarUrl\n        name\n        page\n        comments\n        posts\n    }\n}'
};
const NUMBER_OF_COMMENTS = 10;
const NUMBER_OF_POST = 4;

describe('Search users INTEGRATION', () => {
  let userWithArticles;
  let userWithNoArticles;
  let userWithComments;

  before(async () => {
    userWithArticles = await createUser({strapi});
    userWithComments = await createUser({strapi});
    userWithNoArticles = await createUser({strapi});

    const postWithComments = await createPost(strapi);
    for (let i = 0; i < NUMBER_OF_COMMENTS; i++) {
      await createComment(strapi, {user: userWithComments, post: postWithComments});
    }

    for (let i = 0; i < NUMBER_OF_POST; i++) {
      await createPost(strapi, {author: userWithArticles});
    }
    await createPost(strapi, {author: userWithArticles, enable: false});
  });

  after(async () => {
    await strapi.query('api::post.post').deleteMany({});
    await strapi.query('api::comment.comment').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
  });

  it('should filter one user from the list', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .send({...QUERY_SEARCH_USERS, variables: {filters: {username: {contains: userWithArticles.username}}}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(res.body.errors).to.be.undefined;
    expect(res.body.data.users.length).to.be.equal(1);
  });

  it('should get the user with comments', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .send({...QUERY_SEARCH_USERS, variables: {filters: {username: {contains: userWithComments.username}}}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    const user = res.body.data.users[0];
    expect(user.comments).to.equal(NUMBER_OF_COMMENTS);
  });

  it('should get the user with articles', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .send({...QUERY_SEARCH_USERS, variables: {filters: {username: {contains: userWithArticles.username}}}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    const user = res.body.data.users[0];
    expect(user.posts).to.equal(NUMBER_OF_POST);
  });

  it('should get the user with no articles', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .send({...QUERY_SEARCH_USERS, variables: {filters: {username: {contains: userWithNoArticles.username}}}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    const user = res.body.data.users[0];
    expect(user.posts).to.equal(0);
  });

  it('should get at least one user in the query response', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .send({...QUERY_SEARCH_USERS, variables: {filters: {username: {contains: userWithArticles.username.substr(2, 6)}}}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(res.body.data.users.length).to.be.greaterThan(0);
  });
});
