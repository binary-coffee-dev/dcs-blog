const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../helpers/create-user');
const deleteUser = require('../helpers/delete-user');
const generateJwt = require('../helpers/generate-jwt-by-user');
const createFile = require('../helpers/create-file');

chai.use(chaiHttp);

const expect = chai.expect;

describe('Remove file/images INTEGRATION', () => {
  const files = [];
  const images = [];

  let authUser;
  let staffUser;
  let adminUser;

  before(async () => {
    authUser = await createUser({strapi});
    staffUser = await createUser({strapi, roleType: 'staff'});
    adminUser = await createUser({strapi, roleType: 'administrator'});

    // mock upload provider functions
    strapi.plugins.upload.provider.delete = () => {};
  });

  after(async () => {
    for (let file of files) {
      await strapi.plugins.upload.models.file.deleteOne({_id: file.id});
    }
    for (let image of images) {
      await strapi.models.image.deleteOne({_id: image.id});
    }

    await deleteUser(strapi, authUser);
    await deleteUser(strapi, staffUser);
    await deleteUser(strapi, adminUser);
  });

  it('should remove the file (admin)', async () => {
    const jwt = generateJwt(strapi, adminUser);

    const {file, image} = await createFile(strapi, adminUser);

    await new Promise(resolve => {
      chai.request(strapi.server)
        .delete(`/upload/files/${file.id}`)
        .set('Authorization', `Bearer ${jwt}`)
        .end((err, res) => {
          resolve(res);
        });
    });

    const tfile = await strapi.plugins.upload.models.file.findOne({_id: file.id});
    const timage = await strapi.services.image.findOne({_id: image.id});

    expect(!!tfile).to.be.false;
    expect(!!timage).to.be.false;
  });

  it('should remove the file (staff)', async () => {
    const jwt = generateJwt(strapi, staffUser);

    const {file, image} = await createFile(strapi, staffUser);

    await new Promise(resolve => {
      chai.request(strapi.server)
        .delete(`/upload/files/${file.id}`)
        .set('Authorization', `Bearer ${jwt}`)
        .end((err, res) => {
          resolve(res);
        });
    });

    const tfile = await strapi.plugins.upload.models.file.findOne({_id: file.id});
    const timage = await strapi.services.image.findOne({_id: image.id});

    expect(!!tfile).to.be.false;
    expect(!!timage).to.be.false;
  });

  it('should remove the file (auth)', async () => {
    const jwt = generateJwt(strapi, authUser);

    const {file, image} = await createFile(strapi, authUser);

    await new Promise(resolve => {
      chai.request(strapi.server)
        .delete(`/upload/files/${file.id}`)
        .set('Authorization', `Bearer ${jwt}`)
        .end((err, res) => {
          resolve(res);
        });
    });

    const tfile = await strapi.plugins.upload.models.file.findOne({_id: file.id});
    const timage = await strapi.services.image.findOne({_id: image.id});

    expect(!!tfile).to.be.false;
    expect(!!timage).to.be.false;
  });

  it('should not be able to remove the file (public)', async () => {
    const jwt = generateJwt(strapi, authUser);

    const {file, image} = await createFile(strapi, staffUser);
    files.push(file);
    images.push(image);

    const res = await new Promise(resolve => {
      chai.request(strapi.server)
        .delete(`/upload/files/${file.id}`)
        .set('Authorization', `Bearer ${jwt}`)
        .end((err, res) => {
          resolve(res);
        });
    });

    const tfile = await strapi.plugins.upload.models.file.findOne({_id: file.id});
    const timage = await strapi.services.image.findOne({_id: image.id});

    expect(res).to.have.status(500);
    expect(!!tfile).to.be.true;
    expect(!!timage).to.be.true;
  });

  it('should not be able to remove the file (auth)', async () => {
    const {file, image} = await createFile(strapi, authUser);
    files.push(file);
    images.push(image);

    const res = await new Promise(resolve => {
      chai.request(strapi.server)
        .delete(`/upload/files/${file.id}`)
        .end((err, res) => {
          resolve(res);
        });
    });

    const tfile = await strapi.plugins.upload.models.file.findOne({_id: file.id});
    const timage = await strapi.services.image.findOne({_id: image.id});

    expect(res).to.have.status(403);
    expect(!!tfile).to.be.true;
    expect(!!timage).to.be.true;
  });
});
