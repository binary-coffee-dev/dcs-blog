const chai = require('chai');
const chaiHttp = require('chai-http');
const spies = require('chai-spies');

const createPostRequest = require('../../helpers/create-post-request');
const updatePostRequest = require('../../helpers/update-post-request');
const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const getPostById = require('../../helpers/get-post-by-id');

chai.use(chaiHttp);
chai.use(spies);
const expect = chai.expect;

const QUERY_GET_POST_BY_NAME = {
  operationName: 'fetchPost',
  variables: {
    id: 'this-is-a-tests-yes'
  },
  // language=GraphQL
  query: 'query fetchPost($id: String!, $postName: ID, $userId: ID) {\n    postByName(name: $id) {\n        data {\n            id\n            attributes {\n                title\n                body\n                enable\n                name\n                views\n                readingTime\n                comments\n                likes\n                createdAt\n                updatedAt\n                publishedAt\n            }\n        }\n    }\n    likes:opinions(filters: {post: {id: {eq: $postName}}, type: {eq: "like"}}) {\n        meta {\n            pagination {\n                total\n            }\n        }\n    }\n    userLikes:opinions(filters: {post: {id: {eq: $postName}}, type: {eq: "like"}, user: {id: {eq: $userId}}}) {\n        meta {\n            pagination {\n                total\n            }\n        }\n    }\n}\n'
};

describe('Create/Update post with publishedAt attribute INTEGRATION', () => {
  let sendBotNotificationSaved;

  before(async () => {
    sendBotNotificationSaved = strapi.config.functions.sendBotNotification;
    strapi.config.custom.enableBotNotifications = true;
  });

  beforeEach(() => {
    strapi.config.functions.sendBotNotification = chai.spy(() => Promise.resolve());
  });

  after(async () => {
    await strapi.query('api::post.post').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
    strapi.config.functions.sendBotNotification = sendBotNotificationSaved;
    strapi.config.custom.enableBotNotifications = false;
  });

  it('should create a post with the publishedAt attribute (admin user)', async () => {
    const adminUser = await createUser({strapi, roleType: 'administrator'});
    const jwt = generateJwt(strapi, adminUser);
    const postRes = await createPostRequest(strapi, chai, {title: 'The good one',}, jwt);

    const post = await getPostById(strapi, postRes.id);

    expect(post.tags).to.have.lengthOf(1);
    expect(post.publishedAt).not.null;
    expect(post.adminApproval).to.be.true;
    expect(strapi.config.functions.sendBotNotification).to.not.been.called();
  });

  it('should create a post with the publishedAt attribute (staff user)', async () => {
    const staffUser = await createUser({strapi, roleType: 'staff'});
    const jwt = generateJwt(strapi, staffUser);
    const postRes = await createPostRequest(strapi, chai, {title: 'not work',}, jwt);

    const post = await getPostById(strapi, postRes.id);

    expect(post.tags).to.have.lengthOf(1);
    expect(post.publishedAt).not.null;
    expect(post.adminApproval).to.be.true;
    expect(strapi.config.functions.sendBotNotification).to.not.been.called();
  });

  it('should create a post with the publishedAt attribute (auth user)', async () => {
    const authUser = await createUser({strapi});
    const jwt = generateJwt(strapi, authUser);
    const postRes = await createPostRequest(strapi, chai, {}, jwt);

    const post = await getPostById(strapi, postRes.id);

    expect(post.publishedAt).not.null;
    expect(post.adminApproval).to.be.true;
    expect(strapi.config.functions.sendBotNotification).to.have.been.called();
  });

  it('should create a post without the publishedAt attribute (auth user)', async () => {
    const authUser = await createUser({strapi});
    const jwt = generateJwt(strapi, authUser);
    const postRes = await createPostRequest(strapi, chai, {title: 'not work two', publishedAt: undefined}, jwt);

    const post = await getPostById(strapi, postRes.id);

    expect(post.publishedAt).to.be.null;
    expect(post.adminApproval).to.be.true;
  });

  it('should create a post with the publishedAt attribute (validate minimum time of 30 min) (auth user)', async () => {
    const authUser = await createUser({strapi});
    const jwt = generateJwt(strapi, authUser);
    const postRes = await createPostRequest(strapi, chai, {title: 'not work two', publishedAt: new Date()}, jwt);

    const post = await getPostById(strapi, postRes.id);

    expect(post.publishedAt).not.null;
    expect(post.tags).to.have.lengthOf(1);
    expect(new Date(post.publishedAt) > new Date(new Date().getTime() + 20 * 60000)).to.be.true;
    expect(post.adminApproval).to.be.true;
    expect(strapi.config.functions.sendBotNotification).to.have.been.called();
  });

  it('should create a post with the publishedAt attribute (with valid date after 30 minutes) (auth user)', async () => {
    const authUser = await createUser({strapi});
    const jwt = generateJwt(strapi, authUser);
    const date = new Date(new Date().getTime() + 100 * 60000);
    const postRes = await createPostRequest(strapi, chai, {
      title: 'not work two',
      publishedAt: date
    }, jwt);

    const post = await getPostById(strapi, postRes.id);

    expect(post.publishedAt).not.null;
    expect(post.publishedAt).to.be.eq(date.toISOString());
    expect(post.adminApproval).to.be.true;
    expect(strapi.config.functions.sendBotNotification).to.have.been.called();
  });

  it('should update a post with the publishedAt attribute (admin user)', async () => {
    const authUser = await createUser({strapi});
    const jwtAuth = generateJwt(strapi, authUser);
    const adminUser = await createUser({strapi, roleType: 'administrator'});
    const jwt = generateJwt(strapi, adminUser);

    const adminPost = await createPostRequest(strapi, chai, {author: authUser.id, publishedAt: null}, jwtAuth);

    expect(adminPost.publishedAt).to.be.undefined;
    expect(strapi.config.functions.sendBotNotification).to.not.been.called();

    const postRes = await updatePostRequest(strapi, chai, {id: adminPost.id}, jwt);
    const post = await getPostById(strapi, postRes.id);

    expect(post.publishedAt).not.null;
    expect(post.adminApproval).to.be.true;
    expect(strapi.config.functions.sendBotNotification).to.not.been.called();
  });

  it('should update a post without the publishedAt attribute (staff user)', async () => {
    const authUser = await createUser({strapi});
    const staffUser = await createUser({strapi, roleType: 'staff'});
    const jwt = generateJwt(strapi, staffUser);

    const staffPost = await createPostRequest(strapi, chai, {author: authUser.id, publishedAt: null}, jwt);

    expect(staffPost.attributes.publishedAt).to.be.null;
    expect(strapi.config.functions.sendBotNotification).to.not.been.called();

    const postRes = await updatePostRequest(strapi, chai, {id: staffPost.id}, jwt);
    const post = await getPostById(strapi, postRes.id);

    expect(post.publishedAt).not.null;
    expect(post.adminApproval).to.be.true;
    expect(strapi.config.functions.sendBotNotification).to.not.been.called();
  });

  it('should update a post without the publishedAt attribute (auth user)', async () => {
    const authUser = await createUser({strapi});
    const jwt = generateJwt(strapi, authUser);

    const authPost = await createPostRequest(strapi, chai, {author: authUser.id, publishedAt: null}, jwt);

    expect(authPost.attributes.publishedAt).to.be.null;
    expect(strapi.config.functions.sendBotNotification).to.not.been.called();

    const postRes = await updatePostRequest(strapi, chai, {id: authPost.id}, jwt);
    const post = await getPostById(strapi, postRes.id);

    expect(post.publishedAt).not.null;
    expect(post.adminApproval).to.be.true;
    expect(strapi.config.functions.sendBotNotification).to.have.been.called();
  });

  it('should update a published post and the date should be not modified (auth user)', async () => {
    const authUser = await createUser({strapi});
    const jwt = generateJwt(strapi, authUser);

    const authPost = await createPostRequest(strapi, chai, {}, jwt);
    await strapi.query('api::post.post').update({
      where: {id: authPost.id},
      data: {
        publishedAt: new Date(new Date() - 30),
        adminApproval: true
      }
    });
    const updatedPost = await getPostById(strapi, authPost.id);
    expect(strapi.config.functions.sendBotNotification).to.have.been.called.once;

    const postRes = await updatePostRequest(strapi, chai, {id: authPost.id,}, jwt);
    const post = await getPostById(strapi, postRes.id);

    expect(post.publishedAt).to.be.eq(updatedPost.publishedAt);
    expect(post.adminApproval).to.be.true;
    expect(strapi.config.functions.sendBotNotification).to.have.been.called.once;
  });

  it('should not allow to publish a post with an empty title', async () => {
    const adminUser = await createUser({strapi, roleType: 'administrator'});
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
    const adminUser = await createUser({strapi, roleType: 'administrator'});
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

  it('should publish a post after created and send notification to telegram (auth user)', async () => {
    const authUser = await createUser({strapi});
    const jwt = generateJwt(strapi, authUser);

    // create post
    let postRes = await createPostRequest(strapi, chai, {publishedAt: undefined}, jwt);
    let post = await getPostById(strapi, postRes.id);

    expect(post.publishedAt).to.be.null;
    expect(post.adminApproval).to.be.true;
    expect(strapi.config.functions.sendBotNotification).to.not.been.called();

    // update post without publishing
    postRes = await updatePostRequest(strapi, chai, {id: post.id, title: 'this', publishedAt: undefined}, jwt);
    post = await getPostById(strapi, postRes.id);

    expect(post.publishedAt).to.be.null;
    expect(post.adminApproval).to.be.true;
    expect(strapi.config.functions.sendBotNotification).to.not.been.called();

    // publishing post
    postRes = await updatePostRequest(strapi, chai, {id: post.id, title: 'this is the new title'}, jwt);
    post = await getPostById(strapi, postRes.id);

    expect(post.publishedAt).to.not.be.null;
    expect(post.adminApproval).to.be.true;
    expect(strapi.config.functions.sendBotNotification).to.have.been.called();
  });

  it('should create and then update post and tests the created links', async () => {
    const adminUser = await createUser({strapi, roleType: 'administrator'});
    // create post
    const jwt = generateJwt(strapi, adminUser);
    let postRes = await createPostRequest(strapi, chai, {title: 'The good one'}, jwt);

    let post = await getPostById(strapi, postRes.id);
    const initialName = post.name;

    expect(post.publishedAt).not.null;

    // update post without change title
    postRes = await updatePostRequest(strapi, chai, {id: post.id, title: post.title}, jwt);
    post = await getPostById(strapi, postRes.id);

    let links = await strapi.query('api::link.link').findMany({where: {post: post.id}});

    expect(post.publishedAt).not.null;
    expect(links.length).to.equal(1);

    // update with new title
    postRes = await updatePostRequest(strapi, chai, {id: post.id, title: 'this is the new title'}, jwt);
    post = await getPostById(strapi, postRes.id);

    links = await strapi.query('api::link.link').findMany({where: {post: post.id}});

    expect(post.publishedAt).not.null;
    expect(links.length).to.equal(2);

    // check if post can be requested with an old name
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...QUERY_GET_POST_BY_NAME, variables: {id: initialName, postName: initialName, userId: adminUser.id}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    expect(res.body.data).not.undefined;
    expect(res.body.data.postByName).not.null;
    expect(res.body.data.postByName.data.attributes.name).to.equal(post.name);
  });
});
