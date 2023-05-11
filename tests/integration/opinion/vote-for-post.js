const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const createPost = require('../../helpers/create-post');
const getPostById = require('../../helpers/get-post-by-id');
const createOpinionRequest = require('../../helpers/create-opinion-request');
const deleteOpinionRequest = require('../../helpers/delete-opinion-request');

chai.use(chaiHttp);

const expect = chai.expect;

describe('create/edit/remove opinion INTEGRATION', () => {
  let authUser;
  let staffUser;

  before(async () => {
    authUser = await createUser({strapi});
    staffUser = await createUser({strapi, roleType: 'staff'});
  });

  after(async () => {
    await strapi.query('api::post.post').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
  });

  afterEach(async () => {
    await strapi.query('api::opinion.opinion').deleteMany({});
  });

  it('should not create a new opinion if the user is not the same of the opinion (auth)', async () => {
    const jwt = generateJwt(strapi, authUser);
    const post = await createPost(strapi, {author: authUser.id});
    const res = await createOpinionRequest.request(strapi, chai, {
      post: post.id,
      user: staffUser.id,
      type: createOpinionRequest.LIKE
    }, jwt);

    expect(res.body.errors.length).to.be.equal(1);
    expect(res.body.errors[0].message).to.be.equal('Policy Failed');

    const postQ = await strapi.query('api::post.post').findOne({where: {id: post.id}});
    expect(+postQ.likes).to.be.equal(0);
  });

  it('should create a new opinion (auth)', async () => {
    const jwt = generateJwt(strapi, staffUser);
    const post = await createPost(strapi, {author: staffUser.id});
    const resOpinion = await createOpinionRequest(strapi, chai, {
      post: post.id,
      user: staffUser.id,
      type: createOpinionRequest.LIKE
    }, jwt);

    expect(resOpinion).not.undefined;

    const opinion = await strapi.query('api::opinion.opinion').findOne({where: {id: +resOpinion.id}});
    const postUpdated = await getPostById(strapi, post.id);

    expect(opinion).not.null;
    expect(+postUpdated.likes).to.be.equal((+post.likes) + 1);
  });

  it('should not remove the opinion of other user (auth)', async () => {
    const jwt = generateJwt(strapi, authUser);
    const post = await createPost(strapi, {author: authUser.id});
    const opi = await strapi.query('api::opinion.opinion').create({
      data: {
        user: staffUser.id,
        post: post.id,
        type: createOpinionRequest.LIKE
      }
    });
    const res = await deleteOpinionRequest.request(strapi, chai, {id: post.id}, jwt);

    expect(res.body.errors.length).to.be.equal(1);
    expect(res.body.errors[0].message).to.be.equal('Policy Failed');

    const opinion = await strapi.query('api::opinion.opinion').findOne({where: {id: opi.id}});
    expect(opinion).not.null;
  });

  it('the user be able to remove one of his own opinions (auth)', async () => {
    const jwt = generateJwt(strapi, authUser);
    const post = await createPost(strapi, {author: staffUser.id});

    const res1 = await createOpinionRequest.request(strapi, chai, {
      post: post.id,
      user: authUser.id,
      type: createOpinionRequest.LIKE
    }, jwt);
    expect(res1.body.errors).to.be.undefined;

    const res2 = await deleteOpinionRequest.request(strapi, chai, {id: post.id}, jwt);
    expect(res2.body.errors).to.be.undefined;

    const postUpdated = await getPostById(strapi, post.id);
    const opinions = await strapi.query('api::opinion.opinion').findMany({where: {post: post.id, user: authUser.id}});

    expect(opinions.length).to.be.equal(0);
    expect(+postUpdated.likes).to.be.equal(0);
  });

  it('should not create more than one opinion by user in a post (staff)', async () => {
    const post = await createPost(strapi);
    const jwt = generateJwt(strapi, staffUser);
    const res1 = await createOpinionRequest.request(strapi, chai, {
      post: post.id,
      user: staffUser.id,
      type: createOpinionRequest.LIKE
    }, jwt);
    expect(res1.body.errors).to.be.undefined;

    const res2 = await createOpinionRequest.request(strapi, chai, {
      post: post.id,
      user: staffUser.id,
      type: createOpinionRequest.LIKE
    }, jwt);
    expect(res2.body.errors.length).to.be.equal(1);
    expect(res2.body.errors[0].message).to.be.equal('Policy Failed');

    const opinions = await strapi.query('api::opinion.opinion').count({where: {post: post.id, user: staffUser.id}});
    const postUpdated = await getPostById(strapi, post.id);

    expect(opinions).to.be.equal(1);
    expect(+postUpdated.likes).to.be.equal(1);
  });

  it('should not create a new opinion (public)', async () => {
    const post = await createPost(strapi, {author: authUser.id});
    const res = await new Promise(resolve => {
      chai.request(strapi.server.httpServer)
        .post('/graphql')
        .send({
          ...createOpinionRequest.MUTATION_CREATE_OPINION,
          variables: {post: post.id, user: authUser.id, type: createOpinionRequest.LIKE}
        })
        .end((err, res) => resolve(res));
    });
    expect(res.body.errors.length).to.be.equal(1);
    expect(res.body.errors[0].message).to.be.equal('Forbidden access');
  });
});
