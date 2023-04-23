const chai = require('chai');
const chaiHttp = require('chai-http');

const createPostRequest = require('../../helpers/create-post-request');
const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const getPostById = require('../../helpers/get-post-by-id');

chai.use(chaiHttp);

const expect = chai.expect;

describe('Get post body by name INTEGRATION', () => {
  let authUser;
  let adminUser;

  before(async () => {
    authUser = await createUser({strapi});
    adminUser = await createUser({strapi, roleType: 'administrator'});
  });

  after(async () => {
    await strapi.query('post').delete({});
    await strapi.query('user', 'users-permissions').delete({});
  });

  it('should get a post body by the name throw the api rest', async () => {
    const jwt = generateJwt(strapi, adminUser);
    const postRes = await createPostRequest(strapi, chai, {title: 'The good one',}, jwt);

    const post = await getPostById(strapi, postRes.id);

    const jwt2 = generateJwt(strapi, authUser);
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .get(`/post-body-by-name/${post.name}/download.md`)
        .set('Authorization', `Bearer ${jwt2}`)
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    expect(res.text).to.equal(post.body);
    expect(res.status).to.be.equal(200);
  });
});
