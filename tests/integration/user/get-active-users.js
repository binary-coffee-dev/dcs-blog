const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const createPost = require('../../helpers/create-post');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY_GET_ACTIVE_USERS = {
  operationName: null,
  // language=GraphQL
  query: 'query {\n    topActiveUsers {\n        users {\n            id\n            attributes {\n                username\n                email\n                provider\n                confirmed\n                blocked\n                role {\n                    data {\n                        attributes {\n                            type\n                            name\n                        }\n                    }\n                }\n                avatar {\n                    data {\n                        attributes {\n                            url\n                        }\n                    }\n                }\n                avatarUrl\n                name\n                page\n                createdAt\n                updatedAt\n            }\n        }\n        values\n    }\n}\n'
};
const MAX_NUMBER = 10;

describe('Get more active users INTEGRATION', () => {
  let users = [];

  before(async () => {
    for (let i = 0; i < MAX_NUMBER; i++) {
      // create user
      let user = await createUser({strapi});
      users.push(user);

      // assign posts
      for (let j = 0; j < i; j++) {
        if (i < MAX_NUMBER - 1) {
          await createPost(strapi, {author: user});
        } else {
          await createPost(strapi, {author: user, publishedAt: null});
        }
      }
    }
  });

  after(async () => {
    await strapi.query('api::post.post').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
  });

  it('should get the the list of more active users', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .send({...QUERY_GET_ACTIVE_USERS, variables: {limit: 5}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    const topUsers = res.body.data.topActiveUsers.users;
    const topValues = res.body.data.topActiveUsers.values;
    expect(topUsers.length).to.be.equal(strapi.config.custom.maxNumberOfTopUsers);
    expect(topValues.length).to.be.equal(strapi.config.custom.maxNumberOfTopUsers);

    for (let i = 0; i < strapi.config.custom.maxNumberOfTopUsers; i++) {
      expect(+topUsers[i].id).to.be.equal(users[MAX_NUMBER - i - 2].id);
    }

    for (let i = 0; i < strapi.config.custom.maxNumberOfTopUsers; i++) {
      expect(topValues[i]).to.be.equal(MAX_NUMBER - i - 2);
    }
  });

  it('should get the the list of more active users (auth)', async () => {
    const jwt = generateJwt(strapi, users[0]);
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send(QUERY_GET_ACTIVE_USERS)
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    const topUsers = res.body.data.topActiveUsers.users;
    const topValues = res.body.data.topActiveUsers.values;
    expect(topUsers.length).to.be.equal(strapi.config.custom.maxNumberOfTopUsers);
    expect(topValues.length).to.be.equal(strapi.config.custom.maxNumberOfTopUsers);

    for (let i = 0; i < strapi.config.custom.maxNumberOfTopUsers; i++) {
      expect(+topUsers[i].id).to.be.equal(+users[MAX_NUMBER - i - 2].id);
    }

    for (let i = 0; i < strapi.config.custom.maxNumberOfTopUsers; i++) {
      expect(topValues[i]).to.be.equal(MAX_NUMBER - i - 2);
    }
  });
});
