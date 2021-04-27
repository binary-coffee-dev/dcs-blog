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
  query: '\nquery ($limit: Int!, $start: Int!, $where: JSON) {\n  imagesConnection(sort: "createdAt:desc",limit: $limit, start: $start, where: $where){\n    values {\n      id\n      image {\n        id\n        name\n        url\n        mime\n      }\n    }\n    aggregate {\n      count\n      totalCount\n    }\n  }\n}'
};

describe('Get list of upload files INTEGRATION', () => {
  let user;
  let user2;

  before(async () => {
    user = await createUser({strapi});
    user2 = await createUser({strapi});

    for (let i = 0; i < 40; i++) {
      await createFile(strapi, user);
      if (i<20) {
        await createFile(strapi, user2);
      }
    }
  });

  it('should get the list of images', async () => {
    const jwt = generateJwt(strapi, user);
    const res = await new Promise((resolve, reject) => chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        ...QUERY_LIST_OF_FILES, variables: {limit: 20, start: 0, where: {}}
      })
      .end((err, res) => err ? reject(err) : resolve(res)));

    expect(res.body.data.imagesConnection.values.length).to.be.equal(20);
  });

  it('should get images filtered by user', async () => {
    const jwt = generateJwt(strapi, user2);
    const res = await new Promise((resolve, reject) => chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        ...QUERY_LIST_OF_FILES, variables: {limit: 100, start: 0, where: {user: user2.id}}
      })
      .end((err, res) => err ? reject(err) : resolve(res)));

    expect(res.body.data.imagesConnection.values.length).to.be.equal(20);
  });

  it('should get correctly pagination of the images', async () => {
    const jwt = generateJwt(strapi, user);
    const res = await new Promise((resolve, reject) => chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        ...QUERY_LIST_OF_FILES, variables: {limit: 6, start: 0, where: {user: user2.id}}
      })
      .end((err, res) => err ? reject(err) : resolve(res)));

    expect(res.body.data.imagesConnection.values.length).to.be.equal(6);
    expect(res.body.data.imagesConnection.aggregate.count).to.be.equal(20);
  });
});
