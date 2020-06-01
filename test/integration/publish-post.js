const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../helpers/create-user');
const deleteUser = require('../helpers/delete-user');
const deletePost = require('../helpers/delete-post');
const randomName = require('../helpers/random-name');
const generateJwt = require('../helpers/generate-jwt-by-user');
const getPostById = require('../helpers/get-post-by-id');

chai.use(chaiHttp);

const expect = chai.expect;

const MUTATION_CREATE_POST = {
  operationName: null,
  query: 'mutation ($title: String, $body: String, $description: String, $enable: Boolean, $banner: ID, $author: ID, $tags: [ID], $publishedAt: DateTime) {\n  createPost(input: {data: {publishedAt: $publishedAt, title: $title, body: $body, description: $description, enable: $enable, banner: $banner, author: $author, tags: $tags}}) {\n    post {\n      id\n      __typename\n    }\n    __typename\n  }\n}\n'
};

const MUTATION_UPDATE_POST = {
  operationName: null,
  query: 'mutation ($id: ID!, $title: String, $body: String, $description: String, $enable: Boolean, $banner: ID, $tags: [ID], $publishedAt: DateTime) {\n  updatePost(input: {data: {publishedAt: $publishedAt, title: $title, body: $body, description: $description, enable: $enable, banner: $banner, tags: $tags}, where: {id: $id}}) {\n    post {\n      id\n      __typename\n    }\n    __typename\n  }\n}\n'
};

describe('Create/Update post with publishedAt attribute INTEGRATION', () => {
  let posts = [];

  let authUser;
  let staffUser;
  let adminUser;

  before(async () => {
    authUser = await createUser({strapi});
    staffUser = await createUser({strapi, roleType: 'staff'});
    adminUser = await createUser({strapi, roleType: 'administrator'});
  });

  after(async () => {
    for (let post of posts) {
      await deletePost(strapi, post);
    }
    await deleteUser(strapi, authUser);
    await deleteUser(strapi, staffUser);
    await deleteUser(strapi, adminUser);
  });

  it('should create an article with the publishedAt attribute (admin user)', (done) => {
    const jwt = generateJwt(strapi, adminUser);
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        ...MUTATION_CREATE_POST, variables: {
          body: 'safsadf',
          description: 'sfgsd fg sdfg',
          title: 'The good one',
          enable: true,
          author: '5deee37e98bbd80013a0a844',
          publishedAt: new Date()
        }
      })
      .end((err, res) => {
        getPostById(strapi, res.body.data.createPost.post.id)
          .then(post => {
            posts.push(post);
            expect(!!post.publishedAt).to.equal(true);
            done();
          });
      });
  });

  it('should create an article without the publishedAt attribute (staff user)', (done) => {
    const jwt = generateJwt(strapi, staffUser);
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        ...MUTATION_CREATE_POST, variables: {
          body: 'safsadf',
          description: 'sfgsd fg sdfg',
          title: 'not work',
          enable: true,
          author: '5deee37e98bbd80013a0a844',
          publishedAt: new Date()
        }
      })
      .end((err, res) => {
        getPostById(strapi, res.body.data.createPost.post.id)
          .then(post => {
            posts.push(post);
            expect(!!post.publishedAt).to.equal(false);
            done();
          });
      });
  });

  it('should create an article without the publishedAt attribute (auth user)', (done) => {
    const jwt = generateJwt(strapi, authUser);
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        ...MUTATION_CREATE_POST, variables: {
          body: 'safsadf',
          description: 'sfgsd fg sdfg',
          title: 'not work two',
          enable: true,
          author: '5deee37e98bbd80013a0a844',
          publishedAt: new Date()
        }
      })
      .end((err, res) => {
        getPostById(strapi, res.body.data.createPost.post.id)
          .then(post => {
            posts.push(post);
            expect(!!post.publishedAt).to.equal(false);
            done();
          });
      });
  });

  it('should update an article with the publishedAt attribute (admin user)', async () => {
    const adminPost = await strapi.models.post.create({
      title: randomName(),
      name: randomName(),
      body: 'SOME',
      description: 'SOME 1',
      enable: true,
      author: authUser
    });
    posts.push(adminPost);
    const jwt = generateJwt(strapi, adminUser);
    return await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({
          ...MUTATION_UPDATE_POST, variables: {
            id: adminPost.id,
            enable: true,
            title: randomName(),
            description: 'asdfasdf sd sdf',
            body: '# fasdfasd f',
            publishedAt: new Date(),
            tags: ['5eb120d1e7134c0012f4d440'],
            banner: null,
          }
        })
        .end((err, res) => {
          getPostById(strapi, res.body.data.updatePost.post.id)
            .then(post => {
              console.log(post);
              posts.push(post);
              expect(!!post.publishedAt).to.equal(true);
              resolve();
            });
        });
    });
  });

  it('should update an article without the publishedAt attribute (staff user)', async () => {
    const adminPost = await strapi.models.post.create({
      title: randomName(),
      name: randomName(),
      body: 'SOME',
      description: 'SOME 1',
      enable: true,
      author: authUser
    });
    posts.push(adminPost);
    const jwt = generateJwt(strapi, staffUser);
    return await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({
          ...MUTATION_UPDATE_POST, variables: {
            id: adminPost.id,
            enable: true,
            title: randomName(),
            description: 'asdfasdf sd sdf',
            body: '# fasdfasd f',
            publishedAt: new Date(),
            tags: ['5eb120d1e7134c0012f4d440'],
            banner: null,
          }
        })
        .end((err, res) => {
          getPostById(strapi, res.body.data.updatePost.post.id)
            .then(post => {
              console.log(post);
              posts.push(post);
              expect(!!post.publishedAt).to.equal(false);
              resolve();
            });
        });
    });
  });

  it('should update an article without the publishedAt attribute (auth user)', async () => {
    const adminPost = await strapi.models.post.create({
      title: randomName(),
      name: randomName(),
      body: 'SOME',
      description: 'SOME 1',
      enable: true,
      author: authUser
    });
    posts.push(adminPost);
    const jwt = generateJwt(strapi, authUser);
    return await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({
          ...MUTATION_UPDATE_POST, variables: {
            id: adminPost.id,
            enable: true,
            title: randomName(),
            description: 'asdfasdf sd sdf',
            body: '# fasdfasd f',
            publishedAt: new Date(),
            tags: ['5eb120d1e7134c0012f4d440'],
            banner: null,
          }
        })
        .end((err, res) => {
          getPostById(strapi, res.body.data.updatePost.post.id)
            .then(post => {
              console.log(post);
              posts.push(post);
              expect(!!post.publishedAt).to.equal(false);
              resolve();
            });
        });
    });
  });
});
