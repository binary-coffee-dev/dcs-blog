const expect = require('chai').expect;

const Post = require('../../../../api/post/services/Post');

describe('Post service', function () {
  it('should convert the text to dash base', function () {
    expect(Post.getNameFromTitle('  This is an example  ')).to.equal('this-is-an-example');
  });

  it('should convert vowels with accent', () => {
    expect(Post.getNameFromTitle('Thís áis éan óexample ú ñ äëïöü')).to.equal('this-ais-ean-oexample-u-n-aeiou');
  });

  it('should remove all not letters and numbers', () => {
    expect(Post.getNameFromTitle('!Que, .pasa 08 )(**&%&*%?')).to.equal('que-pasa-08');
  });

  it('should remove all not allowed atributes in the where object', () => {
    const where = {author: '123ouhvsodflknl', title: 'sondflksdflkasjdf', not: 'asdf', enable: true};
    expect(Post.cleanWhere(where)).to.deep.equal({author: '123ouhvsodflknl', title: 'sondflksdflkasjdf'});
  });

  it('should convert attributes to a reg expresion', () => {
    const where = {author: '123ouhvsodflknl', title: 'sondflksdflkasjdf', not: 'asdf'};
    expect(Post.convertToLikeQuery(where)).to.deep.equal({author: '123ouhvsodflknl', title: /sondflksdflkasjdf/, not: 'asdf'});
  });
});
