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
  query: 'mutation ($email: String!){\n    subscribe(email: $email) {\n        verified\n    }\n}'
};

const UNSUBSCRIBE_MUTATION = {
  operationName: null,
  variables: {unsubscribeToken: ''},
  // language=GraphQL
  query: 'mutation ($unsubscribeToken: String!){\n    unsubscribe(unsubscribeToken: $unsubscribeToken) {\n        verified\n    }\n}'
};

const SUBSCRIPTION_VALIDATION_MUTATION = {
  operationName: null,
  variables: {token: ''},
  // language=GraphQL
  query: 'mutation ($token: String!){\n    verify(token: $token) {\n        verified\n    }\n}'
};

const EMAIL_EXAMPLE = 'testemail@test.com';

describe('Subscribe public use INTEGRATION', () => {

  let emailProvider;

  before(async () => {
    emailProvider = strapi.plugins.email.provider;
  });

  after(async () => {
    strapi.plugins.email.provider = emailProvider;
  });

  afterEach(async () => {
    await strapi.query('api::subscription.subscription').deleteMany({});
  });

  it('should subscribe a public user', async () => {
    const res = await subscribeRequest(EMAIL_EXAMPLE);

    expect(res.body.data.subscribe.verified).to.be.false;
  });

  it('should fail to subscribe with invalid email', async () => {
    const invalidEmails = [
      'not_valid_email', 'not valid email', 'string', '  ', 'a d', '', 'plainaddress,', '#@%^%#$@#$@#.com',
      '@example.com', 'Joe Smith <email@example.com>', 'email.example.com', 'email@example@example.com',
      '.email@example.com', 'email.@example.com', 'email..email@example.com', 'this\ is"really"not\allowed@example.com',
      'email@example.com (Joe Smith)', 'email@example', 'email@111.222.333.44444', 'email@example..com',
      'Abc..123@example.com', '”(),:;<>[\]@example.com',
    ];

    for (const invalidEmail of invalidEmails) {
      await subscribeRequest(invalidEmail, true);
      const res = await strapi.query('api::subscription.subscription').findMany({where: {email: invalidEmail}});
      expect(res.length).to.be.eq(0);
    }
  });

  it('should validate a subscription from link', async () => {
    const res = await subscribeRequest(EMAIL_EXAMPLE);

    expect(res.body.data.subscribe.verified).to.be.false;

    let subscriptions = await strapi.query('api::subscription.subscription').findMany({where: {email: EMAIL_EXAMPLE}});

    expect(subscriptions).to.not.be.null;
    expect(subscriptions).to.not.be.undefined;
    expect(subscriptions.length).to.be.eq(1);

    const res2 = await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/graphql').send({...SUBSCRIPTION_VALIDATION_MUTATION, variables: {token: subscriptions[0].token}})
      .end((err, res) => err ? reject(err) : resolve(res))
    );

    expect(res2.body.errors).to.be.undefined;

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

  async function subscribeRequest(email, expectedFail = false) {
    strapi.plugins.email.provider = {
      send: chai.spy(async ({to, subject, html}) => {
        expect(to).to.be.eq(email);
        expect(subject).to.be.eq('Binary Coffee subscription');

        const {token} = await strapi.query('api::subscription.subscription').findOne({where: {email}});
        expect(html.indexOf(token)).to.not.eq(-1);
      })
    };

    const res = await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/graphql').send({...SUBSCRIBE_MUTATION, variables: {email}})
      .end((err, res) => err ? reject(err) : resolve(res))
    );

    if (expectedFail) {
      expect(res.body.errors).to.not.be.undefined;
      expect(strapi.plugins.email.provider.send).to.not.have.been.called();
    } else {
      expect(res.body.errors).to.be.undefined;
      expect(strapi.plugins.email.provider.send).to.have.been.called();
    }

    return res;
  }

});
