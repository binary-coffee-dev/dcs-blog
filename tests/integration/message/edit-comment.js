const chai = require('chai');
const chaiHttp = require('chai-http');

const randomName = require('../../helpers/random-name');
const createUser = require('../../helpers/create-user');
const createPost = require('../../helpers/create-post');
const createComment = require('../../helpers/create-comment');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);
const expect = chai.expect;

const MUTATION_UPDATE_COMMENT = {
  operationName: null,
  // language=GraphQL
  query: 'mutation ($id: ID!, $body: String){\n    updateComment(id: $id, data: {body: $body}){\n        data {\n            id\n            attributes {\n                body\n                user {\n                    data {\n                        id\n                    }\n                }\n            }\n        }\n    }\n}'
};

describe('Edit comment INTEGRATION', () => {
  let user;
  let post;
  let comment;

  before(async () => {
    user = await createUser({strapi, roleType: 'administrator'});
    post = await createPost(strapi, {author: user.id});
    comment = await createComment(strapi, {user: user.id, post: post.id});
  });

  after(async () => {
    await strapi.query('api::post.post').deleteMany({});
    await strapi.query('api::comment.comment').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
  });

  it('should edit a comment from the owner', async () => {
    const NEW_BODY = randomName();
    const jwt = generateJwt(strapi, user);
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_UPDATE_COMMENT, variables: {body: NEW_BODY, id: comment.id}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    comment = await strapi.query('api::comment.comment').findOne({where: {id: res.body.data.updateComment.data.id}});
    expect(comment.body).to.be.equal(NEW_BODY);
  });

  it('should not allow an user edit a comment from other user', async () => {
    const NEW_BODY = randomName();
    const user2 = await createUser({strapi});
    const jwt = generateJwt(strapi, user2);
    await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_UPDATE_COMMENT, variables: {body: NEW_BODY, id: comment.id}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    comment = await strapi.query('api::comment.comment').findOne({where: {id: comment.id}});
    expect(comment.body).to.not.be.equal(NEW_BODY);
  });

  it('should allow to edit a comment to a staff user', async () => {
    const NEW_BODY = randomName();
    const user2 = await createUser({strapi, roleType: 'staff'});
    const jwt = generateJwt(strapi, user2);
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_UPDATE_COMMENT, variables: {body: NEW_BODY, id: comment.id}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    comment = await strapi.query('api::comment.comment').findOne({where: {id: res.body.data.updateComment.data.id}});
    expect(comment.body).to.be.equal(NEW_BODY);
  });
});
