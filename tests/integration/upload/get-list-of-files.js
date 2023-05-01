const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const createFile = require('../../helpers/create-file');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY_LIST_OF_FILES = {
  operationName: null,
  // language=GraphQL
  query: 'query ($limit: Int!, $start: Int!, $filters: ImageFiltersInput) {\n    images(sort: ["createdAt:desc"], pagination: {limit: $limit, start: $start}, filters: $filters){\n        data {\n            id\n            attributes {\n                image {\n                    data {\n                        attributes {\n                            url\n                            name\n                        }\n                    }\n                }\n            }\n        }\n        meta {\n            pagination {\n                total\n            }\n        }\n    }\n}'
};

describe('Get list of upload files INTEGRATION', () => {
  let user;
  let user2;

  before(async () => {
    user = await createUser({strapi});
    user2 = await createUser({strapi});

    for (let i = 0; i < 40; i++) {
      await createFile(strapi, user);
      if (i < 20) {
        await createFile(strapi, user2);
      }
    }
  });

  after(async () => {
    await strapi.query('api::image.image').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
    await strapi.query('plugin::upload.file').deleteMany({});
  });

  it('should get the list of images', async () => {
    const jwt = generateJwt(strapi, user);
    const res = await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        ...QUERY_LIST_OF_FILES, variables: {limit: 20, start: 0, filters: {}}
      })
      .end((err, res) => err ? reject(err) : resolve(res)));

    expect(res.body.data.images.data.length).to.be.equal(20);
  });

  it('should get images filtered by user', async () => {
    const jwt = generateJwt(strapi, user2);
    const res = await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        ...QUERY_LIST_OF_FILES, variables: {limit: 100, start: 0, filters: {user: {id: {eq: user2.id}}}}
      })
      .end((err, res) => err ? reject(err) : resolve(res)));

    expect(res.body.data.images.data.length).to.be.equal(20);
  });

  it('should get correctly pagination of the images', async () => {
    const jwt = generateJwt(strapi, user);
    const res = await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        ...QUERY_LIST_OF_FILES, variables: {limit: 6, start: 0, filters: {user: {id: {eq: user2.id}}}}
      })
      .end((err, res) => err ? reject(err) : resolve(res)));

    expect(res.body.data.images.data.length).to.be.equal(6);
    expect(res.body.data.images.meta.pagination.total).to.be.equal(20);
  });
});
