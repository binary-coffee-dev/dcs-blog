const expect = require('chai').expect;

const marked = require('marked');

const Post = require('../../../../api/post/services/Post');
const {cleanBody} = require('../../../../config/functions/delivery.to.email.subscriptions');

const EXAMPLE_BODY = `
## ¿De donde surgió la idea?
Esta idea loca surgió de nuestro grupo de **Telegram**, donde intercambiando y hablamos de tecnologías nos dijimos: ¿Por qué no hacer un blog y compartir nuestros temas con otras personas? Y así es como en menos de 3 semanas nos creamos este pequeño espacio donde guardar y compartir nuestras experiencias.

## ¿Quienes somos?
Todos los creadores del blog somos Ingenieros de Software y la mayoría participamos en competencias de programación tales como **ICPC** (*Internationals College Programing Contest*), ya sea como concursantes o como entrenadores. Por lo cual dentro del blog tendremos contenidos sobre **algoritmos**, **estructuras de datos**, **matemática**, **combinatoria**, e incluso explicaciones y debates de soluciones a problemas.

![pedris11s](https://api.binary-coffee.dev/uploads/95ad9d05a9b646769c515913b98cce5b.jpg)
> **pedris11s**: I Love Mona...<i class="fas fa-heart"></i>
`;

const EXPECTED_BODY = '¿De donde surgió la idea? Esta idea loca surgió de nuestro grupo de Telegram, donde intercambiando y hablamos de tecnologías nos dijimos: ¿Por qué no hacer un blog y compartir nuestros temas con otras personas? Y así es como en menos de 3 semanas nos creamos este pequeño espacio donde guardar y compartir nuestras experiencias. ¿Quienes somos? Todos los creadores del blog somos Ingenieros de Software y la mayoría participamos en competencias de programación tales como ICPC (Internationals College Programing Contest), ya sea como concursantes o como entrenadores. Por lo cual dentro del blog tendremos contenidos sobre algoritmos, estructuras de datos, matemática, combinatoria, e incluso explicaciones y debates de soluciones a problemas. pedris11s: I Love Mona...';

describe('Post service', function () {
  it('should convert the text to dash base', function () {
    const name = Post.getNameFromTitle('  This is an example  ');
    expect(name.substring(0, name.length - 5)).to.equal('this-is-an-example');
  });

  it('should convert vowels with accent', () => {
    const name = Post.getNameFromTitle('Thís áis éan óexample ú ñ äëïöü');
    expect(name.substring(0, name.length - 5)).to.equal('this-ais-ean-oexample-u-n-aeiou');
  });

  it('should remove all not letters and numbers', () => {
    const name = Post.getNameFromTitle('!Que, .pasa 08 )(**&%&*%?');
    expect(name.substring(0, name.length - 5)).to.equal('que-pasa-08');
  });

  it('should remove all not allowed atributes in the where object', () => {
    const where = {author: '123ouhvsodflknl', title: 'sondflksdflkasjdf', not: 'asdf', enable: true};
    expect(Post.cleanWhere(where)).to.deep.equal({author: '123ouhvsodflknl', title: 'sondflksdflkasjdf'});
  });

  it('should convert attributes to a reg expresion', () => {
    const where = {author: '123ouhvsodflknl', title: 'sondflksdflkasjdf', not: 'asdf'};
    expect(Post.convertToLikeQuery(where)).to.deep.equal({
      author: '123ouhvsodflknl',
      title: /sondflksdflkasjdf/i,
      not: 'asdf'
    });
  });

  it('should take the date 7 days ago', function () {
    const date = new Date();
    date.setFullYear(2000, 0, 1);
    date.setDate(date.getDate() - 7);
    expect(date.getFullYear()).to.be.equal(1999);
    expect(date.getMonth()).to.be.equal(11);
    expect(date.getDate()).to.be.equal(25);
  });

  it('should extract summary from article', function () {
    expect(cleanBody(marked(EXAMPLE_BODY))).to.equal(EXPECTED_BODY);
  });
});
