const randomName = require('./random-name');

const MUTATION_UPDATE_POST = {
  operationName: null,
  query: 'mutation ($id: ID!, $title: String, $body: String, $enable: Boolean, $banner: ID, $tags: [ID], $publishedAt: DateTime) {\n  updatePost(input: {data: {publishedAt: $publishedAt, title: $title, body: $body, enable: $enable, banner: $banner, tags: $tags}, where: {id: $id}}) {\n    post {\n      id\n      __typename\n    }\n    __typename\n  }\n}\n'
};

module.exports = async function (strapi, chai, variables, jwt) {
  const res = await new Promise((resolve, reject) => {
    chai.request(strapi.server)
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
  return res.body.data.updatePost.post;
};
