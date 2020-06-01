const chai = require('chai');
const chaiHttp = require('chai-http');

const deletePost = require('../helpers/delete-post');
const randomName = require('../helpers/random-name');

chai.use(chaiHttp);

const expect = chai.expect;

describe('Check sitemap functionality INTEGRATION', () => {
  let posts = [];

  before(async () => {
    posts.push(await strapi.models.post.create({
      title: 'TITLE 1',
      name: randomName(),
      body: 'SOME',
      description: 'SOME 1',
      enable: true,
      publishedAt: new Date(new Date() - 10)
    }));
  });

  after(async () => {
    for (let post of posts) {
      await deletePost(strapi, post);
    }
  });

  it('should create an article with the name attribute', (done) => {
    chai.request(strapi.server)
      .get('/sitemap')
      .end((err, res) => {
        expect(res.type).to.be.equal('application/xml');
        done();
      });
  });
});
