const chai = require('chai');
const chaiHttp = require('chai-http');

const randomName = require('../../helpers/random-name');
const createUser = require('../../helpers/create-user');
const createPost = require('../../helpers/create-post');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const createCommentRequest = require('../../helpers/create-comment-request');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Create comments INTEGRATION', () => {
  let user;
  let post;

  before(async () => {
    user = await createUser({strapi});
    post = await createPost(strapi);
  });

  after(async () => {
    await strapi.query('api::post.post').deleteMany({});
    await strapi.query('api::comment.comment').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
  });

  it('should create a comment with the correct user id', async () => {
    const jwt = generateJwt(strapi, user);
    const res = await createCommentRequest.request(strapi, chai, {body: randomName(100), post: post.id}, jwt);
    expect(res.body.errors).to.be.undefined;
    expect(res.body.data).not.null.and.not.undefined;

    const comment = await strapi.query('api::comment.comment').findOne({
      where: {id: res.body.data.createComment.data.id},
      populate: ['user', 'post']
    });
    expect(+comment.user.id).to.be.equal(+user.id);
    expect(+comment.post.id).to.be.equal(+post.id);
  });
});
