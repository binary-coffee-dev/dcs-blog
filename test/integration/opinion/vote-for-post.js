const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const createPost = require('../../helpers/create-post');

chai.use(chaiHttp);

const expect = chai.expect;

const LIKE = 'like';
const MUTATION_CREATE_OPINION = {
  operationName: null,
  query: 'mutation ($post: ID, $user: ID, $type: String){\n  createOpinion(input: {data: {post: $post, user: $user, type: $type}}){\n    opinion {\n      id\n    }\n  }\n}'
};
const MUTATION_REMOVE_OPINION = {
  operationName: null,
  query: 'mutation ($id: ID!){\n  deleteOpinion(input: {where: {id: $id}}){\n    opinion {\n      id\n    }\n  }\n}'
};

describe('create/edit/remove opinion INTEGRATION', () => {
  let authUser;
  let staffUser;

  before(async () => {
    authUser = await createUser({strapi});
    staffUser = await createUser({strapi, roleType: 'staff'});
  });

  after(async () => {
    await strapi.models.post.deleteMany({});
    await strapi.plugins['users-permissions'].models.user.deleteMany({});
  });

  afterEach(async () => {
    await strapi.models.opinion.deleteMany({});
  });

  it('should not create a new opinion if the user is not the same of the opinion (auth)', async () => {
    const jwt = generateJwt(strapi, authUser);
    const post = await createPost(strapi, {author: authUser.id});
    const res = await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_CREATE_OPINION, variables: {post: post.id, user: staffUser.id, type: LIKE}})
        .end((err, res) => resolve(res));
    });

    expect(res.body.errors.length).to.be.equal(1);
  });

  it('should create a new opinion (auth)', async () => {
    const jwt = generateJwt(strapi, staffUser);
    const post = await createPost(strapi, {author: staffUser.id});
    const res = await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_CREATE_OPINION, variables: {post: post.id, user: staffUser.id, type: LIKE}})
        .end((err, res) => resolve(res));
    });

    const id = res.body.data.createOpinion.opinion.id;
    const opinion = await strapi.models.opinion.findOne({_id: id});

    expect(!!res.body.data.createOpinion.opinion).to.be.true;
    expect(!!opinion).to.be.true;
  });

  xit('should not remove the opinion of other user (auth)', async () => {
    const jwt = generateJwt(strapi, authUser);
    const post = await createPost(strapi, {author: authUser.id});
    const opi = await strapi.models.opinion.create({user: staffUser.id, post: post.id, type: LIKE});
    await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_REMOVE_OPINION, variables: {id: opi.id}})
        .end((err, res) => resolve(res));
    });

    const opinion = await strapi.models.opinion.findOne({_id: opi.id});

    expect(!!opinion).to.be.true;
  });

  it('should the user be able to remove one of his own opinions (auth)', async () => {
    const jwt = generateJwt(strapi, authUser);
    const post = await createPost(strapi, {author: staffUser.id});
    const opi = await strapi.models.opinion.create({user: authUser.id, post: post.id, type: LIKE});
    await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_REMOVE_OPINION, variables: {id: opi.id}})
        .end((err, res) => resolve(res));
    });

    const opinion = await strapi.models.opinion.findOne({_id: opi.id});

    expect(!!opinion).to.be.false;
  });

  it('should not create more than one opinion by user in a post (staff)', async () => {
    const post = await createPost(strapi);
    const jwt = generateJwt(strapi, staffUser);
    await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_CREATE_OPINION, variables: {post: post.id, user: staffUser.id, type: LIKE}})
        .end((err, res) => resolve(res));
    });
    await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_CREATE_OPINION, variables: {post: post.id, user: staffUser.id, type: LIKE}})
        .end((err, res) => resolve(res));
    });

    const opinions = await strapi.models.opinion.find({post: post.id, user: staffUser.id});

    expect(opinions.length).to.be.equal(1);
  });

  it('should not create a new opinion (public)', async () => {
    const post = await createPost(strapi, {author: authUser.id});
    const res = await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .send({...MUTATION_CREATE_OPINION, variables: {post: post.id, user: authUser.id, type: LIKE}})
        .end((err, res) => resolve(res));
    });
    expect(res.body.errors.length).to.be.equal(1);
    expect(res.body.errors[0].message).to.be.equal('Forbidden');
  });
});
