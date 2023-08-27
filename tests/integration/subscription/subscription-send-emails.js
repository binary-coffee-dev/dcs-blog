const chai = require('chai');
const chaiHttp = require('chai-http');
const spies = require('chai-spies');

const createPost = require('../../helpers/create-post');

chai.use(chaiHttp);
chai.use(spies);

const expect = chai.expect;


describe('Send subscription emails INTEGRATION', () => {

  let emailProvider;

  before(async () => {
    await strapi.query('api::subscription.subscription').deleteMany({});

    emailProvider = strapi.plugins.email.provider;
  });

  after(async () => {
    strapi.plugins.email.provider = emailProvider;
  });

  afterEach(async () => {
    await strapi.query('api::subscription.subscription').deleteMany({});
  });

  it('should send email to subscription emails', async () => {
    // create post to send in subscription
    const post = await createPost(strapi, {publishedAt: new Date()});

    const emailsValid = [
      'a@test.com', 'b@test.com', 'c@test.com', 'd@test.com', 'e@test.com', 'f@test.com', 'h@test.com',
      'i@test.com', 'j@test.com', 'k@test.com', 'l@test.com', 'm@test.com', 'n@test.com', 'o@test.com',
    ];
    const emailsInvalid = [
      'p@test.com', 'q@test.com', 'r@test.com', 's@test.com', 't@test.com', 'u@test.com', 'v@test.com',
    ];

    const unsubscriptionTokens = new Map();

    // create valid subscription emails
    for (const email of emailsValid) {
      unsubscriptionTokens.set(email, await createEmail(email, true));
    }
    // create invalid subscription emails
    for (const email of emailsInvalid) {
      await createEmail(email, false);
    }

    // mock email provider
    const SUBJECT = 'test subject';
    mockSendEmails(emailsValid, SUBJECT, post.title, unsubscriptionTokens);

    await strapi.config.functions.subscriptionsEmails.sendEmailWithLatestPosts(SUBJECT, 7);

    expect(strapi.plugins.email.provider.send).to.have.been.called.exactly(emailsValid.length);
  });

  async function createEmail(email, verified = true) {
    const token = strapi.config.functions.token.generate(100);
    const unsubscribeToken = strapi.config.functions.token.generate(100);

    await strapi.query('api::subscription.subscription').create({
      data: {
        email,
        token,
        unsubscribeToken,
        verified,
        lastSubscriptionTime: new Date()
      }
    });

    return unsubscribeToken;
  }

  function mockSendEmails(emails, expectedSubject, expectedTitle, unsubscriptionTokens) {
    strapi.plugins.email.provider = {
      send: chai.spy(async ({to, subject, html}) => {
        expect(emails.includes(to)).to.be.true;
        expect(subject).to.be.eq(expectedSubject);

        expect(html.indexOf(expectedTitle)).to.not.eq(-1);
        expect(html.indexOf(unsubscriptionTokens.get(to))).to.not.eq(-1);
      })
    };
  }

});
