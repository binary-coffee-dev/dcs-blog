const chai = require('chai');
const chaiHttp = require('chai-http');
const spies = require('chai-spies');

const meRequest = require('../../helpers/me-request');

chai.use(chaiHttp);
chai.use(spies);
const expect = chai.expect;


const MUTATION_LOGIN_WITH_PROVIDER = {
  operationName: null,
  // language=GraphQL
  query: 'mutation login($provider: String!, $code: String!){\n    loginWithProvider(provider: $provider, code: $code)\n}'
};

describe('Get me user INTEGRATION', () => {
  let provider;

  before(async () => {
    provider = strapi.service('plugin::users-permissions.extra').provider.github;
  });

  after(async () => {
    await strapi.query('plugin::users-permissions.user').deleteMany({});
    await strapi.query('api::provider.provider').deleteMany({});
    strapi.service('plugin::users-permissions.extra').provider.github = provider;
  });

  it('should login with provider', async () => {
    const EXAMPLE_CODE = 'asdfasdKJH(DSAFY(ADHF(ADF';

    // login for the fist time with privider (should create the user)
    let providerMock = getMockProvider();
    await loginWithProviderRequest(providerMock, EXAMPLE_CODE, 'username');

    const user = await strapi.query('plugin::users-permissions.user').findOne({where: {username: 'username'}});
    expect(user).not.undefined.and.not.null;

    // after the user was created the first time, the user should only get login
    providerMock = getMockProvider();
    await loginWithProviderRequest(providerMock, EXAMPLE_CODE, 'username');

    // should create a new user with username update given that exist an user with the same username
    await strapi.query('api::provider.provider').deleteMany({});
    providerMock = getMockProvider();
    await loginWithProviderRequest(providerMock, EXAMPLE_CODE, 'username2');

    const user2 = await strapi.query('plugin::users-permissions.user').findOne({where: {username: 'username2'}});
    expect(user2).not.undefined.and.not.null;
  });

  function getMockProvider() {
    return {
      auth: chai.spy(() => async () => {
        return {access_token: 'asdfasdfasdff34gdfgw4etysdfgew5rg654e5g6435', scope: 'read:user'};
      }),
      user: chai.spy(() => async () => {
        return {username: 'username', avatar: '', html_url: '', name: 'name'};
      })
    };
  }

  async function loginWithProviderRequest(providerMock, code, checkUsername) {
    strapi.service('plugin::users-permissions.extra').provider.github = providerMock;
    const res = await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/graphql')
      .send({...MUTATION_LOGIN_WITH_PROVIDER, variables: {provider: 'github', code}})
      .end((err, res) => err ? reject(err) : resolve(res)));
    expect(providerMock.auth).to.have.been.called();
    expect(providerMock.user).to.have.been.called();
    expect(res.body.data.loginWithProvider).not.undefined.and.not.null;

    const jwt = res.body.data.loginWithProvider;
    const me = await meRequest(strapi, chai, jwt);
    expect(me.username).to.be.equal(checkUsername);
    expect(me.role.type).to.be.equal('authenticated');
  }

});
