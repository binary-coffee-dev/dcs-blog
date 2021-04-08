const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const deleteUser = require('../../helpers/delete-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY_SEARCH_USERS = {
  operationName: null,
  variables: {search: ''},
  // language=GraphQL
  query: 'query ($search: String!){\n  users(sort: "asd", limit: 10, start: 0, where: {username: $search}) {\n    id\n    username\n    avatarUrl\n    name\n  }\n}'
};
const MAX_NUMBER = 20;

describe('Search users INTEGRATION', () => {
  let users = [];

  before(async () => {
    for (let i = 0; i < MAX_NUMBER; i++) {
      users.push(await createUser({strapi}));
    }
  });

  after(async () => {
    for (let user of users) {
      await deleteUser(strapi, user);
    }
  });

  it('should filter one user from the list', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .send({...QUERY_SEARCH_USERS, variables: {search: users[0].username}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(res.body.data.users.length).to.be.equal(1);
  });

  it('should get at least one user in the query response', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .send({...QUERY_SEARCH_USERS, variables: {search: users[0].username.substr(2, 6)}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(res.body.data.users.length).to.be.greaterThan(0);
  });
});
