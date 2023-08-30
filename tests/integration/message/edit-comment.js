const chai = require('chai');
const chaiHttp = require('chai-http');

const randomName = require('../../helpers/random-name');
const createUser = require('../../helpers/create-user');
const createPost = require('../../helpers/create-post');
const createComment = require('../../helpers/create-comment');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const updateCommentRequest = require('../../helpers/update-comment-request');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Edit comment INTEGRATION', () => {
  let user;
  let post;

  before(async () => {
    user = await createUser({strapi, roleType: 'administrator'});
    post = await createPost(strapi, {author: user.id});
  });

  after(async () => {
    await strapi.query('api::post.post').deleteMany({});
    await strapi.query('api::comment.comment').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
  });

  it('should edit a comment from the owner', async () => {
    const comment = await createComment(strapi, {user: user.id, post: post.id});
    const NEW_BODY = randomName();
    const jwt = generateJwt(strapi, user);
    const commentRes = await updateCommentRequest(strapi, chai, {body: NEW_BODY, id: comment.id}, jwt);
    const commentTmp = await strapi.query('api::comment.comment').findOne({where: {id: commentRes.id}});
    expect(commentTmp.body).to.be.equal(NEW_BODY);
  });

  it('should not allow an user edit a comment from other user', async () => {
    const comment = await createComment(strapi, {user: user.id, post: post.id});
    const NEW_BODY = randomName();
    const user2 = await createUser({strapi});
    const jwt = generateJwt(strapi, user2);
    await updateCommentRequest.request(strapi, chai, {body: NEW_BODY, id: comment.id}, jwt);
    const commentTmp = await strapi.query('api::comment.comment').findOne({where: {id: comment.id}});
    expect(commentTmp.body).to.not.be.equal(NEW_BODY);
  });

  it('should allow to edit a comment to a staff user', async () => {
    const comment = await createComment(strapi, {user: user.id, post: post.id});
    const NEW_BODY = randomName();
    const user2 = await createUser({strapi, roleType: 'staff'});
    const jwt = generateJwt(strapi, user2);
    const commentRes = await updateCommentRequest(strapi, chai, {body: NEW_BODY, id: comment.id}, jwt);
    const commentTmp = await strapi.query('api::comment.comment').findOne({where: {id: commentRes.id}});
    expect(commentTmp.body).to.be.equal(NEW_BODY);
  });
});
