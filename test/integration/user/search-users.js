const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const deleteUser = require('../../helpers/delete-user');
const createComment = require('../../helpers/create-comment');
const createPost = require('../../helpers/create-post');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY_SEARCH_USERS = {
  operationName: null,
  variables: {search: ''},
  // language=GraphQL
  query: 'query ($search: String!){\n  users2(sort: "asc", limit: 10, start: 0, where: {username: $search}) {\n    id\n    username\n    avatarUrl\n    name\n    comments\n    posts\n  }\n}'
};
const MAX_NUMBER = 20;
const NUMBER_OF_COMMENTS = 10;
const NUMBER_OF_POST = 4;

describe('Search users INTEGRATION', () => {
  let users = [];
  let userWithArticles;
  let userWithNoArticles;
  let userWithComments;

  before(async () => {
    for (let i = 0; i < MAX_NUMBER; i++) {
      users.push(await createUser({strapi}));
    }
    userWithArticles = users[0];
    userWithComments = users[1];
    userWithNoArticles = users[2];

    for (let i = 0; i < NUMBER_OF_COMMENTS; i++) {
      await createComment(strapi, {user: userWithComments});
    }

    for (let i = 0; i < NUMBER_OF_POST; i++) {
      await createPost(strapi, {author: userWithArticles});
    }
    await createPost(strapi, {author: userWithArticles, enable: false});
  });

  after(async () => {
    for (let user of users) {
      await deleteUser(strapi, user);
    }
  });

  it('should filter one user from the list', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .send({...QUERY_SEARCH_USERS, variables: {search: users[0].username}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    console.log(res.body);
    expect(res.body.data.users2.length).to.be.equal(1);
  });

  it('should get the user with comments', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .send({...QUERY_SEARCH_USERS, variables: {search: userWithComments.username}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    const user = res.body.data.users2[0];
    expect(user.comments).to.equal(NUMBER_OF_COMMENTS);
  });

  it('should get the user with articles', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .send({...QUERY_SEARCH_USERS, variables: {search: userWithArticles.username}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    const user = res.body.data.users2[0];
    expect(user.posts).to.equal(NUMBER_OF_POST);
  });

  it('should get the user with no articles', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .send({...QUERY_SEARCH_USERS, variables: {search: userWithNoArticles.username}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    const user = res.body.data.users2[0];
    expect(user.posts).to.equal(0);
  });

  it('should get at least one user in the query response', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .send({...QUERY_SEARCH_USERS, variables: {search: users[0].username.substr(2, 6)}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(res.body.data.users2.length).to.be.greaterThan(0);
  });
});
