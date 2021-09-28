const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const deleteUser = require('../../helpers/delete-user');
const deletePost = require('../../helpers/delete-post');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const getPostById = require('../../helpers/get-post-by-id');

chai.use(chaiHttp);

const expect = chai.expect;

const MUTATION_CREATE_POST = {
  operationName: null,
  query: 'mutation ($title: String, $body: String, $enable: Boolean, $banner: ID, $author: ID, $tags: [ID], $publishedAt: DateTime) {\n  createPost(input: {data: {publishedAt: $publishedAt, title: $title, body: $body, enable: $enable, banner: $banner, author: $author, tags: $tags}}) {\n    post {\n      id\n      name\n      __typename\n    }\n    __typename\n  }\n}\n'
};

describe('Check auto-generation of the post\'s name in create/update actions INTEGRATION', () => {
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

  it('should create an article with the name attribute', async () => {
    const jwt = generateJwt(strapi, authUser);
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({
          ...MUTATION_CREATE_POST, variables: {
            body: 'safsadf',
            title: 'this is an example of title',
            enable: true,
            author: '5deee37e98bbd80013a0a844'
          }
        })
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    const post = await getPostById(strapi, res.body.data.createPost.post.id);

    posts.push(post);
    expect(post.name.substring(0, post.name.length - 5)).to.equal('this-is-an-example-of-title');
  });
});
