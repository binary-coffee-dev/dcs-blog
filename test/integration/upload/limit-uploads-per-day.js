const path = require('path');
const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const randomName = require('../../helpers/random-name');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const {createFile, removeFile} = require('../../helpers/fileUtils');

chai.use(chaiHttp);
const expect = chai.expect;

const FILEPATH = path.join(__dirname, 'tmp.png');

describe('Limit uploads per day INTEGRATION', () => {
  let user;
  let admin;
  let provider;

  before(async () => {
    user = await createUser({strapi});
    admin = await createUser({strapi, roleType: 'administrator'});
    removeFile(FILEPATH);
    createFile(FILEPATH);

    provider = strapi.plugins.upload.provider;
    strapi.plugins.upload.provider = {
      upload: (fileData) => {
        fileData.url = `/uploads/${randomName(20)}`;
        return Promise.resolve();
      },
      delete: () => Promise.resolve()
    };
  });

  after(async () => {
    removeFile(FILEPATH);
    strapi.plugins.upload.provider = provider;
    await strapi.query('image').delete({});
    await strapi.query('user', 'users-permissions').delete({});
    await strapi.query('file', 'upload').delete({});
  });

  it('should limit to 20 the upload files per day', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const image = await strapi.query('image').create({user: user.id});
    await strapi.connections.default.raw('UPDATE images SET created_at=? WHERE id=?;', [yesterday, image.id]);

    const jwt = generateJwt(strapi, user);
    for (let i = 0; i < strapi.config.custom.maxNumberOfUploadsPerDay; i++) {
      const res = await new Promise((resolve, reject) => chai.request(strapi.server)
        .post('/upload')
        .set('Authorization', `Bearer ${jwt}`)
        .set('Content-Type', 'image/png')
        .attach('files', FILEPATH, `image${i}.png`)
        .end((err, res) => err ? reject(err) : resolve(res)));
      expect(res.status).to.be.equal(200);
    }
    const res = await new Promise((resolve, reject) => chai.request(strapi.server)
      .post('/upload')
      .set('Authorization', `Bearer ${jwt}`)
      .set('Content-Type', 'image/png')
      .attach('files', FILEPATH, 'image6.png')
      .end((err, res) => err ? reject(err) : resolve(res)));
    expect(res.status).to.be.equal(403);
  });

  it('should not limit the uploads to the admins', async () => {
    const jwt = generateJwt(strapi, admin);
    for (let i = 0; i < strapi.config.custom.maxNumberOfUploadsPerDay + 10; i++) {
      const res = await new Promise((resolve, reject) => chai.request(strapi.server)
        .post('/upload')
        .set('Authorization', `Bearer ${jwt}`)
        .set('Content-Type', 'image/png')
        .attach('files', FILEPATH, `image${i}.png`)
        .end((err, res) => err ? reject(err) : resolve(res)));
      expect(res.status).to.be.equal(200);
    }
  });
});
