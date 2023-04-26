const chai = require('chai');
const chaiHttp = require('chai-http');

const randomName = require('../../helpers/random-name');
const createUser = require('../../helpers/create-user');
const createPost = require('../../helpers/create-post');
const createComment = require('../../helpers/create-comment');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);
const expect = chai.expect;

const MUTATION_CREATE_COMMENT = {
  operationName: null,
  // language=GraphQL
  query: 'mutation create(\n  $body: String\n  $post: ID\n) {\n  createComment(input: {data: {body: $body, post: $post}}){\n    comment {\n      id\n      body\n      published_at\n      name\n      user {\n        username\n        avatar {\n          url\n        }\n      }\n    }\n  }\n}'
};

describe('Create comments INTEGRATION', () => {
  let user;
  let admin;
  let post;

  before(async () => {
    user = await createUser({strapi});
    admin = await createUser({strapi, roleType: 'administrator'});
    post = await createPost(strapi);
  });

  after(async () => {
    await strapi.query('post').delete({});
    await strapi.query('comment').delete({});
    await strapi.query('user', 'users-permissions').delete({});
  });

  it('should limit (20) the comments by user in the same day', async () => {
    const jwt = generateJwt(strapi, user);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await createComment(strapi, {createdAt: yesterday, post: post.id, user: user.id});

    for (let i = 0; i < strapi.config.custom.maxNumberOfCommentsPerDay; i++) {
      const res = await new Promise((resolve, reject) => {
        chai.request(strapi.server)
          .post('/graphql')
          .set('Authorization', `Bearer ${jwt}`)
          .send({...MUTATION_CREATE_COMMENT, variables: {body: randomName(100), post: post.id}})
          .end((err, res) => err ? reject(err) : resolve(res));
      });
      expect(res.body.data).not.null;
    }
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_CREATE_COMMENT, variables: {body: randomName(100), post: post.id}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(res.body.errors[0].message).to.be.equal('Limit of comments by post');
  });

  it('should not limit the comments to the admin role', async () => {
    const jwt = generateJwt(strapi, admin);

    for (let i = 0; i < 40; i++) {
      const res = await new Promise((resolve, reject) => {
        chai.request(strapi.server)
          .post('/graphql')
          .set('Authorization', `Bearer ${jwt}`)
          .send({...MUTATION_CREATE_COMMENT, variables: {body: randomName(100), post: post.id}})
          .end((err, res) => err ? reject(err) : resolve(res));
      });
      expect(!!res.body.errors).to.be.false;
    }
  });
});
