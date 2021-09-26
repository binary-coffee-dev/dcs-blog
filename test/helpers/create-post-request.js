const randomName = require('./random-name');

const MUTATION_CREATE_POST = {
  operationName: null,
  query: 'mutation ($title: String, $body: String, $enable: Boolean, $banner: ID, $author: ID, $tags: [ID], $publishedAt: DateTime) {\n  createPost(input: {data: {publishedAt: $publishedAt, title: $title, body: $body, enable: $enable, banner: $banner, author: $author, tags: $tags}}) {\n    post {\n      id\n      __typename\n    }\n    __typename\n  }\n}\n'
};

module.exports = async function(strapi, chai, variables, jwt) {
  const res = await new Promise((resolve, reject) => {
    chai.request(strapi.server)
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
  return res.body.data.createPost.post;
};
