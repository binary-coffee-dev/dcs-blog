const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const createPostRequest = require('../../helpers/create-post-request');

chai.use(chaiHttp);

const expect = chai.expect;

const LIKE = 'like';
const QUERY_COUNT_OPINION = {
  operationName: null,
  query: 'query ($where: JSON!){\n  countOpinions(where: $where)\n}'
};

describe('create/edit/remove opinion INTEGRATION', () => {
  let authUser;
  let staffUser;

  before(async () => {
    authUser = await createUser({strapi});
    staffUser = await createUser({strapi, roleType: 'staff'});
  });

  after(async () => {
    await strapi.query('post').delete({});
    await strapi.query('user', 'users-permissions').delete({});
  });

  afterEach(async () => {
    await strapi.query('opinion').delete({});
  });

  it('should count the number of opinions by post', async () => {
    const jwt = generateJwt(strapi, authUser);
    const post = await createPostRequest(strapi, chai, {author: authUser.id}, jwt);

    await strapi.query('opinion').create({user: authUser.id, post: post.id, type: LIKE});
    await strapi.query('opinion').create({user: staffUser.id, post: post.id, type: LIKE});

    const res = await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...QUERY_COUNT_OPINION, variables: {where: {post: post.name, type: LIKE}}})
        .end((err, res) => resolve(res));
    });

    expect(res.body.data.countOpinions).to.be.equal(2);
  });

  it('should count the number of opinions by post', async () => {
    const jwt = generateJwt(strapi, authUser);
    const post = await createPostRequest(strapi, chai, {author: authUser.id}, jwt);

    await strapi.query('opinion').create({user: authUser.id, post: post.id, type: LIKE});
    await strapi.query('opinion').create({user: staffUser.id, post: post.id, type: LIKE});

    const res = await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...QUERY_COUNT_OPINION, variables: {where: {post: post.name, user: 'current', type: LIKE}}})
        .end((err, res) => resolve(res));
    });

    expect(res.body.data.countOpinions).to.be.equal(1);
  });
});
