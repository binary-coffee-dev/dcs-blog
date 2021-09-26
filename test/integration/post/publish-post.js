const chai = require('chai');
const chaiHttp = require('chai-http');

const createPost = require('../../helpers/create-post');
const createUser = require('../../helpers/create-user');
const deleteUser = require('../../helpers/delete-user');
const deletePost = require('../../helpers/delete-post');
const randomName = require('../../helpers/random-name');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const getPostById = require('../../helpers/get-post-by-id');

chai.use(chaiHttp);

const expect = chai.expect;

const MUTATION_CREATE_POST = {
  operationName: null,
  query: 'mutation ($title: String, $body: String, $enable: Boolean, $banner: ID, $author: ID, $tags: [ID], $publishedAt: DateTime) {\n  createPost(input: {data: {publishedAt: $publishedAt, title: $title, body: $body, enable: $enable, banner: $banner, author: $author, tags: $tags}}) {\n    post {\n      id\n      __typename\n    }\n    __typename\n  }\n}\n'
};

const MUTATION_UPDATE_POST = {
  operationName: null,
  query: 'mutation ($id: ID!, $title: String, $body: String, $enable: Boolean, $banner: ID, $tags: [ID], $publishedAt: DateTime) {\n  updatePost(input: {data: {publishedAt: $publishedAt, title: $title, body: $body, enable: $enable, banner: $banner, tags: $tags}, where: {id: $id}}) {\n    post {\n      id\n      __typename\n    }\n    __typename\n  }\n}\n'
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

  it('should create an article with the publishedAt attribute (admin user)', async () => {
    const jwt = generateJwt(strapi, adminUser);
    const res = await createNewPost({title: 'The good one',}, jwt);

    const post = await getPostById(strapi, res.body.data.createPost.post.id);

    posts.push(post);
    expect(!!post.publishedAt).to.equal(true);
  });

  it('should create an article without the publishedAt attribute (staff user)', async () => {
    const jwt = generateJwt(strapi, staffUser);
    const res = await createNewPost({title: 'not work',}, jwt);

    const post = await getPostById(strapi, res.body.data.createPost.post.id);

    posts.push(post);
    expect(!!post.publishedAt).to.equal(false);
  });

  it('should create an article without the publishedAt attribute (auth user)', async () => {
    const jwt = generateJwt(strapi, authUser);
    const res = await createNewPost({title: 'not work two',}, jwt);

    const post = await getPostById(strapi, res.body.data.createPost.post.id);

    posts.push(post);
    expect(!!post.publishedAt).to.equal(false);
  });

  it('should update an article with the publishedAt attribute (admin user)', async () => {
    const adminPost = await createPost(strapi, {author: authUser, publishedAt: null});
    posts.push(adminPost);
    const jwt = generateJwt(strapi, adminUser);

    const res = await updatePost({id: adminPost.id}, jwt);
    const post = await getPostById(strapi, res.body.data.updatePost.post.id);

    posts.push(post);
    expect(!!post.publishedAt).to.equal(true);
  });

  it('should update an article without the publishedAt attribute (staff user)', async () => {
    const adminPost = await createPost(strapi, {author: authUser, publishedAt: null});
    posts.push(adminPost);
    const jwt = generateJwt(strapi, staffUser);

    const res = await updatePost({id: adminPost.id}, jwt);
    const post = await getPostById(strapi, res.body.data.updatePost.post.id);

    posts.push(post);
    expect(!!post.publishedAt).to.equal(false);
  });

  it('should update an article without the publishedAt attribute (auth user)', async () => {
    const adminPost = await createPost(strapi, {author: authUser, publishedAt: null});
    posts.push(adminPost);
    const jwt = generateJwt(strapi, authUser);

    const res = await updatePost({id: adminPost.id}, jwt);
    const post = await getPostById(strapi, res.body.data.updatePost.post.id);

    posts.push(post);
    expect(!!post.publishedAt).to.equal(false);
  });

  it('should create and then update article and test the created links', async () => {
    // create post
    const jwt = generateJwt(strapi, adminUser);
    let res = await createNewPost({title: 'The good one',}, jwt);

    let post = await getPostById(strapi, res.body.data.createPost.post.id);
    posts.push(post);

    expect(!!post.publishedAt).to.equal(true);

    // update post without change title
    res = await updatePost({id: post.id, title: post.title}, jwt);
    post = await getPostById(strapi, res.body.data.updatePost.post.id);

    let links = await strapi.models.link.find({post: post.id});

    expect(!!post.publishedAt).to.equal(true);
    expect(links.length).to.equal(1);

    // update with new title
    res = await updatePost({id: post.id, title: 'this is the new title'}, jwt);
    post = await getPostById(strapi, res.body.data.updatePost.post.id);

    links = await strapi.models.link.find({post: post.id});

    expect(!!post.publishedAt).to.equal(true);
    expect(links.length).to.equal(2);
  });
});

async function updatePost(variables, jwt) {
  return new Promise((resolve, reject) => {
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        ...MUTATION_UPDATE_POST, variables: {
          enable: true,
          title: randomName(),
          body: '# fasdfasd f',
          publishedAt: new Date(),
          tags: ['5eb120d1e7134c0012f4d440'],
          banner: null,
          ...variables
        }
      })
      .end((err, res) => err ? reject(err) : resolve(res));
  });
}

function createNewPost(variables, jwt) {
  return new Promise((resolve, reject) => {
    chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        ...MUTATION_CREATE_POST, variables: {
          body: 'safsadf',
          enable: true,
          author: '5deee37e98bbd80013a0a844',
          publishedAt: new Date(),
          ...variables
        }
      })
      .end((err, res) => err ? reject(err) : resolve(res));
  });
}
