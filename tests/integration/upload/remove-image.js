const path = require('path');
const chai = require('chai');
const chaiHttp = require('chai-http');
const spies = require('chai-spies');

const createUser = require('../../helpers/create-user');
const randomName = require('../../helpers/random-name');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const {createFile, removeFile} = require('../../helpers/fileUtils');
const deleteImageRequest = require('../../helpers/delete-image-request');

chai.use(chaiHttp);
chai.use(spies);
const expect = chai.expect;

const FILEPATH = path.join(__dirname, 'tmp2.png');

describe('Remove images INTEGRATION', () => {
  let user;
  let provider;
  let mockProvider;

  before(async () => {
    user = await createUser({strapi});

    removeFile(FILEPATH);
    createFile(FILEPATH);

    provider = strapi.plugins.upload.provider;
  });

  beforeEach(() => {
    mockProvider = {
      upload: chai.spy((fileData) => {
        fileData.url = `/uploads/${randomName(20)}`;
        return Promise.resolve();
      }),
      delete: chai.spy(() => {
        Promise.resolve();
      }),
      checkFileSize: () => Promise.resolve()
    };
    strapi.plugins.upload.provider = mockProvider;
  });

  after(async () => {
    removeFile(FILEPATH);
    strapi.plugins.upload.provider = provider;
    await strapi.query('api::image.image').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
    await strapi.query('plugin::upload.file').deleteMany({});
  });

  it('should allow the user to remove his image (auth)', async () => {
    const jwt = generateJwt(strapi, user);

    const res = await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/api/upload')
      .set('Authorization', `Bearer ${jwt}`)
      .set('Content-Type', 'image/png')
      .attach('files', FILEPATH, 'image6.png')
      .end((err, res) => err ? reject(err) : resolve(res)));
    expect(res.status).to.be.equal(200);
    expect(mockProvider.upload).to.have.been.called();
    let fileUpload = await strapi.query('plugin::upload.file').findOne({
      where: {id: res.body[0].id},
      populate: ['related']
    });
    expect(fileUpload).not.null;
    let img = await strapi.query('api::image.image').findOne({where: {id: fileUpload.related[0].id}});
    expect(img).not.null;

    await deleteImageRequest(strapi, chai, {id: res.body[0].id}, jwt);
    expect(mockProvider.delete).to.have.been.called();
    img = await strapi.query('api::image.image').findOne({where: {id: img.id}});
    expect(img).to.be.null;
  });

  it('should not allow the user to remove other user image', async () => {
    const user2 = await createUser({strapi});
    const jwt2 = generateJwt(strapi, user2);
    const jwt = generateJwt(strapi, user);

    // upload file
    const res = await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/api/upload')
      .set('Authorization', `Bearer ${jwt2}`)
      .set('Content-Type', 'image/png')
      .attach('files', FILEPATH, 'image6.png')
      .end((err, res) => err ? reject(err) : resolve(res)));
    expect(res.status).to.be.equal(200);
    expect(mockProvider.upload).to.have.been.called();
    let fileUpload = await strapi.query('plugin::upload.file').findOne({
      where: {id: res.body[0].id},
      populate: ['related']
    });
    expect(fileUpload).not.null;
    let img = await strapi.query('api::image.image').findOne({where: {id: fileUpload.related[0].id}});
    expect(img).not.null;

    // remove file
    await deleteImageRequest(strapi, chai, {id: res.body[0].id}, jwt);
    expect(mockProvider.delete).to.not.have.been.called.once;
    img = await strapi.query('api::image.image').findOne({where: {id: img.id}});
    expect(img).not.null;
  });

  it('should not allow the staff to remove other user image', async () => {
    const user2 = await createUser({strapi, roleType: 'staff'});
    const jwt2 = generateJwt(strapi, user2);
    const jwt = generateJwt(strapi, user);

    const res = await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/api/upload')
      .set('Authorization', `Bearer ${jwt2}`)
      .set('Content-Type', 'image/png')
      .attach('files', FILEPATH, 'image6.png')
      .end((err, res) => err ? reject(err) : resolve(res)));
    expect(res.status).to.be.equal(200);
    expect(mockProvider.upload).to.have.been.called();
    let fileUpload = await strapi.query('plugin::upload.file').findOne({
      where: {id: res.body[0].id},
      populate: ['related']
    });
    expect(fileUpload).not.null;
    let img = await strapi.query('api::image.image').findOne({where: {id: fileUpload.related[0].id}});
    expect(img).not.null;

    await deleteImageRequest(strapi, chai, {id: res.body[0].id}, jwt);
    expect(mockProvider.delete).to.not.have.been.called.once;
    img = await strapi.query('api::image.image').findOne({where: {id: img.id}});
    expect(!!img).to.be.true;
  });

  it('should not allow the admin to remove other user image', async () => {
    const admin = await createUser({strapi, roleType: 'administrator'});
    const jwt2 = generateJwt(strapi, user);
    const jwt = generateJwt(strapi, admin);

    const res = await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/api/upload')
      .set('Authorization', `Bearer ${jwt2}`)
      .set('Content-Type', 'image/png')
      .attach('files', FILEPATH, 'image6.png')
      .end((err, res) => err ? reject(err) : resolve(res)));
    expect(res.status).to.be.equal(200);
    expect(mockProvider.upload).to.have.been.called();
    let fileUpload = await strapi.query('plugin::upload.file').findOne({
      where: {id: res.body[0].id},
      populate: ['related']
    });
    expect(fileUpload).not.null;
    let img = await strapi.query('api::image.image').findOne({where: {id: fileUpload.related[0].id}});
    expect(img).not.null;

    await deleteImageRequest(strapi, chai, {id: res.body[0].id}, jwt);
    expect(mockProvider.delete).to.have.been.called.once;
    img = await strapi.query('api::image.image').findOne({where: {id: img.id}});
    expect(!!img).to.be.false;
  });
});
