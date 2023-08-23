const chai = require('chai');
const chaiHttp = require('chai-http');
const spies = require('chai-spies');

chai.use(chaiHttp);
chai.use(spies);

const expect = chai.expect;

const SUBSCRIBE_MUTATION = {
  operationName: null,
  variables: {email: ''},
  // language=GraphQL
  query: 'mutation ($email: String!){\n    subscribe(email: $email) {\n        id\n    }\n}'
};

const UNSUBSCRIBE_MUTATION = {
  operationName: null,
  variables: {unsubscribeToken: ''},
  // language=GraphQL
  query: 'mutation ($unsubscribeToken: String!){\n    unsubscribe(unsubscribeToken: $unsubscribeToken) {\n        __typename\n    }\n}'
};

const SUBSCRIPTION_VALIDATION_MUTATION = {
  operationName: null,
  variables: {token: ''},
  // language=GraphQL
  query: 'mutation ($token: String!){\n    verify(token: $token) {\n        __typename\n    }\n}'
};

const EMAIL_EXAMPLE = 'testemail@test.com';

describe('Subscribe public use INTEGRATION', () => {

  let emailProvider;
  let emailProviderMock;

  before(async () => {
    emailProvider = strapi.plugins.email.provider;
  });

  beforeEach(async () => {
    emailProviderMock = {
      send: chai.spy(({to, subject}) => {
        expect(to).to.be.eq(EMAIL_EXAMPLE);
        expect(subject).to.be.eq('Binary Coffee subscription');
        return Promise.resolve();
      })
    };
    strapi.plugins.email.provider = emailProviderMock;
  });

  after(async () => {
    strapi.plugins.email.provider = emailProvider;
  });

  afterEach(async () => {
    await strapi.query('api::subscription.subscription').deleteMany({});
  });

  it('should subscribe a public user', async () => {
    await subscribeRequest(EMAIL_EXAMPLE);
  });

  it('should validate a subscription from link', async () => {
    await subscribeRequest(EMAIL_EXAMPLE);

    let subscriptions = await strapi.query('api::subscription.subscription').findMany({where: {email: EMAIL_EXAMPLE}});

    expect(subscriptions).to.not.be.null;
    expect(subscriptions).to.not.be.undefined;
    expect(subscriptions.length).to.be.eq(1);

    const res = await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/graphql').send({...SUBSCRIPTION_VALIDATION_MUTATION, variables: {token: subscriptions[0].token}})
      .end((err, res) => err ? reject(err) : resolve(res))
    );

    expect(res.body.errors).to.be.undefined;

    subscriptions = await strapi.query('api::subscription.subscription').findMany({where: {email: EMAIL_EXAMPLE}});

    expect(subscriptions[0].enable).to.be.true;
    expect(subscriptions[0].verified).to.be.true;
  });

  it('should not allow same email more than one time in the same day', async () => {
    await subscribeRequest(EMAIL_EXAMPLE);

    // should fail after two subscriptions with the same email
    await subscribeRequest(EMAIL_EXAMPLE, true);
  });

  it('should unsubscribe user', async () => {
    await subscribeRequest(EMAIL_EXAMPLE);

    let subscriptions = await strapi.query('api::subscription.subscription').findMany({where: {email: EMAIL_EXAMPLE}});

    expect(subscriptions[0].unsubscribeToken).to.not.be.null;
    expect(subscriptions[0].unsubscribeToken).to.not.be.undefined;

    const res = await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/graphql').send({
        ...UNSUBSCRIBE_MUTATION,
        variables: {unsubscribeToken: subscriptions[0].unsubscribeToken}
      })
      .end((err, res) => err ? reject(err) : resolve(res))
    );

    expect(res.body.errors).to.be.undefined;

    subscriptions = await strapi.query('api::subscription.subscription').findMany({where: {email: EMAIL_EXAMPLE}});

    expect(subscriptions[0].enable).to.be.true;
    expect(subscriptions[0].verified).to.be.false;
  });

  async function subscribeRequest(email, expectFail = false) {
    const res = await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/graphql').send({...SUBSCRIBE_MUTATION, variables: {email}})
      .end((err, res) => err ? reject(err) : resolve(res))
    );

    if (expectFail) {
      expect(res.body.errors).to.not.be.undefined;
    } else {
      expect(res.body.errors).to.be.undefined;
      expect(emailProviderMock.send).to.have.been.called();
    }

    return res;
  }

});
