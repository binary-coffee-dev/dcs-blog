const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const deleteUser = require('../../helpers/delete-user');
const deletePost = require('../../helpers/delete-post');
const createPost = require('../../helpers/create-post');
const createComment = require('../../helpers/create-comment');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY_GET_RECENT_COMMENTS = {
  operationName: null,
  // language=GraphQL
  query: 'query{\n  recentComments {\n    id\n    body\n    createdAt\n    post {\n      name\n      id\n    }\n    user {\n      id\n      username\n      avatarUrl\n    }\n  }\n}'
};

describe('Get recent comments INTEGRATION', () => {
  let posts = [];
  let users = [];

  before(async () => {
  });

  after(async () => {
    for (let post of posts) {
      await deletePost(strapi, post);
    }
    for (let user of users) {
      await deleteUser(strapi, user);
    }
  });

  it('should get the the list of recent comments', async () => {
    const user = await createUser({strapi});
    users.push(user);
    const post = await createPost(strapi, {author: user});
    posts.push(post);
    for (let i = 0; i < 20; i++) {
      await createComment(strapi, {user, post});
    }

    const res = await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .send(QUERY_GET_RECENT_COMMENTS)
        .end((err, res) => resolve(res));
    });

    const comments = res.body.data.recentComments;
    expect(comments.length).to.be.equal(15);
    expect(comments[0].user.id.toString()).to.be.equal(user._id.toString());
    expect(comments[0].post.id.toString()).to.be.equal(post._id.toString());
  });

  it('should get the the list of recent comments (auth)', async () => {
    const user = await createUser({strapi});
    users.push(user);
    const post = await createPost(strapi, {author: user});
    posts.push(post);
    for (let i = 0; i < 20; i++) {
      await createComment(strapi, {user, post});
    }

    const jwt = generateJwt(strapi, user);
    const res = await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send(QUERY_GET_RECENT_COMMENTS)
        .end((err, res) => resolve(res));
    });

    const comments = res.body.data.recentComments;
    expect(comments.length).to.be.equal(15);
    expect(comments[0].user.id.toString()).to.be.equal(user._id.toString());
    expect(comments[0].post.id.toString()).to.be.equal(post._id.toString());
  });
});
