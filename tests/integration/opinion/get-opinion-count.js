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
  // language=GraphQL
  query: 'query ($name: String!, $userId: ID){\n    opinions(filters: {post: {name: {eq: $name}}, type: {eq: "like"}, user: {id: {eq: $userId}}}) {\n        meta {\n            pagination {\n                total\n            }\n        }\n    }\n}'
};

describe('create/edit/remove opinion INTEGRATION', () => {
  let authUser;
  let staffUser;

  before(async () => {
    authUser = await createUser({strapi});
    staffUser = await createUser({strapi, roleType: 'staff'});
  });

  after(async () => {
    await strapi.query('api::post.post').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
  });

  afterEach(async () => {
    await strapi.query('api::opinion.opinion').deleteMany({});
  });

  it('should count the number of opinions by post (with id)', async () => {
    const jwt = generateJwt(strapi, authUser);
    const post = await createPostRequest(strapi, chai, {author: authUser.id}, jwt);

    await strapi.query('api::opinion.opinion').create({data: {user: authUser.id, post: post.id, type: LIKE}});
    await strapi.query('api::opinion.opinion').create({data: {user: staffUser.id, post: post.id, type: LIKE}});

    const res = await new Promise(resolve => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...QUERY_COUNT_OPINION, variables: {name: post.attributes.name, userId: authUser.id}})
        .end((err, res) => resolve(res));
    });

    expect(res.body.data.opinions.meta.pagination.total).to.be.equal(1);
  });
});
