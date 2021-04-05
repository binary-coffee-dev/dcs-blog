const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const deleteUser = require('../../helpers/delete-user');
const deletePost = require('../../helpers/delete-post');
const createPost = require('../../helpers/create-post');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY_GET_POPULAR_USERS = {
  operationName: null,
  query: 'query {\n  topPopularUsers {\n    users {\n      id\n      _id\n      createdAt\n      updatedAt\n      username\n      email\n      provider\n      confirmed\n      blocked\n      avatarUrl\n      name\n      page\n    }\n    values\n  }\n}'
};
const MAX_NUMBER = 10;

describe('Get popular users INTEGRATION', () => {
  let posts = [];

  let users = [];

  before(async () => {
    for (let i = 0; i < MAX_NUMBER; i++) {
      // create user
      let user = await createUser({strapi});
      users.push(user);

      // assign posts
      for (let j = 0; j < MAX_NUMBER; j++) {
        posts.push(await createPost(strapi,{
          author: user,
          likes: i * MAX_NUMBER + j
        }));
      }
    }
  });

  after(async () => {
    for (let post of posts) {
      await deletePost(strapi, post);
    }
    for (let user of users) {
      await deleteUser(strapi, user);
    }
  });

  it('should get the the list of popular users', (done) => {
    chai.request(strapi.server)
      .post('/graphql')
      .send(QUERY_GET_POPULAR_USERS)
      .end((err, res) => {
        const topUsers = res.body.data.topPopularUsers.users;
        const topValues = res.body.data.topPopularUsers.values;
        const topLength = topUsers.length;

        for (let i = 0; i < topLength; i++) {
          expect(topUsers[i]._id.toString()).to.be.equal(users[MAX_NUMBER - i - 1]._id.toString());
        }
        expect(topValues.length).to.be.equal(topLength);

        done();
      });
  });

  it('should get the the list of popular users (auth)', (done) => {
    const jwt = generateJwt(strapi, users[0]);
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send(QUERY_GET_POPULAR_USERS)
      .end((err, res) => {
        const topUsers = res.body.data.topPopularUsers.users;
        const topValues = res.body.data.topPopularUsers.values;
        const topLength = topUsers.length;

        for (let i = 0; i < topLength; i++) {
          expect(topUsers[i]._id.toString()).to.be.equal(users[MAX_NUMBER - i - 1]._id.toString());
        }
        expect(topValues.length).to.be.equal(topLength);

        done();
      });
  });
});
