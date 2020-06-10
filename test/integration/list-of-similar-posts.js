const chai = require('chai');
const chaiHttp = require('chai-http');

const createUser = require('../helpers/create-user');
const deleteUser = require('../helpers/delete-user');
const deletePost = require('../helpers/delete-post');
const randomName = require('../helpers/random-name');

chai.use(chaiHttp);

const expect = chai.expect;

const QUERY = {
  operationName: "similarPosts",
  variables: {"id": "", "limit": 10},
  query: "query similarPosts($id: ID!, $limit: Int) {\n  similarPosts(id: $id, limit: $limit) {\n    title\n    description\n    name\n    banner {\n      url\n      __typename\n    }\n    publishedAt\n    id\n    __typename\n  }\n}\n"
};

/*fetch("https://api-dev.binary-coffee.dev/graphql", {
  "headers": {
    "accept": "application/json, text/plain, *!/!*",
    "accept-language": "en-US,en;q=0.9,pl;q=0.8,es;q=0.7",
    "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkZWVlMzdlOThiYmQ4MDAxM2EwYTg0NCIsImlhdCI6MTU5MDk2MDY2MSwiZXhwIjoxNTkzNTUyNjYxfQ.kWeFKXvxD_sHPT0Ai68g3vEPASIakYF6cbe7FCOibfU",
    "content-type": "application/json",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site"
  },
  "referrer": "https://dev.binary-coffee.dev/post/como-instalar-python",
  "referrerPolicy": "no-referrer-when-downgrade",
  "body": "{\"operationName\":\"similarPosts\",\"variables\":{\"id\":\"5e068d133e8db80013d1c268\",\"limit\":10},\"query\":\"query similarPosts($id: ID!, $limit: Int) {\\n  similarPosts(id: $id, limit: $limit) {\\n    title\\n    description\\n    name\\n    banner {\\n      url\\n      __typename\\n    }\\n    publishedAt\\n    id\\n    __typename\\n  }\\n}\\n\"}",
  "method": "POST",
  "mode": "cors"
});*/

describe('Post list (dashboard list) INTEGRATION', () => {
  let posts = [];
  let tag;

  let authUser;

  const NUMBER_OF_POSTS = 20;

  before(async () => {
    authUser = await createUser({strapi});

    for (let i = 0; i < NUMBER_OF_POSTS; i++) {
      posts.push(await strapi.models.post.create({
        title: 'TITLE 1',
        name: randomName(),
        body: 'SOME',
        description: 'SOME 1',
        enable: true,
        publishedAt: new Date(new Date() - 10),
        author: authUser
      }));
    }

    await strapi.models.tag.update({name: 'chrome'}, {posts: posts.map(post => post.id)});

    posts.push(await strapi.models.post.create({
      title: 'TITLE 4',
      body: 'SOME',
      name: randomName(),
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

  it('should get the not published articles for the not authenticated users', (done) => {
    console.log('a');
    chai.request(strapi.server)
      .post('/graphql')
      .send({...QUERY, variables: {...QUERY.variables, "id": posts[0].id}})
      .end((err, res) => {
        expect(!!res.body.data.similarPosts).to.be.true;
        expect(res.body.data.similarPosts.length).to.be.equal(10);
        done();
      });
  });
});
