const chai = require('chai');
const chaiHttp = require('chai-http');

const createPostRequest = require('../../helpers/create-post-request');
const updatePostRequest = require('../../helpers/update-post-request');
const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const getPostById = require('../../helpers/get-post-by-id');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY_GET_POST_BY_NAME = {
  operationName: 'fetchPost',
  variables: {
    id: 'this-is-a-test-yes'
  },
  // language=GraphQL
  query: 'query fetchPost($id: String!) {\n  postByName(name: $id) {\n    id\n    name\n    title\n    body\n    published_at\n    views\n    tags {\n      id\n      name\n      __typename\n    }\n    comments\n    banner {\n      url\n      __typename\n    }\n    author {\n      id\n      username\n      email\n      avatarUrl\n      page\n      __typename\n    }\n    tags {\n      name\n      __typename\n    }\n    __typename\n  }\n  likes:countOpinions(where: {post: $id, type: "like"})\n  userLike:countOpinions(where: {post: $id, type: "like", user: "current"})\n}\n'
};

describe('Create/Update post with publishedAt attribute INTEGRATION', () => {
  let authUser;
  let staffUser;
  let adminUser;

  before(async () => {
    authUser = await createUser({strapi});
    staffUser = await createUser({strapi, roleType: 'staff'});
    adminUser = await createUser({strapi, roleType: 'administrator'});
  });

  after(async () => {
    await strapi.query('post').delete({});
    await strapi.query('user', 'users-permissions').delete({});
  });

  it('should create an article with the publishedAt attribute (admin user)', async () => {
    const jwt = generateJwt(strapi, adminUser);
    const postRes = await createPostRequest(strapi, chai, {title: 'The good one',}, jwt);

    const post = await getPostById(strapi, postRes.id);

    expect(post.published_at).not.null;
  });

  it('should create an article without the publishedAt attribute (staff user)', async () => {
    const jwt = generateJwt(strapi, staffUser);
    const postRes = await createPostRequest(strapi, chai, {title: 'not work',}, jwt);

    const post = await getPostById(strapi, postRes.id);

    expect(post.published_at).not.null;
  });

  it('should create an article without the publishedAt attribute (auth user)', async () => {
    const jwt = generateJwt(strapi, authUser);
    const postRes = await createPostRequest(strapi, chai, {title: 'not work two',}, jwt);

    const post = await getPostById(strapi, postRes.id);

    expect(post.published_at).not.null;
  });

  it('should update an article with the publishedAt attribute (admin user)', async () => {
    const jwt = generateJwt(strapi, adminUser);

    const adminPost = await createPostRequest(strapi, chai, {author: authUser._id, publishedAt: null}, jwt);

    expect(adminPost.published_at).to.be.undefined;

    const postRes = await updatePostRequest(strapi, chai, {id: adminPost.id}, jwt);
    const post = await getPostById(strapi, postRes.id);

    expect(post.published_at).not.null;
  });

  it('should update an article without the publishedAt attribute (staff user)', async () => {
    const jwt = generateJwt(strapi, staffUser);

    const authPost = await createPostRequest(strapi, chai, {author: authUser._id, publishedAt: null}, jwt);

    expect(authPost.published_at).to.be.undefined;

    const postRes = await updatePostRequest(strapi, chai, {id: authPost.id}, jwt);
    const post = await getPostById(strapi, postRes.id);

    expect(post.published_at).not.null;
  });

  it('should update an article without the publishedAt attribute (auth user)', async () => {
    const jwt = generateJwt(strapi, authUser);

    const authPost = await createPostRequest(strapi, chai, {author: authUser._id, publishedAt: null}, jwt);

    expect(authPost.published_at).to.be.undefined;

    const postRes = await updatePostRequest(strapi, chai, {id: authPost.id}, jwt);
    const post = await getPostById(strapi, postRes.id);

    expect(post.published_at).to.be.undefined;
  });

  it('should not allow to publish a post with an empty title', async () => {
    const jwt = generateJwt(strapi, adminUser);

    let fail = false;
    try {
      await createPostRequest(strapi, chai, {title: ''}, jwt);
      fail = true;
    } catch (ignore) {
      expect(ignore).to.exist;
    }
    expect(fail).to.be.equal(false, 'Expected error didn\'t thrown');
  });

  it('should not allow to edit a post with an empty title', async () => {
    const jwt = generateJwt(strapi, adminUser);

    const post = await createPostRequest(strapi, chai, {}, jwt);

    let fail = false;
    try {
      await updatePostRequest(strapi, chai, {id: post.id, title: ''}, jwt);
      fail = true;
    } catch (ignore) {
      expect(ignore).to.exist;
    }
    expect(fail).to.be.equal(false, 'Expected error didn\'t thrown');
  });

  it('should create and then update article and test the created links', async () => {
    // create post
    const jwt = generateJwt(strapi, adminUser);
    let postRes = await createPostRequest(strapi, chai, {title: 'The good one'}, jwt);

    let post = await getPostById(strapi, postRes.id);
    const initialName = post.name;

    expect(post.published_at).not.null;

    // update post without change title
    postRes = await updatePostRequest(strapi, chai, {id: post.id, title: post.title}, jwt);
    post = await getPostById(strapi, postRes.id);

    let links = await strapi.query('link').find({post: post.id});

    expect(post.published_at).not.null;
    expect(links.length).to.equal(1);

    // update with new title
    postRes = await updatePostRequest(strapi, chai, {id: post.id, title: 'this is the new title'}, jwt);
    post = await getPostById(strapi, postRes.id);

    links = await strapi.query('link').find({post: post.id});

    expect(post.published_at).not.null;
    expect(links.length).to.equal(2);

    // check if post can be requested with an old name
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...QUERY_GET_POST_BY_NAME, variables: {id: initialName}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    expect(res.body.data).not.null;
    expect(res.body.data.postByName).not.null;
    expect(res.body.data.postByName.name).to.equal(post.name);
  });
});
