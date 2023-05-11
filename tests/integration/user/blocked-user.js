const path = require('path');
const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const createPost = require('../../helpers/create-post');
const updatePostRequest = require('../../helpers/update-post-request');
const createPostRequest = require('../../helpers/create-post-request');
const createCommentRequest = require('../../helpers/create-comment-request');
const updateCommentRequest = require('../../helpers/update-comment-request');
const createComment = require('../../helpers/create-comment');
const createOpinionRequest = require('../../helpers/create-opinion-request');
const deleteOpinionRequest = require('../../helpers/delete-opinion-request');
const uploadImageRequest = require('../../helpers/upload-image-request');
const {removeFile, createFile} = require('../../helpers/fileUtils');
const deleteImageRequest = require('../../helpers/delete-image-request');
const randomName = require('../../helpers/random-name');
const createFileDatabase = require('../../helpers/create-file');

chai.use(chaiHttp);

const expect = chai.expect;
const FILEPATH = path.join(__dirname, 'tmp.png');

describe('Blocked user INTEGRATION', () => {
  let blockedUser;
  let provider;

  before(async () => {
    const providerUser = await strapi.query('api::provider.provider').create({data: {provider: 'github'}});
    blockedUser = await createUser({strapi, provider: providerUser, data: {blocked: true}});

    removeFile(FILEPATH);
    createFile(FILEPATH);

    provider = strapi.plugins.upload.provider;
    strapi.plugins.upload.provider = {
      upload: (fileData) => {
        fileData.url = `/uploads/${randomName(20)}`;
        return Promise.resolve();
      },
      delete: () => Promise.resolve(),
      checkFileSize: () => Promise.resolve()
    };
  });

  after(async () => {
    removeFile(FILEPATH);
    strapi.plugins.upload.provider = provider;

    await strapi.query('plugin::users-permissions.user').deleteMany({});
    await strapi.query('plugin::upload.file').deleteMany({});
    await strapi.query('api::provider.provider').deleteMany({});
    await strapi.query('api::image.image').deleteMany({});
    await strapi.query('api::comment.comment').deleteMany({});
    await strapi.query('api::post.post').deleteMany({});
    await strapi.query('api::opinion.opinion').deleteMany({});
  });

  it('should not be able to create a post', async () => {
    const jwt = generateJwt(strapi, blockedUser);
    const post = await createPost(strapi, {author: blockedUser.id});

    const res = await updatePostRequest.request(strapi, chai, {id: post.id}, jwt);
    expect(res.body.error).not.null.and.not.undefined;
    expect(res.body.error.status).to.be.equal(401);
  });

  it('should not be able to update a post', async () => {
    const jwt = generateJwt(strapi, blockedUser);

    const res = await createPostRequest.request(strapi, chai, {author: blockedUser.id, publishedAt: null}, jwt);
    expect(res.body.error).not.null.and.not.undefined;
    expect(res.body.error.status).to.be.equal(401);
  });

  it('should not be able to create a comment', async () => {
    const jwt = generateJwt(strapi, blockedUser);
    const post = await createPost(strapi, {author: blockedUser.id});

    const res = await createCommentRequest.request(strapi, chai, {post: post.id}, jwt);
    expect(res.body.error).not.null.and.not.undefined;
    expect(res.body.error.status).to.be.equal(401);
  });

  it('should not be able to update a comment', async () => {
    const jwt = generateJwt(strapi, blockedUser);
    const post = await createPost(strapi, {author: blockedUser.id});
    const comment = await createComment(strapi, {user: blockedUser.id, post: post.id});

    const res = await updateCommentRequest.request(strapi, chai, {id: comment.id}, jwt);
    expect(res.body.error).not.null.and.not.undefined;
    expect(res.body.error.status).to.be.equal(401);
  });

  it('should not be able to create an opinion', async () => {
    const jwt = generateJwt(strapi, blockedUser);
    const post = await createPost(strapi, {author: blockedUser.id});

    const res = await createOpinionRequest.request(strapi, chai, {
      post: post.id,
      user: blockedUser.id,
      type: createOpinionRequest.LIKE
    }, jwt);
    expect(res.body.error).not.null.and.not.undefined;
    expect(res.body.error.status).to.be.equal(401);
  });

  it('should not be able to remove an opinion', async () => {
    const jwt = generateJwt(strapi, blockedUser);
    const post = await createPost(strapi, {author: blockedUser.id});

    const res = await deleteOpinionRequest.request(strapi, chai, {post: post.id}, jwt);
    expect(res.body.error).not.null.and.not.undefined;
    expect(res.body.error.status).to.be.equal(401);
  });

  it('should not be able to upload an image', async () => {
    const jwt = generateJwt(strapi, blockedUser);
    const FILEPATH = path.join(__dirname, 'tmp.png');

    const res = await uploadImageRequest(strapi, chai, {filePath: FILEPATH, fileName: 'image6.png'}, jwt);
    expect(res.body.error).not.null.and.not.undefined;
    expect(res.body.error.status).to.be.equal(401);
  });

  it('should not be able to remove an image', async () => {
    const jwt = generateJwt(strapi, blockedUser);
    const {file} = await createFileDatabase(strapi, blockedUser);

    const res = await deleteImageRequest.request(strapi, chai, {id: file.id}, jwt);
    expect(res.body.error).not.null.and.not.undefined;
    expect(res.body.error.status).to.be.equal(401);
  });
});
