const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../../helpers/create-user');
const deleteUser = require('../../helpers/delete-user');
const deletePost = require('../../helpers/delete-post');
const randomName = require('../../helpers/random-name');

chai.use(chaiHttp);

const expect = chai.expect;

describe('Get feed by username INTEGRATION', () => {
  let posts = [];

  let authUser;

  const PUBLISHED_ARTICLES = 7;

  before(async () => {
    authUser = await createUser({strapi});

    for (let i = 0; i < PUBLISHED_ARTICLES; i++) {
      posts.push(await strapi.models.post.create({
        title: randomName(),
        name: randomName(),
        body: 'SOME',
        description: 'SOME 1',
        enable: true,
        publishedAt: new Date(new Date() - 10),
        author: authUser
      }));
    }
    posts.push(await strapi.models.post.create({
      title: randomName(),
      name: randomName(),
      body: 'SOME',
      description: 'SOME 1',
      enable: true,
      author: authUser
    }));
  });

  after(async () => {
    for (let post of posts) {
      await deletePost(strapi, post);
    }
    await deleteUser(strapi, authUser);
  });

  it('should get the feed by username', async () => {
    const res = await new Promise((resolve, reject) => chai.request(strapi.server)
      .get(`/posts/feed/${authUser.username}/json1`)
      .end((err, res) => err ? reject(err) : resolve(res)));

    expect(!!res.body).to.be.true;
    expect(res.body.items.length).to.be.equal(5);
  });
});
