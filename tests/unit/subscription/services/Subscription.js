const expect = require('chai').expect;

describe('Token util functions', function () {
  let token;

  before(() => {
    token = strapi.config.functions.token;
  });

  it('should get a random text of size 12', function () {
    const value = token.generate();
    expect(value.length).to.be.equal(12);
  });

  it('should get a random text of size 60', function () {
    const value = token.generate(60);
    expect(value.length).to.be.equal(60);
  });
});
