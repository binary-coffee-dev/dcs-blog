const chai = require('chai');
const chaiHttp = require('chai-http');

const randomName = require('../../helpers/random-name');
const createUser = require('../../helpers/create-user');
const createPost = require('../../helpers/create-post');
const createComment = require('../../helpers/create-comment');
const generateJwt = require('../../helpers/generate-jwt-by-user');

chai.use(chaiHttp);
const expect = chai.expect;

const QUERY_COMMENTS_BY_POST = {
  operationName: null,
  // language=GraphQL
  query: 'query ($postId: ID){\n    comments(\n        sort: "createdAt:desc"\n        pagination: { limit: 100, start: 0 }\n        filters: { post: { id: {eq: $postId} } }\n    ) {\n        data {\n            id\n            attributes {\n                body\n                name\n                user {\n                    data {\n                        id\n                        attributes {\n                            username\n                            avatarUrl\n                            role {\n                                data {\n                                    attributes {\n                                        name\n                                    }\n                                }\n                            }\n                        }\n                    }\n                }\n            }\n        }\n    }\n}'
};

const MUTATION_REMOVE_COMMENT = {
  operationName: null,
  // language=GraphQL
  query: 'mutation ($id: ID!){\n    deleteComment(id: $id){\n        data {\n            id\n        }\n    }\n}'
};

const MUTATION_CREATE_COMMENT = {
  operationName: null,
  // language=GraphQL
  query: 'mutation create($body: String, $post: ID) {\n    createComment(data: {body: $body, post: $post}){\n        data {\n            id\n            attributes {\n                body\n                email\n                name\n                user {\n                    data {\n                        id\n                        attributes {\n                            username\n                        }\n                    }\n                }\n            }\n        }\n    }\n}'
};

describe('Remove comments INTEGRATION', () => {
  let user;

  before(async () => {
    user = await createUser({strapi});
  });

  after(async () => {
    await strapi.query('api::post.post').deleteMany({});
    await strapi.query('api::comment.comment').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
  });

  it('should return the list of comments', async () => {
    const post = await createPost(strapi, {author: user});
    for (let i = 0; i < 20; i++) {
      await createComment(strapi, {user, post});
    }
    const jwt = generateJwt(strapi, user);
    const res = await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...QUERY_COMMENTS_BY_POST, variables: {postId: post.id}})
      .end((err, res) => err ? reject(err) : resolve(res)));
    expect(res.body.data.comments.data.length).to.be.equal(20);
  });

  it('should remove a comment from the owner', async () => {
    const post = await createPost(strapi, {author: user});
    let comment = await createComment(strapi, {user, post});
    const jwt = generateJwt(strapi, user);

    comment = await strapi.query('api::comment.comment').findOne({where: {id: comment.id}});
    expect(comment).not.be.undefined.and.not.be.null;

    await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...MUTATION_REMOVE_COMMENT, variables: {id: comment.id}})
      .end((err, res) => err ? reject(err) : resolve(res)));

    comment = await strapi.query('api::comment.comment').findOne({where: {id: comment.id}});
    expect(comment).to.be.null;
  });

  it('should not remove a comment from a user that is not the owner', async () => {
    const post = await createPost(strapi, {author: user});
    const user2 = await createUser({strapi});
    let comment = await createComment(strapi, {user, post});
    const jwt = generateJwt(strapi, user2);

    await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...MUTATION_REMOVE_COMMENT, variables: {id: comment.id}})
      .end((err, res) => err ? reject(err) : resolve(res)));

    comment = await strapi.query('api::comment.comment').findOne({id: comment.id});
    expect(comment).not.be.undefined.and.not.be.null;
  });

  it('should remove a comment from an admin', async () => {
    const user2 = await createUser({strapi, roleType: 'administrator'});
    let post2 = await createPost(strapi, {user});
    const jwt = generateJwt(strapi, user2);

    const res = await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...MUTATION_CREATE_COMMENT, variables: {body: randomName(), post: post2.id}})
      .end((err, res) => err ? reject(err) : resolve(res)));
    post2 = await strapi.query('api::post.post').findOne({where: {id: post2.id}});
    expect(+post2.comments).to.be.equal(1);

    let comment = res.body.data.createComment.data;

    await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...MUTATION_REMOVE_COMMENT, variables: {id: comment.id}})
      .end((err, res) => err ? reject(err) : resolve(res)));

    comment = await strapi.query('api::comment.comment').findOne({where: {id: comment.id}});
    expect(comment).to.be.null;

    post2 = await strapi.query('api::post.post').findOne({where: {id: post2.id}});
    expect(+post2.comments).to.be.equal(0);
  });
});
