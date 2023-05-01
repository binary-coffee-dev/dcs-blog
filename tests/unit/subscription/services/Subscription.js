const expect = require('chai').expect;

describe('Subscription service', function () {
  let subscription;

  before(() => {
    subscription = strapi.service('api::subscription.subscription');
  });

  it('should get a random text of size 12', function () {
    const token = subscription.generateToken();
    expect(token.length).to.be.equal(12);
  });

  it('should get a random text of size 60', function () {
    const token = subscription.generateToken(60);
    expect(token.length).to.be.equal(60);
  });
});
