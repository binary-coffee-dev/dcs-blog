const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const createPost = require('../../helpers/create-post');
const getPostById = require('../../helpers/get-post-by-id');

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
    await strapi.query('post').delete({});
    await strapi.query('user', 'users-permissions').delete({});
  });

  afterEach(async () => {
    await strapi.query('opinion').delete({});
  });

  it('should not create a new opinion if the user is not the same of the opinion (auth)', async () => {
    const jwt = generateJwt(strapi, authUser);
    const post = await createPost(strapi, {author: authUser.id});
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_CREATE_OPINION, variables: {post: post.id, user: staffUser.id, type: LIKE}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    expect(res.body.errors.length).to.be.equal(1);
  });

  it('should create a new opinion (auth)', async () => {
    const jwt = generateJwt(strapi, staffUser);
    const post = await createPost(strapi, {author: staffUser.id});
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_CREATE_OPINION, variables: {post: post.id, user: staffUser.id, type: LIKE}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    const id = res.body.data.createOpinion.opinion.id;
    const opinion = await strapi.query('opinion').findOne({id});
    const postUpdated = await getPostById(strapi, post.id);

    expect(!!res.body.data.createOpinion.opinion).to.be.true;
    expect(!!opinion).to.be.true;
    expect(+postUpdated.likes).to.be.equal((+post.likes) + 1);
  });

  it('should not remove the opinion of other user (auth)', async () => {
    const jwt = generateJwt(strapi, authUser);
    const post = await createPost(strapi, {author: authUser.id});
    const opi = await strapi.query('opinion').create({user: staffUser.id, post: post.id, type: LIKE});
    await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_REMOVE_OPINION, variables: {id: post.id}})
        .end((err, res) => resolve(res));
    });

    const opinion = await strapi.query('opinion').findOne({id: opi.id});

    expect(opinion).not.null;
  });

  it('the user be able to remove one of his own opinions (auth)', async () => {
    const jwt = generateJwt(strapi, authUser);
    const post = await createPost(strapi, {author: staffUser.id});

    await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_CREATE_OPINION, variables: {post: post.id, user: authUser.id, type: LIKE}})
        .end((err, res) => resolve(res));
    });
    await new Promise(resolve => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_REMOVE_OPINION, variables: {id: post.id}})
        .end((err, res) => resolve(res));
    });

    const postUpdated = await getPostById(strapi, post.id);
    const opinions = await strapi.query('opinion').find({post: post.id, user: authUser.id});

    expect(opinions.length).to.be.equal(0);
    expect(+postUpdated.likes).to.be.equal(0);
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

    const opinions = await strapi.query('opinion').find({post: post.id, user: staffUser.id});
    const postUpdated = await getPostById(strapi, post.id);

    expect(opinions.length).to.be.equal(1);
    expect(+postUpdated.likes).to.be.equal(1);
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
