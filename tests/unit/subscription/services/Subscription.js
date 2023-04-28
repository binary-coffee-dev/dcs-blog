const expect = require('chai').expect;

const subscription = require('../../../../src/api/subscription/services/subscription');

describe('Subscription service', function () {
  it('should get a random text of size 12', function () {
    const token = subscription.generateToken();
    expect(token.length).to.be.equal(12);
  });

  it('should get a random text of size 60', function () {
    const token = subscription.generateToken(60);
    expect(token.length).to.be.equal(60);
  });
});
