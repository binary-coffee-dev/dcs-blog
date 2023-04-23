const chai = require('chai');
const chaiHttp = require('chai-http');

const randomName = require('../helpers/random-name');

chai.use(chaiHttp);

const expect = chai.expect;

describe('Check sitemap functionality INTEGRATION', () => {
  let posts = [];

  before(async () => {
    posts.push(await strapi.query('post').create({
      title: 'TITLE 1',
      name: randomName(),
      body: 'SOME',
      description: 'SOME 1',
      enable: true,
      publishedAt: new Date(new Date() - 10)
    }));
  });

  after(async () => {
    await strapi.query('post').delete({});
    await strapi.query('user', 'users-permissions').delete({});
  });

  it('should get the sitemap of the site', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .get('/sitemap')
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(res.type).to.be.equal('application/xml');
  });
});
