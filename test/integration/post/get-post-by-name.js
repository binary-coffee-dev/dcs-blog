const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const deleteUser = require('../../helpers/delete-user');
const deletePost = require('../../helpers/delete-post');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY_GET_POST_BY_NAME = {
  operationName: 'fetchPost',
  variables: {
    id: 'this-is-a-test-yes'
  },
  query: 'query fetchPost($id: String!) {\n  postByName(name: $id) {\n    id\n    name\n    title\n    body\n    publishedAt\n    views\n    tags {\n      id\n      name\n      __typename\n    }\n    comments\n    banner {\n      url\n      __typename\n    }\n    author {\n      id\n      username\n      email\n      avatarUrl\n      page\n      __typename\n    }\n    tags {\n      name\n      __typename\n    }\n    __typename\n  }\n}\n'
};

describe('Get post by name INTEGRATION', () => {
  let posts = [];

  let authUserOwner;
  let authUser;
  let staffUser;
  let adminUser;

  before(async () => {
    authUserOwner = await createUser({strapi});
    authUser = await createUser({strapi});
    staffUser = await createUser({strapi, roleType: 'staff'});
    adminUser = await createUser({strapi, roleType: 'administrator'});

    posts.push(await strapi.models.post.create({
      title: 'this is a test yes',
      name: 'this-is-a-test-yes',
      body: 'SOME',
      description: 'SOME 1',
      enable: false,
      author: authUserOwner
    }));
  });

  after(async () => {
    for (let post of posts) {
      await deletePost(strapi, post);
    }
    await deleteUser(strapi, authUserOwner);
    await deleteUser(strapi, authUser);
    await deleteUser(strapi, staffUser);
    await deleteUser(strapi, adminUser);
  });

  it('should get the post by name the owner of the article', (done) => {
    const jwt = generateJwt(strapi, authUserOwner);
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send(QUERY_GET_POST_BY_NAME)
      .end((err, res) => {
        expect(!!res.body.data.postByName).to.be.true;
        expect(res.body.data.postByName.author.id).to.equal(authUserOwner.id);
        expect(res.body.data.postByName.name).to.equal('this-is-a-test-yes');
        done();
      });
  });

  it('should not have access to an article if the user is not the owner', (done) => {
    const jwt = generateJwt(strapi, authUser);
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send(QUERY_GET_POST_BY_NAME)
      .end((err, res) => {
        expect(!!res.body.data).to.be.false;
        done();
      });
  });

  it('should not have access to an article a public user', (done) => {
    chai.request(strapi.server)
      .post('/graphql')
      .send(QUERY_GET_POST_BY_NAME)
      .end((err, res) => {
        expect(!!res.body.data).to.be.false;
        done();
      });
  });

  it('should get the post an user with staff role', (done) => {
    const jwt = generateJwt(strapi, staffUser);
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send(QUERY_GET_POST_BY_NAME)
      .end((err, res) => {
        expect(!!res.body.data.postByName).to.be.true;
        expect(res.body.data.postByName.author.id).to.equal(authUserOwner.id);
        expect(res.body.data.postByName.name).to.equal('this-is-a-test-yes');
        done();
      });
  });

  it('should get the post an user with admin role', (done) => {
    const jwt = generateJwt(strapi, adminUser);
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send(QUERY_GET_POST_BY_NAME)
      .end((err, res) => {
        expect(!!res.body.data.postByName).to.be.true;
        expect(res.body.data.postByName.author.id).to.equal(authUserOwner.id);
        expect(res.body.data.postByName.name).to.equal('this-is-a-test-yes');
        done();
      });
  });
});
