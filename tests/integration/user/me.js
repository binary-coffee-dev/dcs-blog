const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const generateJwt = require('../../helpers/generate-jwt-by-user');
const meRequest = require('../../helpers/me-request');

chai.use(chaiHttp);

const expect = chai.expect;

describe('Get me user INTEGRATION', () => {

  after(async () => {
    await strapi.query('api::provider.provider').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
  });

  it('should get my user data', async () => {
    const provider = await strapi.query('api::provider.provider').create({data: {provider: 'github'}});
    let user = await createUser({strapi, provider});

    const jwt = generateJwt(strapi, user);
    const myData = await meRequest(strapi, chai, jwt);

    expect(+myData.id).to.be.equal(+user.id);
    expect(myData.username).to.be.equal(user.username);
    expect(myData.avatarUrl).to.be.equal(user.avatarUrl);
    expect(myData.role.type).to.be.equal(user.role.type);
  });
});
