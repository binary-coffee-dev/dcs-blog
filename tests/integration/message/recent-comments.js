const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const createPost = require('../../helpers/create-post');
const createComment = require('../../helpers/create-comment');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY_GET_RECENT_COMMENTS = {
  operationName: null,
  // language=GraphQL
  query: 'query ($limit: Int){\n  recentComments (limit: $limit) {\n    id\n    body\n    created_at\n    post {\n      name\n      id\n    }\n    user {\n      id\n      username\n      avatarUrl\n    }\n  }\n}'
};

describe('Get recent comments INTEGRATION', () => {

  after(async () => {
    await strapi.query('api::post.post').delete({});
    await strapi.query('comment').delete({});
    await strapi.query('plugin::users-permissions.user').delete({});
  });

  it('should get the the list of recent comments', async () => {
    const user = await createUser({strapi});
    const post = await createPost(strapi, {author: user});
    for (let i = 0; i < 20; i++) {
      await createComment(strapi, {user, post});
    }

    const res = await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .send({...QUERY_GET_RECENT_COMMENTS, variables: {limit: 8}})
        .end((err, res) => resolve(res));
    });

    const comments = res.body.data.recentComments;
    expect(comments.length).to.be.equal(8);
    expect(+comments[0].user.id).to.be.equal(+user.id);
    expect(+comments[0].post.id).to.be.equal(+post.id);
  });

  it('should get the the list of recent comments (auth)', async () => {
    const user = await createUser({strapi});
    const post = await createPost(strapi, {author: user});
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
    expect(comments.length).to.be.equal(strapi.config.custom.maxRecentComments);
    expect(+comments[0].user.id).to.be.equal(+user.id);
    expect(+comments[0].post.id).to.be.equal(+post.id);
  });
});
