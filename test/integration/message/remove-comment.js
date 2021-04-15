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
  query: 'query ($postId: ID){\n  commentsConnection(\n    sort: "publishedAt:desc"\n    limit: 100\n    start: 0\n    where: {post: $postId}\n  ){\n    values {\n      id\n      body\n      publishedAt\n      name\n      user {\n        username\n        avatarUrl\n        role { name }\n      }\n    }\n    aggregate {\n      count\n    }\n  }\n}'
}

const MUTATION_REMOVE_COMMENT = {
  operationName: null,
  // language=GraphQL
  query: 'mutation ($id: ID!){\n  deleteComment(input: {where: {id: $id}}){\n    comment {\n      id\n    }\n  }\n}'
}

const MUTATION_CREATE_COMMENT = {
  operationName: null,
  // language=GraphQL
  query: 'mutation create(\n  $body: String\n  $post: ID\n) {\n  createComment(input: {data: {body: $body, post: $post}}){\n    comment {\n      id\n      body\n      publishedAt\n      name\n      user {\n        username\n        avatar {\n          url\n        }\n      }\n    }\n  }\n}'
};

describe('Remove comments INTEGRATION', () => {
  let user;
  let post;

  before(async () => {
    user = await createUser({strapi});
    post = await createPost(strapi, {author: user});
  });

  it('should not return the removed comments', async () => {
    const comments = [];
    for (let i = 0; i < 20; i++) {
      const comment = await createComment(strapi, {user, post});
      comments.push(comment);
    }
    const jwt = generateJwt(strapi, user);
    const res = await new Promise((resolve, reject) => chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...QUERY_COMMENTS_BY_POST, variables: {postId: post.id}})
      .end((err, res) => err ? reject(err) : resolve(res)));
    expect(res.body.data.commentsConnection.values.length).to.be.equal(20);
  });

  it('should remove a comment from the owner', async () => {
    let comment = await createComment(strapi, {user, post});
    const jwt = generateJwt(strapi, user);

    await new Promise((resolve, reject) => chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...MUTATION_REMOVE_COMMENT, variables: {id: comment.id}})
      .end((err, res) => err ? reject(err) : resolve(res)));

    comment = await strapi.models.comment.findOne({_id: comment.id});
    expect(!!comment).to.be.false;
  });

  it('should not remove a comment from a user that is not the owner', async () => {
    const user2 = await createUser({strapi});
    let comment = await createComment(strapi, {user, post});
    const jwt = generateJwt(strapi, user2);

    await new Promise((resolve, reject) => chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...MUTATION_REMOVE_COMMENT, variables: {id: comment.id}})
      .end((err, res) => err ? reject(err) : resolve(res)));

    comment = await strapi.models.comment.findOne({_id: comment.id});
    expect(!!comment).to.be.true;
  });

  it('should remove a comment from an admin', async () => {
    const user2 = await createUser({strapi, roleType: 'administrator'});
    let post2 = await createPost(strapi, {user})
    const jwt = generateJwt(strapi, user2);

    const res = await new Promise((resolve, reject) => chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...MUTATION_CREATE_COMMENT, variables: {body: randomName(), post: post2.id}})
      .end((err, res) => err ? reject(err) : resolve(res)));
    post2 = await strapi.models.post.findOne({_id: post2.id});
    expect(post2.comments.toNumber()).to.be.equal(1);

    let comment = res.body.data.createComment.comment;

    await new Promise((resolve, reject) => chai.request(strapi.server)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({...MUTATION_REMOVE_COMMENT, variables: {id: comment.id}})
      .end((err, res) => err ? reject(err) : resolve(res)));

    comment = await strapi.models.comment.findOne({_id: comment.id});
    expect(!!comment).to.be.false;

    post2 = await strapi.models.post.findOne({_id: post2.id});
    expect(post2.comments.toNumber()).to.be.equal(0);
  });
});
