const path = require('path');
const chai = require('chai');
const chaiHttp = require('chai-http');
const spies = require('chai-spies');

const createUser = require('../../helpers/create-user');
const randomName = require('../../helpers/random-name');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const {createFile, removeFile} = require('../../helpers/fileUtils');

chai.use(chaiHttp);
chai.use(spies);
const expect = chai.expect;

const FILEPATH = path.join(__dirname, 'tmp2.png');

const MUTATION_REMOVE_FILE = {
  operationName: null,
  // language=GraphQL
  query: 'mutation ($id: ID!){\n  deleteFile(input: {where: {id: $id}}){\n    file {\n      id\n    }\n  }\n}'
};

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
      delete: chai.spy(() => Promise.resolve())
    };
    strapi.plugins.upload.provider = mockProvider;
  });

  after(async () => {
    removeFile(FILEPATH);
    strapi.plugins.upload.provider = provider;
    await strapi.query('image').delete({});
    await strapi.query('user', 'users-permissions').delete({});
    await strapi.query('file', 'upload').delete({});
  });

  it('should allow the user to remove his image', async () => {
    const jwt = generateJwt(strapi, user);

    const res = await new Promise((resolve, reject) => chai.request(strapi.server)
      .post('/upload')
      .set('Authorization', `Bearer ${jwt}`)
      .set('Content-Type', 'image/png')
      .attach('files', FILEPATH, 'image6.png')
      .end((err, res) => err ? reject(err) : resolve(res)));
    expect(res.status).to.be.equal(200);
    expect(mockProvider.upload).to.have.been.called();
    let fileUpload = await strapi.query('file', 'upload').findOne({id: res.body[0].id});
    expect(fileUpload).not.null;
    let img = await strapi.query('image').findOne({id: fileUpload.related[0].id});
    expect(img).not.null;

    await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_REMOVE_FILE, variables: {id: res.body[0].id}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(mockProvider.delete).to.have.been.called();
    img = await strapi.query('image').findOne({id: img.id});
    expect(img).to.be.null;
  });

  it('should not allow the user to remove other user image', async () => {
    const user2 = await createUser({strapi});
    const jwt2 = generateJwt(strapi, user2);
    const jwt = generateJwt(strapi, user);

    // upload file
    const res = await new Promise((resolve, reject) => chai.request(strapi.server)
      .post('/upload')
      .set('Authorization', `Bearer ${jwt2}`)
      .set('Content-Type', 'image/png')
      .attach('files', FILEPATH, 'image6.png')
      .end((err, res) => err ? reject(err) : resolve(res)));
    expect(res.status).to.be.equal(200);
    expect(mockProvider.upload).to.have.been.called();
    let fileUpload = await strapi.query('file', 'upload').findOne({id: res.body[0].id});
    expect(fileUpload).not.null;
    let img = await strapi.query('image').findOne({id: fileUpload.related[0].id});
    expect(img).not.null;

    // remove file
    await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_REMOVE_FILE, variables: {id: res.body[0].id}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(mockProvider.delete).to.not.have.been.called.once;
    img = await strapi.query('image').findOne({id: img.id});
    expect(img).not.null;
  });

  it('should not allow the staff to remove other user image', async () => {
    const user2 = await createUser({strapi, roleType: 'staff'});
    const jwt2 = generateJwt(strapi, user2);
    const jwt = generateJwt(strapi, user);

    const res = await new Promise((resolve, reject) => chai.request(strapi.server)
      .post('/upload')
      .set('Authorization', `Bearer ${jwt2}`)
      .set('Content-Type', 'image/png')
      .attach('files', FILEPATH, 'image6.png')
      .end((err, res) => err ? reject(err) : resolve(res)));
    expect(res.status).to.be.equal(200);
    expect(mockProvider.upload).to.have.been.called();
    let fileUpload = await strapi.query('file', 'upload').findOne({id: res.body[0].id});
    expect(fileUpload).not.null;
    let img = await strapi.query('image').findOne({id: fileUpload.related[0].id});
    expect(img).not.null;

    await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_REMOVE_FILE, variables: {id: res.body[0].id}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(mockProvider.delete).to.not.have.been.called.once;
    img = await strapi.query('image').findOne({id: img.id});
    expect(!!img).to.be.true;
  });

  it('should not allow the admin to remove other user image', async () => {
    const admin = await createUser({strapi, roleType: 'administrator'});
    const jwt2 = generateJwt(strapi, user);
    const jwt = generateJwt(strapi, admin);

    const res = await new Promise((resolve, reject) => chai.request(strapi.server)
      .post('/upload')
      .set('Authorization', `Bearer ${jwt2}`)
      .set('Content-Type', 'image/png')
      .attach('files', FILEPATH, 'image6.png')
      .end((err, res) => err ? reject(err) : resolve(res)));
    expect(res.status).to.be.equal(200);
    expect(mockProvider.upload).to.have.been.called();
    let fileUpload = await strapi.query('file', 'upload').findOne({id: res.body[0].id});
    expect(fileUpload).not.null;
    let img = await strapi.query('image').findOne({id: fileUpload.related[0].id});
    expect(img).not.null;

    await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .post('/graphql')
        .set('Authorization', `Bearer ${jwt}`)
        .send({...MUTATION_REMOVE_FILE, variables: {id: res.body[0].id}})
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(mockProvider.delete).to.have.been.called.once;
    img = await strapi.query('image').findOne({id: img.id});
    expect(!!img).to.be.false;
  });
});
