const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const createPost = require('../../helpers/create-post');

chai.use(chaiHttp);

const expect = chai.expect;

describe('Get feed INTEGRATION', () => {
  let authUser;

  let PUBLISHED_ARTICLES = 10;

  before(async () => {
    authUser = await createUser({strapi});

    PUBLISHED_ARTICLES += strapi.config.custom.feedArticlesLimit;

    for (let i = 0; i < PUBLISHED_ARTICLES; i++) {
      await createPost(strapi, {author: authUser});
    }
    await createPost(strapi, {author: authUser, publishedAt: null});
  });

  after(async () => {
    await strapi.query('post').delete({});
    await strapi.query('user', 'users-permissions').delete({});
  });

  it('should get the feed', async () => {
    const res = await new Promise((resolve, reject) => {
      chai.request(strapi.server)
        .get('/posts/feed/json1')
        .end((err, res) => err ? reject(err) : resolve(res));
    });
    expect(!!res.body).to.be.true;
    expect(res.body.items.length).to.be.equal(strapi.config.custom.feedArticlesLimit);
  });
});
