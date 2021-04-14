const chai = require('chai');
const chaiHttp = require('chai-http');

const randomName = require('../../helpers/random-name');
const createUser = require('../../helpers/create-user');
const createPost = require('../../helpers/create-post');
const deleteUser = require('../../helpers/delete-user');
const deletePost = require('../../helpers/delete-post');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);

const expect = chai.expect;

const MUTATION_CREATE_POST = {
  operationName: null,
  query: 'mutation ($title: String, $body: String, $description: String, $enable: Boolean, $banner: ID, $author: ID, $tags: [ID], $publishedAt: DateTime) {\n  createPost(input: {data: {publishedAt: $publishedAt, title: $title, body: $body, description: $description, enable: $enable, banner: $banner, author: $author, tags: $tags}}) {\n    post {\n      id\n      __typename\n    }\n    __typename\n  }\n}\n'
};

describe('Create/Update post with publishedAt attribute INTEGRATION', () => {
  let posts = [];

  let authUser;

  before(async () => {
    authUser = await createUser({strapi});
  });

  after(async () => {
    for (let post of posts) {
      await deletePost(strapi, post);
    }
    await deleteUser(strapi, authUser);
  });

  it('should limit the number of post by user in the same day', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const post = await createPost(strapi, {createdAt: yesterday, author: authUser});
    posts.push(post);

    const jwt = generateJwt(strapi, authUser);
    for (let i = 0; i < 5; i++) {
      const res = await new Promise((resolve, reject) => chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({
          ...MUTATION_CREATE_POST, variables: {
            body: randomName(100),
            description: randomName(100),
            title: randomName(15),
            enable: true
          }
        })
        .end((err, res) => err ? reject(err) : resolve(res)));
      expect(!!res.body.errors).to.be.false;
    }
    const res = await new Promise((resolve, reject) => chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        ...MUTATION_CREATE_POST, variables: {
          body: randomName(100),
          description: randomName(100),
          title: randomName(15),
          enable: true
        }
      })
      .end((err, res) => err ? reject(err) : resolve(res)));
    expect(res.body.errors.length).to.be.equal(1);
  });
});
