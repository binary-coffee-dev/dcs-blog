const chai = require('chai');
const chaiHttp = require('chai-http');

const randomName = require('../../helpers/random-name');
const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const createPostRequest = require('../../helpers/create-post-request');

chai.use(chaiHttp);

const expect = chai.expect;

describe('Create/Update post with publishedAt attribute INTEGRATION', () => {
  let authUser;
  let admin;

  before(async () => {
    authUser = await createUser({strapi});
    admin = await createUser({strapi, roleType: 'administrator'});
  });

  after(async () => {
    await strapi.query('post').delete({});
    await strapi.query('user', 'users-permissions').delete({});
  });

  it('should limit the number of post by user in the same day', async () => {
    // create a post 2 days before the new ones are created
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    const sql = 'INSERT INTO post (title, name, body, enable, published_at, created_at, author) VALUES (?,?,?,?,?,?,?);';
    await strapi.connections.default.raw(sql,
      [randomName(), randomName(), randomName(), true, new Date(new Date() - 10), yesterday, authUser.id]);

    const jwt = generateJwt(strapi, authUser);
    for (let i = 0; i < strapi.config.custom.maxNumberOfArticlesPerDay; i++) {
      const res = await createPostRequest(strapi, chai, {enable: true}, jwt);
      expect(!!res).to.be.true;
    }
    const res = await new Promise((resolve, reject) => chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        ...(createPostRequest.MUTATION_CREATE_POST), variables: {
          body: randomName(100),
          title: randomName(15),
          enable: true
        }
      })
      .end((err, res) => err ? reject(err) : resolve(res)));
    expect(res.body.errors.length).to.be.equal(1);
  });

  it('should not limit post for admins', async () => {
    const jwt = generateJwt(strapi, admin);
    for (let i = 0; i < 10; i++) {
      const post = await createPostRequest(strapi, chai, {enable: true}, jwt);
      expect(!!post).to.be.true;
    }
  });
});
