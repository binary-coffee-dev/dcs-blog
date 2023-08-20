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

  it('should subscribe a public user', async () => {
    const res = await new Promise((resolve, reject) => chai.request(strapi.server.httpServer)
      .post('/graphql').send({...SUBSCRIBE_MUTATION, variables: {email: EMAIL_EXAMPLE}})
      .end((err, res) => err ? reject(err) : resolve(res))
    );

    expect(res.body.errors).to.be.undefined;
    expect(emailProviderMock.send).to.have.been.called();
  });
});
