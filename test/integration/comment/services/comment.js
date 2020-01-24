const expect = require('chai').expect;

const Comment = require('../../../../api/comment/services/comment');

describe('Post service', () => {
  it('should create the jwt', () => {
    const jwt = Comment.createCaptchaJwt('Dkd2f', 'this is my key');
    expect(jwt).to.not.equal('');
  });

  it('should create and check jwt', () => {
    const jwt = Comment.createCaptchaJwt('Dkd2f', 'this is my key');
    expect(Comment.checkCaptchaJwt(jwt, 'Dkd2f', 'this is my key')).to.be.true;
  });

  it('should create and check jwt with case sensitive', () => {
    const jwt = Comment.createCaptchaJwt('Dkd2f', 'this is my key');
    expect(Comment.checkCaptchaJwt(jwt, 'dkd2f', 'this is my key')).to.be.true;
  });

  it('should create and check jwt and fail with a wrong text', () => {
    const jwt = Comment.createCaptchaJwt('Dkd2f', 'this is my key');
    expect(Comment.checkCaptchaJwt(jwt, 'asdf3', 'this is my key')).to.be.false;
  });
});
