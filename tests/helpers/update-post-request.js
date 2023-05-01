const randomName = require('./random-name');

const MUTATION_UPDATE_POST = {
  operationName: null,
  query: 'mutation ($id: ID!, $title: String, $body: String, $enable: Boolean, $banner: ID, $tags: [ID], $publishedAt: DateTime) {\n    updatePost(id: $id, data: {publishedAt: $publishedAt, title: $title, body: $body, enable: $enable, banner: $banner, tags: $tags}) {\n        data {\n            id\n            attributes {\n                readingTime\n            }\n        }\n    }\n}\n'
};

module.exports = async function (strapi, chai, variables, jwt) {
  const res = await new Promise((resolve, reject) => {
    chai.request(strapi.server.httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        ...MUTATION_UPDATE_POST, variables: {
          title: randomName(),
          body: randomName(),
          enable: true,
          publishedAt: new Date(new Date() - 10),
          ...variables
        }
      })
      .end((err, res) => err ? reject(err) : resolve(res));
  });
  return res.body.data.updatePost.data;
};
