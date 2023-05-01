const randomName = require('./random-name');

const MUTATION_CREATE_POST = {
  operationName: null,
  // language=GraphQL
  query: 'mutation ($title: String, $body: String, $enable: Boolean, $banner: ID, $author: ID, $tags: [ID], $publishedAt: DateTime) {\n    createPost(data: {publishedAt: $publishedAt, title: $title, body: $body, enable: $enable, banner: $banner, author: $author, tags: $tags}) {\n        data {\n            id\n            attributes {\n                title\n                body\n                publishedAt\n                readingTime\n                name\n            }\n        }\n    }\n}'
};

async function createPostRequest(strapi, chai, variables, jwt) {
  const res = await new Promise((resolve, reject) => {
    chai.request(strapi.server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        ...MUTATION_CREATE_POST, variables: {
          body: randomName(),
          title: randomName(),
          enable: true,
          publishedAt: new Date(new Date() - 10),
          ...variables
        }
      })
      .end((err, res) => err ? reject(err) : resolve(res));
  });
  return res.body.data.createPost.data;
}

createPostRequest.MUTATION_CREATE_POST = MUTATION_CREATE_POST;

module.exports = createPostRequest;
