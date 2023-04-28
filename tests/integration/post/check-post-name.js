const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const getPostById = require('../../helpers/get-post-by-id');
const createPostRequest = require('../../helpers/create-post-request');

chai.use(chaiHttp);

const expect = chai.expect;

describe('Check auto-generation of the post\'s name in create/update actions INTEGRATION', () => {
  let authUser;

  before(async () => {
    authUser = await createUser({strapi});
  });

  after(async () => {
    await strapi.query('api::post.post').delete({});
    await strapi.query('plugin::users-permissions.user').delete({});
  });

  it('should create an comment with the name attribute', async () => {
    const jwt = generateJwt(strapi, authUser);
    const postRes = await createPostRequest(strapi, chai, {
      publishedAt: null,
      enable: true,
      title: 'this is an example of title'
    }, jwt);

    const post = await getPostById(strapi, postRes.id);

    expect(post.name.substring(0, post.name.length - 5)).to.equal('this-is-an-example-of-title');
  });
});
