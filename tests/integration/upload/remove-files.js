const chai = require('chai');
const chaiHttp = require('chai-http');
const spies = require('chai-spies');

const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const createFile = require('../../helpers/create-file');
const randomName = require("../../helpers/random-name");

chai.use(chaiHttp);
chai.use(spies);
const expect = chai.expect;

describe('Remove file/images INTEGRATION', () => {
  let authUser;
  let staffUser;
  let adminUser;
  let provider;
  let mockProvider;

  before(async () => {
    authUser = await createUser({strapi});
    staffUser = await createUser({strapi, roleType: 'staff'});
    adminUser = await createUser({strapi, roleType: 'administrator'});

    // mock upload provider functions
    provider = strapi.plugins.upload.provider;
  });

  beforeEach(() => {
    mockProvider = {
      delete: chai.spy(() => Promise.resolve())
    };
    strapi.plugins.upload.provider = mockProvider;
  });

  after(async () => {
    strapi.plugins.upload.provider = provider;
    await strapi.query('api::image.image').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
    await strapi.query('plugin::upload.file').deleteMany({});
  });

  it('should remove the file (admin)', async () => {
    const jwt = generateJwt(strapi, adminUser);

    const {file, image} = await createFile(strapi, adminUser);

    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server.httpServer)
        .delete(`/api/upload/files/${file.id}`)
        .set('Authorization', `Bearer ${jwt}`)
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    expect(res.status).to.be.equal(200);
    expect(mockProvider.delete).to.have.been.called();
    const tfile = await strapi.query('plugin::upload.file').findOne({id: file.id});
    const timage = await strapi.query('api::image.image').findOne({id: image.id});

    expect(tfile).to.be.null;
    expect(timage).to.be.null;
  });

  it('should remove the file (staff)', async () => {
    const jwt = generateJwt(strapi, staffUser);

    const {file, image} = await createFile(strapi, staffUser);

    const res = await new Promise(resolve => {
      chai.request(strapi.server.httpServer)
        .delete(`/api/upload/files/${file.id}`)
        .set('Authorization', `Bearer ${jwt}`)
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    expect(res.status).to.be.equal(200);
    expect(mockProvider.delete).to.have.been.called();
    const tfile = await strapi.query('plugin::upload.file').findOne({id: file.id});
    const timage = await strapi.query('api::image.image').findOne({id: image.id});

    expect(tfile).to.be.null;
    expect(timage).to.be.null;
  });

  it('should remove the file (auth)', async () => {
    const jwt = generateJwt(strapi, authUser);

    const {file, image} = await createFile(strapi, authUser);

    const res = await new Promise(resolve => {
      chai.request(strapi.server.httpServer)
        .delete(`/api/upload/files/${file.id}`)
        .set('Authorization', `Bearer ${jwt}`)
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    expect(res.status).to.be.equal(200);
    expect(mockProvider.delete).to.have.been.called();
    const tfile = await strapi.query('plugin::upload.file').findOne({id: file.id});
    const timage = await strapi.query('api::image.image').findOne({id: image.id});

    expect(tfile).to.be.null;
    expect(timage).to.be.null;
  });

  it('should not be able to remove the file (auth)', async () => {
    const jwt = generateJwt(strapi, authUser);

    const {file, image} = await createFile(strapi, staffUser);

    const res = await new Promise(resolve => {
      chai.request(strapi.server.httpServer)
        .delete(`/api/upload/files/${file.id}`)
        .set('Authorization', `Bearer ${jwt}`)
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    expect(res).to.have.status(403);
    expect(mockProvider.delete).to.have.been.not.called();
    const tfile = await strapi.query('plugin::upload.file').findOne({id: file.id});
    const timage = await strapi.query('api::image.image').findOne({id: image.id});

    expect(tfile).not.null;
    expect(timage).not.null;
  });

  it('should not be able to remove the file (public)', async () => {
    const {file, image} = await createFile(strapi, authUser);

    const res = await new Promise(resolve => {
      chai.request(strapi.server.httpServer)
        .delete(`/api/upload/files/${file.id}`)
        .end((err, res) => err ? reject(err) : resolve(res));
    });

    expect(res).to.have.status(500);
    expect(mockProvider.delete).to.have.been.not.called();
    const tfile = await strapi.query('plugin::upload.file').findOne({id: file.id});
    const timage = await strapi.query('api::image.image').findOne({id: image.id});

    expect(tfile).not.null;
    expect(timage).not.null;
  });
});
