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
  query: 'mutation create($body: String, $post: ID) {\n    createComment(data: {body: $body, post: $post}){\n        data {\n            id\n            attributes {\n                body\n                email\n                name\n                user {\n                    data {\n                        id\n                        attributes {\n                            username\n                        }\n                    }\n                }\n            }\n        }\n    }\n}'
};

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
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_CREATE_COMMENT, variables: {body: randomName(100), post: post.id}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
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
