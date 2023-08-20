const chai = require('chai');
const chaiHttp = require('chai-http');
const spies = require('chai-spies');

const deliveryToEmailSubscriptions = require('../../../src/functions/subscriptions.emails');

const createUser = require('../../helpers/create-user');
const checkHtmlEmail = require('../../helpers/check-html-email');
const createPost = require('../../helpers/create-post');

chai.use(chaiHttp);
chai.use(spies);

const expect = chai.expect;

const EXAMPLE_BODY = `
## ¿De donde surgió la idea?
Esta idea loca surgió de nuestro grupo de **Telegram**, donde intercambiando y hablamos de tecnologías nos dijimos: ¿Por qué no hacer un blog y compartir nuestros temas con otras personas? Y así es como en menos de 3 semanas nos creamos este pequeño espacio donde guardar y compartir nuestras experiencias.
>
## ¿Quienes somos?
Todos los creadores del blog somos Ingenieros de Software y la mayoría participamos en competencias de programación tales como **ICPC** (*Internationals College Programing Contest*), ya sea como concursantes o como entrenadores. Por lo cual dentro del blog tendremos contenidos sobre **algoritmos**, **estructuras de datos**, **matemática**, **combinatoria**, e incluso explicaciones y debates de soluciones a problemas.

![pedris11s](https://api.binary-coffee.dev/uploads/95ad9d05a9b646769c515913b98cce5b.jpg)
> **pedris11s**: I Love Mona...<i class="fas fa-heart"></i>
`;

describe('NewsLetter post list INTEGRATION', () => {
  const NOMBER_OF_ARTICLES = 10;
  let authUser;
  let message;

  let savedFunction;

  before(async () => {
    authUser = await createUser({strapi});
    for (let i = 0; i < NOMBER_OF_ARTICLES; i++) {
      await createPost(strapi, {
        author: authUser.id,
        body: EXAMPLE_BODY,
        published_at: new Date(new Date() - (10 + Math.round(Math.random() * 100)))
      });
    }

    for (let i = 0; i < 60; i++) {
      await strapi.query('api::subscription.subscription').create({data: {verified: true, enable: true, email: 'some@tests.com'}});
    }

    savedFunction = strapi.service('plugin::email.email').send;
    strapi.service('plugin::email.email').send = chai.spy((messageToSend) => {
      message = messageToSend;
      return Promise.resolve();
    });
  });

  after(async () => {
    await strapi.query('api::post.post').deleteMany({});
    await strapi.query('api::subscription.subscription').deleteMany({});
    await strapi.query('plugin::users-permissions.user').deleteMany({});
    strapi.service('plugin::email.email').send = savedFunction;
  });

  it('should get the not published articles for the not authenticated users', async () => {
    await deliveryToEmailSubscriptions.send('Binary Coffee Weekly Posts', 7);

    expect(strapi.service('plugin::email.email').send).to.have.been.called.exactly(2);
    expect(checkHtmlEmail(message.html)).to.be.equal(NOMBER_OF_ARTICLES);
  });
});
