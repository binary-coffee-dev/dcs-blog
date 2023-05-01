const chai = require('chai');
const chaiHttp = require('chai-http');

const randomName = require('../../helpers/random-name');
const createUser = require('../../helpers/create-user');
const createPost = require('../../helpers/create-post');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);
const expect = chai.expect;

const MUTATION_CREATE_COMMENT = {
  operationName: null,
  // language=GraphQL
  query: 'mutation create($body: String, $post: ID) {\n    createComment(data: {body: $body, post: $post}){\n        data {\n            id\n            attributes {\n                body\n                email\n                name\n                user {\n                    data {\n                        id\n                        attributes {\n                            username\n                        }\n                    }\n                }\n            }\n        }\n    }\n}'
};

describe('Update comments count in post INTEGRATION', () => {
  let user;
  let post;

  before(async () => {
    user = await createUser({strapi, roleType: 'administrator'});
    post = await createPost(strapi, {author: user});
  });

  after(async () => {
    await strapi.query('api::post.post').deleteMany({});
    await strapi.query('api::comment.comment').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
  });

  it('should increment the count of comments in the post', async () => {
    const jwt = generateJwt(strapi, user);

    for (let i = 0; i < 10; i++) {
      await new Promise((resolve, reject) => {
        chai.request(strapi.server.httpServer)
          .post('/graphql')
          .set('Authorization', `Bearer ${jwt}`)
          .send({...MUTATION_CREATE_COMMENT, variables: {body: randomName(100), post: post.id}})
          .end((err, res) => err ? reject(err) : resolve(res));
      });
      post = await strapi.query('api::post.post').findOne({id: post.id});
      expect(+post.comments).to.be.equal(i + 1);
    }
  });
});
